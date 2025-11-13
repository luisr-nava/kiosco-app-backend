import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
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

  // IVA aplicable al producto (opcional)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(27)
  taxRate?: number;

  @IsOptional()
  @IsString()
  taxCategory?: string; // Ej: "Gravado", "Exento", "No Alcanzado"
}
