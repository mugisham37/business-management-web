/**
 * Generated GraphQL Types
 * 
 * This file contains TypeScript types generated from the GraphQL schema.
 * These types should be generated automatically using GraphQL Code Generator.
 * 
 * For now, we're providing the essential types manually to resolve import errors.
 * Run `npm run codegen` to generate the complete types from the schema.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER',
}

export enum BusinessTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum AuthEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SOCIAL_PROVIDER_LINKED = 'SOCIAL_PROVIDER_LINKED',
  SOCIAL_PROVIDER_UNLINKED = 'SOCIAL_PROVIDER_UNLINKED',
}

// Core Types
export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  businessName?: string;
  businessTier: BusinessTier;
  featureFlags: string[];
  trialExpiresAt?: Date;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  requiresMfa?: boolean;
  mfaToken?: string;
  riskScore?: number;
  securityRecommendations?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  riskScore?: number;
}

// Input Types
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginWithMfaInput {
  email: string;
  password: string;
  mfaToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  phone?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface OAuthLoginInput {
  provider: string;
  code: string;
  state?: string;
  tenantId: string;
}

// MFA Types
export interface MfaStatusResponse {
  isEnabled: boolean;
  enabled: boolean; // Alias for isEnabled
  hasBackupCodes: boolean;
  backupCodesCount: number;
  hasSecret: boolean;
  lastUsedAt?: Date;
  setupAt?: Date;
  methods: string[];
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  setupToken: string;
}

export interface EnableMfaInput {
  token: string;
  setupToken: string;
}

export interface DisableMfaInput {
  token?: string;
  backupCode?: string;
  password: string;
}

export interface VerifyMfaTokenInput {
  token: string;
  mfaToken?: string;
}

export interface GenerateBackupCodesInput {
  token: string;
}

// Security Types
export interface RiskScoreResponse {
  score: number;
  level: string;
  factors: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface SecurityStatusResponse {
  securityLevel: string;
  riskScore: number;
  mfaEnabled: boolean;
  deviceTrusted: boolean;
  networkTrusted: boolean;
  activeSessions: number;
  lastSecurityEvent?: Date;
  recommendations: string[];
}

export interface LogSecurityEventInput {
  type: string;
  description: string;
  metadata?: Record<string, any>;
}

// Permission Types
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
  isSystem: boolean;
}

export interface UserPermissions {
  userId: string;
  permissions: string[];
  roles: string[];
  effectivePermissions: string[];
  lastUpdated: Date;
}

export interface AvailablePermissionsResponse {
  permissions: Permission[];
  categories: string[];
  resources: string[];
  totalCount: number;
}

export interface CheckPermissionInput {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
}

export interface GrantPermissionInput {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
}

export interface RevokePermissionInput {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
}

export interface AssignRoleInput {
  userId: string;
  roleName: string;
}

export interface BulkPermissionInput {
  userIds: string[];
  permissions: string[];
}

// Social Auth Types
export interface SocialProvider {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  linkedAt: Date;
  lastUsedAt?: Date;
  isVerified: boolean;
}

export interface LinkSocialProviderInput {
  provider: string;
  code: string;
  state?: string;
}

// Tier Types
export interface TierInfo {
  tier: BusinessTier;
  displayName: string;
  description: string;
  features: string[];
  limits: Record<string, number>;
  pricing?: Record<string, any>;
  isActive: boolean;
  trialExpiresAt?: Date;
  subscriptionExpiresAt?: Date;
}

export interface FeatureAccess {
  feature: string;
  hasAccess: boolean;
  reason?: string;
  requiredTier?: BusinessTier;
  usageCount?: number;
  usageLimit?: number;
  resetDate?: Date;
}

export interface TierUsage {
  feature: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  resetDate?: Date;
  isOverLimit: boolean;
}

// Event Types
export interface AuthEvent {
  type: AuthEventType;
  timestamp: Date;
  metadata?: Record<string, any>;
  user?: AuthUser;
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
}

// Response Types
export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Utility Types
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

// Apollo Client Types (for hooks)
export interface QueryResult<TData = any> {
  data?: TData;
  loading: boolean;
  error?: any;
  refetch: () => Promise<any>;
}

export interface MutationResult<TData = any> {
  data?: TData;
  loading: boolean;
  error?: any;
}

export interface SubscriptionResult<TData = any> {
  data?: TData;
  loading: boolean;
  error?: any;
}