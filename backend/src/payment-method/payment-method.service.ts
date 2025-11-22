import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto, user: JwtPayload) {
    await this.validateShopAccess(dto.shopId, user);

    const existing = await this.prisma.paymentMethod.findFirst({
      where: { shopId: dto.shopId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un método de pago con el código "${dto.code}" en esta tienda`,
      );
    }

    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        shopId: dto.shopId,
        name: dto.name,
        code: dto.code.toUpperCase(),
        description: dto.description,
      },
    });

    return {
      message: 'Método de pago creado correctamente',
      data: paymentMethod,
    };
  }

  async findAll(shopId: string, user: JwtPayload) {
    await this.validateShopAccess(shopId, user);

    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { shopId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Métodos de pago obtenidos correctamente',
      data: paymentMethods,
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    await this.validateShopAccess(paymentMethod.shopId, user);

    return {
      message: 'Método de pago encontrado',
      data: paymentMethod,
    };
  }

  async update(id: string, dto: UpdatePaymentMethodDto, user: JwtPayload) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    await this.validateShopAccess(paymentMethod.shopId, user);

    if (dto.code && dto.code !== paymentMethod.code) {
      const existing = await this.prisma.paymentMethod.findFirst({
        where: {
          shopId: paymentMethod.shopId,
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe otro método de pago con el código "${dto.code}"`,
        );
      }
    }

    const updated = await this.prisma.paymentMethod.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code ? dto.code.toUpperCase() : undefined,
        description: dto.description,
        isActive: dto.isActive,
      },
    });

    return {
      message: 'Método de pago actualizado correctamente',
      data: updated,
    };
  }

  async toggle(id: string, user: JwtPayload) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    await this.validateShopAccess(paymentMethod.shopId, user);

    if (paymentMethod.isActive) {
      const salesCount = await this.prisma.sale.count({
        where: { paymentMethodId: id, status: 'COMPLETED' },
      });

      if (salesCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar. Tiene ${salesCount} ventas asociadas`,
        );
      }
    }

    const updated = await this.prisma.paymentMethod.update({
      where: { id },
      data: { isActive: !paymentMethod.isActive },
    });

    return {
      message: `Método ${updated.isActive ? 'activado' : 'desactivado'} correctamente`,
      data: updated,
    };
  }

  async remove(id: string, user: JwtPayload) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Método de pago no encontrado');
    }

    await this.validateShopAccess(paymentMethod.shopId, user);

    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo el propietario puede eliminar métodos de pago',
      );
    }

    const salesCount = await this.prisma.sale.count({
      where: { paymentMethodId: id },
    });

    if (salesCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar. Tiene ${salesCount} ventas asociadas`,
      );
    }

    await this.prisma.paymentMethod.delete({ where: { id } });

    return {
      message: 'Método de pago eliminado correctamente',
      data: { id },
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
