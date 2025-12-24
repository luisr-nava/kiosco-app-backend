import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MeasurementBaseUnit,
  MeasurementUnitCategory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { CreateMeasurementUnitDto } from './dto/create-measurement-unit.dto';
import { AssignMeasurementUnitDto } from './dto/assign-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from './dto/update-measurement-unit.dto';

type MeasurementUnitWithShops = Prisma.MeasurementUnitGetPayload<{
  include: { shopMeasurementUnits: { select: { shopId: true } } };
}>;

type MeasurementUnitWithOwnership = Prisma.MeasurementUnitGetPayload<{
  include: {
    shopMeasurementUnits: {
      include: {
        shop: { select: { id: true; ownerId: true; projectId: true } };
      };
    };
  };
}>;

@Injectable()
export class MeasurementUnitService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly baseUnitByCategory: Record<
    MeasurementUnitCategory,
    MeasurementBaseUnit
  > = {
    UNIT: MeasurementBaseUnit.UNIT,
    WEIGHT: MeasurementBaseUnit.KG,
    VOLUME: MeasurementBaseUnit.L,
  };

  async create(dto: CreateMeasurementUnitDto, user: JwtPayload) {
    const isOwner = user.role === 'OWNER';
    const code = this.normalizeCode(dto.code);
    const isBaseUnit = dto.isBaseUnit ?? false;
    const requestedIsDefault = dto.isDefault ?? false;
    const isDefault = requestedIsDefault || isBaseUnit;

    this.ensureCategoryBaseUnit(dto.category, dto.baseUnit);
    this.validateConversion(dto.conversionFactor, isBaseUnit);

    if (requestedIsDefault && !isOwner) {
      throw new ForbiddenException(
        'Solo un OWNER puede crear unidades globales por defecto',
      );
    }

    if (isBaseUnit && code !== dto.baseUnit) {
      throw new BadRequestException(
        'Las unidades base deben usar el mismo código que la unidad base',
      );
    }

    const duplicatedCode = await this.prisma.measurementUnit.findFirst({
      where: { code, baseUnit: dto.baseUnit },
    });

    if (duplicatedCode) {
      throw new ConflictException(
        'Ya existe una unidad con este código para la misma unidad base',
      );
    }

    if (isBaseUnit) {
      const existingBase = await this.prisma.measurementUnit.findFirst({
        where: { baseUnit: dto.baseUnit, isBaseUnit: true },
      });

      if (existingBase) {
        throw new BadRequestException(
          'Las unidades base son únicas y ya existen en el sistema',
        );
      }
    }

    const targetShopIds = await this.resolveShopIdsForCreation(
      dto.shopIds,
      user,
      isDefault,
    );

    const createdUnit = await this.prisma.measurementUnit.create({
      data: {
        name: dto.name.trim(),
        code,
        category: dto.category,
        baseUnit: dto.baseUnit,
        conversionFactor: new Prisma.Decimal(dto.conversionFactor),
        isBaseUnit,
        isDefault,
        createdByUserId: user.id,
      },
      include: { shopMeasurementUnits: { select: { shopId: true } } },
    });

    if (targetShopIds.length > 0) {
      await this.prisma.shopMeasurementUnit.createMany({
        data: targetShopIds.map((shopId) => ({
          shopId,
          measurementUnitId: createdUnit.id,
          assignedByUserId: user.id,
        })),
        skipDuplicates: true,
      });
    }

    const unitWithShops = await this.prisma.measurementUnit.findUnique({
      where: { id: createdUnit.id },
      include: { shopMeasurementUnits: { select: { shopId: true } } },
    });

    return {
      message: 'Unidad de medida creada correctamente',
      data: this.mapUnit(unitWithShops!),
    };
  }

  async findByShop(shopId: string, user: JwtPayload) {
    if (!shopId) {
      throw new BadRequestException('El parámetro shopId es obligatorio');
    }

    await this.ensureShopAccess(shopId, user);

    const units = await this.prisma.measurementUnit.findMany({
      where: {
        OR: [
          { isDefault: true },
          { shopMeasurementUnits: { some: { shopId } } },
        ],
      },
      include: { shopMeasurementUnits: { select: { shopId: true } } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return {
      message: 'Unidades de medida disponibles',
      data: units.map((unit) => this.mapUnit(unit, shopId)),
    };
  }

  async assignToShops(
    measurementUnitId: string,
    dto: AssignMeasurementUnitDto,
    user: JwtPayload,
  ) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un OWNER puede asignar unidades');
    }

    if (!dto.shopIds || dto.shopIds.length === 0) {
      throw new BadRequestException('Debe enviar al menos una tienda');
    }

    const unit = await this.prisma.measurementUnit.findUnique({
      where: { id: measurementUnitId },
      include: {
        shopMeasurementUnits: {
          include: {
            shop: { select: { id: true, ownerId: true, projectId: true } },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('La unidad de medida no existe');
    }

    this.ensureUnitOwnership(unit, user);
    await this.ensureOwnerShops(dto.shopIds, user);

    await this.prisma.shopMeasurementUnit.createMany({
      data: dto.shopIds.map((shopId) => ({
        shopId,
        measurementUnitId,
        assignedByUserId: user.id,
      })),
      skipDuplicates: true,
    });

    const updated = await this.prisma.measurementUnit.findUnique({
      where: { id: measurementUnitId },
      include: { shopMeasurementUnits: { select: { shopId: true } } },
    });

    return {
      message: 'Unidad asignada correctamente',
      data: this.mapUnit(updated!),
    };
  }

  async update(
    measurementUnitId: string,
    dto: UpdateMeasurementUnitDto,
    user: JwtPayload,
  ) {
    const unit = await this.prisma.measurementUnit.findUnique({
      where: { id: measurementUnitId },
      include: {
        shopMeasurementUnits: {
          include: {
            shop: { select: { id: true, ownerId: true, projectId: true } },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('La unidad de medida no existe');
    }

    if (unit.isDefault || unit.isBaseUnit) {
      throw new BadRequestException(
        'No se pueden actualizar unidades base o por defecto',
      );
    }

    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un OWNER puede actualizar unidades');
    }

    this.ensureUnitOwnership(unit, user);

    const nextCategory = dto.category ?? unit.category;
    const nextBaseUnit =
      dto.baseUnit ??
      (dto.category ? this.baseUnitByCategory[dto.category] : unit.baseUnit);
    const nextCode = dto.code ? this.normalizeCode(dto.code) : unit.code;
    const currentConversion =
      typeof unit.conversionFactor === 'number'
        ? unit.conversionFactor
        : Number(unit.conversionFactor);
    const conversionFactor = dto.conversionFactor ?? currentConversion;

    this.ensureCategoryBaseUnit(nextCategory, nextBaseUnit);
    this.validateConversion(conversionFactor, unit.isBaseUnit);

    const duplicatedCode = await this.prisma.measurementUnit.findFirst({
      where: {
        code: nextCode,
        baseUnit: nextBaseUnit,
        NOT: { id: measurementUnitId },
      },
    });

    if (duplicatedCode) {
      throw new ConflictException(
        'Ya existe una unidad con este código para la misma unidad base',
      );
    }

    const updated = await this.prisma.measurementUnit.update({
      where: { id: measurementUnitId },
      data: {
        name: dto.name?.trim() ?? unit.name,
        code: nextCode,
        category: nextCategory,
        baseUnit: nextBaseUnit,
        conversionFactor: new Prisma.Decimal(conversionFactor),
      },
      include: { shopMeasurementUnits: { select: { shopId: true } } },
    });

    return {
      message: 'Unidad de medida actualizada correctamente',
      data: this.mapUnit(updated),
    };
  }

  async remove(id: string, user: JwtPayload) {
    const unit = await this.prisma.measurementUnit.findUnique({
      where: { id },
      include: {
        shopMeasurementUnits: {
          include: {
            shop: { select: { id: true, ownerId: true, projectId: true } },
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('La unidad de medida no existe');
    }

    if (unit.isDefault || unit.isBaseUnit) {
      throw new BadRequestException(
        'No se pueden eliminar unidades base o por defecto',
      );
    }

    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un OWNER puede eliminar unidades');
    }

    this.ensureUnitOwnership(unit, user);

    const productUsage = await this.prisma.product.count({
      where: { measurementUnitId: id },
    });

    if (productUsage > 0) {
      throw new BadRequestException(
        `No se puede eliminar. Está en uso por ${productUsage} producto(s)`,
      );
    }

    await this.prisma.shopMeasurementUnit.deleteMany({
      where: { measurementUnitId: id },
    });

    await this.prisma.measurementUnit.delete({ where: { id } });

    return {
      message: 'Unidad eliminada correctamente',
      data: { id },
    };
  }

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private ensureCategoryBaseUnit(
    category: MeasurementUnitCategory,
    baseUnit: MeasurementBaseUnit,
  ) {
    const expected = this.baseUnitByCategory[category];
    if (expected !== baseUnit) {
      throw new BadRequestException(
        'La unidad base no coincide con la categoría de la unidad',
      );
    }
  }

  private validateConversion(conversionFactor: number, isBaseUnit: boolean) {
    if (conversionFactor <= 0) {
      throw new BadRequestException(
        'El factor de conversión debe ser mayor a 0',
      );
    }

    if (isBaseUnit && conversionFactor !== 1) {
      throw new BadRequestException(
        'Las unidades base deben tener factor de conversión 1',
      );
    }
  }

  private async resolveShopIdsForCreation(
    dtoShopIds: string[] | undefined,
    user: JwtPayload,
    isDefault: boolean,
  ): Promise<string[]> {
    if (isDefault) {
      return [];
    }

    if (user.role === 'OWNER') {
      const shopIds = dtoShopIds ?? [];
      if (shopIds.length === 0) {
        throw new BadRequestException(
          'Debe asignar la unidad personalizada al menos a una tienda',
        );
      }
      await this.ensureOwnerShops(shopIds, user);
      return shopIds;
    }

    const employeeShop = await this.getEmployeeShop(user);
    if (
      dtoShopIds &&
      (dtoShopIds.length !== 1 || dtoShopIds[0] !== employeeShop.id)
    ) {
      throw new ForbiddenException('Solo podés asignar unidades a tu tienda');
    }
    return [employeeShop.id];
  }

  private async ensureShopAccess(shopId: string, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true, projectId: true },
    });

    if (!shop) {
      throw new NotFoundException('La tienda no existe');
    }

    if (shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: {
          employeeShops: {
            some: {
              shopId,
            },
          },
          id: user.id,
        },
      });

      if (!employee) {
        throw new ForbiddenException('No tienes permiso para esta tienda');
      }
    }
  }

  private async ensureOwnerShops(shopIds: string[], user: JwtPayload) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo el propietario puede operar con múltiples tiendas',
      );
    }

    const shops = await this.prisma.shop.findMany({
      where: {
        id: { in: shopIds },
        ownerId: user.id,
        projectId: user.projectId,
      },
      select: { id: true },
    });

    if (shops.length !== shopIds.length) {
      throw new ForbiddenException(
        'Alguna de las tiendas no pertenece al propietario actual',
      );
    }
  }

  private async getEmployeeShop(user: JwtPayload) {
    const employeeShop = await this.prisma.employeeShop.findFirst({
      where: { employeeId: user.id },
      include: {
        shop: true,
      },
    });

    if (!employeeShop || !employeeShop.shop) {
      throw new ForbiddenException('No se encontró información del empleado');
    }

    if (employeeShop.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    return employeeShop.shop;
  }

  private ensureUnitOwnership(
    unit: MeasurementUnitWithOwnership,
    user: JwtPayload,
  ) {
    if (unit.isDefault) {
      return;
    }

    const ownerIds = unit.shopMeasurementUnits.map(
      (assignment) => assignment.shop.ownerId,
    );
    const owners = new Set(ownerIds);

    if (owners.size > 1 || (owners.size === 1 && !owners.has(user.id))) {
      throw new ForbiddenException(
        'No tienes permisos sobre esta unidad de medida',
      );
    }

    const belongsToProject = unit.shopMeasurementUnits.every(
      (assignment) => assignment.shop.projectId === user.projectId,
    );

    if (!belongsToProject) {
      throw new ForbiddenException(
        'La unidad pertenece a un proyecto distinto',
      );
    }

    if (owners.size === 0 && unit.createdByUserId !== user.id) {
      throw new ForbiddenException(
        'No tienes permisos para operar esta unidad de medida',
      );
    }
  }

  private mapUnit(unit: MeasurementUnitWithShops, shopId?: string) {
    return {
      id: unit.id,
      name: unit.name,
      code: unit.code,
      category: unit.category,
      baseUnit: unit.baseUnit,
      conversionFactor: Number(unit.conversionFactor),
      isBaseUnit: unit.isBaseUnit,
      isDefault: unit.isDefault,
      createdByUserId: unit.createdByUserId,
      createdAt: unit.createdAt,
      shopIds: unit.shopMeasurementUnits.map((item) => item.shopId),
      assignedToShop:
        shopId !== undefined
          ? unit.isDefault ||
            unit.shopMeasurementUnits.some((item) => item.shopId === shopId)
          : undefined,
    };
  }
}
