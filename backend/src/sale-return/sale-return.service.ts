import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSaleReturnDto } from './dto/create-sale-return.dto';
import { UpdateSaleReturnDto } from './dto/update-sale-return.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class SaleReturnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashRegisterService: CashRegisterService,
  ) {}

  async create(createSaleReturnDto: CreateSaleReturnDto, user: JwtPayload) {
    // Verificar que la tienda pertenezca al usuario
    const shop = await this.prisma.shop.findFirst({
      where: {
        id: createSaleReturnDto.shopId,
        ownerId: user.id,
        projectId: user.projectId,
      },
    });

    if (!shop) {
      throw new ForbiddenException('No tienes permiso para esta tienda');
    }

    // Calcular el total
    const totalAmount = createSaleReturnDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Crear la devolución con sus items en una transacción
    const saleReturn = await this.prisma.$transaction(async (tx) => {
      const newReturn = await tx.saleReturn.create({
        data: {
          shopId: createSaleReturnDto.shopId,
          saleId: createSaleReturnDto.saleId,
          reason: createSaleReturnDto.reason,
          totalAmount,
          refundType: createSaleReturnDto.refundType,
          refundAmount: createSaleReturnDto.refundAmount,
          notes: createSaleReturnDto.notes,
          status: 'PENDING',
          items: {
            create: createSaleReturnDto.items.map((item) => ({
              shopProductId: item.shopProductId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
              reason: item.reason,
              condition: item.condition,
            })),
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
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return newReturn;
    });

    return {
      message: 'Devolución de venta creada correctamente',
      data: saleReturn,
    };
  }

  async findAll(
    user: JwtPayload,
    filters: {
      shopId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Construir condiciones de filtro
    const where: any = {
      shop: {
        ownerId: user.id,
        projectId: user.projectId,
      },
    };

    if (filters.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.returnDate = {};
      if (filters.startDate) {
        where.returnDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.returnDate.lte = new Date(filters.endDate);
      }
    }

    const [returns, total] = await Promise.all([
      this.prisma.saleReturn.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
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
          _count: {
            select: {
              items: true,
              purchaseReturns: true,
            },
          },
        },
        orderBy: { returnDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.saleReturn.count({ where }),
    ]);

    // Calcular totales
    const totalAmount = await this.prisma.saleReturn.aggregate({
      where,
      _sum: {
        totalAmount: true,
        refundAmount: true,
      },
    });

    return {
      message: 'Devoluciones obtenidas correctamente',
      data: returns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalAmount: totalAmount._sum.totalAmount || 0,
        totalRefunded: totalAmount._sum.refundAmount || 0,
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
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
        purchaseReturns: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!saleReturn) {
      throw new NotFoundException('Devolución no encontrada');
    }

    return {
      message: 'Devolución obtenida correctamente',
      data: saleReturn,
    };
  }

  async update(id: string, updateSaleReturnDto: UpdateSaleReturnDto, user: JwtPayload) {
    // Verificar que la devolución pertenezca al usuario
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
    });

    if (!saleReturn) {
      throw new NotFoundException('Devolución no encontrada');
    }

    // No permitir cambiar estado si ya está procesada
    if (saleReturn.status === 'PROCESSED' && updateSaleReturnDto.status) {
      throw new BadRequestException('No se puede modificar una devolución ya procesada');
    }

    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: {
        status: updateSaleReturnDto.status,
        notes: updateSaleReturnDto.notes,
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

    return {
      message: 'Devolución actualizada correctamente',
      data: updated,
    };
  }

  async approve(id: string, user: JwtPayload) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
      include: {
        items: true,
      },
    });

    if (!saleReturn) {
      throw new NotFoundException('Devolución no encontrada');
    }

    if (saleReturn.status !== 'PENDING') {
      throw new BadRequestException('Solo se pueden aprobar devoluciones pendientes');
    }

    // Aprobar y reintegrar stock
    const updated = await this.prisma.$transaction(async (tx) => {
      // Actualizar estado
      const approved = await tx.saleReturn.update({
        where: { id },
        data: { status: 'APPROVED' },
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

      // Reintegrar stock de cada item
      for (const item of saleReturn.items) {
        await tx.shopProduct.update({
          where: { id: item.shopProductId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });

        // Registrar en historial
        const shopProduct = await tx.shopProduct.findUnique({
          where: { id: item.shopProductId },
        });

        await tx.productHistory.create({
          data: {
            shopProductId: item.shopProductId,
            userId: user.id,
            changeType: 'SALE_RETURN',
            previousStock: (shopProduct?.stock || 0) - item.quantity,
            newStock: shopProduct?.stock || 0,
            note: `Devolución de venta #${id.substring(0, 8)}`,
          },
        });
      }

      // Si el reembolso es en efectivo, registrar movimiento de caja
      if (saleReturn.refundType === 'CASH' && saleReturn.refundAmount > 0) {
        // Buscar caja abierta
        const openCashRegister = await tx.cashRegister.findFirst({
          where: {
            shopId: saleReturn.shopId,
            status: 'OPEN',
          },
        });

        if (openCashRegister) {
          await tx.cashMovement.create({
            data: {
              cashRegisterId: openCashRegister.id,
              shopId: saleReturn.shopId,
              type: 'RETURN',
              amount: saleReturn.refundAmount,
              description: `Devolución de venta - ${saleReturn.reason}`,
              userId: user.id,
              saleReturnId: saleReturn.id,
            },
          });
        }
      }

      return approved;
    });

    return {
      message: 'Devolución aprobada y stock reintegrado',
      data: updated,
    };
  }

  async reject(id: string, reason: string, user: JwtPayload) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
    });

    if (!saleReturn) {
      throw new NotFoundException('Devolución no encontrada');
    }

    if (saleReturn.status !== 'PENDING') {
      throw new BadRequestException('Solo se pueden rechazar devoluciones pendientes');
    }

    const updated = await this.prisma.saleReturn.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason,
      },
    });

    return {
      message: 'Devolución rechazada',
      data: updated,
    };
  }

  async remove(id: string, user: JwtPayload) {
    const saleReturn = await this.prisma.saleReturn.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
    });

    if (!saleReturn) {
      throw new NotFoundException('Devolución no encontrada');
    }

    if (saleReturn.status === 'APPROVED' || saleReturn.status === 'PROCESSED') {
      throw new BadRequestException(
        'No se puede eliminar una devolución aprobada o procesada',
      );
    }

    await this.prisma.saleReturn.delete({
      where: { id },
    });

    return {
      message: 'Devolución eliminada correctamente',
    };
  }
}
