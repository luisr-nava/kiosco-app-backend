import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty({
    message: 'El nombre completo es requerido',
  })
  @Length(5, 50, {
    message: 'El nombre debe tener entre 5 y 50 caracteres',
  })
  @IsString()
  fullName: string;

  @IsEmail()
  @IsNotEmpty({
    message: 'El email es requerido',
  })
  email: string;

  @IsString()
  @Length(8, 20, {
    message: 'La contraseña debe tener entre 8 y 20 caracteres',
  })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
