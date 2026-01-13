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
        const creditLimit = customer.creditLimit ?? 0;
        if (creditLimit === 0) {
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

      const baseUnitPrice = shopProduct.salePrice;
      const requestedUnitPrice =
        item.unitPrice !== undefined ? item.unitPrice : baseUnitPrice;

      if (
        !shopProduct.product.allowPriceOverride &&
        item.unitPrice !== undefined &&
        item.unitPrice !== baseUnitPrice
      ) {
        throw new BadRequestException(
          `El producto ${shopProduct.product.name} no permite editar el precio`,
        );
      }

      const unitPrice = requestedUnitPrice;
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

      const creditLimit = customer.creditLimit ?? 0;
      const newBalance = customer.currentBalance + totalAmount;
      if (newBalance > creditLimit) {
        throw new BadRequestException(
          `El total de la venta (${totalAmount}) excede el límite de crédito disponible. Límite: ${creditLimit}, Deuda actual: ${customer.currentBalance}, Disponible: ${creditLimit - customer.currentBalance}`,
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
          history: {
            orderBy: { createdAt: 'desc' },
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
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  async getSalesByShopPaginated(
    shopId: string,
    user: JwtPayload,
    filters: {
      startDate?: string;
      endDate?: string;
      paymentMethodId?: string;
      status?: SaleStatus;
    },
    page?: string,
    limit?: string,
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const parsedPage = Number(page ?? 1);
    const parsedLimit = Number(limit ?? 10);
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

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

    const [data, totalItems] = await Promise.all([
      this.prisma.sale.findMany({
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
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    const saleIds = data.map((sale) => sale.id);
    const histories = saleIds.length
      ? await this.prisma.saleHistory.findMany({
          where: { saleId: { in: saleIds } },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    const historyBySaleId = new Map<string, unknown>();
    for (const history of histories) {
      if (!historyBySaleId.has(history.saleId)) {
        historyBySaleId.set(history.saleId, history.snapshot);
      }
    }

    const enrichedData = data.map((sale) => ({
      ...sale,
      changesSummary: buildChangesSummary(
        historyBySaleId.get(sale.id) ?? null,
        sale,
      ),
    }));

    return {
      data: enrichedData,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
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
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (sale.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta venta');
    }

    return {
      ...sale,
      items: sale.items.map((item) => ({
        ...item,
        allowPriceOverride: item.shopProduct?.product?.allowPriceOverride ?? false,
      })),
    };
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

    const { items } = dto;

    if (!items) {
      return this.prisma.sale.update({
        where: { id },
        data: {
          notes: dto.notes,
          invoiceNumber: dto.invoiceNumber,
          invoiceType: dto.invoiceType,
          paymentMethodId: dto.paymentMethodId,
          discountAmount: dto.discountAmount,
          customerId: dto.customerId,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const oldSale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!oldSale) {
        throw new NotFoundException('Venta no encontrada');
      }

      await tx.saleHistory.create({
        data: {
          saleId: id,
          action: 'UPDATED',
          snapshot: {
            sale: oldSale,
            items: oldSale.items,
          },
        },
      });

      const currentQtyByProduct = new Map<string, number>();
      for (const item of oldSale.items) {
        const previousQty = currentQtyByProduct.get(item.shopProductId) ?? 0;
        currentQtyByProduct.set(
          item.shopProductId,
          previousQty + Number(item.quantity),
        );
      }

      const incomingQtyByProduct = new Map<string, number>();
      for (const item of items) {
        const previousQty = incomingQtyByProduct.get(item.shopProductId) ?? 0;
        incomingQtyByProduct.set(item.shopProductId, previousQty + item.quantity);
      }

      const stockProductIds = new Set<string>([
        ...currentQtyByProduct.keys(),
        ...incomingQtyByProduct.keys(),
      ]);

      if (stockProductIds.size > 0) {
        const stockProducts = await tx.shopProduct.findMany({
          where: {
            id: { in: Array.from(stockProductIds) },
            shopId: sale.shopId,
          },
          select: {
            id: true,
            stock: true,
          },
        });

        if (stockProducts.length !== stockProductIds.size) {
          throw new BadRequestException(
            'Algunos productos no existen para esta venta',
          );
        }

        const stockById = new Map(
          stockProducts.map((product) => [product.id, product.stock]),
        );

        for (const shopProductId of stockProductIds) {
          const oldQty = currentQtyByProduct.get(shopProductId) ?? 0;
          const newQty = incomingQtyByProduct.get(shopProductId) ?? 0;
          const delta = oldQty - newQty;

          if (delta === 0) continue;

          const currentStock = stockById.get(shopProductId);
          if (currentStock === null) {
            continue;
          }

          await tx.shopProduct.update({
            where: { id: shopProductId },
            data: {
              stock: {
                increment: delta,
              },
            },
          });
        }
      }

      await tx.saleItem.deleteMany({
        where: { saleId: id },
      });

      const shopProductIds = items.map((item) => item.shopProductId);
      const shopProducts = await tx.shopProduct.findMany({
        where: {
          id: { in: shopProductIds },
          shopId: sale.shopId,
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

      const shopProductsById = new Map(
        shopProducts.map((shopProduct) => [shopProduct.id, shopProduct]),
      );

      const itemsData = items.map((item) => {
        const shopProduct = shopProductsById.get(item.shopProductId);
        if (!shopProduct) {
          throw new BadRequestException('Producto inv�lido para la venta');
        }

        const discount = item.discount ?? 0;
        const baseUnitPrice = shopProduct.salePrice;
        const requestedUnitPrice =
          item.unitPrice !== undefined ? item.unitPrice : baseUnitPrice;

        if (
          !shopProduct.product.allowPriceOverride &&
          item.unitPrice !== undefined &&
          item.unitPrice !== baseUnitPrice
        ) {
          throw new BadRequestException(
            `El producto ${shopProduct.product.name} no permite editar el precio`,
          );
        }

        const unitPrice = requestedUnitPrice;
        const subtotal = unitPrice * item.quantity;
        const taxRate = shopProduct.product.taxRate || 0;
        const taxAmount = ((subtotal - discount) * taxRate) / 100;
        const total = subtotal - discount + taxAmount;

        return {
          saleId: id,
          shopProductId: item.shopProductId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
          discount,
          taxRate,
          taxAmount,
          total,
        };
      });

      await tx.saleItem.createMany({
        data: itemsData,
      });

      const subtotal = itemsData.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      );
      const taxAmount = itemsData.reduce(
        (acc, item) => acc + (item.taxAmount ?? 0),
        0,
      );
      const discountAmount = itemsData.reduce(
        (acc, item) => acc + (item.discount ?? 0),
        0,
      );
      const totalAmount = subtotal + taxAmount - discountAmount;

      return tx.sale.update({
        where: { id },
        data: {
          notes: dto.notes,
          invoiceNumber: dto.invoiceNumber,
          invoiceType: dto.invoiceType,
          paymentMethodId: dto.paymentMethodId,
          customerId: dto.customerId,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
        },
      });
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
          action: 'CANCELLED',
          snapshot: {
            sale,
            items: sale.items,
          },
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

        const quantity = Number(item.quantity);
        const newStock = item.shopProduct.stock + quantity;

        await tx.shopProduct.update({
          where: { id: item.shopProductId },
          data: { stock: newStock },
        });

        await this.stockService.updateStock({
          tx,
          shopProductId: item.shopProductId,
          delta: quantity,
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

type SaleItemSnapshot = {
  shopProductId: string;
  quantity: number | Prisma.Decimal;
  unitPrice: number;
};

type SaleSnapshot = {
  totalAmount?: number;
  items?: SaleItemSnapshot[];
};

type SaleHistorySnapshot = {
  sale?: SaleSnapshot;
  items?: SaleItemSnapshot[];
};

type SaleItemLike = SaleItemSnapshot & Record<string, unknown>;

type SaleLike = {
  totalAmount?: number;
  updatedAt?: Date | string | null;
  items?: SaleItemLike[];
};

function buildChangesSummary(snapshot: unknown, currentSale: SaleLike) {
  if (!snapshot) {
    return {
      wasEdited: false,
      lastEditedAt: null,
      changes: {},
    };
  }

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

  const parseItems = (items: unknown): SaleItemSnapshot[] => {
    if (!Array.isArray(items)) return [];
    return items
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => ({
        shopProductId: String(item.shopProductId ?? ''),
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      }))
      .filter((item) => item.shopProductId.length > 0);
  };

  const snapshotRecord = isRecord(snapshot) ? snapshot : null;
  const snapshotSale = snapshotRecord?.sale && isRecord(snapshotRecord.sale)
    ? (snapshotRecord.sale as SaleSnapshot)
    : (snapshotRecord as SaleSnapshot | null);

  const snapshotItems = snapshotRecord?.items
    ? parseItems(snapshotRecord.items)
    : parseItems(snapshotSale?.items);

  if (!snapshotSale) {
    return {
      wasEdited: false,
      lastEditedAt: null,
      changes: {},
    };
  }

  const toIsoString = (value: unknown) => {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return null;
  };

  const buildItemMap = (items: any[]) => {
    const map = new Map<string, { quantity: number; unitPrice: number }>();
    for (const item of items ?? []) {
      if (!item?.shopProductId) continue;
      const shopProductId = String(item.shopProductId);
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unitPrice ?? 0);
      const existing = map.get(shopProductId);
      if (existing) {
        existing.quantity += quantity;
        if (existing.unitPrice === 0 && unitPrice !== 0) {
          existing.unitPrice = unitPrice;
        }
        continue;
      }
      map.set(shopProductId, { quantity, unitPrice });
    }
    return map;
  };

  const beforeMap = buildItemMap(snapshotItems);
  const afterMap = buildItemMap(currentSale?.items ?? []);

  const beforeUnits = Array.from(beforeMap.values()).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const afterUnits = Array.from(afterMap.values()).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const changes: {
    totalAmount?: { before: number; after: number };
    itemsUnits?: { before: number; after: number };
    items?: {
      added: { shopProductId: string; quantity: number }[];
      removed: { shopProductId: string; quantity: number }[];
      updated: {
        shopProductId: string;
        quantity?: { before: number; after: number };
        unitPrice?: { before: number; after: number };
      }[];
    };
  } = {};

  const beforeTotal = Number(snapshotSale.totalAmount ?? 0);
  const afterTotal = Number(currentSale?.totalAmount ?? 0);
  if (beforeTotal !== afterTotal) {
    changes.totalAmount = { before: beforeTotal, after: afterTotal };
  }

  if (beforeUnits !== afterUnits) {
    changes.itemsUnits = { before: beforeUnits, after: afterUnits };
  }

  const added: { shopProductId: string; quantity: number }[] = [];
  const removed: { shopProductId: string; quantity: number }[] = [];
  const updated: {
    shopProductId: string;
    quantity?: { before: number; after: number };
    unitPrice?: { before: number; after: number };
  }[] = [];

  for (const [shopProductId, afterItem] of afterMap) {
    if (!beforeMap.has(shopProductId)) {
      added.push({ shopProductId, quantity: afterItem.quantity });
    }
  }

  for (const [shopProductId, beforeItem] of beforeMap) {
    const afterItem = afterMap.get(shopProductId);
    if (!afterItem) {
      removed.push({ shopProductId, quantity: beforeItem.quantity });
      continue;
    }

    const updatedEntry: {
      shopProductId: string;
      quantity?: { before: number; after: number };
      unitPrice?: { before: number; after: number };
    } = { shopProductId };

    if (beforeItem.quantity !== afterItem.quantity) {
      updatedEntry.quantity = {
        before: beforeItem.quantity,
        after: afterItem.quantity,
      };
    }

    if (beforeItem.unitPrice !== afterItem.unitPrice) {
      updatedEntry.unitPrice = {
        before: beforeItem.unitPrice,
        after: afterItem.unitPrice,
      };
    }

    if (updatedEntry.quantity || updatedEntry.unitPrice) {
      updated.push(updatedEntry);
    }
  }

  if (added.length || removed.length || updated.length) {
    changes.items = { added, removed, updated };
  }

  const wasEdited = Object.keys(changes).length > 0;

  return {
    wasEdited,
    lastEditedAt: wasEdited ? toIsoString(currentSale?.updatedAt) : null,
    changes,
  };
}
