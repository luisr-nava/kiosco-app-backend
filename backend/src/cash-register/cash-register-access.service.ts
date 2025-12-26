import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class CashRegisterAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUserCanAccessShop(
    shop: { id: string; ownerId: string; projectId: string },
    user: JwtPayload,
  ) {
    if (shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    if (user.role === 'OWNER') {
      if (shop.ownerId !== user.id) {
        throw new ForbiddenException('No tienes acceso a esta tienda');
      }
      return;
    }

    if (user.role === 'EMPLOYEE') {
      const assignment = await this.prisma.employeeShop.findFirst({
        where: { employeeId: user.id, shopId: shop.id },
        select: { id: true },
      });

      if (!assignment) {
        throw new ForbiddenException('No tienes permiso para esta tienda');
      }
      return;
    }

    throw new ForbiddenException('No tienes acceso a esta tienda');
  }

  async getAccessibleShopIds(user: JwtPayload): Promise<string[]> {
    if (user.role === 'OWNER') {
      const shops = await this.prisma.shop.findMany({
        where: {
          ownerId: user.id,
          projectId: user.projectId,
        },
        select: {
          id: true,
        },
      });
      return shops.map((shop) => shop.id);
    }

    if (user.role === 'EMPLOYEE') {
      const assignments = await this.prisma.employeeShop.findMany({
        where: {
          employeeId: user.id,
          shop: {
            projectId: user.projectId,
          },
        },
        select: {
          shopId: true,
        },
      });
      return assignments.map((assignment) => assignment.shopId);
    }

    return [];
  }
}
