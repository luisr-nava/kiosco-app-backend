import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString, MaxLength } from 'class-validator';

export class CloseCashRegisterDto {
  @ApiProperty({
    description: 'Monto real contado en la caja',
    example: 25300,
  })
  @IsNumber()
  @Min(0, { message: 'El monto real debe ser mayor o igual a 0' })
  actualAmount: number;

  @ApiPropertyOptional({
    description: 'Notas del cierre de caja',
    example: 'Cierre normal sin novedades',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  closingNotes?: string;
}
