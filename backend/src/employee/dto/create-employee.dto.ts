import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsDateString,
  Length,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @Length(3, 50)
  fullName: string;

  @IsUUID()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  shopIds: string[];

  @IsEmail()
  email: string; // LEGACY_EMPLOYEE_COMPAT: requerido por el esquema local, no para autenticación

  @IsString()
  @IsOptional()
  role?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;
}
