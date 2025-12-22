import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import type { UserRole } from '../interfaces/jwt-payload.interface';

const USER_ROLES: readonly UserRole[] = ['EMPLOYEE', 'OWNER', 'MANAGER'];

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(5, 20, {
    message: 'El nombre de usuario debe tener entre 5 y 20 caracteres',
  })
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @Length(7, 20, { message: 'El teléfono debe tener entre 7 y 20 caracteres' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(7, 15, { message: 'El DNI debe tener entre 7 y 15 caracteres' })
  dni?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'La dirección debe tener entre 5 y 200 caracteres' })
  address?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsString()
  @IsOptional()
  salary?: string;

  @IsString()
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  @IsOptional()
  notes?: string;

  @IsString()
  @MaxLength(500, { message: 'La URL de imagen no puede exceder 500 caracteres' })
  @IsOptional()
  profileImage?: string;

  @IsString()
  @MaxLength(200, { message: 'El contacto de emergencia no puede exceder 200 caracteres' })
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsOptional()
  @IsBoolean()
  isVerify?: boolean;
}
