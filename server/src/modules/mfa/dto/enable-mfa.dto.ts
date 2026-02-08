import { IsString, IsNotEmpty, Length } from 'class-validator';

/**
 * DTO for enabling MFA
 * 
 * Requirement 13.2: WHEN a user confirms MFA setup, THE MFA_System SHALL 
 * require validation of a TOTP code before activation
 */
export class EnableMfaDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'TOTP code must be 6 digits' })
  token!: string;
}
