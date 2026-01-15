import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchQueryWithShopDto } from '../../common/dto';

export class ProductQueryDto extends SearchQueryWithShopDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  categoryId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  supplierId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) {
      return undefined;
    }
    if (value === true || value === 'true') {
      return true;
    }
    if (value === false || value === 'false') {
      return false;
    }
    return value;
  })
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'lowStock debe ser un booleano' })
  lowStock?: boolean;
}
