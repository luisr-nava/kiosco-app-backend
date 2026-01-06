import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CommonQueryWithDatesDto } from '../../common/dto';
import { PurchaseStatus } from '@prisma/client';

export class PurchaseQueryDto extends CommonQueryWithDatesDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la tienda debe ser un UUID válido' })
  shopId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  supplierId?: string;

  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;
}
