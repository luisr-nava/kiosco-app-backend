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
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Caja Registradora')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @Post('open')
  @ApiOperation({ summary: 'Abrir caja registradora' })
  open(@Body() dto: OpenCashRegisterDto, @GetUser() user: JwtPayload) {
    return this.cashRegisterService.open(dto, user);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Cerrar caja registradora' })
  close(
    @Param('id') id: string,
    @Body() dto: CloseCashRegisterDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.close(id, dto, user);
  }

  @Get('current/:shopId')
  @ApiOperation({ summary: 'Obtener caja actual abierta de una tienda' })
  getCurrentCashRegister(
    @Param('shopId') shopId: string,
    @GetUser() user: JwtPayload,
  ) {
    return this.cashRegisterService.getCurrentCashRegister(shopId, user);
  }

  @Get('history/:shopId')
  @ApiOperation({ summary: 'Historial de cajas de una tienda' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
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
  @ApiOperation({ summary: 'Obtener detalle de caja por ID' })
  getCashRegisterById(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.cashRegisterService.getCashRegisterById(id, user);
  }
}
