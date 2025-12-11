
import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class OpenCashRegisterDto {
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @IsNumber()
  @Min(0, { message: 'El monto inicial debe ser mayor o igual a 0' })
  openingAmount: number;
}
