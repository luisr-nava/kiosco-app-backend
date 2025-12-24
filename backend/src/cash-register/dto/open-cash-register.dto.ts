import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsUUID,
  Length,
} from 'class-validator';

export class OpenCashRegisterDto {
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @IsNumber()
  @Min(0, { message: 'El monto inicial debe ser mayor o igual a 0' })
  openingAmount: number;

  @IsString()
  @IsNotEmpty({ message: 'Responsable obligatorio' })
  @Length(2, 255, { message: 'Responsable debe tener al menos 2 caracteres' })
  openedByName: string;
}
