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

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, user: JwtPayload) {
    // Solo OWNER puede crear gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo un Dueño puede registrar gastos',
      );
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
    await this.validatePaymentMethod(createExpenseDto.paymentMethodId, createExpenseDto.shopId);

    const expense = await this.prisma.expense.create({
      data: {
        description: createExpenseDto.description,
        amount: createExpenseDto.amount,
        shopId: createExpenseDto.shopId,
        paymentMethodId: createExpenseDto.paymentMethodId,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
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
      throw new ForbiddenException(
        'Solo un Dueño puede ver los gastos',
      );
    }

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

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
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
      throw new ForbiddenException(
        'Solo un Dueño puede ver los gastos',
      );
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

  async update(id: string, updateExpenseDto: UpdateExpenseDto, user: JwtPayload) {
    // Solo OWNER puede actualizar gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo un Dueño puede actualizar gastos',
      );
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

    // Si se intenta cambiar de tienda, verificar que sea del mismo owner
    if (updateExpenseDto.shopId && updateExpenseDto.shopId !== expense.shopId) {
      const newShop = await this.prisma.shop.findFirst({
        where: {
          id: updateExpenseDto.shopId,
          ownerId: user.id,
          projectId: user.projectId,
        },
      });

      if (!newShop) {
        throw new ForbiddenException(
          'No tienes permiso para asignar el gasto a esta tienda',
        );
      }
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        description: updateExpenseDto.description ?? expense.description,
        amount: updateExpenseDto.amount ?? expense.amount,
        shopId: updateExpenseDto.shopId ?? expense.shopId,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : expense.date,
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

    return {
      message: 'Gasto actualizado correctamente',
      data: updatedExpense,
    };
  }

  async remove(id: string, user: JwtPayload) {
    // Solo OWNER puede eliminar gastos
    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo un Dueño puede eliminar gastos',
      );
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

    await this.prisma.expense.delete({
      where: { id },
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
}
