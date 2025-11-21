import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { envs } from '../config/envs';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AuthClientService } from '../auth-client/auth-client.service';
import { CreateEmployeeDto as AuthCreateEmployeeDto } from '../auth-client/dto/create-employee.dto';
import { UpdateUserDto } from '../auth-client/dto/update-user.dto';
import { UserRole } from '../auth-client/dto/create.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authClientService: AuthClientService,
  ) {}
  async registerEmployee(
    dto: CreateEmployeeDto,
    user: JwtPayload,
    token: string,
  ) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo los OWNER pueden crear empleados');
    }
    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
    });

    if (!shop) {
      throw new NotFoundException('La tienda indicada no existe');
    }

    if (shop.ownerId !== user.id) {
      throw new ForbiddenException(
        'No tenés permiso para asignar empleados a esta tienda',
      );
    }

    try {
      // Usar auth-client en lugar de llamada directa
      const authEmployeeDto: AuthCreateEmployeeDto = {
        fullName: dto.fullName,
        email: dto.email,
        password: dto.password,
        phone: dto.phone,
        dni: dto.dni,
        address: dto.address,
        hireDate: dto.hireDate,
        salary: dto.salary?.toString(),
        notes: dto.notes,
      };

      const authUser = await this.authClientService.createEmployee(
        authEmployeeDto,
        token,
      );
      const userId = authUser.id ?? authUser.userId ?? authUser.user?.id;
      if (!userId) {
        throw new InternalServerErrorException(
          'Auth Service no devolvió userId',
        );
      }
      const kioskEmployee = await this.prisma.employee.create({
        data: {
          id: userId,
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
          shopId: dto.shopId,
        },
      });

      return kioskEmployee;
    } catch (error) {
      throw error;
    }
  }

  async updateEmployee(
    id: string,
    dto: UpdateEmployeeDto,
    user: JwtPayload,
    token: string,
  ) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    const isOwner = user.role === 'OWNER';
    const isSelf = user.id === employee.id;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException(
        'No tenés permiso para actualizar este empleado',
      );
    }
    if (dto.shopId) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: dto.shopId },
      });

      if (!shop) {
        throw new NotFoundException('La tienda indicada no existe');
      }

      if (isOwner && shop.ownerId !== user.id) {
        throw new ForbiddenException(
          'No tenés permiso para asignar empleados a otra tienda',
        );
      }
    }
    const { password, ...employeeData } = dto;
    const authData: UpdateUserDto = {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      role: dto.role as UserRole,
      dni: dto.dni,
      phone: dto.phone,
      address: dto.address,
      hireDate: dto.hireDate,
      salary: dto.salary ? String(dto.salary) : undefined,
      notes: dto.notes,
      profileImage: dto.profileImage,
      emergencyContact: dto.emergencyContact,
    };

    try {
      await this.authClientService.updateEmployee(id, authData, token);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        { message: 'Error al actualizar datos en Auth Service' },
        500,
      );
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: employeeData,
    });

    return updatedEmployee;
  }

  async findAll(user: JwtPayload, shopId?: string) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo los OWNER pueden ver los empleados');
    }
    if (shopId) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        include: { employees: true }, // o cualquier relación
      });
      if (!shop) {
        throw new NotFoundException('La tienda indicada no existe');
      }
      if (shop.ownerId !== user.id) {
        throw new ForbiddenException('No tenés acceso a esta tienda');
      }
    }
    const shops = await this.prisma.shop.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const shopIds = shopId ? [shopId] : shops.map((shop) => shop.id);

    const employee = await this.prisma.employee.findMany({
      where: {
        shopId: { in: shopIds },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return employee;
  }

  async findOne(id: string, user: JwtPayload) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            ownerId: true,
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
      if (employee.shop.ownerId !== user.id) {
        throw new ForbiddenException('No tenés acceso a este empleado');
      }
    } else if (!isSelf) {
      throw new ForbiddenException('No tenés permiso para ver este empleado');
    }

    return employee;
  }
}
