import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupplier(createSupplierDto: CreateSupplierDto, user: JwtPayload) {
    let ownerId: string;
    if (user.role === 'OWNER') {
      ownerId = user.id;
    } else {
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.id },
        select: { shopId: true },
      });

      if (!employee) throw new ForbiddenException('Empleado no encontrado');

      const shop = await this.prisma.shop.findUnique({
        where: { id: employee.shopId },
        select: { ownerId: true },
      });

      if (!shop) throw new ForbiddenException('Tienda no encontrada');

      ownerId = shop.ownerId;
    }
    const exists = await this.prisma.supplier.findFirst({
      where: {
        ownerId,
        name: createSupplierDto.name,
        phone: createSupplierDto.phone,
        email: createSupplierDto.email,
        contactName: createSupplierDto.contactName,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Este proveedor ya existe con los mismos datos (nombre, teléfono, email y contacto).',
      );
    }

    let shopIdsToAssing: string[] = [];

    if (user.role === 'OWNER') {
      shopIdsToAssing = createSupplierDto.shopIds ?? [];
    } else {
      const employee = await this.prisma.employee.findUnique({
        where: {
          id: user.id,
        },
        select: { shopId: true },
      });

      if (!employee) {
        throw new ForbiddenException('Empleado no encontrado.');
      }

      shopIdsToAssing = [employee.shopId];
    }

    if (shopIdsToAssing.length === 0) {
      throw new BadRequestException('Debe asignar al menos una tienda.');
    }

    const shops = await this.prisma.shop.findMany({
      where: { id: { in: shopIdsToAssing } },
      select: { id: true },
    });

    if (shops.length !== shopIdsToAssing.length) {
      throw new BadRequestException('Algunas tiendas no existen.');
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        ownerId,
        name: createSupplierDto.name,
        contactName: createSupplierDto.contactName,
        phone: createSupplierDto.phone,
        email: createSupplierDto.email,
        address: createSupplierDto.address,
        notes: createSupplierDto.notes,
      },
    });

    await this.prisma.supplierShop.createMany({
      data: shopIdsToAssing.map((shopId) => ({
        supplierId: supplier.id,
        shopId,
      })),
      skipDuplicates: true,
    });
    return this.prisma.supplier.findUnique({
      where: { id: supplier.id },
      include: {
        supplierShop: {
          select: { shopId: true },
        },
      },
    });
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto, user: JwtPayload) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        supplierShop: { select: { shopId: true } },
        purchases: { select: { shopId: true } },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    const supplierExist = await this.prisma.supplier.findFirst({
      where: {
        id: { not: id },
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        contactName: dto.contactName,
      },
    });
    if (supplierExist) {
      throw new BadRequestException(
        'Ya existe un proveedor con los mismos datos',
      );
    }

    let newShopIds: string[] = [];

    if (user.role === 'OWNER') {
      newShopIds = dto.shopIds ?? [];
    } else {
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.id },
        select: { shopId: true },
      });
      if (!employee) {
        throw new ForbiddenException('Empleado no encontrado.');
      }
      newShopIds = [employee.shopId];
    }

    if (newShopIds.length === 0) {
      throw new BadRequestException(
        'El proveedor debe estar asignado al menos a una tienda.',
      );
    }

    const validShops = await this.prisma.shop.findMany({
      where: { id: { in: newShopIds } },
      select: { id: true },
    });

    if (validShops.length !== newShopIds.length) {
      throw new BadRequestException('Algunas tiendas no existen.');
    }

    const currentShops = supplier.supplierShop.map((s) => s.shopId);
    const shopsWithPurchases = supplier.purchases.map((p) => p.shopId);

    for (const shopId of shopsWithPurchases) {
      if (!newShopIds.includes(shopId)) {
        throw new ForbiddenException(
          `No puede quitar la tienda ${shopId} porque tiene compras asociadas.`,
        );
      }
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: {
        name: dto.name,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        notes: dto.notes,
      },
    });

    if (user.role === 'OWNER') {
      const shopsToDelete = currentShops.filter(
        (shopId) => !newShopIds.includes(shopId),
      );

      await this.prisma.supplierShop.deleteMany({
        where: {
          supplierId: id,
          shopId: { in: shopsToDelete },
        },
      });
    }

    await this.prisma.supplierShop.createMany({
      data: newShopIds.map((shopId) => ({
        supplierId: id,
        shopId,
      })),
      skipDuplicates: true,
    });

    return updatedSupplier;
  }

  async getSuppliers(user: JwtPayload) {
    let ownerId: string;
    let shopIds: string | null = null;

    if (user.role === 'OWNER') {
      ownerId = user.id;
    } else {
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.id },
        select: { shopId: true },
      });

      if (!employee) {
        throw new ForbiddenException('Empleado no encontrado.');
      }

      shopIds = employee.shopId;
      const shop = await this.prisma.shop.findUnique({
        where: { id: employee.shopId },
        select: { ownerId: true },
      });

      if (!shop) {
        throw new ForbiddenException('Tienda no encontrada');
      }

      ownerId = shop.ownerId;
    }

    if (user.role === 'OWNER') {
      return await this.prisma.supplier.findMany({
        where: { ownerId },
        include: {
          supplierShop: {
            select: { shopId: true },
          },
        },
      });
    }

    return this.prisma.supplier.findMany({
      where: {
        ownerId,
        supplierShop: {
          some: { shopId: shopIds! }, // relación m-m
        },
      },
      include: {
        supplierShop: { select: { shopId: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(id: string, user: JwtPayload) {
    let ownerId: string;
    let shopId: string | null = null;

    if (user.role === 'OWNER') {
      ownerId = user.id;
    } else {
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.id },
        select: { shopId: true },
      });

      if (!employee) {
        throw new ForbiddenException('Empleado no encontrado');
      }

      const shop = await this.prisma.shop.findUnique({
        where: { id: employee.shopId },
        select: { ownerId: true },
      });

      if (!shop) {
        throw new ForbiddenException('Tienda no encontrada');
      }

      ownerId = shop.ownerId;
    }

    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        supplierShop: {
          select: { shopId: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    if (supplier.ownerId !== ownerId) {
      throw new ForbiddenException(
        'No tienes permisos para ver este proveedor',
      );
    }

    if (user.role !== 'OWNER') {
      const assigenedShops = supplier.supplierShop.map((s) => s.shopId);

      if (!assigenedShops.includes(shopId!)) {
        throw new ForbiddenException(
          'No tienes permisos para ver este proveedor',
        );
      }
    }

    return supplier;
  }

  findOne(id: number) {
    return `This action returns a #${id} supplier`;
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return `This action updates a #${id} supplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} supplier`;
  }
}
