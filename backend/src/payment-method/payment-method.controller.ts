import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  create(@Body() dto: CreatePaymentMethodDto, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.create(dto, user);
  }

  @Get('shop/:shopId')
  findAll(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentMethodService.findAll(
      shopId,
      user,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.paymentMethodService.update(id, dto, user);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.toggle(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.remove(id, user);
  }
}
