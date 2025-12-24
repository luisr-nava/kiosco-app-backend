import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeDto } from './create-income.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
  description?: string;
}
