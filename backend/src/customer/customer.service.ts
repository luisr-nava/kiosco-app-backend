import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto, user: JwtPayload) {
    // Verificar que la tienda pertenece al proyecto del usuario
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
    });

    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta tienda');
    }

    // Verificar DNI �nico en la tienda (si se proporciona)
    if (dto.dni) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          shopId: dto.shopId,
          dni: dto.dni,
          isActive: true,
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Ya existe un cliente con ese DNI en esta tienda',
        );
      }
    }

    return this.prisma.customer.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        dni: dto.dni,
        address: dto.address,
        creditLimit: dto.creditLimit || 0,
        currentBalance: 0,
        notes: dto.notes,
        shopId: dto.shopId,
      },
    });
  }

  async findAll(
    shopId: string,
    user: JwtPayload,
    includeInactive = false,
    page = 1,
    limit = 10,
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a esta tienda');
    }

    const where: any = { shopId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          dni: true,
          creditLimit: true,
          currentBalance: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      message: 'Clientes obtenidos correctamente',
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        shop: true,
        sales: {
          where: { paymentStatus: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
          select: {
            id: true,
            totalAmount: true,
            saleDate: true,
            paymentStatus: true,
          },
          orderBy: { saleDate: 'desc' },
          take: 10,
        },
        accountMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (customer.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a este cliente');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, user: JwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (customer.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a este cliente');
    }

    // Verificar DNI �nico si se est� cambiando
    if (dto.dni && dto.dni !== customer.dni) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          shopId: customer.shopId,
          dni: dto.dni,
          isActive: true,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Ya existe un cliente con ese DNI en esta tienda',
        );
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        dni: dto.dni,
        address: dto.address,
        creditLimit: dto.creditLimit,
        notes: dto.notes,
      },
    });
  }

  async toggleActive(id: string, user: JwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (customer.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a este cliente');
    }

    // No permitir desactivar si tiene deuda pendiente
    if (customer.isActive && customer.currentBalance > 0) {
      throw new BadRequestException(
        'No se puede desactivar un cliente con deuda pendiente',
      );
    }

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: !customer.isActive },
    });
  }

  // PAGOS DE CUENTA CORRIENTE
  async createPayment(dto: CreatePaymentDto, user: JwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      include: { shop: true },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (customer.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a este cliente');
    }

    // Verificar que el m�todo de pago exista y pertenezca a la tienda
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.paymentMethodId },
    });

    if (!paymentMethod || paymentMethod.shopId !== dto.shopId) {
      throw new BadRequestException('M�todo de pago inv�lido para esta tienda');
    }

    if (!paymentMethod.isActive) {
      throw new BadRequestException('El m�todo de pago no est� activo');
    }

    if (dto.amount > customer.currentBalance) {
      throw new BadRequestException(
        `El monto del pago (${dto.amount}) no puede ser mayor a la deuda actual (${customer.currentBalance})`,
      );
    }

    // Crear pago y movimiento de cuenta en transacci�n
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.customerPayment.create({
        data: {
          customerId: dto.customerId,
          shopId: dto.shopId,
          amount: dto.amount,
          paymentMethodId: dto.paymentMethodId,
          referenceNumber: dto.referenceNumber,
          notes: dto.notes,
        },
      });

      const previousBalance = customer.currentBalance;
      const newBalance = previousBalance - dto.amount;

      await tx.customerAccountMovement.create({
        data: {
          customerId: dto.customerId,
          shopId: dto.shopId,
          type: 'PAYMENT',
          amount: dto.amount,
          previousBalance,
          newBalance,
          paymentId: payment.id,
          description: `Pago ${paymentMethod.name} ${dto.referenceNumber ? `- Ref: ${dto.referenceNumber}` : ''}`,
        },
      });

      await tx.customer.update({
        where: { id: dto.customerId },
        data: { currentBalance: newBalance },
      });

      return payment;
    });
  }

  async getPaymentHistory(customerId: string, user: JwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { shop: true },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (customer.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a este cliente');
    }

    return this.prisma.customerPayment.findMany({
      where: { customerId },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async getAccountStatement(customerId: string, user: JwtPayload) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { shop: true },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (customer.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No ten�s acceso a este cliente');
    }

    const movements = await this.prisma.customerAccountMovement.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sale: {
          select: {
            id: true,
            totalAmount: true,
            saleDate: true,
            invoiceNumber: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            referenceNumber: true,
          },
        },
      },
    });

    return {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        currentBalance: customer.currentBalance,
        creditLimit: customer.creditLimit,
      },
      movements,
    };
  }
}
