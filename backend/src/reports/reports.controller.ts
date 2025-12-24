import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/daily/:shopId')
  getDailySales(
    @Param('shopId') shopId: string,
    @Query('date') date: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.reportsService.getDailySales(shopId, date, user);
  }

  @Get('products/top/:shopId')
  getTopProducts(
    @Param('shopId') shopId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @GetUser() user: JwtPayload,
  ) {
    return this.reportsService.getTopProducts(shopId, limit, user);
  }

  @Get('products/low-stock/:shopId')
  getLowStock(
    @Param('shopId') shopId: string,
    @Query('threshold', new DefaultValuePipe(5), ParseIntPipe)
    threshold: number,
    @GetUser() user: JwtPayload,
  ) {
    return this.reportsService.getLowStock(shopId, threshold, user);
  }

  @Get('customers/debt/:shopId')
  getCustomersWithDebt(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.reportsService.getCustomersWithDebt(shopId, user);
  }
}
