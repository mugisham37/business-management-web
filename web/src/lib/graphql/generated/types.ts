/**
 * Generated GraphQL Types
 * 
 * This file contains all TypeScript types generated from the GraphQL schema.
 * These types ensure type safety across the entire application.
 */

// Enums
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
  READONLY = 'readonly',
}

export enum BusinessTier {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum AuthEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTERED = 'USER_REGISTERED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SOCIAL_PROVIDER_LINKED = 'SOCIAL_PROVIDER_LINKED',
  SOCIAL_PROVIDER_UNLINKED = 'SOCIAL_PROVIDER_UNLINKED',
  SECURITY_ALERT = 'SECURITY_ALERT',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
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

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface OAuthLoginInput {
  provider: string;
  code: string;
  state?: string;
  tenantId: string;
}

export interface EnableMfaInput {
  token: string;
}

export interface DisableMfaInput {
  token?: string;
  backupCode?: string;
}

export interface VerifyMfaTokenInput {
  token: string;
}

export interface GenerateBackupCodesInput {
  token: string;
}

export interface SocialAuthInput {
  provider: string;
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  tenantId?: string;
}

export interface LinkSocialProviderInput {
  provider: string;
  providerId: string;
  email: string;
}

export interface UnlinkSocialProviderInput {
  provider: string;
}

export interface GrantPermissionInput {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  expiresAt?: string;
}

export interface RevokePermissionInput {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
}

export interface AssignRoleInput {
  userId: string;
  role: string;
}

export interface CheckPermissionInput {
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
}

export interface BulkPermissionInput {
  userIds: string[];
  permissions: string[];
  resource?: string;
  expiresAt?: string;
}

// Response Types
export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  lastLoginAt?: Date;
  businessTier: string;
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

export interface MfaRequirementResponse {
  requiresMfa: boolean;
  userId?: string;
  availableMethods?: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface MfaStatusResponse {
  enabled: boolean;
  backupCodesCount: number;
  hasSecret: boolean;
}

export interface SocialProvider {
  provider: string;
  providerId: string;
  email: string;
  connectedAt: Date;
  lastUsedAt?: Date;
}

export interface SocialAuthResponse {
  success: boolean;
  message: string;
  connectedProviders: SocialProvider[];
}

export interface SocialAuthUrlResponse {
  authUrl: string;
  state: string;
  provider?: string;
  tenantId?: string;
}

export interface Permission {
  id: string;
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  grantedBy?: string;
  grantedAt: Date;
  expiresAt?: Date;
  isInherited: boolean;
}

export interface Role {
  name: string;
  permissions: string[];
}

export interface UserPermissionsResponse {
  permissions: string[];
  role: string;
  detailedPermissions: Permission[];
  includesInherited: boolean;
}

export interface PermissionCheckResponse {
  hasPermission: boolean;
  source?: string;
  expiresAt?: Date;
}

export interface BulkPermissionResponse {
  affectedUsers: number;
  processedPermissions: number;
  failedUsers: string[];
  errors: string[];
}

export interface AvailablePermissionsResponse {
  permissions: string[];
  resources: string[];
  actions: string[];
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

export interface RiskScoreResponse {
  score: number;
  level: string;
  factors: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface SessionInfoResponse {
  id: string;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  trustScore: number;
  riskScore: number;
  isActive: boolean;
}

export interface DeviceInfoResponse {
  id: string;
  platform: string;
  browser: string;
  trustScore: number;
  firstSeen: Date;
  lastSeen: Date;
  seenCount: number;
  isTrusted: boolean;
}

export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  severity?: string;
}

export interface MutationResponse {
  success: boolean;
  message: string;
  errors?: Array<{
    message: string;
    timestamp: Date;
  }>;
}

// Utility Types
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

// GraphQL Operation Types
export interface Query {
  me?: Maybe<AuthUser>;
  requiresMfa: MfaRequirementResponse;
  validateSession: boolean;
  getSecurityStatus: string;
  mfaStatus: MfaStatusResponse;
  isMfaEnabled: boolean;
  getSocialAuthUrl: SocialAuthUrlResponse;
  getConnectedSocialProviders: SocialProvider[];
  isSocialProviderAvailable: boolean;
  getSupportedSocialProviders: string[];
  getPermissions: string[];
  myPermissions: string[];
  getRoles: Role[];
  getRolePermissions: string[];
  hasPermission: boolean;
  getAllPermissions: string[];
  getDetailedPermissions: UserPermissionsResponse;
  checkPermission: PermissionCheckResponse;
  getAvailablePermissions: AvailablePermissionsResponse;
  myRiskScore: number;
  mySecurityStatus: string;
  mySecurityRecommendations: string[];
  isDeviceTrusted: boolean;
  tenantSecurityMetrics: string;
  basicFeature: string;
  premiumFeature: string;
  enterpriseFeature: string;
  standardFeature: string;
  myTierInfo: string;
  getUpgradeOptions: string;
  testFeatureFlag: string;
}

export interface Mutation {
  login: LoginResponse;
  loginWithMfa: LoginResponse;
  oauthLogin: LoginResponse;
  register: LoginResponse;
  logout: MutationResponse;
  logoutAllSessions: MutationResponse;
  refreshToken: RefreshTokenResponse;
  changePassword: MutationResponse;
  forgotPassword: MutationResponse;
  resetPassword: MutationResponse;
  generateMfaSetup: MfaSetupResponse;
  enableMfa: MutationResponse;
  disableMfa: MutationResponse;
  verifyMfaToken: MutationResponse;
  generateBackupCodes: string[];
  linkSocialProvider: SocialAuthResponse;
  unlinkSocialProvider: SocialAuthResponse;
  grantPermission: MutationResponse;
  revokePermission: MutationResponse;
  assignRole: MutationResponse;
  bulkGrantPermissions: BulkPermissionResponse;
  bulkRevokePermissions: BulkPermissionResponse;
  logSecurityEvent: MutationResponse;
  simulateTierUpgrade: string;
}

export interface Subscription {
  userAuthEvents: AuthEvent;
  userPermissionEvents: AuthEvent;
  tenantAuthEvents: AuthEvent;
  securityAlerts: AuthEvent;
  userMfaEvents: AuthEvent;
  userSessionEvents: AuthEvent;
  tenantRoleEvents: AuthEvent;
  userSocialProviderEvents: AuthEvent;
  userRiskEvents: AuthEvent;
  userEvents: AuthEvent;
  allTenantAuthEvents: AuthEvent;
}