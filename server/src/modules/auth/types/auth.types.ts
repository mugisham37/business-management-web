import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { userRoleEnum } from '../../database/schema/enums';

// Register enum for GraphQL
registerEnumType(userRoleEnum.enumValues, {
  name: 'UserRole',
  description: 'User role in the system',
});

/**
 * Authenticated user type for GraphQL
 */
@ObjectType()
export class AuthUser {
  @Field(() => ID)
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'User email' })
  email!: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => String)
  @ApiProperty({ description: 'User role', enum: userRoleEnum.enumValues })
  role!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'User permissions', type: [String] })
  permissions!: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'First name', required: false })
  firstName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last name', required: false })
  lastName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Display name', required: false })
  displayName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Avatar URL', required: false })
  avatar?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;
}

/**
 * Login response type
 */
@ObjectType()
export class LoginResponse {
  @Field(() => AuthUser)
  @ApiProperty({ type: AuthUser, description: 'Authenticated user' })
  user!: AuthUser;

  @Field()
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;

  @Field()
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken!: string;

  @Field()
  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn!: number;

  @Field()
  @ApiProperty({ description: 'Token type (Bearer)' })
  tokenType!: string;
}

/**
 * Refresh token response type
 */
@ObjectType()
export class RefreshTokenResponse {
  @Field()
  @ApiProperty({ description: 'New JWT access token' })
  accessToken!: string;

  @Field()
  @ApiProperty({ description: 'New JWT refresh token' })
  refreshToken!: string;

  @Field()
  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn!: number;

  @Field()
  @ApiProperty({ description: 'Token type (Bearer)' })
  tokenType!: string;
}

/**
 * MFA requirement check response
 */
@ObjectType()
export class MfaRequirementResponse {
  @Field()
  @ApiProperty({ description: 'Whether MFA is required' })
  requiresMfa!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User ID if MFA is required', required: false })
  userId?: string;
}
