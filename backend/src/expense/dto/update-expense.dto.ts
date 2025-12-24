import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
  description?: string;
}
