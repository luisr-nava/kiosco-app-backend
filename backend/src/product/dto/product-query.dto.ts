import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SearchQueryWithShopDto } from '../../common/dto';

export class ProductQueryDto extends SearchQueryWithShopDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  categoryId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  supplierId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'lowStock debe ser un booleano' })
  lowStock?: boolean;
}
