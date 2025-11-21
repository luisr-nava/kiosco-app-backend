import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({
    description: 'Código de verificación de 6 dígitos',
    example: '12345678',
    minLength: 8,
    maxLength: 8,
  })
  @IsString()
  @Length(8, 8, {
    message: 'El código de verificación debe tener 8 dígitos',
  })
  code: string;
}
