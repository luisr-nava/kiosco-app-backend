import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierCategoryDto } from './dtos/create-supplier-category.dto';
import { UpdateSupplierCategoryDto } from './dtos/update-supplier-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

interface SupplierCategoryQuery {
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

@Injectable()
export class SupplierCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createSupplierCategoryDto: CreateSupplierCategoryDto,
    user: JwtPayload,
  ) {
    const { id: userId, role } = user;

    // Solo los OWNER pueden crear categorías de proveedores
    if (role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden crear categorías de proveedores',
      );
    }

    // Verificar que no exista una categoría con el mismo nombre para este owner
    const existingCategory = await this.prisma.supplierCategory.findUnique({
      where: {
        name_ownerId: {
          name: createSupplierCategoryDto.name,
          ownerId: userId,
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        `Ya existe una categoría de proveedor con el nombre "${createSupplierCategoryDto.name}"`,
      );
    }

    const category = await this.prisma.supplierCategory.create({
      data: {
        name: createSupplierCategoryDto.name,
        ownerId: userId,
        createdBy: userId,
      },
    });

    return {
      message: 'Categoría de proveedor creada correctamente',
      data: {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt,
        isActive: category.isActive,
      },
    };
  }

  async findAll(user: JwtPayload, query: SupplierCategoryQuery) {
    const { search, page = 1, limit = 20, includeInactive = false } = query;
    const { id: userId, role } = user;

    // Solo los OWNER pueden ver categorías de proveedores
    if (role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden ver categorías de proveedores',
      );
    }

    const filters: any = {
      ownerId: userId,
    };

    if (!includeInactive) {
      filters.isActive = true;
    }

    if (search) {
      filters.name = { contains: search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      this.prisma.supplierCategory.findMany({
        where: filters,
        include: {
          _count: { select: { suppliers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supplierCategory.count({ where: filters }),
    ]);

    return {
      message: 'Categorías de proveedores',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        suppliersCount: cat._count.suppliers,
        isActive: cat.isActive,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      })),
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const { id: userId, role } = user;

    // Solo los OWNER pueden ver categorías de proveedores
    if (role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden ver categorías de proveedores',
      );
    }

    const category = await this.prisma.supplierCategory.findUnique({
      where: { id },
      include: {
        suppliers: {
          select: {
            id: true,
            name: true,
            contactName: true,
            phone: true,
          },
          take: 10,
        },
        _count: { select: { suppliers: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar que pertenece al owner
    if (category.ownerId !== userId) {
      throw new ForbiddenException('No tenés permiso para ver esta categoría');
    }

    return {
      message: 'Categoría encontrada',
      data: {
        id: category.id,
        name: category.name,
        isActive: category.isActive,
        suppliersCount: category._count.suppliers,
        sampleSuppliers: category.suppliers,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    };
  }

  async update(
    id: string,
    updateSupplierCategoryDto: UpdateSupplierCategoryDto,
    user: JwtPayload,
  ) {
    const { id: userId, role } = user;

    // Solo los OWNER pueden actualizar categorías
    if (role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden actualizar categorías de proveedores',
      );
    }

    const category = await this.prisma.supplierCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar que pertenece al owner
    if (category.ownerId !== userId) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar esta categoría',
      );
    }

    // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
    if (
      updateSupplierCategoryDto.name &&
      updateSupplierCategoryDto.name !== category.name
    ) {
      const existingCategory = await this.prisma.supplierCategory.findUnique({
        where: {
          name_ownerId: {
            name: updateSupplierCategoryDto.name,
            ownerId: userId,
          },
        },
      });

      if (existingCategory) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${updateSupplierCategoryDto.name}"`,
        );
      }
    }

    const updated = await this.prisma.supplierCategory.update({
      where: { id },
      data: {
        name: updateSupplierCategoryDto.name,
        updatedBy: userId,
      },
    });

    return {
      message: 'Categoría actualizada correctamente',
      data: {
        id: updated.id,
        name: updated.name,
        isActive: updated.isActive,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async toggleActive(id: string, user: JwtPayload) {
    const { id: userId, role } = user;

    // Solo los OWNER pueden cambiar estado
    if (role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden cambiar el estado de categorías de proveedores',
      );
    }

    const category = await this.prisma.supplierCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { suppliers: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar que pertenece al owner
    if (category.ownerId !== userId) {
      throw new ForbiddenException(
        'No tenés permiso para cambiar el estado de esta categoría',
      );
    }

    const newStatus = !category.isActive;

    const updated = await this.prisma.supplierCategory.update({
      where: { id },
      data: {
        isActive: newStatus,
        disabledAt: newStatus ? null : new Date(),
        disabledBy: newStatus ? null : userId,
      },
    });

    return {
      message: `Categoría ${newStatus ? 'activada' : 'desactivada'} correctamente`,
      data: {
        id: updated.id,
        name: updated.name,
        isActive: updated.isActive,
        suppliersCount: category._count.suppliers,
      },
    };
  }

  async remove(id: string, user: JwtPayload) {
    const { id: userId, role } = user;

    // Solo los OWNER pueden eliminar
    if (role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo los propietarios pueden eliminar categorías de proveedores',
      );
    }

    const category = await this.prisma.supplierCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { suppliers: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('La categoría no existe');
    }

    // Verificar que pertenece al owner
    if (category.ownerId !== userId) {
      throw new ForbiddenException(
        'No tenés permiso para eliminar esta categoría',
      );
    }

    // No permitir eliminar si tiene proveedores asociados
    if (category._count.suppliers > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría porque tiene ${category._count.suppliers} proveedor(es) asociado(s). Desactívala en su lugar.`,
      );
    }

    await this.prisma.supplierCategory.delete({
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
