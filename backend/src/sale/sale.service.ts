import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { StockService } from '../stock/stock.service';
import { SaleStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

@Injectable()
export class SaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashRegisterService: CashRegisterService,
    private readonly stockService: StockService,
  ) {}

  async create(dto: CreateSaleDto, user: JwtPayload) {
    // Verificar acceso a la tienda
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
      select: { id: true, ownerId: true, projectId: true },
    });

    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta tienda');
    }

    if (user.role === 'OWNER' && shop.ownerId !== user.id) {
      throw new ForbiddenException('No ten�s acceso a esta tienda');
    }

    const isEmployeeActor = user.role === 'EMPLOYEE' || user.role === 'MANAGER';
    const employeeWhere: Prisma.EmployeeWhereInput = { id: user.id };

    if (isEmployeeActor) {
      employeeWhere.employeeShops = {
        some: {
          shopId: dto.shopId,
        },
      };
    }

    const resolvedEmployee = await this.prisma.employee.findFirst({
      where: employeeWhere,
      select: { id: true },
    });

    if (isEmployeeActor && !resolvedEmployee) {
      throw new ForbiddenException('No ten�s permiso para esta tienda');
    }

    const employeeIdForSale = resolvedEmployee?.id;

    // Verificar que el método de pago exista y pertenezca a la tienda
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.paymentMethodId },
    });

    if (!paymentMethod || paymentMethod.shopId !== dto.shopId) {
      throw new BadRequestException('M�todo de pago inv�lido para esta tienda');
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException('El m�todo de pago no est� activo');
    }

    // Si hay cliente, verificar que exista y pertenezca a la tienda
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });

      if (!customer || customer.shopId !== dto.shopId) {
        throw new BadRequestException('Cliente inv�lido para esta tienda');
      }

      // Si es venta a cr�dito, verificar l�mite
      if (paymentMethod.code === 'ACCOUNT') {
        // Calcularemos el total despu�s, por ahora solo verificamos que tenga l�mite
        if (customer.creditLimit === 0) {
          throw new BadRequestException(
            'El cliente no tiene cr�dito habilitado',
          );
        }
      }
    } else if (paymentMethod.code === 'ACCOUNT') {
      throw new BadRequestException(
        'Las ventas a cuenta corriente requieren un cliente',
      );
    }

    // Obtener productos y validar stock
    const shopProductIds = dto.items.map((item) => item.shopProductId);
    const shopProducts = await this.prisma.shopProduct.findMany({
      where: {
        id: { in: shopProductIds },
        shopId: dto.shopId,
        isActive: true,
      },
      include: {
        product: true,
      },
    });

    if (shopProducts.length !== shopProductIds.length) {
      throw new BadRequestException(
        'Algunos productos no existen o no est�n activos',
      );
    }

    // Validar stock suficiente
    const stockErrors: string[] = [];
    for (const item of dto.items) {
      const shopProduct = shopProducts.find(
        (sp) => sp.id === item.shopProductId,
      );
      if (!shopProduct) continue;

      if (shopProduct.stock !== null && shopProduct.stock < item.quantity) {
        stockErrors.push(
          `${shopProduct.product.name}: stock insuficiente (disponible: ${shopProduct.stock}, solicitado: ${item.quantity})`,
        );
      }
    }

    if (stockErrors.length > 0) {
      throw new BadRequestException({
        message: 'Stock insuficiente',
        errors: stockErrors,
      });
    }

    // Calcular totales
    let subtotal = 0;
    let totalTaxAmount = 0;
    const itemsData: Array<{
      shopProductId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      discount: number;
      taxRate: number;
      taxAmount: number;
      total: number;
    }> = [];

    for (const item of dto.items) {
      const shopProduct = shopProducts.find(
        (sp) => sp.id === item.shopProductId,
      );
      if (!shopProduct) continue;

      const unitPrice = shopProduct.salePrice;
      const itemSubtotal = unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const taxRate = shopProduct.product.taxRate || 0;
      const itemTaxAmount = ((itemSubtotal - itemDiscount) * taxRate) / 100;
      const itemTotal = itemSubtotal - itemDiscount + itemTaxAmount;

      subtotal += itemSubtotal;
      totalTaxAmount += itemTaxAmount;

      itemsData.push({
        shopProductId: item.shopProductId,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
        discount: itemDiscount,
        taxRate,
        taxAmount: itemTaxAmount,
        total: itemTotal,
      });
    }

    const discountAmount = dto.discountAmount || 0;
    const totalAmount = subtotal - discountAmount + totalTaxAmount;

    // Si es venta a cr�dito, verificar que no exceda el l�mite
    if (dto.customerId && paymentMethod.code === 'ACCOUNT') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new BadRequestException('Cliente no encontrado');
      }

      const newBalance = customer.currentBalance + totalAmount;
      if (newBalance > customer.creditLimit) {
        throw new BadRequestException(
          `El total de la venta (${totalAmount}) excede el l�mite de cr�dito disponible. L�mite: ${customer.creditLimit}, Deuda actual: ${customer.currentBalance}, Disponible: ${customer.creditLimit - customer.currentBalance}`,
        );
      }
    }

    // Crear venta en transacci�n
    const sale = await this.prisma.$transaction(async (tx) => {
      // 1. Crear venta
      const sale = await tx.sale.create({
        data: {
          shopId: dto.shopId,
          customerId: dto.customerId,
          ...(employeeIdForSale ? { employeeId: employeeIdForSale } : {}),
          subtotal,
          discountAmount,
          taxAmount: totalTaxAmount,
          totalAmount,
          paymentMethodId: dto.paymentMethodId,
          paymentStatus: paymentMethod.code === 'ACCOUNT' ? 'PENDING' : 'PAID',
          notes: dto.notes,
          invoiceType: dto.invoiceType,
          invoiceNumber: dto.invoiceNumber,
          status: 'COMPLETED',
          items: {
            create: itemsData,
          },
        },
        include: {
          items: {
            include: {
              shopProduct: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // 2. Actualizar stock de productos
      for (const item of dto.items) {
        const shopProduct = shopProducts.find(
          (sp) => sp.id === item.shopProductId,
        );
        if (!shopProduct || shopProduct.stock === null) continue;

        await this.stockService.updateStock({
          tx,
          shopProductId: item.shopProductId,
          delta: -item.quantity,
          userId: user.id,
          reason: 'sale',
          note: `Venta #${sale.id.substring(0, 8)}`,
        });
      }

      // 4. Si es venta a cr�dito, crear movimiento de cuenta
      if (dto.customerId && paymentMethod.code === 'ACCOUNT') {
        const customer = await tx.customer.findUnique({
          where: { id: dto.customerId },
        });
        if (!customer) {
          throw new BadRequestException('Cliente no encontrado');
        }

        const previousBalance = customer.currentBalance;
        const newBalance = previousBalance + totalAmount;

        await tx.customerAccountMovement.create({
          data: {
            customerId: dto.customerId,
            shopId: dto.shopId,
            type: 'SALE',
            amount: totalAmount,
            previousBalance,
            newBalance,
            saleId: sale.id,
            description: `Venta ${dto.invoiceType || 'TICKET'} ${dto.invoiceNumber || ''}`,
          },
        });

        await tx.customer.update({
          where: { id: dto.customerId },
          data: { currentBalance: newBalance },
        });
      }

      // 5. Si es venta en efectivo, crear movimiento de caja
      if (paymentMethod.code === 'CASH') {
        // Buscar caja abierta
        const openCashRegister = await tx.cashRegister.findFirst({
          where: {
            shopId: dto.shopId,
            status: 'OPEN',
            employeeId: user.id,
          },
        });

        if (openCashRegister) {
          await tx.cashMovement.create({
            data: {
              cashRegisterId: openCashRegister.id,
              shopId: dto.shopId,
              type: 'SALE',
              amount: totalAmount,
              description: `Venta ${dto.invoiceType || 'TICKET'} ${dto.invoiceNumber || ''} ${dto.customerId ? `- Cliente` : ''}`,
              userId: user.id,
              saleId: sale.id,
            },
          });
        }
      }

      return sale;
    });

    return sale;
  }

  async findAll(
    shopId: string,
    user: JwtPayload,
    filters: {
      startDate?: string;
      endDate?: string;
      paymentMethodId?: string;
      status?: SaleStatus;
    },
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta tienda');
    }

    const where: Prisma.SaleWhereInput = { shopId };

    if (filters.paymentMethodId) {
      where.paymentMethodId = filters.paymentMethodId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      const saleDate: Prisma.DateTimeFilter = {};
      if (filters.startDate) saleDate.gte = new Date(filters.startDate);
      if (filters.endDate) saleDate.lte = new Date(filters.endDate);
      where.saleDate = saleDate;
    }

    return this.prisma.sale.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
          },
        },
        items: {
          include: {
            shopProduct: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  async findOne(id: string, user: JwtPayload) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        shop: true,
        customer: true,
        employee: true,
        items: {
          include: {
            shopProduct: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (sale.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta venta');
    }

    return sale;
  }

  async update(id: string, dto: UpdateSaleDto, user: JwtPayload) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (sale.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta venta');
    }

    // Solo permitir actualizar ventas COMPLETED (no canceladas ni devueltas)
    if (sale.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Solo se pueden actualizar ventas completadas',
      );
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        notes: dto.notes,
        invoiceNumber: dto.invoiceNumber,
        invoiceType: dto.invoiceType,
      },
    });
  }

  async cancel(id: string, user: JwtPayload, reason: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        shop: true,
        items: {
          include: {
            shopProduct: true,
          },
        },
        customer: true,
        paymentMethod: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (sale.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta venta');
    }

    if (sale.status === 'CANCELLED') {
      throw new BadRequestException('La venta ya est� cancelada');
    }

    // Cancelar en transacci�n
    const updatedSale = await this.prisma.$transaction(async (tx) => {
      // 1. Crear registro en SaleHistory
      await tx.saleHistory.create({
        data: {
          saleId: id,
          userId: user.id,
          action: 'CANCEL',
          previousData: JSON.stringify({ status: sale.status }),
          newData: JSON.stringify({ status: 'CANCELLED' }),
          reason,
        },
      });

      // 2. Actualizar estado de venta
      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: user.id,
          cancellationReason: reason,
        },
      });

      // 3. Devolver stock
      for (const item of sale.items) {
        if (item.shopProduct.stock === null) continue;

        const newStock = item.shopProduct.stock + item.quantity;

        await tx.shopProduct.update({
          where: { id: item.shopProductId },
          data: { stock: newStock },
        });

        await this.stockService.updateStock({
          tx,
          shopProductId: item.shopProductId,
          delta: item.quantity,
          userId: user.id,
          reason: 'sale_return',
          note: `Cancelación venta #${id.substring(0, 8)} - ${reason}`,
        });
      }

      // 3. Si era venta a cr�dito, revertir movimiento de cuenta
      if (sale.customerId && sale.paymentMethod.code === 'ACCOUNT') {
        const customer = sale.customer;
        if (!customer) {
          throw new BadRequestException('Cliente no encontrado');
        }

        const previousBalance = customer.currentBalance;
        const newBalance = previousBalance - sale.totalAmount;

        await tx.customerAccountMovement.create({
          data: {
            customerId: sale.customerId,
            shopId: sale.shopId,
            type: 'ADJUSTMENT',
            amount: -sale.totalAmount,
            previousBalance,
            newBalance,
            description: `Cancelaci�n de venta - ${reason}`,
          },
        });

        await tx.customer.update({
          where: { id: sale.customerId },
          data: { currentBalance: newBalance },
        });
      }

      return updatedSale;
    });

    return updatedSale;
  }
}
