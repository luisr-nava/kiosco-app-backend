import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CancelSaleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  cancellationReason: string;
}
