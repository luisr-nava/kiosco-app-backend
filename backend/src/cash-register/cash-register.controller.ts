import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto';
import { CashRegisterReportFiltersDto } from './dto/cash-register-report-filters.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post('open')
  open(@Body() dto: OpenCashRegisterDto, @GetUser() user: JwtPayload) {
    return this.cashRegisterService.open(dto, user);
  }

  @Patch(':id/close')
  close(
    @Param('id') id: string,
    @Body() dto: CloseCashRegisterDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.close(id, dto, user);
  }

  @Get('report/:shopId')
  getReport(
    @Param('shopId') shopId: string,
    @Query() filters: CashRegisterReportFiltersDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getReport(shopId, filters, user);
  }

  @Get('available-years/:shopId')
  getAvailableYears(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getAvailableYears(shopId, user);
  }

  @Get('current/:shopId')
  getCurrentCashRegister(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getCurrentCashRegister(shopId, user);
  }

  @Get('history/:shopId')
  getCashRegisterHistory(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getCashRegisterHistory(
      shopId,
      user,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  getCashRegisterById(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.cashRegisterService.getCashRegisterById(id, user);
  }
}
