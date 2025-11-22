import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
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
