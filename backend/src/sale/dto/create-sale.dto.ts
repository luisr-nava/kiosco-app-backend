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
  @IsUUID()
  @IsNotEmpty()
  shopProductId: string;

  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateSaleDto {
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @IsUUID()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsString()
  @MaxLength(1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  @IsOptional()
  notes?: string;

  @IsEnum(InvoiceType)
  @IsOptional()
  invoiceType?: InvoiceType;

  @IsString()
  @MaxLength(50, {
    message: 'El número de factura no puede exceder 50 caracteres',
  })
  @IsOptional()
  invoiceNumber?: string;
}
