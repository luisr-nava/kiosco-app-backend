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
import { Prisma } from '@prisma/client';

type SupplierWithRelations = Prisma.SupplierGetPayload<{
  include: {
    supplierShop: { select: { shopId: true } };
    category: { select: { id: true; name: true } };
  };
}>;

type SupplierWithRelationsAndPurchases = Prisma.SupplierGetPayload<{
  include: {
    supplierShop: { select: { shopId: true } };
    category: { select: { id: true; name: true } };
    purchases: { select: { shopId: true } };
  };
}>;

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────

  private async getOwnerAndShopFromUser(user: JwtPayload) {
    if (user.role === 'OWNER') return { ownerId: user.id, shopId: null };

    const employee = await this.prisma.employee.findUnique({
      where: { id: user.id },
      select: {
        employeeShops: {
          select: {
            shopId: true,
            shop: { select: { ownerId: true } },
          },
        },
      },
    });

    const primaryRelation = employee?.employeeShops[0];
    if (!primaryRelation)
      throw new ForbiddenException('Empleado no encontrado.');

    return {
      ownerId: primaryRelation.shop.ownerId,
      shopId: primaryRelation.shopId,
    };
  }

  private async getSupplierOrFail(
    id: string,
    withPurchases = false,
  ): Promise<SupplierWithRelations | SupplierWithRelationsAndPurchases> {
    const baseInclude = {
      supplierShop: { select: { shopId: true } },
      category: { select: { id: true, name: true } },
    };

    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: withPurchases
        ? { ...baseInclude, purchases: { select: { shopId: true } } }
        : baseInclude,
    });

    if (!supplier) throw new NotFoundException('Proveedor no encontrado.');

    return supplier;
  }

  private ensureSupplierBelongsToUser(
    supplier: SupplierWithRelations,
    ownerId: string,
    shopId: string | null,
    role: string,
  ) {
    if (supplier.ownerId !== ownerId)
      throw new ForbiddenException('No tiene permisos sobre este proveedor.');

    if (role !== 'OWNER') {
      const assigned = supplier.supplierShop.map((s) => s.shopId);
      if (!assigned.includes(shopId!))
        throw new ForbiddenException(
          'No tiene permisos para acceder a este proveedor.',
        );
    }
  }

  private async validateShopsExist(shopIds: string[]) {
    const shops = await this.prisma.shop.findMany({
      where: { id: { in: shopIds } },
      select: { id: true },
    });

    if (shops.length !== shopIds.length)
      throw new BadRequestException('Algunas tiendas no existen.');
  }

  private async validateCategoryOwnership(
    categoryId: string | null | undefined,
    shopIds: string[],
  ) {
    if (!categoryId) return;

    const category = await this.prisma.supplierCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, shopId: true, isActive: true },
    });

    if (!category || !shopIds.includes(category.shopId))
      throw new BadRequestException(
        'La categoría de proveedor no existe o no pertenece a las tiendas seleccionadas.',
      );

    if (!category.isActive)
      throw new BadRequestException(
        'La categoría de proveedor está deshabilitada.',
      );
  }

  private resolveShopIdsForAction(
    dtoShopIds: string[] | undefined,
    user: JwtPayload,
    employeeShopId: string | null,
  ): string[] {
    return user.role === 'OWNER' ? (dtoShopIds ?? []) : [employeeShopId!];
  }

  private async checkUniqueSupplier(
    dto: CreateSupplierDto | UpdateSupplierDto,
    ownerId: string,
    ignoreId?: string,
  ) {
    const duplicated = await this.prisma.supplier.findFirst({
      where: {
        ownerId,
        id: ignoreId ? { not: ignoreId } : undefined,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        contactName: dto.contactName,
      },
    });

    if (duplicated)
      throw new BadRequestException(
        'Ya existe un proveedor con los mismos datos.',
      );
  }

  private async assignShopsToSupplier(
    supplierId: string,
    newShopIds: string[],
    isOwner: boolean,
    currentShops?: string[],
  ) {
    if (isOwner && currentShops) {
      const toDelete = currentShops.filter((id) => !newShopIds.includes(id));
      await this.prisma.supplierShop.deleteMany({
        where: { supplierId, shopId: { in: toDelete } },
      });
    }

    await this.prisma.supplierShop.createMany({
      data: newShopIds.map((id) => ({ supplierId, shopId: id })),
      skipDuplicates: true,
    });
  }

  // ───────────────────────────────────────────────
  // CREATE
  // ───────────────────────────────────────────────

  async createSupplier(dto: CreateSupplierDto, user: JwtPayload) {
    const { ownerId, shopId } = await this.getOwnerAndShopFromUser(user);

    await this.checkUniqueSupplier(dto, ownerId);

    const shopIds = this.resolveShopIdsForAction(dto.shopIds, user, shopId);
    if (shopIds.length === 0)
      throw new BadRequestException('Debe asignar al menos una tienda.');

    await this.validateShopsExist(shopIds);

    await this.validateCategoryOwnership(dto.categoryId, shopIds);

    // 🔥 Extraer shopIds para que NO vaya a Prisma
    const { shopIds: _, ...supplierData } = dto;

    const supplier = await this.prisma.supplier.create({
      data: {
        ownerId,
        ...supplierData, // shopIds ya NO está acá
      },
    });

    // 🟢 Relacionar con las tiendas via pivot
    await this.assignShopsToSupplier(
      supplier.id,
      shopIds,
      user.role === 'OWNER',
    );

    return this.getSupplierOrFail(supplier.id, false);
  }

  // ───────────────────────────────────────────────
  // UPDATE
  // ───────────────────────────────────────────────

  async updateSupplier(id: string, dto: UpdateSupplierDto, user: JwtPayload) {
    const { ownerId, shopId } = await this.getOwnerAndShopFromUser(user);

    const supplier = await this.getSupplierOrFail(id, true);
    this.ensureSupplierBelongsToUser(supplier, ownerId, shopId, user.role);

    await this.checkUniqueSupplier(dto, ownerId, id);

    const newShopIds = this.resolveShopIdsForAction(dto.shopIds, user, shopId);
    if (newShopIds.length === 0)
      throw new BadRequestException(
        'El proveedor debe estar asignado al menos a una tienda.',
      );

    await this.validateShopsExist(newShopIds);

    if (dto.categoryId !== undefined)
      await this.validateCategoryOwnership(dto.categoryId, newShopIds);

    for (const sId of (
      supplier as SupplierWithRelationsAndPurchases
    ).purchases.map((p) => p.shopId)) {
      if (!newShopIds.includes(sId))
        throw new ForbiddenException(
          `No puede quitar la tienda ${sId} porque tiene compras asociadas.`,
        );
    }

    const currentShops = supplier.supplierShop.map((s) => s.shopId);
    const { shopIds: _, ...supplierData } = dto;

    const updated = await this.prisma.supplier.update({
      where: { id },
      data: supplierData,
    });

    await this.assignShopsToSupplier(
      id,
      newShopIds,
      user.role === 'OWNER',
      currentShops,
    );

    return updated;
  }

  // ───────────────────────────────────────────────
  // GET ALL
  // ───────────────────────────────────────────────

  async getSuppliers(user: JwtPayload) {
    const { ownerId, shopId } = await this.getOwnerAndShopFromUser(user);

    return this.prisma.supplier.findMany({
      where:
        user.role === 'OWNER'
          ? { ownerId, isActive: true }
          : {
              ownerId,
              isActive: true,
              supplierShop: { some: { shopId: shopId! } },
            },
      include: {
        supplierShop: { select: { shopId: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // ───────────────────────────────────────────────
  // GET BY ID
  // ───────────────────────────────────────────────

  async getSupplierById(id: string, user: JwtPayload) {
    const { ownerId, shopId } = await this.getOwnerAndShopFromUser(user);
    const supplier = await this.getSupplierOrFail(id);
    this.ensureSupplierBelongsToUser(supplier, ownerId, shopId, user.role);
    return supplier;
  }

  // ───────────────────────────────────────────────
  // TOGGLE ACTIVE
  // ───────────────────────────────────────────────

  async toggleActiveSupplier(id: string, user: JwtPayload) {
    const { ownerId, shopId } = await this.getOwnerAndShopFromUser(user);

    const supplier = await this.getSupplierOrFail(id);
    this.ensureSupplierBelongsToUser(supplier, ownerId, shopId, user.role);

    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
      include: {
        supplierShop: { select: { shopId: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }
}
