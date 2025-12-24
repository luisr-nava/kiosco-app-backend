import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notification.gateway';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';

interface LowStockContext {
  shopId: string;
  productId: string;
  productName: string;
  stockBefore: number;
  stockAfter: number;
  ownerId: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async handleLowStock(context: LowStockContext) {
    const { shopId, productId, productName, stockBefore, stockAfter, ownerId } =
      context;

    if (!shopId) return;

    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId_shopId: { userId: ownerId, shopId } },
    });

    if (!preference) return;
    if (!preference.lowStockEnabled) return;

    const threshold = preference.lowStockThreshold ?? 5;
    if (!(stockBefore > threshold && stockAfter <= threshold)) {
      return;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: ownerId,
        shopId,
        type: 'LOW_STOCK',
        title: 'Stock bajo',
        message: `${productName} tiene stock ${stockAfter} por debajo del umbral (${threshold})`,
      },
    });

    this.gateway.emitNotification(ownerId, {
      type: 'LOW_STOCK',
      productId,
      productName,
      stock: stockAfter,
      shopId,
      notificationId: notification.id,
    });
  }

  async ensureDefaultPreference(shopId: string, ownerId: string) {
    if (!shopId || !ownerId) return;
    try {
      await this.prisma.notificationPreference.upsert({
        where: { userId_shopId: { userId: ownerId, shopId } },
        update: {},
        create: {
          userId: ownerId,
          shopId,
        },
      });
    } catch (error) {
      // No rethrow to avoid breaking shop creation
    }
  }

  async getPreferences(userId: string, shopId: string) {
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId_shopId: { userId, shopId } },
    });
    return preference;
  }

  async updatePreferences(
    userId: string,
    shopId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId_shopId: { userId, shopId } },
    });

    if (!preference) {
      return this.prisma.notificationPreference.create({
        data: {
          userId,
          shopId,
          lowStockEnabled: dto.lowStockEnabled,
          lowStockThreshold: dto.lowStockThreshold,
        },
      });
    }

    return this.prisma.notificationPreference.update({
      where: { id: preference.id },
      data: {
        lowStockEnabled: dto.lowStockEnabled,
        lowStockThreshold: dto.lowStockThreshold,
      },
    });
  }

  async getNotifications(userId: string, read?: boolean) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(read !== undefined ? { read } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new ForbiddenException('No tenés permiso para esta notificación');
    }
    if (notification.read) return notification;
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
