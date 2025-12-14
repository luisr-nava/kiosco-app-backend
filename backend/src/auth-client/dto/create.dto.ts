import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export class CreateUserDto {
  @IsNotEmpty({
    message: 'El nombre de usuario es requerido',
  })
  @Length(5, 20, {
    message: 'El nombre de usuario debe tener entre 5 y 20 caracteres',
  })
  @IsString()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(8, 20, {
    message: 'La contraseña debe tener entre 8 y 20 caracteres',
  })
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
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

  @IsDate()
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

  // Solo aplica para OWNER: se permite enviar el customerId de Stripe, opcional para otros roles
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;
}
