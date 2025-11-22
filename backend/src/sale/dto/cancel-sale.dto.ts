import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CancelSaleDto {
  @ApiProperty({
    description: 'Razón de la cancelación',
    example: 'Cliente solicitó cancelación de la venta',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  cancellationReason: string;
}
