import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsUUID } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(1)
  password!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

@InputType()
export class LoginWithMfaInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(1)
  password!: string;

  @Field()
  @IsString()
  @MinLength(6)
  @MaxLength(8)
  mfaToken!: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @Field()
  @IsUUID()
  tenantId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString()
  refreshToken!: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  currentPassword!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  email!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  token!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}

@InputType()
export class OAuthLoginInput {
  @Field()
  @IsString()
  provider!: string; // 'google', 'facebook', 'github'

  @Field()
  @IsString()
  code!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field()
  @IsUUID()
  tenantId!: string;
}

@InputType()
export class WebAuthnLoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  credentialId!: string;

  @Field()
  @IsString()
  authenticatorData!: string;

  @Field()
  @IsString()
  clientDataJSON!: string;

  @Field()
  @IsString()
  signature!: string;
}