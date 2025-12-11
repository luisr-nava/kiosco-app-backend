import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { UpdateStockThresholdDto } from './dto/update-stock-threshold.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() dto: CreateWebhookDto, @GetUser() user: JwtPayload) {
    return this.webhookService.create(dto, user);
  }

  @Get('shop/:shopId')
  findAll(@Param('shopId') shopId: string, @GetUser() user: JwtPayload) {
    return this.webhookService.findAll(shopId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.webhookService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.webhookService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.webhookService.remove(id, user);
  }

  @Patch('shop/:shopId/stock-threshold')
  updateStockThreshold(
    @Param('shopId') shopId: string,
    @Body() dto: UpdateStockThresholdDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.webhookService.updateStockThreshold(shopId, dto, user);
  }

  @Get('shop/:shopId/stock-alerts')
  getStockAlerts(@Param('shopId') shopId: string, @GetUser() user: JwtPayload) {
    return this.webhookService.getStockAlerts(shopId, user);
  }

  @Patch('stock-alert/:alertId/resolve')
  resolveStockAlert(
    @Param('alertId') alertId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.webhookService.resolveStockAlert(alertId, user);
  }
}
