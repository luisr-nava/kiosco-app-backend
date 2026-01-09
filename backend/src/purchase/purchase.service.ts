import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePurchaseDto, PurchaseItemDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { DeletePurchaseDto } from './dto/delete-purchase.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { Prisma, PurchaseStatus } from '@prisma/client';
import { StockService } from '../stock/stock.service';

interface PurchaseQuery {
  search?: string;
  page?: number;
  limit?: number;
  shopId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  status?: PurchaseStatus;
}

type PurchaseWithItems = Prisma.PurchaseGetPayload<{
  include: {
    shop: { select: { ownerId: true } };
    items: { include: { shopProduct: true } };
  };
}>;

@Injectable()
export class PurchaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashRegisterService: CashRegisterService,
    private readonly stockService: StockService,
  ) {}

  async createPurchase(dto: CreatePurchaseDto, user: JwtPayload) {
    await this.validateShopAccess(dto.shopId, user);

    await this.validateSupplierIfExists(dto.supplierId, user);

    await this.validatePaymentMethod(dto.paymentMethodId, dto.shopId);

    const shopProducts = await this.getShopProducts(dto.shopId, dto.items);

    const purchase = await this.prisma.$transaction(async (tx) => {
      // Crear la compra principal
      const purchase = await tx.purchase.create({
        data: {
          shopId: dto.shopId,
          supplierId: dto.supplierId ?? null,
          paymentMethodId: dto.paymentMethodId,
          notes: dto.notes ?? null,
          totalAmount: dto.items.reduce((acc, i) => acc + i.subtotal, 0),
        },
      });

      // Procesar cada item (esto queda en el create sin helpers nuevos)
      for (const item of dto.items) {
        const sp = shopProducts.find((p) => p.id === item.shopProductId);

        if (!sp) {
          throw new BadRequestException(
            `El producto con ID ${item.shopProductId} no fue encontrado.`,
          );
        }

        const previousStock = sp.stock ?? 0;
        const newStock = previousStock + item.quantity;

        // Crear registro del item de compra
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            shopProductId: item.shopProductId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            subtotal: item.subtotal,
          },
        });

        await this.stockService.updateStock({
          tx,
          shopProductId: item.shopProductId,
          delta: item.quantity,
          userId: user.id,
          reason: 'purchase',
          note: dto.notes,
        });
      }

      // Crear movimiento de caja si hay caja abierta (pago en efectivo)
      const openCashRegister = await tx.cashRegister.findFirst({
        where: {
          shopId: dto.shopId,
          status: 'OPEN',
          employeeId: user.id,
        },
      });

      if (openCashRegister && purchase.totalAmount) {
        const supplier = dto.supplierId
          ? await tx.supplier.findUnique({ where: { id: dto.supplierId } })
          : null;

        await tx.cashMovement.create({
          data: {
            cashRegisterId: openCashRegister.id,
            shopId: dto.shopId,
            type: 'PURCHASE',
            amount: purchase.totalAmount,
            description: `Pago a proveedor${supplier ? ` - ${supplier.name}` : ''}`,
            userId: user.id,
            purchaseId: purchase.id,
          },
        });
      }

      return purchase;
    });

    return purchase;
  }

  private async validateShopAccess(shopId: string, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { projectId: true, ownerId: true },
    });

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Validar que la tienda pertenece al proyecto del usuario
    if (shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    // Si es OWNER, ya validamos projectId, permitir acceso
    if (user.role === 'OWNER') {
      return;
    }

    // Si es EMPLOYEE, validar que esté asignado a esta tienda específica
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: user.id,
        employeeShops: { some: { shopId } },
      },
    });

    if (!employee) {
      throw new ForbiddenException(
        'No tenés permiso para operar en esta tienda.',
      );
    }
  }

  private async validateSupplierIfExists(
    supplierId: string | null | undefined,
    user: JwtPayload,
  ) {
    if (!supplierId) return;

    const exists = await this.prisma.supplier.findFirst({
      where: {
        id: supplierId,
        ownerId: user.id,
      },
    });

    if (!exists) {
      throw new BadRequestException(
        'El proveedor no existe o no pertenece al usuario.',
      );
    }
  }

  private async validatePaymentMethod(paymentMethodId: string, shopId: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        shopId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new BadRequestException(
        'El método de pago no existe o no está activo en esta tienda.',
      );
    }
  }

  private async getShopProducts(shopId: string, items: PurchaseItemDto[]) {
    const ids = items.map((i) => i.shopProductId);

    const results = await this.prisma.shopProduct.findMany({
      where: { id: { in: ids }, shopId },
    });

    if (results.length !== items.length) {
      throw new ForbiddenException(
        'Uno o más productos no pertenecen a esta tienda.',
      );
    }

    return results;
  }

  private async createPurchaseRecord(
    tx: Prisma.TransactionClient,
    dto: CreatePurchaseDto,
  ) {
    return tx.purchase.create({
      data: {
        shopId: dto.shopId,
        supplierId: dto.supplierId ?? null,
        paymentMethodId: dto.paymentMethodId,
        notes: dto.notes ?? null,
        totalAmount: dto.items.reduce((acc, item) => acc + item.subtotal, 0),
      },
    });
  }

  async findAll(user: JwtPayload, query: PurchaseQuery) {
    const {
      search,
      page = 1,
      limit = 20,
      shopId,
      supplierId,
      startDate,
      endDate,
      status,
    } = query;

    let accessibleShopIds: string[] = [];

    if (user.role === 'OWNER') {
      const shops = await this.prisma.shop.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      accessibleShopIds = shops.map((s) => s.id);
    } else {
      const employee = await this.prisma.employee.findFirst({
        where: { id: user.id },
        select: { employeeShops: { select: { shopId: true } } },
      });

      const employeeShopIds =
        employee?.employeeShops.map((relation) => relation.shopId) ?? [];

      if (employeeShopIds.length === 0) {
        throw new ForbiddenException('No se encontró información del empleado');
      }

      accessibleShopIds = employeeShopIds;
    }

    if (shopId && !accessibleShopIds.includes(shopId)) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const targetShopIds = shopId ? [shopId] : accessibleShopIds;

    if (targetShopIds.length === 0) {
      throw new ForbiddenException('No tenés tiendas asignadas');
    }

    const filters: Prisma.PurchaseWhereInput = {
      shopId: { in: targetShopIds },
      status: status ?? 'COMPLETED',
    };

    if (supplierId) {
      filters.supplierId = supplierId;
    }

    if (startDate || endDate) {
      const purchaseDate: Prisma.DateTimeFilter = {};
      if (startDate) {
        purchaseDate.gte = new Date(startDate);
      }
      if (endDate) {
        purchaseDate.lte = new Date(endDate);
      }
      filters.purchaseDate = purchaseDate;
    }

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      filters.OR = [
        {
          supplier: {
            name: { contains: normalizedSearch, mode: 'insensitive' },
          },
        },
        {
          items: {
            some: {
              shopProduct: {
                product: {
                  name: { contains: normalizedSearch, mode: 'insensitive' },
                },
              },
            },
          },
        },
      ];
    }

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where: filters,
        include: {
          shop: { select: { name: true } },
          supplier: { select: { name: true } },
          items: {
            include: {
              shopProduct: {
                include: {
                  product: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { purchaseDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchase.count({ where: filters }),
    ]);

    return {
      message:
        user.role === 'OWNER'
          ? 'Compras de todas tus tiendas'
          : 'Compras de tu tienda asignada',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: purchases.map((p) => ({
        id: p.id,
        shopId: p.shopId,
        shopName: p.shop.name,
        supplierId: p.supplierId,
        supplierName: p.supplier?.name,
        paymentMethodId: p.paymentMethodId,
        totalAmount: p.totalAmount,
        itemsCount: p.items.length,
        purchaseDate: p.purchaseDate,
        status: p.status,
        notes: p.notes,
        items: p.items.map((item) => ({
          id: item.id,
          shopProductId: item.shopProductId,
          productName: item.shopProduct.product.name,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.subtotal,
        })),
      })),
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            ownerId: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            contactName: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            shopProduct: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    barcode: true,
                  },
                },
              },
            },
          },
        },
        histories: {
          select: {
            id: true,
            shopProductId: true,
            userId: true,
            changeType: true,
            previousStock: true,
            newStock: true,
            previousCost: true,
            newCost: true,
            createdAt: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('La compra no existe');
    }

    // Verificar permisos
    if (user.role === 'OWNER' && purchase.shop.ownerId !== user.id) {
      throw new ForbiddenException('No tenés permiso para ver esta compra');
    } else if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: user.id,
          employeeShops: { some: { shopId: purchase.shopId } },
        },
      });
      if (!employee) {
        throw new ForbiddenException('No tenés permiso para ver esta compra');
      }
    }

    return {
      message: 'Compra encontrada',
      data: {
        id: purchase.id,
        shopId: purchase.shopId,
        shopName: purchase.shop.name,
        shopAddress: purchase.shop.address,
        supplierId: purchase.supplierId,
        supplier: purchase.supplier,
        paymentMethodId: purchase.paymentMethodId,
        totalAmount: purchase.totalAmount,
        purchaseDate: purchase.purchaseDate,
        status: purchase.status,
        cancelledAt: purchase.cancelledAt,
        cancelledBy: purchase.cancelledBy,
        cancellationReason: purchase.cancellationReason,
        notes: purchase.notes,
        items: purchase.items.map((item) => ({
          id: item.id,
          shopProductId: item.shopProductId,
          product: {
            id: item.shopProduct.product.id,
            name: item.shopProduct.product.name,
            description: item.shopProduct.product.description,
            barcode: item.shopProduct.product.barcode,
          },
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.subtotal,
        })),
        histories: purchase.histories,
      },
    };
  }

  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
    user: JwtPayload,
  ) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        shop: { select: { ownerId: true } },
        items: {
          include: {
            shopProduct: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('La compra no existe');
    }

    // Verificar que no esté cancelada
    if (purchase.status === 'CANCELLED') {
      throw new BadRequestException(
        'No se puede actualizar una compra cancelada',
      );
    }

    // Verificar permisos
    if (user.role === 'OWNER' && purchase.shop.ownerId !== user.id) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar esta compra',
      );
    } else if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: user.id,
          employeeShops: { some: { shopId: purchase.shopId } },
        },
      });
      if (!employee) {
        throw new ForbiddenException(
          'No tenés permiso para actualizar esta compra',
        );
      }
    }

    // Validar proveedor si se está cambiando
    if (updatePurchaseDto.supplierId !== undefined) {
      await this.validateSupplierIfExists(updatePurchaseDto.supplierId, user);
    }

    // Si se envían items, actualizar los items y el stock
    if (updatePurchaseDto.items && updatePurchaseDto.items.length > 0) {
      return this.updateWithItems(id, purchase, updatePurchaseDto, user);
    }

    // Si no se envían items, solo actualizar notas y proveedor
    const updated = await this.prisma.purchase.update({
      where: { id },
      data: {
        notes: updatePurchaseDto.notes,
        supplierId: updatePurchaseDto.supplierId ?? purchase.supplierId,
      },
      include: {
        shop: { select: { name: true } },
        supplier: { select: { name: true } },
        items: {
          include: {
            shopProduct: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return {
      message: 'Compra actualizada correctamente',
      data: {
        id: updated.id,
        shopName: updated.shop.name,
        supplierName: updated.supplier?.name,
        totalAmount: updated.totalAmount,
        purchaseDate: updated.purchaseDate,
        notes: updated.notes,
        itemsCount: updated.items.length,
      },
    };
  }

  private async updateWithItems(
    purchaseId: string,
    purchase: PurchaseWithItems,
    updatePurchaseDto: UpdatePurchaseDto,
    user: JwtPayload,
  ) {
    const newItems = updatePurchaseDto.items!;
    const currentItems = purchase.items;
    const modifiedProductIds = new Set<string>();

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Procesar items existentes: comparar y actualizar o eliminar
      for (const currentItem of currentItems) {
        const newItem = newItems.find(
          (ni) => ni.shopProductId === currentItem.shopProductId,
        );

        if (!newItem) {
          // Item eliminado: revertir stock completamente
          const shopProduct = currentItem.shopProduct;
          await this.stockService.updateStock({
            tx,
            shopProductId: currentItem.shopProductId,
            delta: -currentItem.quantity,
            userId: user.id,
            reason: 'purchase_cancel',
            note: 'Eliminación de item de compra',
          });

          modifiedProductIds.add(currentItem.shopProductId);

          // Eliminar el item de la compra
          await tx.purchaseItem.delete({
            where: { id: currentItem.id },
          });
        } else {
          // Item existe: verificar si cambió quantity o unitCost
          const quantityChanged = newItem.quantity !== currentItem.quantity;
          const costChanged = newItem.unitCost !== currentItem.unitCost;

          if (quantityChanged || costChanged) {
            const shopProduct = currentItem.shopProduct;
            const quantityDiff = newItem.quantity - currentItem.quantity;

            await this.stockService.updateStock({
              tx,
              shopProductId: currentItem.shopProductId,
              delta: quantityDiff,
              userId: user.id,
              reason: 'purchase',
              note: 'Actualización de compra',
            });

            modifiedProductIds.add(currentItem.shopProductId);

            // Actualizar el item de compra
            await tx.purchaseItem.update({
              where: { id: currentItem.id },
              data: {
                quantity: newItem.quantity,
                unitCost: newItem.unitCost,
                subtotal: newItem.subtotal,
              },
            });
          }
        }
      }

      // 2. Procesar items nuevos
      for (const newItem of newItems) {
        const exists = currentItems.find(
          (ci) => ci.shopProductId === newItem.shopProductId,
        );

        if (!exists) {
          // Item nuevo: agregarlo y sumar stock
          const shopProduct = await tx.shopProduct.findUnique({
            where: { id: newItem.shopProductId },
          });

          if (!shopProduct) {
            throw new BadRequestException(
              `Producto ${newItem.shopProductId} no encontrado`,
            );
          }

          // Crear el nuevo item
          await tx.purchaseItem.create({
            data: {
              purchaseId: purchase.id,
              shopProductId: newItem.shopProductId,
              quantity: newItem.quantity,
              unitCost: newItem.unitCost,
              subtotal: newItem.subtotal,
            },
          });

          await this.stockService.updateStock({
            tx,
            shopProductId: newItem.shopProductId,
            delta: newItem.quantity,
            userId: user.id,
            reason: 'purchase',
            note: 'Item agregado a compra existente',
          });

          modifiedProductIds.add(newItem.shopProductId);
        }
      }

      // 3. Actualizar totalAmount de la compra
      const newTotalAmount = newItems.reduce(
        (acc, item) => acc + item.subtotal,
        0,
      );

      const updated = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          notes: updatePurchaseDto.notes ?? purchase.notes,
          supplierId: updatePurchaseDto.supplierId ?? purchase.supplierId,
          totalAmount: newTotalAmount,
        },
        include: {
          shop: { select: { name: true } },
          supplier: { select: { name: true } },
          items: {
            include: {
              shopProduct: {
                include: {
                  product: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      return {
        message: 'Compra e items actualizados correctamente',
        data: {
          id: updated.id,
          shopName: updated.shop.name,
          supplierName: updated.supplier?.name,
          totalAmount: updated.totalAmount,
          purchaseDate: updated.purchaseDate,
          notes: updated.notes,
          itemsCount: updated.items.length,
        },
      };
    });

    return result;
  }

  async getDeletionHistory(user: JwtPayload, query: PurchaseQuery) {
    const { page = 1, limit = 20, shopId } = query;

    // Solo los OWNER pueden ver el historial de eliminaciones
    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden ver el historial de eliminaciones',
      );
    }

    let accessibleShopIds: string[] = [];
    const shops = await this.prisma.shop.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    accessibleShopIds = shops.map((s) => s.id);

    if (shopId && !accessibleShopIds.includes(shopId)) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const targetShopIds = shopId ? [shopId] : accessibleShopIds;

    if (targetShopIds.length === 0) {
      throw new ForbiddenException('No tenés tiendas asignadas');
    }

    const filters: Prisma.PurchaseDeletionHistoryWhereInput = {
      shopId: { in: targetShopIds },
    };

    const [deletions, total] = await Promise.all([
      this.prisma.purchaseDeletionHistory.findMany({
        where: filters,
        orderBy: { deletedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseDeletionHistory.count({ where: filters }),
    ]);

    return {
      message: 'Historial de compras eliminadas',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: deletions.map((d) => ({
        id: d.id,
        purchaseId: d.purchaseId,
        shopName: d.shopName,
        supplierName: d.supplierName,
        totalAmount: d.totalAmount,
        purchaseDate: d.purchaseDate,
        originalNotes: d.originalNotes,
        deletedBy: d.deletedByEmail,
        deletedAt: d.deletedAt,
        deletionReason: d.deletionReason,
        items: JSON.parse(d.itemsSnapshot),
      })),
    };
  }

  async remove(
    id: string,
    deletePurchaseDto: DeletePurchaseDto,
    user: JwtPayload,
  ) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        shop: { select: { id: true, name: true, ownerId: true } },
        supplier: { select: { id: true, name: true } },
        items: {
          include: {
            shopProduct: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('La compra no existe');
    }

    // Verificar que no esté ya cancelada
    if (purchase.status === 'CANCELLED') {
      throw new BadRequestException('La compra ya está cancelada');
    }

    // Solo los OWNER pueden cancelar
    if (user.role !== 'OWNER' || purchase.shop.ownerId !== user.id) {
      throw new ForbiddenException(
        'No tenés permiso para cancelar esta compra',
      );
    }

    const modifiedProductIds: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Revertir stock de todos los items y crear registros en historial
      for (const item of purchase.items) {
        modifiedProductIds.push(item.shopProductId);
        await this.stockService.updateStock({
          tx,
          shopProductId: item.shopProductId,
          delta: -item.quantity,
          userId: user.id,
          reason: 'purchase_cancel',
          note: `Compra cancelada - Se revirtió stock de ${item.quantity} unidades. Razón: ${deletePurchaseDto.deletionReason}`,
        });
      }

      // 2. Marcar la compra como cancelada (NO eliminarla)
      await tx.purchase.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: user.id,
          cancellationReason: deletePurchaseDto.deletionReason,
        },
      });
    });

    return {
      message: 'Compra cancelada correctamente',
      data: {
        id: purchase.id,
        shopName: purchase.shop.name,
        supplierName: purchase.supplier?.name,
        totalAmount: purchase.totalAmount,
        itemsCount: purchase.items.length,
        cancelledBy: user.id,
        cancellationReason: deletePurchaseDto.deletionReason,
        cancelledAt: new Date(),
      },
    };
  }
}
