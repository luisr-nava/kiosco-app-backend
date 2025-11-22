import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class OpenCashRegisterDto {
  @ApiProperty({
    description: 'ID de la tienda',
    example: 'uuid-tienda',
  })
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @ApiProperty({
    description: 'Monto inicial en la caja',
    example: 10000,
  })
  @IsNumber()
  @Min(0, { message: 'El monto inicial debe ser mayor o igual a 0' })
  openingAmount: number;
}
