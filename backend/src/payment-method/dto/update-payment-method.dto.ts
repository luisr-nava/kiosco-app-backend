import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment-method.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {
  @ApiPropertyOptional({
    description: 'Estado activo del método de pago',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
