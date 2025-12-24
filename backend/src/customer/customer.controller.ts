import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';

import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto, @GetUser() user: JwtPayload) {
    return this.customerService.create(dto, user);
  }

  @Get('shop/:shopId')
  findAll(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @GetUser() user: JwtPayload,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.customerService.findAll(
      shopId,
      user,
      includeInactive,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search?.trim(),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: JwtPayload) {
    return this.customerService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.customerService.update(id, dto, user);
  }

  @Patch(':id/toggle')
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.customerService.toggleActive(id, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: JwtPayload) {
    return this.customerService.remove(id, user);
  }

  // PAGOS
  @Post('payment')
  createPayment(@Body() dto: CreatePaymentDto, @GetUser() user: JwtPayload) {
    return this.customerService.createPayment(dto, user);
  }

  @Get(':id/payments')
  getPaymentHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.customerService.getPaymentHistory(id, user);
  }

  @Get(':id/account-statement')
  getAccountStatement(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.customerService.getAccountStatement(id, user);
  }
}
