import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, user: JwtPayload) {
    // Solo OWNER puede crear gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede registrar gastos');
    }

    // Verificar que la tienda pertenezca al usuario
    const shop = await this.prisma.shop.findFirst({
      where: {
        id: createExpenseDto.shopId,
        ownerId: user.id,
        projectId: user.projectId,
      },
    });

    if (!shop) {
      throw new ForbiddenException(
        'No tienes permiso para registrar gastos en esta tienda',
      );
    }

    // Validar método de pago
    await this.validatePaymentMethod(
      createExpenseDto.paymentMethodId,
      createExpenseDto.shopId,
    );

    // Validar que la caja esté abierta y sea de la tienda
    await this.validateOpenCashRegister(
      createExpenseDto.cashRegisterId,
      createExpenseDto.shopId,
    );

    const expense = await this.prisma.$transaction(async (tx) => {
      const createdExpense = await tx.expense.create({
        data: {
          description: createExpenseDto.description,
          amount: createExpenseDto.amount,
          shopId: createExpenseDto.shopId,
          paymentMethodId: createExpenseDto.paymentMethodId,
          date: createExpenseDto.date
            ? new Date(createExpenseDto.date)
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
          cashRegisterId: createExpenseDto.cashRegisterId,
          shopId: createExpenseDto.shopId,
          type: 'EXPENSE',
          amount: createdExpense.amount,
          description: createExpenseDto.description,
          userId: user.id,
          expenseId: createdExpense.id,
        },
      });

      return createdExpense;
    });

    return {
      message: 'Gasto registrado correctamente',
      data: expense,
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
    // Solo OWNER puede ver gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede ver los gastos');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Construir condiciones de filtro
    const where: Prisma.ExpenseWhereInput = {
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

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
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
      this.prisma.expense.count({ where }),
    ]);

    // Calcular total de gastos
    const totalAmount = await this.prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return {
      message: 'Gastos obtenidos correctamente',
      data: expenses,
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
    // Solo OWNER puede ver gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede ver los gastos');
    }

    const expense = await this.prisma.expense.findFirst({
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

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return {
      message: 'Gasto obtenido correctamente',
      data: expense,
    };
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    user: JwtPayload,
  ) {
    // Solo OWNER puede actualizar gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede actualizar gastos');
    }

    // Verificar que el gasto pertenezca al usuario
    const expense = await this.prisma.expense.findFirst({
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

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    if (updateExpenseDto.shopId && updateExpenseDto.shopId !== expense.shopId) {
      throw new BadRequestException(
        'No se puede cambiar la tienda de un gasto ya registrado',
      );
    }

    const targetCashRegisterId =
      updateExpenseDto.cashRegisterId ?? expense.cashMovement?.cashRegisterId;

    if (!targetCashRegisterId) {
      throw new BadRequestException(
        'Debe especificar una caja abierta para el gasto',
      );
    }

    // Validar nueva caja si se quiere cambiar
    if (
      updateExpenseDto.cashRegisterId &&
      updateExpenseDto.cashRegisterId !== expense.cashMovement?.cashRegisterId
    ) {
      await this.validateOpenCashRegister(targetCashRegisterId, expense.shopId);
    }

    const updatedExpense = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id },
        data: {
          description: updateExpenseDto.description ?? expense.description,
          amount: updateExpenseDto.amount ?? expense.amount,
          shopId: expense.shopId,
          date: updateExpenseDto.date
            ? new Date(updateExpenseDto.date)
            : expense.date,
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

      if (expense.cashMovement) {
        await tx.cashMovement.update({
          where: { id: expense.cashMovement.id },
          data: {
            cashRegisterId: targetCashRegisterId,
            shopId: updated.shopId,
            amount: updated.amount,
            description: updateExpenseDto.description ?? expense.description,
          },
        });
      } else {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: targetCashRegisterId,
            shopId: updated.shopId,
            type: 'EXPENSE',
            amount: updated.amount,
            description: updateExpenseDto.description ?? updated.description,
            userId: user.id,
            expenseId: updated.id,
          },
        });
      }

      return updated;
    });

    return {
      message: 'Gasto actualizado correctamente',
      data: updatedExpense,
    };
  }

  async remove(id: string, user: JwtPayload) {
    // Solo OWNER puede eliminar gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede eliminar gastos');
    }

    // Verificar que el gasto pertenezca al usuario
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        shop: {
          ownerId: user.id,
          projectId: user.projectId,
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cashMovement.deleteMany({ where: { expenseId: id } });
      await tx.expense.delete({ where: { id } });
    });

    return {
      message: 'Gasto eliminado correctamente',
    };
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
}
