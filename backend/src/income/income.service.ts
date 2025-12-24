import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class IncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIncomeDto: CreateIncomeDto, user: JwtPayload) {
    // Solo OWNER puede crear ingresos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede registrar ingresos');
    }

    // Verificar que la tienda pertenezca al usuario
    const shop = await this.prisma.shop.findFirst({
      where: {
        id: createIncomeDto.shopId,
        ownerId: user.id,
        projectId: user.projectId,
      },
    });

    if (!shop) {
      throw new ForbiddenException(
        'No tienes permiso para registrar ingresos en esta tienda',
      );
    }

    // Validar método de pago
    await this.validatePaymentMethod(
      createIncomeDto.paymentMethodId,
      createIncomeDto.shopId,
    );

    // Validar que la caja esté abierta y sea de la tienda
    await this.validateOpenCashRegister(
      createIncomeDto.cashRegisterId,
      createIncomeDto.shopId,
    );

    const income = await this.prisma.$transaction(async (tx) => {
      const createdIncome = await tx.income.create({
        data: {
          description: createIncomeDto.description,
          amount: createIncomeDto.amount,
          shopId: createIncomeDto.shopId,
          paymentMethodId: createIncomeDto.paymentMethodId,
          date: createIncomeDto.date
            ? new Date(createIncomeDto.date)
            : new Date(),
          createdBy: user.id,
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          paymentMethod: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      await tx.cashMovement.create({
        data: {
          cashRegisterId: createIncomeDto.cashRegisterId,
          shopId: createIncomeDto.shopId,
          type: 'INCOME',
          amount: createdIncome.amount,
          description: createIncomeDto.description,
          userId: user.id,
          incomeId: createdIncome.id,
        },
      });

      return createdIncome;
    });

    return {
      message: 'Ingreso registrado correctamente',
      data: income,
    };
  }

  async findAll(
    user: JwtPayload,
    filters: {
      shopId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    // Solo OWNER puede ver ingresos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede ver los ingresos');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Construir condiciones de filtro
    const where: Prisma.IncomeWhereInput = {
      shop: {
        ownerId: user.id,
        projectId: user.projectId,
      },
    };

    if (filters.shopId) {
      where.shopId = filters.shopId;
    }

    if (filters.startDate || filters.endDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.startDate) {
        dateFilter.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateFilter.lte = new Date(filters.endDate);
      }
      where.date = dateFilter;
    }

    const [incomes, total] = await Promise.all([
      this.prisma.income.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          paymentMethod: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.income.count({ where }),
    ]);

    // Calcular total de ingresos
    const totalAmount = await this.prisma.income.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return {
      message: 'Ingresos obtenidos correctamente',
      data: incomes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalAmount: totalAmount._sum.amount || 0,
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    // Solo OWNER puede ver ingresos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede ver los ingresos');
    }

    const income = await this.prisma.income.findFirst({
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
        paymentMethod: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!income) {
      throw new NotFoundException('Ingreso no encontrado');
    }

    return {
      message: 'Ingreso obtenido correctamente',
      data: income,
    };
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto, user: JwtPayload) {
    // Solo OWNER puede actualizar ingresos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede actualizar ingresos');
    }

    // Verificar que el ingreso pertenezca al usuario
    const income = await this.prisma.income.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
      include: {
        cashMovement: {
          select: {
            id: true,
            cashRegisterId: true,
          },
        },
      },
    });

    if (!income) {
      throw new NotFoundException('Ingreso no encontrado');
    }

    if (updateIncomeDto.shopId && updateIncomeDto.shopId !== income.shopId) {
      throw new BadRequestException(
        'No se puede cambiar la tienda de un ingreso ya registrado',
      );
    }

    const targetCashRegisterId =
      updateIncomeDto.cashRegisterId ?? income.cashMovement?.cashRegisterId;

    if (!targetCashRegisterId) {
      throw new BadRequestException(
        'Debe especificar una caja abierta para el ingreso',
      );
    }

    if (
      updateIncomeDto.cashRegisterId &&
      updateIncomeDto.cashRegisterId !== income.cashMovement?.cashRegisterId
    ) {
      await this.validateOpenCashRegister(targetCashRegisterId, income.shopId);
    }

    const updatedIncome = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.income.update({
        where: { id },
        data: {
          description: updateIncomeDto.description ?? income.description,
          amount: updateIncomeDto.amount ?? income.amount,
          shopId: income.shopId,
          date: updateIncomeDto.date
            ? new Date(updateIncomeDto.date)
            : income.date,
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (income.cashMovement) {
        await tx.cashMovement.update({
          where: { id: income.cashMovement.id },
          data: {
            cashRegisterId: targetCashRegisterId,
            shopId: updated.shopId,
            amount: updated.amount,
            description: updateIncomeDto.description ?? income.description,
          },
        });
      } else {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: targetCashRegisterId,
            shopId: updated.shopId,
            type: 'INCOME',
            amount: updated.amount,
            description: updateIncomeDto.description ?? updated.description,
            userId: user.id,
            incomeId: updated.id,
          },
        });
      }

      return updated;
    });

    return {
      message: 'Ingreso actualizado correctamente',
      data: updatedIncome,
    };
  }

  async remove(id: string, user: JwtPayload) {
    // Solo OWNER puede eliminar ingresos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede eliminar ingresos');
    }

    // Verificar que el ingreso pertenezca al usuario
    const income = await this.prisma.income.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
    });

    if (!income) {
      throw new NotFoundException('Ingreso no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cashMovement.deleteMany({ where: { incomeId: id } });
      await tx.income.delete({ where: { id } });
    });

    return {
      message: 'Ingreso eliminado correctamente',
    };
  }

  private async validateOpenCashRegister(
    cashRegisterId: string,
    shopId: string,
  ) {
    const cashRegister = await this.prisma.cashRegister.findFirst({
      where: {
        id: cashRegisterId,
        shopId,
        status: 'OPEN',
      },
    });

    if (!cashRegister) {
      throw new BadRequestException(
        'La caja seleccionada no está abierta en esta tienda.',
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
}
