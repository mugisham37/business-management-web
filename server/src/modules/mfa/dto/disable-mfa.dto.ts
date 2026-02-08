import { IsString, IsNotEmpty, Length, MinLength } from 'class-validator';

/**
 * DTO for disabling MFA
 * 
 * Requirement 13.7: WHEN a user disables MFA, THE MFA_System SHALL require 
 * current password and a valid TOTP code
 */
export class DisableMfaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'TOTP code must be 6 digits' })
  token!: string;
}
