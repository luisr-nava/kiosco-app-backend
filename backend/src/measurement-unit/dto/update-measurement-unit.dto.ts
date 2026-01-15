import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeasurementUnitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code?: string;
}
