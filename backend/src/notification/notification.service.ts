import { Injectable, ForbiddenException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';

export interface CreateNotificationDto {
  userId: string;
  shopId: string;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto) {
    if (!(await this.shouldCreateNotification(dto))) {
      return null;
    }

    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        shopId: dto.shopId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
      },
    });
  }

  async getNotifications(
    userId: string,
    shopId?: string,
    read?: boolean,
    type?: NotificationType,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(shopId ? { shopId } : {}),
        ...(read !== undefined ? { read } : {}),
        ...(type ? { type } : {}),
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

    if (notification.read) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string, shopId?: string) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (shopId) {
      where.shopId = shopId;
    }

    const result = await this.prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    return { count: result.count };
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

  private async shouldCreateNotification(dto: CreateNotificationDto) {
    if (dto.type !== NotificationType.LOW_STOCK) {
      return true;
    }

    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId_shopId: { userId: dto.userId, shopId: dto.shopId } },
    });

    return preference?.lowStockEnabled ?? true;
  }
}
