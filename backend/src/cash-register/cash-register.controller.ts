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

  @Patch(':cashRegisterId/close')
  close(
    @Param('cashRegisterId') cashRegisterId: string,
    @Body() dto: CloseCashRegisterDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.close(cashRegisterId, dto, user);
  }

  @Get(':cashRegisterId/report')
  getReport(
    @Param('cashRegisterId') cashRegisterId: string,
    @Query() filters: CashRegisterReportFiltersDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getReport(cashRegisterId, filters, user);
  }

  @Get(':cashRegisterId/available-years')
  getAvailableYears(
    @Param('cashRegisterId') cashRegisterId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getAvailableYears(cashRegisterId, user);
  }

  @Get(':cashRegisterId/current')
  getCurrentCashRegister(
    @Param('cashRegisterId') cashRegisterId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getCurrentCashRegister(
      cashRegisterId,
      user,
    );
  }

  @Get(':cashRegisterId/history')
  getCashRegisterHistory(
    @Param('cashRegisterId') cashRegisterId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getCashRegisterHistory(
      cashRegisterId,
      user,
      startDate,
      endDate,
    );
  }

  @Get(':cashRegisterId')
  getCashRegisterById(
    @Param('cashRegisterId') cashRegisterId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getCashRegisterById(cashRegisterId, user);
  }
}
