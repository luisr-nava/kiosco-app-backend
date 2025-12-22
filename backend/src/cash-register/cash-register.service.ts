import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import {
  CashRegisterReportFiltersDto,
  ReportPeriod,
} from './dto/cash-register-report-filters.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import type { Prisma } from '@prisma/client';
import { CashMovementType } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import type { CashMovement } from '@prisma/client';

@Injectable()
export class CashRegisterService {
  private isAutoClosing = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoCloseCashRegisters() {
    if (this.isAutoClosing) {
      return;
    }

    this.isAutoClosing = true;

    try {
      await this.closeExpiredCashRegisters();
    } finally {
      this.isAutoClosing = false;
    }
  }

  async open(dto: OpenCashRegisterDto, user: JwtPayload) {
    // Verificar acceso a la tienda
    await this.validateShopAccess(dto.shopId, user);

    // Verificar que no haya otra caja abierta para este usuario en esta tienda
    const existingOpen = await this.prisma.cashRegister.findFirst({
      where: {
        shopId: dto.shopId,
        status: 'OPEN',
        employeeId: user.id,
      },
    });

    if (existingOpen) {
      throw new BadRequestException(
        'Ya tienes una caja abierta en esta tienda. Debes cerrarla antes de abrir una nueva.',
      );
    }

    // Crear caja en transacción
    return this.prisma.$transaction(async (tx) => {
      const cashRegister = await tx.cashRegister.create({
        data: {
          shopId: dto.shopId,
          employeeId: user.id,
          openingAmount: dto.openingAmount,
          openedBy: user.id,
        },
      });

      // Crear movimiento inicial
      await tx.cashMovement.create({
        data: {
          cashRegisterId: cashRegister.id,
          shopId: dto.shopId,
          type: 'OPENING',
          amount: dto.openingAmount,
          description: 'Apertura de caja',
          userId: user.id,
        },
      });

      return {
        message: 'Caja abierta correctamente',
        data: cashRegister,
      };
    });
  }

  async findOpenCashRegistersForShops(shopIds: string[], user?: JwtPayload) {
    if (!shopIds?.length) {
      return [];
    }

    const where: Prisma.CashRegisterWhereInput = {
      shopId: { in: shopIds },
      status: 'OPEN',
    };

    if (user?.role === 'EMPLOYEE') {
      where.employeeId = user.id;
    }

    const openCashRegisters = await this.prisma.cashRegister.findMany({
      where,
      orderBy: { openedAt: 'desc' },
    });

    const registersByShop = new Map<string, typeof openCashRegisters>();
    shopIds.forEach((shopId) => registersByShop.set(shopId, []));

    openCashRegisters.forEach((register) => {
      const list = registersByShop.get(register.shopId);
      if (list) {
        list.push(register);
      }
    });

    return shopIds.map((shopId) => {
      const registers = registersByShop.get(shopId) ?? [];
      const primaryRegister =
        user?.role === 'EMPLOYEE'
          ? registers.find((reg) => reg.employeeId === user.id) ?? null
          : registers.find((reg) => reg.employeeId === user?.id) ??
            registers[0] ??
            null;

      return {
        shopId,
        cashRegister: primaryRegister,
        cashRegisters: registers,
      };
    });
  }

  async close(cashRegisterId: string, dto: CloseCashRegisterDto, user: JwtPayload) {
    const cashRegister = await this.getCashRegisterWithAccess(cashRegisterId, user, {
      movements: true,
    });

    if (cashRegister.status !== 'OPEN') {
      throw new BadRequestException('La caja ya está cerrada');
    }

    const { closingAmount, totals } = this.calculateClosingFromMovements(
      cashRegister.openingAmount,
      cashRegister.movements,
    );
    const difference = dto.actualAmount - closingAmount;

    // Cerrar caja
    const closedCashRegister = await this.prisma.cashRegister.update({
      where: { id: cashRegisterId },
      data: {
        status: 'CLOSED',
        closingAmount,
        actualAmount: dto.actualAmount,
        difference,
        closedAt: new Date(),
        closedBy: user.id,
        closingNotes: dto.closingNotes,
      },
    });

    return {
      message: 'Caja cerrada correctamente',
      data: {
        ...closedCashRegister,
        differenceStatus:
          difference > 0 ? 'SOBRANTE' : difference < 0 ? 'FALTANTE' : 'EXACTO',
        totals,
      },
    };
  }

