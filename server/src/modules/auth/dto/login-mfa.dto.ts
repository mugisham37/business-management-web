import { IsNotEmpty, IsString } from 'class-validator';

export class LoginMfaDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsNotEmpty()
  mfaCode!: string;
}
