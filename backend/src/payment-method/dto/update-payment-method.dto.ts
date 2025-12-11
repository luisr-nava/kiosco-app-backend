import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment-method.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
