import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

/**
 * MFA setup response type
 */
@ObjectType()
export class MfaSetupResponse {
  @Field()
  @ApiProperty({ description: 'MFA secret key (base32 encoded)' })
  secret!: string;

  @Field()
  @ApiProperty({ description: 'QR code URL for scanning with authenticator app' })
  qrCodeUrl!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Backup codes for account recovery', type: [String] })
  backupCodes!: string[];

  @Field()
  @ApiProperty({ description: 'Manual entry key for authenticator app' })
  manualEntryKey!: string;
}

/**
 * MFA status response type
 */
@ObjectType()
export class MfaStatusResponse {
  @Field()
  @ApiProperty({ description: 'Whether MFA is enabled' })
  enabled!: boolean;

  @Field()
  @ApiProperty({ description: 'Number of remaining backup codes' })
  backupCodesCount!: number;

  @Field()
  @ApiProperty({ description: 'Whether MFA secret is configured' })
  hasSecret!: boolean;
}

/**
 * WebAuthn setup response type (for future implementation)
 */
@ObjectType()
export class WebAuthnSetupResponse {
  @Field()
  @ApiProperty({ description: 'WebAuthn challenge' })
  challenge!: string;

  @Field()
  @ApiProperty({ description: 'Relying party ID' })
  rpId!: string;

  @Field()
  @ApiProperty({ description: 'User ID for WebAuthn' })
  userId!: string;

  @Field()
  @ApiProperty({ description: 'Registration options as JSON string' })
  registrationOptions!: string;
}

/**
 * WebAuthn verification response type (for future implementation)
 */
@ObjectType()
export class WebAuthnVerificationResponse {
  @Field()
  @ApiProperty({ description: 'Whether WebAuthn verification was successful' })
  verified!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message if verification failed', required: false })
  error?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Credential ID if verification successful', required: false })
  credentialId?: string;
}