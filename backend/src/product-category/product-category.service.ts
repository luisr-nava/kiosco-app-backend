import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import type { Prisma } from '@prisma/client';

interface ProductCategoryQuery {
  search?: string;
  page?: number;
  limit?: number;
  shopId?: string;
  includeInactive?: boolean;
}

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductCategoryDto: CreateProductCategoryDto,
    user: JwtPayload,
  ) {
    const { id: userId, role } = user;
    const { shopIds, name } = createProductCategoryDto;

    let targetShopIds: string[] = [];
    let ownerShopNames = new Map<string, string>();

    if (role === 'OWNER') {
      if (!shopIds || shopIds.length === 0)
        throw new BadRequestException('Debe especificar al menos una tienda');

      const uniqueIds = Array.from(new Set(shopIds));
      const ownerShops = await this.prisma.shop.findMany({
        where: { ownerId: userId, id: { in: uniqueIds } },
        select: { id: true, name: true },
      });

      if (ownerShops.length !== uniqueIds.length) {
        throw new ForbiddenException(
          'Alguna tienda no pertenece al propietario',
        );
      }

      ownerShopNames = new Map(ownerShops.map((s) => [s.id, s.name]));
      targetShopIds = uniqueIds;
    } else {
      const employee = await this.prisma.employee.findFirst({
        where: { id: user.id },
        select: { employeeShops: { select: { shopId: true } } },
      });

      const employeeShopIds =
        employee?.employeeShops.map((relation) => relation.shopId) ?? [];

      if (employeeShopIds.length === 0) {
        throw new ForbiddenException('No tenés permiso para crear categorías');
      }

      targetShopIds = employeeShopIds;
    }

    // Verificar que no exista una categoría con el mismo nombre en la tienda
    const existingCategory = await this.prisma.category.findMany({
      where: {
        name,
        shopId: { in: targetShopIds },
      },
      include: { shop: { select: { name: true } } },
    });

    if (existingCategory.length) {
      const shopNames = existingCategory.map((c) => c.shop.name).join(', ');
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${name}" en: ${shopNames}`,
      );
    }

    const created = await Promise.all(
      targetShopIds.map((id) =>
        this.prisma.category.create({
          data: { name, shopId: id, createdBy: userId },
          include: { shop: { select: { name: true } } },
        }),
      ),
    );

    const message =
      created.length === 1
        ? 'Categoría creada correctamente'
        : `Categoría creada en ${created.length} tienda(s)`;

    const format = (cat: (typeof created)[number]) => ({
      id: cat.id,
      name: cat.name,
      shopId: cat.shopId,
      shopName: cat.shop.name ?? ownerShopNames.get(cat.shopId),
      createdAt: cat.createdAt,
      isActive: cat.isActive,
    });

    return {
      message,
      data: created.length === 1 ? format(created[0]) : created.map(format),
    };
  }

  async findAll(user: JwtPayload, query: ProductCategoryQuery) {
    const {
      search,
      page = 1,
      limit = 20,
      shopId,
      includeInactive = false,
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

    const filters: Prisma.CategoryWhereInput = {
      shopId: { in: targetShopIds },
    };

    if (!includeInactive) {
      filters.isActive = true;
    }

    if (search) {
      filters.name = { contains: search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where: filters,
        include: {
          shop: { select: { name: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({ where: filters }),
    ]);

    return {
      message:
        user.role === 'OWNER'
          ? 'Categorías de todas tus tiendas'
          : 'Categorías de tu tienda asignada',
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        shopId: cat.shopId,
        shopName: cat.shop.name,
        productsCount: cat._count.products,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        shop: { select: { name: true, ownerId: true } },
        products: {
          select: {
            id: true,
            name: true,
            barcode: true,
          },
          take: 10,
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar permisos
    if (user.role === 'OWNER' && category.shop.ownerId !== user.id) {
      throw new ForbiddenException('No tenés permiso para ver esta categoría');
    } else if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: user.id,
          employeeShops: { some: { shopId: category.shopId } },
        },
      });
      if (!employee) {
        throw new ForbiddenException(
          'No tenés permiso para ver esta categoría',
        );
      }
    }

    return {
      message: 'Categoría encontrada',
      data: {
        id: category.id,
        name: category.name,
        shopId: category.shopId,
        shopName: category.shop.name,
        isActive: category.isActive,
        productsCount: category._count.products,
        sampleProducts: category.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    };
  }

  async update(
    id: string,
    updateProductCategoryDto: UpdateProductCategoryDto,
    user: JwtPayload,
  ) {
    const { id: userId } = user;

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        shop: { select: { ownerId: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar permisos
    if (user.role === 'OWNER' && category.shop.ownerId !== userId) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar esta categoría',
      );
    } else if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: {
          id: user.id,
          employeeShops: { some: { shopId: category.shopId } },
        },
      });
      if (!employee) {
        throw new ForbiddenException(
          'No tenés permiso para actualizar esta categoría',
        );
      }
    }

    // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
    if (
      updateProductCategoryDto.name &&
      updateProductCategoryDto.name !== category.name
    ) {
      const existingCategory = await this.prisma.category.findUnique({
        where: {
          name_shopId: {
            name: updateProductCategoryDto.name,
            shopId: category.shopId,
          },
        },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${updateProductCategoryDto.name}" en esta tienda`,
        );
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: updateProductCategoryDto.name,
        updatedBy: userId,
      },
    });

    return {
      message: 'Categoría actualizada correctamente',
      data: {
        id: updated.id,
        name: updated.name,
        shopId: updated.shopId,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async toggleActive(id: string, user: JwtPayload) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        shop: { select: { name: true, ownerId: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Solo los owners pueden desactivar/activar
    if (user.role !== 'OWNER' || category.shop.ownerId !== user.id) {
      throw new ForbiddenException(
        'No tenés permiso para cambiar el estado de esta categoría',
      );
    }

    const newStatus = !category.isActive;

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        isActive: newStatus,
        disabledAt: newStatus ? null : new Date(),
        disabledBy: newStatus ? null : user.id,
      },
    });

    return {
      message: `Categoría ${newStatus ? 'activada' : 'desactivada'} correctamente`,
      data: {
        id: updated.id,
        name: updated.name,
        shop: category.shop.name,
        isActive: updated.isActive,
        productsCount: category._count.products,
      },
    };
  }

  async remove(id: string, user: JwtPayload) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        shop: { select: { ownerId: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Solo los owners pueden eliminar
    if (user.role !== 'OWNER' || category.shop.ownerId !== user.id) {
      throw new ForbiddenException(
        'No tenés permiso para eliminar esta categoría',
      );
    }

    // No permitir eliminar si tiene productos asociados
    if (category._count.products > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría porque tiene ${category._count.products} producto(s) asociado(s). Desactívala en su lugar.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Categoría eliminada correctamente',
      data: {
        id: category.id,
        name: category.name,
      },
    };
  }
}
