import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsOptional } from 'class-validator';

/**
 * Enable MFA input
 */
@InputType()
export class EnableMfaInput {
  @Field()
  @ApiProperty({ description: 'MFA token (6-digit code) to verify setup' })
  @IsString()
  @Length(6, 6)
  token!: string;
}

/**
 * Disable MFA input
 */
@InputType()
export class DisableMfaInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'MFA token (6-digit code)', required: false })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  token?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Backup code for disabling MFA', required: false })
  @IsOptional()
  @IsString()
  backupCode?: string;
}

/**
 * Verify MFA token input
 */
@InputType()
export class VerifyMfaTokenInput {
  @Field()
  @ApiProperty({ description: 'MFA token (6-digit code or backup code)' })
  @IsString()
  token!: string;
}

/**
 * Generate backup codes input
 */
@InputType()
export class GenerateBackupCodesInput {
  @Field()
  @ApiProperty({ description: 'MFA token (6-digit code) to verify identity' })
  @IsString()
  @Length(6, 6)
  token!: string;
}
