import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}
  async registerEmployee(dto: CreateEmployeeDto, user: JwtPayload) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo los OWNER pueden crear empleados');
    }

    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        OR: [{ email: dto.email }, { dni: dto.dni }],
      },
    });

    if (existingEmployee) {
      throw new BadRequestException(
        'Ya existe un empleado con el mismo email o DNI.',
      );
    }

    // 1️⃣ Crear employee
    const createdEmployee = await this.prisma.employee.create({
      data: {
        id: dto.id,
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role ?? 'EMPLOYEE',
        dni: dto.dni,
        phone: dto.phone,
        address: dto.address,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        salary: dto.salary,
        notes: dto.notes,
        profileImage: dto.profileImage,
        emergencyContact: dto.emergencyContact,
      },
    });

    // 2️⃣ Crear relaciones employee ↔ shop
    if (dto.shopIds && dto.shopIds.length > 0) {
      await this.prisma.employeeShop.createMany({
        data: dto.shopIds.map((shopId) => ({
          employeeId: createdEmployee.id,
          shopId,
        })),
        skipDuplicates: true,
      });
    }

    return createdEmployee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, user: JwtPayload) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        employeeShops: {
          include: {
            shop: {
              select: { ownerId: true, id: true },
            },
          },
        },
      },
    });

    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const isOwner = user.role === 'OWNER';
    const isSelf = user.id === employee.id;

    if (isOwner) {
      const ownsEmployee = employee.employeeShops.some(
        (relation) => relation.shop.ownerId === user.id,
      );
      if (!ownsEmployee) {
        throw new ForbiddenException(
          'No tenés permiso para actualizar este empleado',
        );
      }
    } else if (!isSelf) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar este empleado',
      );
    }

    // 🔥 UPDATE DE TIENDAS
    if (dto.shopIds) {
      if (!isOwner) {
        throw new ForbiddenException(
          'Solo el OWNER puede modificar las tiendas del empleado',
        );
      }

      const currentShopIds = employee.employeeShops.map(
        (relation) => relation.shop.id,
      );

      const nextShopIds = dto.shopIds;

      // Normalizamos para comparar
      const currentSet = new Set(currentShopIds);
      const nextSet = new Set(nextShopIds);

      const shopsToAdd = nextShopIds.filter((id) => !currentSet.has(id));
      const shopsToRemove = currentShopIds.filter((id) => !nextSet.has(id));

      // Validar que las tiendas pertenezcan al OWNER
      const ownedShops = await this.prisma.shop.findMany({
        where: {
          id: { in: nextShopIds },
          ownerId: user.id,
          projectId: user.projectId,
        },
        select: { id: true },
      });

      if (ownedShops.length !== nextShopIds.length) {
        throw new ForbiddenException(
          'Alguna de las tiendas no pertenece al propietario',
        );
      }

      if (shopsToAdd.length > 0) {
        await this.prisma.employeeShop.createMany({
          data: shopsToAdd.map((shopId) => ({
            employeeId: employee.id,
            shopId,
          })),
          skipDuplicates: true,
        });
      }

      if (shopsToRemove.length > 0) {
        await this.prisma.employeeShop.deleteMany({
          where: {
            employeeId: employee.id,
            shopId: { in: shopsToRemove },
          },
        });
      }
    }

    const { shopIds: _ignore, ...employeeData } = dto;

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: employeeData,
    });

    return updatedEmployee;
  }

  async findAll(
    user: JwtPayload,
    shopId: string,
    page = 1,
    limit = 10,
    role?: string,
    isActive?: boolean,
    search?: string,
  ) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo los OWNER pueden ver los empleados');
    }
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, ownerId: true, name: true },
    });
    if (!shop) {
      throw new NotFoundException('La tienda indicada no existe');
    }
    if (shop.ownerId !== user.id) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      employeeShops: {
        some: {
          shopId,
        },
      },
      ...(role ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const normalizedSearch = search?.trim();
    if (normalizedSearch) {
      const existingAnd = Array.isArray(where.AND)
        ? where.AND
        : where.AND
          ? [where.AND]
          : [];

      where.AND = [
        ...existingAnd,
        {
          OR: [
            { fullName: { contains: normalizedSearch, mode: 'insensitive' } },
            { email: { contains: normalizedSearch, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          employeeShops: {
            where: { shopId },
            select: {
              shopId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      message: 'Empleados obtenidos correctamente',
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        employeeShops: {
          select: {
            shop: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const isOwner = user.role === 'OWNER';
    const isSelf = user.id === employee.id;
    if (isOwner) {
      const belongsToOwner = employee.employeeShops.some(
        (relation) => relation.shop.ownerId === user.id,
      );
      if (!belongsToOwner) {
        throw new ForbiddenException('No tenés acceso a este empleado');
      }
    } else if (!isSelf) {
      throw new ForbiddenException('No tenés permiso para ver este empleado');
    }

    return employee;
  }
}
