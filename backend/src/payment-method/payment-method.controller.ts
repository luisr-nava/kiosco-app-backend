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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Métodos de Pago')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @ApiOperation({ summary: 'Crear método de pago' })
  create(@Body() dto: CreatePaymentMethodDto, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.create(dto, user);
  }

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Listar métodos de pago de una tienda' })
  findAll(@Param('shopId') shopId: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.findAll(shopId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener método de pago por ID' })
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar método de pago' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.paymentMethodService.update(id, dto, user);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar/Desactivar método de pago' })
  toggle(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.toggle(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar método de pago' })
  remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.paymentMethodService.remove(id, user);
  }
}
