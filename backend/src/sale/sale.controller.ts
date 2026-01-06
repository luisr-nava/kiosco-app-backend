import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';

import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { SaleStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  create(@Body() dto: CreateSaleDto, @GetUser() user: JwtPayload) {
    return this.saleService.create(dto, user);
  }

  @Get('shop/:shopId')
  findAll(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @GetUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('paymentMethodId') paymentMethodId?: string,
    @Query('status') status?: string,
  ) {
    const parsedStatus =
      status && Object.values(SaleStatus).includes(status as SaleStatus)
        ? (status as SaleStatus)
        : undefined;

    return this.saleService.findAll(shopId, user, {
      startDate,
      endDate,
      paymentMethodId,
      status: parsedStatus,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: JwtPayload) {
    return this.saleService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSaleDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.saleService.update(id, dto, user);
  }

  @Delete(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.saleService.cancel(id, user, reason);
  }
}
