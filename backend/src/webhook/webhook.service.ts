import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto, WebhookEvent } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { UpdateStockThresholdDto } from './dto/update-stock-threshold.dto';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import * as crypto from 'crypto';
import { WebhookEvent as PrismaWebhookEvent } from '@prisma/client';

type StockAlertPayload = {
  event: PrismaWebhookEvent;
  timestamp: string;
  data: {
    alert: {
      id: string;
      currentStock: number | null;
      threshold: number;
      createdAt: Date;
    };
    product: {
      id: string;
      name: string;
      description: string | null;
      barcode: string | null;
    };
    shopProduct: {
      id: string;
      costPrice: number;
      salePrice: number;
      stock: number | null;
    };
    shop: {
      id: string;
      name: string;
    };
  };
};

type WebhookDeliveryTarget = {
  id: string;
  url: string;
  event: PrismaWebhookEvent;
  secret: string | null;
  retryAttempts: number;
  timeoutMs: number;
};

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWebhookDto, user: JwtPayload) {
    // Validar acceso a la tienda
    await this.validateShopAccess(dto.shopId, user);

    const webhook = await this.prisma.webhook.create({
      data: {
        shopId: dto.shopId,
        name: dto.name,
        url: dto.url,
        event: dto.event,
        secret: dto.secret,
        retryAttempts: dto.retryAttempts || 3,
        timeoutMs: dto.timeoutMs || 5000,
        createdBy: user.id,
      },
    });

    return {
      message: 'Webhook creado correctamente',
      data: webhook,
    };
  }

  async findAll(shopId: string, user: JwtPayload) {
    await this.validateShopAccess(shopId, user);

    const webhooks = await this.prisma.webhook.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Webhooks obtenidos correctamente',
      data: webhooks,
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            projectId: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook no encontrado');
    }

    if (webhook.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a este webhook');
    }

    return {
      message: 'Webhook obtenido correctamente',
      data: webhook,
    };
  }

  async update(id: string, dto: UpdateWebhookDto, user: JwtPayload) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook no encontrado');
    }

    if (webhook.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a este webhook');
    }

    const updated = await this.prisma.webhook.update({
      where: { id },
      data: {
        name: dto.name,
        url: dto.url,
        event: dto.event,
        secret: dto.secret,
        isActive: dto.isActive,
        retryAttempts: dto.retryAttempts,
        timeoutMs: dto.timeoutMs,
      },
    });

    return {
      message: 'Webhook actualizado correctamente',
      data: updated,
    };
  }

  async remove(id: string, user: JwtPayload) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook no encontrado');
    }

    if (webhook.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a este webhook');
    }

    await this.prisma.webhook.delete({ where: { id } });

    return {
      message: 'Webhook eliminado correctamente',
    };
  }

  async updateStockThreshold(
    shopId: string,
    dto: UpdateStockThresholdDto,
    user: JwtPayload,
  ) {
    await this.validateShopAccess(shopId, user);

    const shop = await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        lowStockThreshold: dto.lowStockThreshold,
      },
    });

    return {
      message: 'Umbral de stock actualizado correctamente',
      data: {
        shopId: shop.id,
        lowStockThreshold: shop.lowStockThreshold,
      },
    };
  }

  async getStockAlerts(shopId: string, user: JwtPayload) {
    await this.validateShopAccess(shopId, user);

    const alerts = await this.prisma.stockAlert.findMany({
      where: {
        shopId,
        isResolved: false,
      },
      include: {
        shopProduct: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                barcode: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Alertas de stock obtenidas correctamente',
      data: alerts,
    };
  }

  async resolveStockAlert(alertId: string, user: JwtPayload) {
    const alert = await this.prisma.stockAlert.findUnique({
      where: { id: alertId },
      include: {
        shop: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerta no encontrada');
    }

    if (alert.shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a esta alerta');
    }

    const resolved = await this.prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });

    return {
      message: 'Alerta resuelta correctamente',
      data: resolved,
    };
  }

  // Método para verificar stock y disparar webhooks
  async checkStockAndNotify(shopProductId: string) {
    const shopProduct = await this.prisma.shopProduct.findUnique({
      where: { id: shopProductId },
      include: {
        product: true,
        shop: true,
      },
    });

    if (!shopProduct) {
      this.logger.warn(`ShopProduct ${shopProductId} not found`);
      return;
    }

    const threshold = shopProduct.shop.lowStockThreshold || 10;
    const currentStock = shopProduct.stock || 0;

    // Determinar evento
    let event: PrismaWebhookEvent | null = null;
    if (currentStock === 0) {
      event = PrismaWebhookEvent.STOCK_OUT;
    } else if (currentStock <= threshold) {
      event = PrismaWebhookEvent.LOW_STOCK;
    }

    if (!event) {
      return; // Stock OK, no hacer nada
    }

    // Evitar alertas duplicadas bajo concurrencia: actualizar si existe, crear si no.
    const { alert, created } = await this.prisma.$transaction(
      async (tx) => {
        const existingAlert = await tx.stockAlert.findFirst({
          where: { shopProductId, isResolved: false },
        });

        if (existingAlert) {
          await tx.stockAlert.update({
            where: { id: existingAlert.id },
            data: { currentStock },
          });
          return { alert: existingAlert, created: false };
        }

        const newAlert = await tx.stockAlert.create({
          data: {
            shopId: shopProduct.shopId,
            shopProductId: shopProduct.id,
            currentStock,
            threshold,
          },
        });

        return { alert: newAlert, created: true };
      },
      { isolationLevel: 'Serializable' },
    );

    if (!created) {
      return; // Ya había alerta abierta, solo se actualizó stock
    }

    // Preparar payload
    const payload: StockAlertPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: {
        alert: {
          id: alert.id,
          currentStock: alert.currentStock,
          threshold: alert.threshold,
          createdAt: alert.createdAt,
        },
        product: {
          id: shopProduct.product.id,
          name: shopProduct.product.name,
          description: shopProduct.product.description,
          barcode: shopProduct.product.barcode,
        },
        shopProduct: {
          id: shopProduct.id,
          costPrice: shopProduct.costPrice,
          salePrice: shopProduct.salePrice,
          stock: shopProduct.stock,
        },
        shop: {
          id: shopProduct.shop.id,
          name: shopProduct.shop.name,
        },
      },
    };

    // Obtener webhooks activos para este evento
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        shopId: shopProduct.shopId,
        event,
        isActive: true,
      },
      select: {
        id: true,
        url: true,
        event: true,
        secret: true,
        retryAttempts: true,
        timeoutMs: true,
      },
    });

    // Disparar webhooks
    for (const webhook of webhooks) {
      await this.triggerWebhook(webhook, payload);
    }

    // Marcar alerta como notificada
    await this.prisma.stockAlert.update({
      where: { id: alert.id },
      data: { notifiedAt: new Date() },
    });
  }

  // Método para disparar un webhook específico
  private async triggerWebhook(
    webhook: WebhookDeliveryTarget,
    payload: StockAlertPayload,
  ) {
    let attempts = 0;
    let success = false;
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    let error: string | null = null;

    while (attempts < webhook.retryAttempts && !success) {
      attempts++;

      try {
        // Generar firma HMAC si hay secret
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'KioscoApp-Webhook/1.0',
        };

        if (webhook.secret) {
          const signature = this.generateSignature(payload, webhook.secret);
          headers['X-Webhook-Signature'] = signature;
        }

        // Enviar request
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), webhook.timeoutMs);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        responseStatus = response.status;
        responseBody = await response.text();

        if (response.ok) {
          success = true;
        } else {
          error = `HTTP ${responseStatus}: ${responseBody}`;
        }
      } catch (err: unknown) {
        error = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Webhook ${webhook.id} attempt ${attempts} failed: ${error}`,
        );
      }
    }

    // Guardar log
    await this.prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: webhook.event,
        payload: JSON.stringify(payload),
        responseStatus,
        responseBody,
        success,
        attempts,
        error,
      },
    });

    if (success) {
      this.logger.log(`Webhook ${webhook.id} triggered successfully`);
    } else {
      this.logger.error(
        `Webhook ${webhook.id} failed after ${attempts} attempts`,
      );
    }
  }

  private generateSignature(
    payload: StockAlertPayload,
    secret: string,
  ): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  private async validateShopAccess(shopId: string, user: JwtPayload) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { projectId: true, ownerId: true },
    });

    if (!shop) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (shop.projectId !== user.projectId) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }

    if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findFirst({
        where: { id: user.id, employeeShops: { some: { shopId } } },
      });

      if (!employee) {
        throw new ForbiddenException('No tienes permiso para esta tienda');
      }
    }
  }
}
