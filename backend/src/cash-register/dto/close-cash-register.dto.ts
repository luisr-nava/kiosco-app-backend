import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CloseCashRegisterDto {
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El monto real debe ser mayor o igual a 0' })
  actualAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  closingNotes?: string;
}
