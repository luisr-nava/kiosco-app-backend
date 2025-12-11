
import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsUUID()
  shopId: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
