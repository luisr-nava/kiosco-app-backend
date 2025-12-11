import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FALoginDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
