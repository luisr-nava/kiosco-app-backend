import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El código de barras no puede exceder 50 caracteres' })
  barcode?: string;

  @IsUUID()
  shopId: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  salePrice: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(27)
  taxRate?: number;

  @IsOptional()
  @IsEnum(['Gravado', 'Exento', 'No Alcanzado'], {
    message: 'Categoría fiscal inválida',
  })
  taxCategory?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsUUID()
  measurementUnitId: string;
}
