import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

/**
 * Login input for GraphQL
 */
@InputType()
export class LoginInput {
  @Field()
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Remember me for extended session', required: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

/**
 * Login with MFA input
 */
@InputType()
export class LoginWithMfaInput {
  @Field()
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @Field()
  @ApiProperty({ description: 'MFA token (6-digit code or backup code)' })
  @IsString()
  mfaToken!: string;
}

/**
 * Register input for GraphQL
 */
@InputType()
export class RegisterInput {
  @Field()
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @Field()
  @ApiProperty({ description: 'User password', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Field()
  @ApiProperty({ description: 'User first name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @Field()
  @ApiProperty({ description: 'User last name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID for multi-tenant registration' })
  @IsString()
  tenantId!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}

/**
 * Refresh token input
 */
@InputType()
export class RefreshTokenInput {
  @Field()
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken!: string;
}

/**
 * Change password input
 */
@InputType()
export class ChangePasswordInput {
  @Field()
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword!: string;

  @Field()
  @ApiProperty({ description: 'New password', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

/**
 * Forgot password input
 */
@InputType()
export class ForgotPasswordInput {
  @Field()
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;
}

/**
 * Reset password input
 */
@InputType()
export class ResetPasswordInput {
  @Field()
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  token!: string;

  @Field()
  @ApiProperty({ description: 'New password', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
