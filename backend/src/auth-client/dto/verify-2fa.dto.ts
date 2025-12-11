import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código debe contener solo números' })
  code: string;
}
