import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import { Shop } from './entities/shop.entity';
import { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { DEFAULT_CURRENCY_CODE } from '../common/constants/currencies';
import { getTimezoneForCountry } from '../common/utils/timezone.util';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashRegisterService: CashRegisterService,
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

    return {
      message: 'Tienda creada correctamente',
      shop,
    };
  }

  async getMyShops(user: JwtPayload) {
    if (user.role === 'OWNER') {
      const shops = await this.prisma.shop.findMany({
        where: {
          ownerId: user.id,
          projectId: user.projectId,
        },
        include: {
          _count: {
            select: {
              employeeShops: true,
              shopProducts: true,
              purchases: true,
              sales: true,
              categories: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calcular estadísticas para cada tienda
      const shopsWithStats = await Promise.all(
        shops.map(async (shop) => {
          const [totalSales, totalExpenses, totalIncomes, recentPurchases] = await Promise.all([
            this.prisma.sale.aggregate({
              where: { shopId: shop.id },
              _sum: { totalAmount: true },
            }),
            this.prisma.expense.aggregate({
              where: { shopId: shop.id },
              _sum: { amount: true },
            }),
            this.prisma.income.aggregate({
              where: { shopId: shop.id },
              _sum: { amount: true },
            }),
            this.prisma.purchase.count({
              where: {
                shopId: shop.id,
                purchaseDate: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
              },
            }),
          ]);

          return {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            isActive: shop.isActive,
            countryCode: shop.countryCode,
            currencyCode: shop.currencyCode,
            timezone: shop.timezone,
            createdAt: shop.createdAt,
            // Estadísticas
            employeesCount: shop._count.employeeShops,
            productsCount: shop._count.shopProducts,
            categoriesCount: shop._count.categories,
            purchasesCount: shop._count.purchases,
            salesCount: shop._count.sales,
            recentPurchasesLast30Days: recentPurchases,
            // Totales financieros
            totalSales: totalSales._sum?.totalAmount || 0,
            totalExpenses: totalExpenses._sum?.amount || 0,
            totalIncomes: totalIncomes._sum?.amount || 0,
            balance: (totalIncomes._sum?.amount || 0) - (totalExpenses._sum?.amount || 0),
          };
        }),
      );

      return {
        message: 'Tiendas del propietario',
        role: 'OWNER',
        data: shopsWithStats,
      };
    }

    if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.id },
        include: {
          employeeShops: {
            include: {
              shop: {
                include: {
                  _count: {
                    select: {
                      shopProducts: true,
                      categories: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const assignedShops =
        employee?.employeeShops.map((relation) => relation.shop) ?? [];

      if (!employee || assignedShops.length === 0) {
        throw new ForbiddenException('No estás asignado a ninguna tienda');
      }

      const data = assignedShops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        isActive: shop.isActive,
        countryCode: shop.countryCode,
        currencyCode: shop.currencyCode,
        timezone: shop.timezone,
        myRole: employee.role,
        myHireDate: employee.hireDate,
        productsCount: shop._count.shopProducts,
        categoriesCount: shop._count.categories,
      }));

      return {
        message: 'Tiendas asignadas',
        role: 'EMPLOYEE',
        data,
      };
    }

    throw new ForbiddenException('No tenés permisos para acceder a esta información');
  }

  async getShopById(id: string, user: JwtPayload) {
    if (user.role === 'OWNER') {
      const shop = await this.prisma.shop.findFirst({
        where: {
          id,
          ownerId: user.id,
          projectId: user.projectId,
        },
        include: {
          employeeShops: {
            include: {
              employee: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  role: true,
                  phone: true,
                  hireDate: true,
                  salary: true,
                  isActive: true,
                },
              },
            },
          },
          _count: {
            select: {
              employeeShops: true,
              shopProducts: true,
              purchases: true,
              sales: true,
              categories: true,
              supplierShop: true,
            },
          },
        },
      });

      if (!shop) {
        throw new ForbiddenException('No tenés permiso para ver esta tienda');
      }

      // Obtener estadísticas financieras detalladas
      const [
        totalSales,
        totalExpenses,
        totalIncomes,
        recentPurchases,
        lowStockProducts,
        topProducts,
        openCashRegisters,
      ] = await Promise.all([
        this.prisma.sale.aggregate({
          where: { shopId: id },
          _sum: { totalAmount: true },
          _count: true,
        }),
        this.prisma.expense.aggregate({
          where: { shopId: id },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.income.aggregate({
          where: { shopId: id },
          _sum: { amount: true },
          _count: true,
        }),
        this.prisma.purchase.findMany({
          where: {
            shopId: id,
            purchaseDate: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
          include: {
            supplier: { select: { name: true } },
          },
          orderBy: { purchaseDate: 'desc' },
          take: 5,
        }),
        this.prisma.shopProduct.findMany({
          where: {
            shopId: id,
            stock: { lte: 10 },
            isActive: true,
          },
          include: {
            product: { select: { name: true, barcode: true } },
          },
          take: 10,
        }),
        this.prisma.shopProduct.findMany({
          where: { shopId: id, isActive: true },
          include: {
            product: { select: { name: true } },
          },
          orderBy: { stock: 'desc' },
          take: 5,
        }),
        this.cashRegisterService.findOpenCashRegistersForShops([id], user),
      ]);
      const shopOpenCashRegisters = openCashRegisters[0]?.cashRegisters ?? [];

      return {
        message: 'Detalle completo de la tienda',
        role: 'OWNER',
        data: {
          // Información básica
          id: shop.id,
          name: shop.name,
          address: shop.address,
          phone: shop.phone,
          isActive: shop.isActive,
          countryCode: shop.countryCode,
          currencyCode: shop.currencyCode,
          timezone: shop.timezone,
          createdAt: shop.createdAt,
          // Empleados completos con salarios
          employees: shop.employeeShops.map((relation) => relation.employee),
          employeesCount: shop._count.employeeShops,
          // Contadores
          productsCount: shop._count.shopProducts,
          categoriesCount: shop._count.categories,
          purchasesCount: shop._count.purchases,
          salesCount: shop._count.sales,
          suppliersCount: shop._count.supplierShop,
          // Estadísticas financieras
          totalSales: totalSales._sum?.totalAmount || 0,
          totalExpenses: totalExpenses._sum?.amount || 0,
          totalIncomes: totalIncomes._sum?.amount || 0,
          salesTransactions: totalSales._count,
          expensesTransactions: totalExpenses._count,
          incomesTransactions: totalIncomes._count,
          balance: (totalIncomes._sum?.amount || 0) - (totalExpenses._sum?.amount || 0),
          // Compras recientes
          recentPurchases: recentPurchases.map((p) => ({
            id: p.id,
            supplierName: p.supplier?.name,
            totalAmount: p.totalAmount,
            purchaseDate: p.purchaseDate,
            notes: p.notes,
          })),
          // Productos con bajo stock
          lowStockProducts: lowStockProducts.map((sp) => ({
            id: sp.id,
            productName: sp.product.name,
            barcode: sp.product.barcode,
            stock: sp.stock,
            costPrice: sp.costPrice,
            salePrice: sp.salePrice,
          })),
          // Top productos por stock
          topProductsByStock: topProducts.map((sp) => ({
            productName: sp.product.name,
            stock: sp.stock,
          })),
          openCashRegisters: shopOpenCashRegisters,
          hasOpenCashRegister: shopOpenCashRegisters.length > 0,
        },
      };
    }

    if (user.role === 'EMPLOYEE') {
      const employeeShop = await this.prisma.employeeShop.findFirst({
        where: { employeeId: user.id, shopId: id },
        include: {
          shop: {
            include: {
              _count: {
                select: {
                  shopProducts: true,
                  categories: true,
                },
              },
            },
          },
        },
      });

      if (!employeeShop?.shop) {
        throw new ForbiddenException('No podés acceder a esta tienda');
      }

      const shop = employeeShop.shop;
      const employee = await this.prisma.employee.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          fullName: true,
          role: true,
          hireDate: true,
          phone: true,
        },
      });

      if (!employee) {
        throw new ForbiddenException('Empleado no encontrado');
      }

      if (!shop) {
        throw new NotFoundException('Tienda no encontrada');
      }

      // Información limitada para empleados
      const [lowStockProducts, recentSalesCount] = await Promise.all([
        this.prisma.shopProduct.findMany({
          where: {
            shopId: id,
            stock: { lte: 10 },
            isActive: true,
          },
          include: {
            product: { select: { name: true, barcode: true } },
          },
          take: 10,
        }),
        this.prisma.sale.count({
          where: {
            shopId: id,
            saleDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);
      const [openCashRegisters] =
        await this.cashRegisterService.findOpenCashRegistersForShops([id], user);
      const myOpenCashRegister =
        openCashRegisters?.cashRegisters?.find(
          (cashRegister) => cashRegister.employeeId === user.id,
        ) ?? null;

      return {
        message: 'Información de tu tienda',
        role: 'EMPLOYEE',
        data: {
          // Información básica
          id: shop.id,
          name: shop.name,
          address: shop.address,
          phone: shop.phone,
          isActive: shop.isActive,
          countryCode: shop.countryCode,
          currencyCode: shop.currencyCode,
          timezone: shop.timezone,
          // Mi información como empleado
          myInfo: {
            id: employee.id,
            fullName: employee.fullName,
            role: employee.role,
            hireDate: employee.hireDate,
            phone: employee.phone,
          },
          // Información operativa limitada
          productsCount: shop._count.shopProducts,
          categoriesCount: shop._count.categories,
          salesToday: recentSalesCount,
          // Productos con bajo stock (operativo)
          lowStockProducts: lowStockProducts.map((sp) => ({
            id: sp.id,
            productName: sp.product.name,
            barcode: sp.product.barcode,
            stock: sp.stock,
            // Sin precios de costo
          })),
          myOpenCashRegister,
          hasOpenCashRegister: Boolean(myOpenCashRegister),
          // Sin acceso a:
          // - Datos fiscales
          // - Información de otros empleados
          // - Salarios
          // - Estadísticas financieras
          // - Balance
        },
      };
    }

    throw new ForbiddenException('No tenés permisos para acceder a esta información');
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
