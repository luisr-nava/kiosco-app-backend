import { IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @Length(8, 8, {
    message: 'El código de verificación debe tener 8 dígitos',
  })
  code: string;
}
