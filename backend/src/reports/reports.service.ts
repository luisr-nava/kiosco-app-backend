import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailySales(shopId: string, date: string, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        shopId,
        saleDate: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
      },
      include: { items: true, customer: true, paymentMethod: true },
    });

    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const count = sales.length;
    const cashSales = sales.filter((s) => s.paymentMethod.code === 'CASH');
    const totalCash = cashSales.reduce((sum, s) => sum + s.totalAmount, 0);

    return { date, total, count, totalCash, sales };
  }

  async getTopProducts(shopId: string, limit: number, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    const saleItems = await this.prisma.saleItem.findMany({
      where: { sale: { shopId, status: 'COMPLETED' } },
      include: { shopProduct: { include: { product: true } } },
    });

    const productStats = saleItems.reduce(
      (acc, item) => {
        const key = item.shopProductId;
        if (!acc[key]) {
          acc[key] = {
            shopProduct: item.shopProduct,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        acc[key].totalQuantity += item.quantity;
        acc[key].totalRevenue += item.total;
        return acc;
      },
      {} as any,
    );

    return Object.values(productStats)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  async getLowStock(shopId: string, threshold: number, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    return this.prisma.shopProduct.findMany({
      where: {
        shopId,
        isActive: true,
        stock: { lte: threshold, not: null },
      },
      include: { product: true },
      orderBy: { stock: 'asc' },
    });
  }

  async getCustomersWithDebt(shopId: string, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop || shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }

    return this.prisma.customer.findMany({
      where: {
        shopId,
        currentBalance: { gt: 0 },
        isActive: true,
      },
      orderBy: { currentBalance: 'desc' },
    });
  }
}