  async getCurrentCashRegister(cashRegisterId: string, user: JwtPayload) {
    const cashRegister = await this.getCashRegisterWithAccess(cashRegisterId, user, {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    });

    if (cashRegister.status !== 'OPEN') {
      return {
        message: 'La caja no está abierta',
        data: null,
      };
    }

    // Calcular balance actual
    const totalMovements = cashRegister.movements.reduce((sum, mov) => {
      if (['SALE', 'INCOME', 'DEPOSIT'].includes(mov.type)) {
        return sum + mov.amount;
      }
      if (['PURCHASE', 'RETURN', 'EXPENSE', 'WITHDRAWAL'].includes(mov.type)) {
        return sum - mov.amount;
      }
      return sum;
    }, 0);

    const currentBalance = cashRegister.openingAmount + totalMovements;

    return {
      message: 'Caja actual',
      data: {
        ...cashRegister,
        currentBalance,
      },
    };
  }

  async getCashRegisterHistory(
    cashRegisterId: string,
    user: JwtPayload,
    startDate?: string,
    endDate?: string,
  ) {
    await this.getCashRegisterWithAccess(cashRegisterId, user);

    const where: any = { cashRegisterId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.createdAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const movements = await this.prisma.cashMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      message: 'Historial de movimientos de la caja',
      data: movements,
    };
  }

  async getCashRegisterById(cashRegisterId: string, user: JwtPayload) {
    const cashRegister = await this.getCashRegisterWithAccess(cashRegisterId, user, {
      shop: true,
      movements: {
        orderBy: { createdAt: 'asc' },
        include: {
          sale: {
            select: {
              id: true,
              totalAmount: true,
              customer: { select: { fullName: true } },
            },
          },
          purchase: {
            select: {
              id: true,
              totalAmount: true,
              supplier: { select: { name: true } },
            },
          },
          saleReturn: {
            select: {
              id: true,
              refundAmount: true,
              reason: true,
            },
          },
        },
      },
    });

    return {
      message: 'Detalle de caja',
      data: cashRegister,
    };
  }

  // Método helper para crear movimientos de caja (usado por otros módulos)
  async createCashMovement(data: {
    cashRegisterId: string;
    shopId: string;
    type: CashMovementType;
    amount: number;
    description: string;
    userId: string;
    saleId?: string;
    purchaseId?: string;
    saleReturnId?: string;
    incomeId?: string;
    expenseId?: string;
  }) {
    return this.prisma.cashMovement.create({
      data,
    });
  }

