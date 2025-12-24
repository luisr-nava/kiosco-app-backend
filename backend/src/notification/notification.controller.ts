import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@Controller()
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('notifications')
  async getNotifications(
    @GetUser() user: JwtPayload,
    @Query('read') read?: string,
  ) {
    const readFilter =
      read === undefined
        ? undefined
        : read === 'true'
          ? true
          : read === 'false'
            ? false
            : undefined;
    return this.notificationService.getNotifications(user.id, readFilter);
  }

  @Patch('notifications/:id/read')
  async markAsRead(@GetUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.id, id);
  }

  @Get('shops/:shopId/preferences/notifications')
  async getPreferences(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });
    if (!shop) {
      throw new NotFoundException('La tienda no existe');
    }
    if (shop.ownerId !== user.id) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }
    return (
      (await this.notificationService.getPreferences(user.id, shopId)) ?? {
        userId: user.id,
        shopId,
        lowStockEnabled: true,
        lowStockThreshold: 5,
      }
    );
  }

  @Put('shops/:shopId/preferences/notifications')
  async updatePreferences(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });
    if (!shop) {
      throw new NotFoundException('La tienda no existe');
    }
    if (shop.ownerId !== user.id) {
      throw new ForbiddenException('No tenés acceso a esta tienda');
    }
    return this.notificationService.updatePreferences(user.id, shopId, dto);
  }
}
