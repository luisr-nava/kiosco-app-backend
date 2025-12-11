import { IsEmail, IsString } from 'class-validator';

export class ResendVerificationCodeDto {
  @IsString()
  @IsEmail()
  email: string;
}
