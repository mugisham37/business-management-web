import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { userRoleEnum, businessTierEnum } from '../../database/schema/enums';

// Register enums for GraphQL
registerEnumType(userRoleEnum.enumValues, {
  name: 'UserRole',
  description: 'User role in the system with hierarchical permissions',
});

registerEnumType(businessTierEnum.enumValues, {
  name: 'BusinessTier',
  description: 'Business subscription tier determining feature access',
});

/**
 * Enhanced authenticated user type for GraphQL
 * Includes security context and tier-based information
 */
@ObjectType()
export class AuthUser {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique user identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'User email address' })
  email!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Tenant identifier for multi-tenancy' })
  tenantId!: string;

  @Field(() => String)
  @ApiProperty({ description: 'User role with hierarchical permissions', enum: userRoleEnum.enumValues })
  role!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Granular user permissions', type: [String] })
  permissions!: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'User first name', required: false })
  firstName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User last name', required: false })
  lastName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Display name for UI', required: false })
  displayName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Avatar image URL', required: false })
  avatar?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last successful login timestamp', required: false })
  lastLoginAt?: Date;

  // Enhanced tier-based fields
  @Field(() => String)
  @ApiProperty({ description: 'Business subscription tier', enum: businessTierEnum.enumValues })
  businessTier!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Available feature flags based on tier and configuration', type: [String] })
  featureFlags!: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Trial expiration date if applicable', required: false })
  trialExpiresAt?: Date;
}

/**
 * Enhanced login response with security information
 */
@ObjectType()
export class LoginResponse {
  @Field(() => AuthUser)
  @ApiProperty({ type: AuthUser, description: 'Authenticated user information' })
  user!: AuthUser;

  @Field()
  @ApiProperty({ description: 'JWT access token for API authentication' })
  accessToken!: string;

  @Field()
  @ApiProperty({ description: 'JWT refresh token for token renewal' })
  refreshToken!: string;

  @Field()
  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn!: number;

  @Field()
  @ApiProperty({ description: 'Token type (always Bearer)' })
  tokenType!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Whether MFA is required for this login', required: false })
  requiresMfa?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Temporary MFA token for high-risk logins', required: false })
  mfaToken?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Risk assessment score (0-100)', required: false })
  riskScore?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Security recommendations', required: false })
  securityRecommendations?: string;
}

/**
 * Enhanced refresh token response
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
  @ApiProperty({ description: 'Access token expiration time in seconds' })
  expiresIn!: number;

  @Field()
  @ApiProperty({ description: 'Token type (always Bearer)' })
  tokenType!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Updated risk assessment score', required: false })
  riskScore?: number;
}

/**
 * MFA requirement check response
 */
@ObjectType()
export class MfaRequirementResponse {
  @Field()
  @ApiProperty({ description: 'Whether MFA is required for this user' })
  requiresMfa!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User ID if MFA is required (for flow continuation)', required: false })
  userId?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Available MFA methods', required: false })
  availableMethods?: string;
}

/**
 * Security status response
 */
@ObjectType()
export class SecurityStatusResponse {
  @Field()
  @ApiProperty({ description: 'Overall security level (low, medium, high)' })
  securityLevel!: string;

  @Field()
  @ApiProperty({ description: 'Current risk score (0-100)' })
  riskScore!: number;

  @Field()
  @ApiProperty({ description: 'Whether MFA is enabled' })
  mfaEnabled!: boolean;

  @Field()
  @ApiProperty({ description: 'Whether current device is trusted' })
  deviceTrusted!: boolean;

  @Field()
  @ApiProperty({ description: 'Whether current network is trusted' })
  networkTrusted!: boolean;

  @Field()
  @ApiProperty({ description: 'Number of active sessions' })
  activeSessions!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last security event timestamp', required: false })
  lastSecurityEvent?: Date;

  @Field(() => [String])
  @ApiProperty({ description: 'Security recommendations', type: [String] })
  recommendations!: string[];
}

/**
 * Risk score response
 */
@ObjectType()
export class RiskScoreResponse {
  @Field()
  @ApiProperty({ description: 'Risk score (0-100, lower is better)' })
  score!: number;

  @Field()
  @ApiProperty({ description: 'Risk level (low, medium, high, critical)' })
  level!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Risk factors contributing to score', type: [String] })
  factors!: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Recommended security actions', type: [String] })
  recommendations!: string[];

  @Field()
  @ApiProperty({ description: 'Assessment timestamp' })
  timestamp!: Date;
}

/**
 * Session information response
 */
@ObjectType()
export class SessionInfoResponse {
  @Field(() => ID)
  @ApiProperty({ description: 'Session identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Session creation timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Last activity timestamp' })
  lastAccessedAt!: Date;

  @Field()
  @ApiProperty({ description: 'Session expiration timestamp' })
  expiresAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'IP address of session', required: false })
  ipAddress?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User agent string', required: false })
  userAgent?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Device information', required: false })
  deviceInfo?: string;

  @Field()
  @ApiProperty({ description: 'Device trust score (0-100)' })
  trustScore!: number;

  @Field()
  @ApiProperty({ description: 'Current risk score (0-100)' })
  riskScore!: number;

  @Field()
  @ApiProperty({ description: 'Whether session is active' })
  isActive!: boolean;
}

/**
 * Device information response
 */
@ObjectType()
export class DeviceInfoResponse {
  @Field(() => ID)
  @ApiProperty({ description: 'Device fingerprint hash' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Device platform (Windows, macOS, etc.)' })
  platform!: string;

  @Field()
  @ApiProperty({ description: 'Browser information' })
  browser!: string;

  @Field()
  @ApiProperty({ description: 'Device trust score (0-100)' })
  trustScore!: number;

  @Field()
  @ApiProperty({ description: 'First seen timestamp' })
  firstSeen!: Date;

  @Field()
  @ApiProperty({ description: 'Last seen timestamp' })
  lastSeen!: Date;

  @Field()
  @ApiProperty({ description: 'Number of times seen' })
  seenCount!: number;

  @Field()
  @ApiProperty({ description: 'Whether device is currently trusted' })
  isTrusted!: boolean;
}