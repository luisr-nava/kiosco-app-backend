import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: 'uuid-del-cliente',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  customerId: string;

  @ApiProperty({
    description: 'Monto del pago',
    example: 5000,
  })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @ApiProperty({
    description: 'ID del método de pago',
    example: 'uuid-payment-method',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  paymentMethodId: string;

  @ApiPropertyOptional({
    description: 'Número de referencia (comprobante, transferencia, etc.)',
    example: 'TRANS-12345',
  })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'ID de la tienda',
    example: 'uuid-de-la-tienda',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  shopId: string;
}
