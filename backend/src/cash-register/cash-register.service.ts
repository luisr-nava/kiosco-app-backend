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
import { CashMovementType } from '@prisma/client';

@Injectable()
export class CashRegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async open(dto: OpenCashRegisterDto, user: JwtPayload) {
    // Verificar acceso a la tienda
    await this.validateShopAccess(dto.shopId, user);

    // Verificar que no haya otra caja abierta para esta tienda
    const existingOpen = await this.prisma.cashRegister.findFirst({
      where: {
        shopId: dto.shopId,
        status: 'OPEN',
      },
    });

    if (existingOpen) {
      throw new BadRequestException(
        'Ya existe una caja abierta para esta tienda. Debe cerrarla antes de abrir una nueva.',
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

  async close(id: string, dto: CloseCashRegisterDto, user: JwtPayload) {
    const cashRegister = await this.prisma.cashRegister.findUnique({
      where: { id },
      include: {
        shop: true,
        movements: true,
      },
    });

    if (!cashRegister) {
      throw new NotFoundException('Caja no encontrada');
    }

    if (cashRegister.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta caja');
    }

    if (cashRegister.status !== 'OPEN') {
      throw new BadRequestException('La caja ya está cerrada');
    }

    // Calcular monto esperado (apertura + movimientos)
    const totalMovements = cashRegister.movements.reduce((sum, mov) => {
      // Ingresos (+): SALE, INCOME, DEPOSIT
      if (['SALE', 'INCOME', 'DEPOSIT'].includes(mov.type)) {
        return sum + mov.amount;
      }
      // Egresos (-): PURCHASE, RETURN, EXPENSE, WITHDRAWAL
      if (['PURCHASE', 'RETURN', 'EXPENSE', 'WITHDRAWAL'].includes(mov.type)) {
        return sum - mov.amount;
      }
      return sum;
    }, 0);

    const closingAmount = cashRegister.openingAmount + totalMovements;
    const difference = dto.actualAmount - closingAmount;

    // Cerrar caja
    const closedCashRegister = await this.prisma.cashRegister.update({
      where: { id },
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
      },
    };
  }

  async getCurrentCashRegister(shopId: string, user: JwtPayload) {
    await this.validateShopAccess(shopId, user);

    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: {
        shopId,
        status: 'OPEN',
      },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!cashRegister) {
      return {
        message: 'No hay caja abierta',
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
    shopId: string,
    user: JwtPayload,
    startDate?: string,
    endDate?: string,
  ) {
    await this.validateShopAccess(shopId, user);

    const where: any = { shopId };

    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) where.openedAt.gte = new Date(startDate);
      if (endDate) where.openedAt.lte = new Date(endDate);
    }

    const cashRegisters = await this.prisma.cashRegister.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      take: 100,
    });

    return {
      message: 'Historial de cajas',
      data: cashRegisters,
    };
  }

  async getCashRegisterById(id: string, user: JwtPayload) {
    const cashRegister = await this.prisma.cashRegister.findUnique({
      where: { id },
      include: {
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
      },
    });

    if (!cashRegister) {
      throw new NotFoundException('Caja no encontrada');
    }

    if (cashRegister.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta caja');
    }

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
    shopId: string,
    filters: CashRegisterReportFiltersDto,
    user: JwtPayload,
  ) {
    await this.validateShopAccess(shopId, user);

    const { startDate, endDate } = this.calculateDateRange(filters);

    // Obtener todos los movimientos del período
    const movements = await this.prisma.cashMovement.findMany({
      where: {
        shopId,
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
    const topProduct = await this.getTopProductOfCurrentMonth(shopId);

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

  async getAvailableYears(shopId: string, user: JwtPayload) {
    await this.validateShopAccess(shopId, user);

    // Obtener el primer y último movimiento de caja
    const [firstMovement, lastMovement] = await Promise.all([
      this.prisma.cashMovement.findFirst({
        where: { shopId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      this.prisma.cashMovement.findFirst({
        where: { shopId },
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

    if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: { id: user.id, shopId },
      });

      if (!employee) {
        throw new ForbiddenException('No tienes permiso para esta tienda');
      }
    }
  }
}
