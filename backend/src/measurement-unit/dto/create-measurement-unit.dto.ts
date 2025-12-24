import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MeasurementBaseUnit, MeasurementUnitCategory } from '@prisma/client';

export class CreateMeasurementUnitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsEnum(MeasurementUnitCategory)
  category: MeasurementUnitCategory;

  @IsEnum(MeasurementBaseUnit)
  baseUnit: MeasurementBaseUnit;

  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  conversionFactor: number;

  @IsOptional()
  @IsBoolean()
  isBaseUnit?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  shopIds?: string[];
}
