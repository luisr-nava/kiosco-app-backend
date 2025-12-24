import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { MeasurementBaseUnit, MeasurementUnitCategory } from '@prisma/client';

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

  @IsOptional()
  @IsEnum(MeasurementUnitCategory)
  category?: MeasurementUnitCategory;

  @IsOptional()
  @IsEnum(MeasurementBaseUnit)
  baseUnit?: MeasurementBaseUnit;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  conversionFactor?: number;
}
