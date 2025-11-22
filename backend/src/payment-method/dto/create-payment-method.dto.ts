import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'uuid-tienda',
  })
  @IsUUID()
  shopId: string;

  @ApiProperty({
    description: 'Nombre del método de pago',
    example: 'Efectivo',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Código único del método de pago',
    example: 'CASH',
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({
    description: 'Descripción del método de pago',
    example: 'Pago en efectivo al momento de la compra',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