  async getReport(
    cashRegisterId: string,
    filters: CashRegisterReportFiltersDto,
    user: JwtPayload,
  ) {
    const cashRegister = await this.getCashRegisterWithAccess(cashRegisterId, user);

    const { startDate, endDate } = this.calculateDateRange(filters);

    // Obtener todos los movimientos del período
    const movements = await this.prisma.cashMovement.findMany({
      where: {
        cashRegisterId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        sale: {
          include: {
            items: {
              include: {
                shopProduct: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            paymentMethod: {
              select: { name: true, code: true },
            },
          },
        },
        purchase: {
          include: {
            supplier: { select: { name: true } },
            paymentMethod: { select: { name: true, code: true } },
          },
        },
        income: {
          include: {
            paymentMethod: { select: { name: true, code: true } },
          },
        },
        expense: {
          include: {
            paymentMethod: { select: { name: true, code: true } },
          },
        },
        saleReturn: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular totales por tipo
    const totals = {
      sales: 0,
      purchases: 0,
      incomes: 0,
      expenses: 0,
      returns: 0,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };

    movements.forEach((mov) => {
      switch (mov.type) {
        case 'SALE':
          totals.sales += mov.amount;
          totals.totalIncome += mov.amount;
          break;
        case 'PURCHASE':
          totals.purchases += mov.amount;
          totals.totalExpense += mov.amount;
          break;
        case 'INCOME':
          totals.incomes += mov.amount;
          totals.totalIncome += mov.amount;
          break;
        case 'EXPENSE':
          totals.expenses += mov.amount;
          totals.totalExpense += mov.amount;
          break;
        case 'RETURN':
          totals.returns += mov.amount;
          totals.totalExpense += mov.amount;
          break;
      }
    });

    totals.balance = totals.totalIncome - totals.totalExpense;

    // Obtener producto más vendido del mes en curso
    const topProduct = await this.getTopProductOfCurrentMonth(cashRegister.shopId);

    return {
      message: 'Reporte de caja registradora',
      data: {
        period: {
          type: filters.period || 'week',
          startDate,
          endDate,
        },
        totals,
        topProductThisMonth: topProduct,
        movements: movements.map((mov) => ({
          id: mov.id,
          type: mov.type,
          amount: mov.amount,
          description: mov.description,
          createdAt: mov.createdAt,
          sale: mov.sale
            ? {
                id: mov.sale.id,
                totalAmount: mov.sale.totalAmount,
                paymentMethod: mov.sale.paymentMethod,
              }
            : null,
          purchase: mov.purchase
            ? {
                id: mov.purchase.id,
                totalAmount: mov.purchase.totalAmount,
                supplier: mov.purchase.supplier?.name,
                paymentMethod: mov.purchase.paymentMethod,
              }
            : null,
          income: mov.income
            ? {
                id: mov.income.id,
                amount: mov.income.amount,
                description: mov.income.description,
                paymentMethod: mov.income.paymentMethod,
              }
            : null,
          expense: mov.expense
            ? {
                id: mov.expense.id,
                amount: mov.expense.amount,
                description: mov.expense.description,
                paymentMethod: mov.expense.paymentMethod,
              }
            : null,
        })),
        summary: {
          totalMovements: movements.length,
          salesCount: movements.filter((m) => m.type === 'SALE').length,
          purchasesCount: movements.filter((m) => m.type === 'PURCHASE').length,
          incomesCount: movements.filter((m) => m.type === 'INCOME').length,
          expensesCount: movements.filter((m) => m.type === 'EXPENSE').length,
        },
      },
    };
  }

  async getAvailableYears(cashRegisterId: string, user: JwtPayload) {
    await this.getCashRegisterWithAccess(cashRegisterId, user);

    // Obtener el primer y último movimiento de caja
    const [firstMovement, lastMovement] = await Promise.all([
      this.prisma.cashMovement.findFirst({
        where: { cashRegisterId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      this.prisma.cashMovement.findFirst({
        where: { cashRegisterId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    if (!firstMovement || !lastMovement) {
      return {
        message: 'No hay movimientos registrados',
        data: {
          years: [],
          currentYear: new Date().getFullYear(),
        },
      };
    }

    const startYear = firstMovement.createdAt.getFullYear();
    const endYear = lastMovement.createdAt.getFullYear();

    const years: number[] = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }

    return {
      message: 'Años disponibles',
      data: {
        years,
        currentYear: new Date().getFullYear(),
        firstMovementDate: firstMovement.createdAt,
        lastMovementDate: lastMovement.createdAt,
      },
    };
  }

  private async getCashRegisterWithAccess<
    TInclude extends Prisma.CashRegisterInclude | undefined,
  >(
    cashRegisterId: string,
    user: JwtPayload,
    include?: TInclude,
  ): Promise<
    Prisma.CashRegisterGetPayload<
      TInclude extends Prisma.CashRegisterInclude ? { include: TInclude } : {}
    >
  > {
    const cashRegister = await this.prisma.cashRegister.findUnique({
      where: { id: cashRegisterId },
      include: include ?? undefined,
    });

    if (!cashRegister) {
      throw new NotFoundException('Caja no encontrada');
    }

    await this.validateShopAccess(cashRegister.shopId, user);

    if (user.role === 'EMPLOYEE' && cashRegister.employeeId !== user.id) {
      throw new ForbiddenException('No tienes permiso para acceder a esta caja');
    }

    return cashRegister as Prisma.CashRegisterGetPayload<
      TInclude extends Prisma.CashRegisterInclude ? { include: TInclude } : {}
    >;
  }

  private calculateDateRange(filters: CashRegisterReportFiltersDto): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.setHours(23, 59, 59, 999));

    if (filters.period === ReportPeriod.CUSTOM) {
      if (!filters.startDate || !filters.endDate) {
        throw new BadRequestException(
          'Se requieren startDate y endDate para período personalizado',
        );
      }
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (filters.year && filters.month) {
      // Mes específico de un año específico
      const year = parseInt(filters.year);
      const month = parseInt(filters.month) - 1; // JavaScript months are 0-indexed
      startDate = new Date(year, month, 1, 0, 0, 0, 0);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    } else if (filters.year) {
      // Todo el año
      const year = parseInt(filters.year);
      startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      // Períodos predefinidos
      switch (filters.period) {
        case ReportPeriod.DAY:
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case ReportPeriod.WEEK:
          // Semana actual (lunes a domingo)
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          startDate = new Date(now);
          startDate.setDate(now.getDate() + diff);
          startDate.setHours(0, 0, 0, 0);
          break;
        case ReportPeriod.MONTH:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          break;
        case ReportPeriod.YEAR:
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          break;
        default:
          // Default: semana actual
          const day = now.getDay();
          const d = day === 0 ? -6 : 1 - day;
          startDate = new Date(now);
          startDate.setDate(now.getDate() + d);
          startDate.setHours(0, 0, 0, 0);
      }
    }

    return { startDate, endDate };
  }

  private async getTopProductOfCurrentMonth(shopId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Obtener todas las ventas del mes
    const sales = await this.prisma.sale.findMany({
      where: {
        shopId,
        saleDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            shopProduct: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Agrupar por producto y calcular totales
    type ProductStats = {
      productId: string;
      productName: string;
      quantitySold: number;
      totalRevenue: number;
      totalCost: number;
      profit: number;
    };

    const productStats = new Map<string, ProductStats>();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.shopProduct.product.id;
        const existing = productStats.get(productId);

        const itemCost = item.quantity * item.shopProduct.costPrice;
        const itemRevenue = item.total;
        const itemProfit = itemRevenue - itemCost;

        if (existing) {
          existing.quantitySold += item.quantity;
          existing.totalRevenue += itemRevenue;
          existing.totalCost += itemCost;
          existing.profit += itemProfit;
        } else {
          productStats.set(productId, {
            productId,
            productName: item.shopProduct.product.name,
            quantitySold: item.quantity,
            totalRevenue: itemRevenue,
            totalCost: itemCost,
            profit: itemProfit,
          });
        }
      });
    });

    // Encontrar el producto más vendido por cantidad
    let topProduct: ProductStats | null = null;
    let maxQuantity = 0;

    productStats.forEach((stats) => {
      if (stats.quantitySold > maxQuantity) {
        maxQuantity = stats.quantitySold;
        topProduct = stats;
      }
    });

    if (!topProduct) {
      return null;
    }

    const product = topProduct as ProductStats;

    return {
      productId: product.productId,
      productName: product.productName,
      quantitySold: product.quantitySold,
      totalRevenue: product.totalRevenue,
      totalCost: product.totalCost,
      profit: product.profit,
      period: {
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
    };
  }

  private calculateClosingFromMovements(
    openingAmount: number,
    movements: Pick<CashMovement, 'type' | 'amount'>[],
  ) {
    const totals = {
      sales: 0,
      incomes: 0,
      purchases: 0,
      expenses: 0,
      returns: 0,
      withdrawals: 0,
      deposits: 0,
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0,
    };

    const totalMovements = movements.reduce((sum, mov) => {
      switch (mov.type) {
        case 'SALE':
          totals.sales += mov.amount;
          return sum + mov.amount;
        case 'INCOME':
          totals.incomes += mov.amount;
          return sum + mov.amount;
        case 'DEPOSIT':
          totals.deposits += mov.amount;
          return sum + mov.amount;
        case 'PURCHASE':
          totals.purchases += mov.amount;
          return sum - mov.amount;
        case 'RETURN':
          totals.returns += mov.amount;
          return sum - mov.amount;
        case 'EXPENSE':
          totals.expenses += mov.amount;
          return sum - mov.amount;
        case 'WITHDRAWAL':
          totals.withdrawals += mov.amount;
          return sum - mov.amount;
        default:
          return sum;
      }
    }, 0);

    totals.totalIncome = totals.sales + totals.incomes + totals.deposits;
    totals.totalExpense =
      totals.purchases + totals.expenses + totals.returns + totals.withdrawals;
    totals.netIncome = totals.totalIncome - totals.totalExpense;

    const closingAmount = openingAmount + totalMovements;

    return { closingAmount, totals };
  }

  private getAutoClosingDeadline(openedAt: Date, timezone: string) {
    const openingLocal = toZonedTime(openedAt, timezone);
    const closingLocal = new Date(openingLocal);
    closingLocal.setHours(0, 1, 0, 0);
    closingLocal.setDate(closingLocal.getDate() + 1);

    return fromZonedTime(closingLocal, timezone);
  }

  private async closeExpiredCashRegisters() {
    const openRegisters = await this.prisma.cashRegister
      .findMany({
        where: { status: 'OPEN' },
        include: {
          shop: {
            select: { timezone: true },
          },
        },
      })
      .catch((error) => {
        // Si la tabla aún no existe (DB sin migrar), evitar que el cron reviente
        if (error?.code === 'P2021') {
          return [];
        }
        throw error;
      });

    if (!openRegisters?.length) {
      return;
    }

    const now = new Date();
    const registerIds = openRegisters.map((reg) => reg.id);

    const movements = await this.prisma.cashMovement.findMany({
      where: { cashRegisterId: { in: registerIds } },
      select: {
        cashRegisterId: true,
        type: true,
        amount: true,
      },
    });

    const movementsByRegister = new Map<string, Pick<CashMovement, 'type' | 'amount'>[]>();

    movements.forEach((movement) => {
      const list = movementsByRegister.get(movement.cashRegisterId) ?? [];
      list.push(movement);
      movementsByRegister.set(movement.cashRegisterId, list);
    });

    for (const register of openRegisters) {
      const timezone = register.shop?.timezone || 'UTC';
      const closingDeadline = this.getAutoClosingDeadline(register.openedAt, timezone);

      if (now < closingDeadline) {
        continue;
      }

      const registerMovements = movementsByRegister.get(register.id) ?? [];
      const { closingAmount } = this.calculateClosingFromMovements(
        register.openingAmount,
        registerMovements,
      );

      await this.prisma.$transaction(async (tx) => {
        const current = await tx.cashRegister.findUnique({
          where: { id: register.id },
          select: { status: true },
        });

        if (current?.status !== 'OPEN') {
          return;
        }

        await tx.cashRegister.update({
          where: { id: register.id },
          data: {
            status: 'CLOSED',
            closingAmount,
            actualAmount: closingAmount,
            difference: 0,
            closedAt: new Date(),
            closedBy: register.employeeId,
            closingNotes: 'Cierre automático por cambio de día',
          },
        });
      });
    }
  }

  private async validateShopAccess(shopId: string, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { projectId: true, ownerId: true },
    });

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    if (user.role === 'OWNER' && shop.ownerId !== user.id) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: { id: user.id, employeeShops: { some: { shopId } } },
      });

      if (!employee) {
        throw new ForbiddenException('No tienes permiso para esta tienda');
      }
    }
  }
}
