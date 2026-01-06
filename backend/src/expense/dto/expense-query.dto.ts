import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CommonQueryWithDatesDto } from '../../common/dto';

export class ExpenseQueryDto extends CommonQueryWithDatesDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la tienda debe ser un UUID válido' })
  shopId?: string;

  @IsOptional()
  @IsUUID('4', {
    message: 'El ID del método de pago debe ser un UUID válido',
  })
  paymentMethodId?: string;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser un texto válido' })
  categoryId?: string;
}
