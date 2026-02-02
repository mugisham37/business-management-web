import { userRoleEnum, businessTierEnum } from '../../database/schema/enums';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  role: typeof userRoleEnum.enumValues[number];
  permissions: string[];
  sessionId: string;
  // Enhanced tier-based fields
  businessTier: typeof businessTierEnum.enumValues[number];
  featureFlags: string[];
  trialExpiresAt?: number; // Unix timestamp
  // Security context
  deviceFingerprint?: string;
  networkTrust?: number;
  riskScore?: number;
  lastAuthAt?: number;
  // Standard JWT fields
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;
  role: typeof userRoleEnum.enumValues[number];
  permissions: string[];
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  sessionId: string;
  lastLoginAt?: Date;
  // Enhanced tier-based fields
  businessTier: typeof businessTierEnum.enumValues[number];
  featureFlags: string[];
  trialExpiresAt?: Date;
  // Security context
  securityContext?: SecurityContext;
  // Additional fields used by services
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityContext {
  deviceFingerprint: string;
  deviceTrustScore: number;
  networkTrust: number;
  riskScore: number;
  lastRiskAssessment: Date;
  requiresMfa: boolean;
  mfaVerified: boolean;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  sessionStartTime: Date;
  lastActivity: Date;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  isp?: string;
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
  canvas?: string;
  webgl?: string;
  fonts?: string[];
  plugins?: string[];
  touchSupport: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  colorDepth: number;
  pixelRatio: number;
  hash: string;
  trustScore: number;
  firstSeen: Date;
  lastSeen: Date;
  seenCount: number;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    location: RiskFactor;
    device: RiskFactor;
    behavior: RiskFactor;
    network: RiskFactor;
    time: RiskFactor;
  };
  recommendations: string[];
  requiredActions: string[];
  timestamp: Date;
}

export interface RiskFactor {
  score: number; // 0-100
  weight: number; // 0-1
  details: Record<string, any>;
  enabled: boolean;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  requiresMfa?: boolean;
  mfaToken?: string;
  riskAssessment?: RiskAssessment;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  riskAssessment?: RiskAssessment;
}

export interface SessionInfo {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  deviceFingerprint?: string;
  location?: GeoLocation;
  expiresAt: Date;
  lastAccessedAt: Date;
  isRevoked: boolean;
  revokedReason?: string;
  trustScore: number;
  riskScore: number;
  mfaVerified: boolean;
  networkTrust: number;
}

export interface PasswordResetInfo {
  token: string;
  expiresAt: Date;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  bcryptRounds: number;
  maxFailedAttempts: number;
  lockoutDuration: number;
  passwordResetExpiration: number;
  // Enhanced security settings
  deviceTrustThreshold: number;
  riskScoreThreshold: number;
  mfaGracePeriod: number;
  sessionExtendOnActivity: boolean;
  requireReauthHours: number;
}

export interface AuthenticationResult {
  success: boolean;
  user?: AuthenticatedUser;
  requiresMfa?: boolean;
  mfaToken?: string;
  riskAssessment?: RiskAssessment;
  securityActions?: string[];
  error?: string;
  lockoutUntil?: Date;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredTier?: string;
  missingFeatures?: string[];
  missingPermissions?: string[];
  upgradeRequired?: boolean;
  securityRequirements?: string[];
  riskLevel?: string;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: GeoLocation;
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  HIGH_RISK_LOGIN = 'high_risk_login',
  MFA_BYPASS_ATTEMPT = 'mfa_bypass_attempt',
  PERMISSION_ESCALATION = 'permission_escalation',
  UNUSUAL_LOCATION = 'unusual_location',
  DEVICE_CHANGE = 'device_change',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',
  SESSION_HIJACK_ATTEMPT = 'session_hijack_attempt',
  POLICY_VIOLATION = 'policy_violation',
  DATA_EXFILTRATION = 'data_exfiltration',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'sox' | 'hipaa' | 'custom';
  tenantId: string;
  generatedBy: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  findings: ComplianceFinding[];
  summary: {
    totalEvents: number;
    violations: number;
    riskLevel: string;
    complianceScore: number;
  };
  recommendations: string[];
}

export interface ComplianceFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: Record<string, any>;
  recommendation: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
}

export interface ThreatDetectionResult {
  threatDetected: boolean;
  threatType?: string;
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  recommendedActions: string[];
  metadata: Record<string, any>;
  timestamp: Date;
}

// Token generation response
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// Additional security event type strings for runtime use
export type SecurityEventTypeString = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'mfa_verified'
  | 'session_created'
  | 'session_expired'
  | 'session_revoked'
  | 'device_registered'
  | 'device_trusted'
  | 'suspicious_activity'
  | 'account_locked'
  | 'account_unlocked'
  | 'permission_granted'
  | 'permission_revoked'
  | 'data_export'
  | 'data_deletion'
  | 'security_scan'
  | 'threat_detected';

export type SecurityEventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEventInput {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// OAuth login context
export interface OAuthLoginContext {
  provider: 'google' | 'facebook' | 'github';
  code: string;
  state?: string;
  redirectUri: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}