import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { DEFAULT_CURRENCY_CODE } from '../common/constants/currencies';
import { getTimezoneForCountry } from '../common/utils/timezone.util';
import { NotificationService } from '../notification/notification.service';
import {
  GetShopByIdResponseDto,
  GetShopsResponseDto,
  ShopMinimalDto,
} from './dto/get-shop-by-id.dto';
import {
  GetShopSummaryResponseDto,
  ShopSummaryDto,
} from './dto/shop-summary.dto';

const SHOP_MINIMAL_SELECT: Record<keyof ShopMinimalDto, true> = {
  id: true,
  name: true,
  address: true,
  phone: true,
  isActive: true,
  countryCode: true,
  currencyCode: true,
  timezone: true,
};

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createShop(user: JwtPayload, dto: CreateShopDto) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede crear tiendas');
    }
    const countryCode = dto.countryCode.toUpperCase();
    const currencyCode = dto.currencyCode
      ? dto.currencyCode.toUpperCase()
      : DEFAULT_CURRENCY_CODE;
    const timezone = getTimezoneForCountry(countryCode);

    const hasActiveSubscription =
      (user.subscriptionStatus ?? '').toLowerCase() === 'active';
    const maxShopsAllowed = hasActiveSubscription ? 3 : 1;

    if (!timezone) {
      throw new BadRequestException(
        'No se pudo determinar la zona horaria para el país seleccionado',
      );
    }

    const shopCount = await this.prisma.shop.count({
      where: { ownerId: user.id },
    });

    if (shopCount >= maxShopsAllowed) {
      throw new ForbiddenException(
        hasActiveSubscription
          ? 'Ya alcanzaste el límite de 3 tiendas permitidas con tu suscripción'
          : 'Con el plan gratuito solo puedes crear 1 tienda. Contrata una suscripción para crear más.',
      );
    }

    const shop = await this.prisma.shop.create({
      data: {
        name: dto.name,
        ownerId: user.id,
        projectId: user.projectId ?? user.id,
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        countryCode,
        currencyCode,
        timezone,
      },
    });

    await this.ensureDefaultPaymentMethods(shop.id);
    this.notificationService
      .ensureDefaultPreference(shop.id, user.id)
      .catch(() => undefined);

    return {
      message: 'Tienda creada correctamente',
      shop,
    };
  }

  async getMyShops(user: JwtPayload): Promise<GetShopsResponseDto> {
    if (user.role === 'OWNER') {
      const shops = await this.prisma.shop.findMany({
        where: {
          ownerId: user.id,
          projectId: user.projectId,
        },
        select: SHOP_MINIMAL_SELECT,
        orderBy: { createdAt: 'desc' },
      });

      return {
        message: 'Tiendas del propietario',
        role: 'OWNER',
        data: shops,
      };
    }

    if (user.role === 'EMPLOYEE') {
      const shops = await this.prisma.shop.findMany({
        where: {
          employeeShops: {
            some: {
              employeeId: user.id,
            },
          },
        },
        select: SHOP_MINIMAL_SELECT,
      });

      if (!shops.length) {
        throw new ForbiddenException('No estás asignado a ninguna tienda');
      }

      return {
        message: 'Tiendas asignadas',
        role: 'EMPLOYEE',
        data: shops,
      };
    }

    throw new ForbiddenException(
      'No tenés permisos para acceder a esta información',
    );
  }

  async getShopById(
    id: string,
    user: JwtPayload,
  ): Promise<GetShopByIdResponseDto> {
    if (user.role === 'OWNER') {
      const shop = await this.prisma.shop.findFirst({
        where: {
          id,
          ownerId: user.id,
          projectId: user.projectId,
        },
        select: SHOP_MINIMAL_SELECT,
      });

      if (!shop) {
        throw new ForbiddenException('No tenés permiso para ver esta tienda');
      }

      return {
        message: 'Detalle de la tienda',
        role: 'OWNER',
        data: shop,
      };
    }

    if (user.role === 'EMPLOYEE') {
      const employeeShop = await this.prisma.employeeShop.findFirst({
        where: { employeeId: user.id, shopId: id },
        select: {
          shop: {
            select: SHOP_MINIMAL_SELECT,
          },
        },
      });

      if (!employeeShop?.shop) {
        throw new ForbiddenException('No podés acceder a esta tienda');
      }

      return {
        message: 'Información de tu tienda',
        role: 'EMPLOYEE',
        data: employeeShop.shop,
      };
    }

    throw new ForbiddenException(
      'No tenés permisos para acceder a esta información',
    );
  }

  async getShopSummary(
    id: string,
    user: JwtPayload,
  ): Promise<GetShopSummaryResponseDto> {
    if (user.role === 'OWNER') {
      const shop = await this.prisma.shop.findFirst({
        where: {
          id,
          ownerId: user.id,
          projectId: user.projectId,
        },
        select: { id: true },
      });

      if (!shop) {
        throw new ForbiddenException('No tenés permiso para ver esta tienda');
      }

      return {
        message: 'Resumen de tienda',
        data: await this.calculateShopSummary(id),
      };
    }

    if (user.role === 'EMPLOYEE') {
      const relation = await this.prisma.employeeShop.findFirst({
        where: { employeeId: user.id, shopId: id },
        select: { id: true },
      });

      if (!relation) {
        throw new ForbiddenException('No podés acceder a esta tienda');
      }

      return {
        message: 'Resumen de tienda',
        data: await this.calculateShopSummary(id),
      };
    }

    throw new ForbiddenException(
      'No tenés permisos para acceder a esta información',
    );
  }

  private async calculateShopSummary(shopId: string): Promise<ShopSummaryDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      employeesCount,
      productsCount,
      categoriesCount,
      purchasesCount,
      salesCount,
      recentPurchasesLast30Days,
      totalSales,
      totalExpenses,
      totalIncomes,
    ] = await Promise.all([
      this.prisma.employeeShop.count({ where: { shopId } }),
      this.prisma.shopProduct.count({ where: { shopId } }),
      this.prisma.category.count({ where: { shopId } }),
      this.prisma.purchase.count({ where: { shopId } }),
      this.prisma.sale.count({ where: { shopId } }),
      this.prisma.purchase.count({
        where: {
          shopId,
          purchaseDate: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.sale.aggregate({
        where: { shopId },
        _sum: { totalAmount: true },
      }),
      this.prisma.expense.aggregate({
        where: { shopId },
        _sum: { amount: true },
      }),
      this.prisma.income.aggregate({
        where: { shopId },
        _sum: { amount: true },
      }),
    ]);

    const totalSalesAmount = totalSales._sum?.totalAmount ?? 0;
    const totalExpensesAmount = totalExpenses._sum?.amount ?? 0;
    const totalIncomesAmount = totalIncomes._sum?.amount ?? 0;

    return {
      employeesCount,
      productsCount,
      categoriesCount,
      purchasesCount,
      salesCount,
      recentPurchasesLast30Days,
      totalSales: totalSalesAmount,
      totalExpenses: totalExpensesAmount,
      totalIncomes: totalIncomesAmount,
      balance: totalIncomesAmount - totalExpensesAmount,
    };
  }

  async updateShop(id: string, updateShopDto: UpdateShopDto, user: JwtPayload) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un Dueño puede actualizar tiendas');
    }
    const shop = await this.prisma.shop.findFirst({
      where: {
        id,
        ownerId: user.id,
        projectId: user.projectId,
      },
    });

    if (!shop) {
      throw new ForbiddenException('Tienda no encontrada o sin permiso');
    }

    const countryCode = updateShopDto.countryCode
      ? updateShopDto.countryCode.toUpperCase()
      : shop.countryCode;
    const currencyCode = updateShopDto.currencyCode
      ? updateShopDto.currencyCode.toUpperCase()
      : shop.currencyCode;
    const timezone =
      updateShopDto.countryCode || !shop.timezone
        ? getTimezoneForCountry(countryCode)
        : shop.timezone;

    if (!timezone) {
      throw new BadRequestException(
        'No se pudo determinar la zona horaria para el país seleccionado',
      );
    }

    const updateShop = await this.prisma.shop.update({
      where: { id },
      data: {
        name: updateShopDto.name ?? shop.name,
        address: updateShopDto.address ?? shop.address,
        isActive: updateShopDto.isActive ?? shop.isActive,
        phone: updateShopDto.phone ?? shop.phone,
        countryCode,
        currencyCode,
        timezone,
      },
    });

    return {
      message: 'Tienda actualizada correctamente',
      updateShop,
    };
  }

  async toggleShop(id: string, user: JwtPayload) {
    if (user.role !== 'OWNER') {
      throw new ForbiddenException('Solo un OWNER puede deshabilitar tiendas');
    }
    const shop = await this.prisma.shop.findFirst({
      where: {
        id,
        ownerId: user.id,
        projectId: user.projectId,
      },
    });

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada o sin permisos');
    }

    const updated = await this.prisma.shop.update({
      where: { id },
      data: { isActive: !shop.isActive },
    });

    return {
      message: `Tienda ${updated.isActive ? 'habilitada' : 'deshabilitada'} correctamente`,
      shop: updated,
    };
  }

  private async ensureDefaultPaymentMethods(shopId: string) {
    await this.prisma.paymentMethod.upsert({
      where: {
        shopId_code: {
          shopId,
          code: 'CASH',
        },
      },
      update: {
        name: 'Cash / Efectivo',
        isActive: true,
      },
      create: {
        shopId,
        name: 'Cash / Efectivo',
        code: 'CASH',
        description: 'Método de pago en efectivo (creado automáticamente)',
      },
    });
  }
}
