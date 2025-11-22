import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  ArrayMinSize,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  TRANSFER = 'TRANSFER',
  QR = 'QR',
  ACCOUNT = 'ACCOUNT', // Cuenta corriente
  MIXED = 'MIXED',
}

export enum InvoiceType {
  TICKET = 'TICKET',
  FACTURA_A = 'FACTURA_A',
  FACTURA_B = 'FACTURA_B',
  FACTURA_C = 'FACTURA_C',
}

export class CreateSaleItemDto {
  @ApiProperty({
    description: 'ID del producto en la tienda (ShopProduct)',
    example: 'uuid-shop-product',
  })
  @IsUUID()
  @IsNotEmpty()
  shopProductId: string;

  @ApiProperty({
    description: 'Cantidad a vender',
    example: 2,
  })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado al item',
    example: 100,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'uuid-tienda',
  })
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @ApiPropertyOptional({
    description: 'ID del cliente (opcional para ventas al público)',
    example: 'uuid-cliente',
  })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'Items de la venta',
    type: [CreateSaleItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({
    description: 'ID del método de pago',
    example: 'uuid-payment-method',
  })
  @IsUUID()
  @IsNotEmpty()
  paymentMethodId: string;

  @ApiPropertyOptional({
    description: 'Descuento global aplicado a la venta',
    example: 500,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
  })
  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Tipo de comprobante fiscal',
    enum: InvoiceType,
    example: InvoiceType.FACTURA_B,
  })
  @IsEnum(InvoiceType)
  @IsOptional()
  invoiceType?: InvoiceType;

  @ApiPropertyOptional({
    description: 'Número de factura (si aplica)',
  })
  @IsString()
  @MaxLength(50, { message: 'El número de factura no puede exceder 50 caracteres' })
  @IsOptional()
  invoiceNumber?: string;
}
