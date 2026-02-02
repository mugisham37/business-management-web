/**
 * Enterprise Authentication & Authorization Module
 * 
 * This module provides a comprehensive, enterprise-grade authentication and authorization system
 * built on modern security principles including zero-trust architecture, DNV-style rigor,
 * and defense-in-depth strategies.
 * 
 * 🔐 AUTHENTICATION CAPABILITIES:
 * - Multi-factor authentication (TOTP, backup codes, WebAuthn)
 * - Social authentication (Google, Facebook, GitHub)
 * - JWT-based authentication with refresh token rotation
 * - Passwordless authentication with magic links
 * - Risk-based authentication with behavioral analysis
 * - Device fingerprinting and trust scoring
 * 
 * 🛡️ AUTHORIZATION FEATURES:
 * - Role-based access control (RBAC) with hierarchical roles
 * - Permission-based access control with wildcard support
 * - Attribute-based access control (ABAC) with dynamic policies
 * - Tier-based feature access control
 * - Time-based and location-based access restrictions
 * - Resource-level permissions with delegation
 * 
 * 🏢 ENTERPRISE SECURITY:
 * - Multi-tenant architecture with proper isolation
 * - Session management with concurrent session control
 * - Account lockout and brute force protection
 * - Comprehensive audit logging and compliance reporting
 * - Real-time security event monitoring
 * - Just-in-time privilege escalation
 * 
 * 📊 INTEGRATION & PERFORMANCE:
 * - GraphQL-first API with real-time subscriptions
 * - Event-driven architecture with proper event emission
 * - Caching integration for performance optimization
 * - Seamless integration with existing infrastructure
 * - Horizontal scaling support with stateless design
 */

// Core Module
export { AuthModule } from './auth.module';

// Services
export { AuthService } from './services/auth.service';
export { SocialAuthService } from './services/social-auth.service';
export { TierAuthorizationService } from './services/tier-authorization.service';
export { PermissionsService } from './services/permissions.service';
export { MfaService } from './services/mfa.service';
export { AuthEventsService } from './services/auth-events.service';
export { SecurityService } from './services/security.service';
export { SessionService } from './services/session.service';
export { RiskAssessmentService } from './services/risk-assessment.service';

// GraphQL Resolvers
export { AuthResolver } from './resolvers/auth.resolver';
export { SocialAuthResolver } from './resolvers/social-auth.resolver';
export { MfaResolver } from './resolvers/mfa.resolver';
export { PermissionsResolver } from './resolvers/permissions.resolver';
export { AuthSubscriptionsResolver } from './resolvers/auth-subscriptions.resolver';
export { SecurityResolver } from './resolvers/security.resolver';

// Controllers
export { SocialAuthController } from './controllers/social-auth.controller';

// Guards
export {
  JwtAuthGuard,
  GraphQLJwtAuthGuard,
  LocalAuthGuard,
  TierAuthGuard,
  PermissionsGuard,
  RolesGuard,
  AdvancedAuthGuard,
  RiskBasedAuthGuard,
} from './guards';

// Decorators
export {
  CurrentUser,
  Permission,
  Permissions,
  Roles,
  RequirePermission,
  RequirePermissions,
  ResourceAuth,
  TenantScoped,
  AdminOnly,
  ManagerOrAbove,
  SelfOrAdmin,
  ConditionalAuth,
  RateLimitedAuth,
  MfaRequired,
  TimeBasedAuth,
  IpRestrictedAuth,
  AuditLoggedAuth,
  FeatureFlagAuth,
  HierarchicalAuth,
  RiskBasedAuth,
  DeviceTrustAuth,
  NetworkBasedAuth,
} from './decorators';

// Tier-based Authorization Decorators
export {
  RequireTier,
  RequireFeature,
  RequireTierAndFeatures,
  RequireSmallTier,
  RequireMediumTier,
  RequireEnterpriseTier,
  RequireAdvancedReporting,
  RequireMultiLocation,
  RequireAPIAccess,
  RequireCustomFields,
  RequireAdvancedAnalytics,
  RequireIntegrations,
} from './decorators/tier-auth.decorator';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';
export { LocalStrategy } from './strategies/local.strategy';
export { GoogleStrategy } from './strategies/google.strategy';
export { FacebookStrategy } from './strategies/facebook.strategy';
export { GitHubStrategy } from './strategies/github.strategy';

// Types & Interfaces
export {
  JwtPayload,
  AuthenticatedUser,
  LoginResponse,
  RefreshTokenResponse,
  SessionInfo,
  AuthConfig,
  SecurityContext,
  RiskAssessment,
  DeviceFingerprint,
} from './interfaces/auth.interface';

export {
  AuthUser,
  LoginResponse as LoginResponseType,
  RefreshTokenResponse as RefreshTokenResponseType,
  MfaRequirementResponse,
  SecurityStatusResponse,
  RiskScoreResponse,
} from './types/auth.types';

export {
  MfaSetupResponse,
  MfaStatusResponse,
  WebAuthnSetupResponse,
  WebAuthnVerificationResponse,
} from './types/mfa.types';

export {
  Permission as PermissionType,
  Role,
  UserPermissionsResponse,
  PermissionCheckResponse,
  BulkPermissionResponse,
  AvailablePermissionsResponse,
  PolicyEvaluationResponse,
} from './types/permissions.types';

export {
  SecurityEvent,
  AuditLogEntry,
  ComplianceReport,
  ThreatDetectionResult,
} from './types/security.types';

// Input Types
export {
  LoginInput,
  LoginWithMfaInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  OAuthLoginInput,
  WebAuthnLoginInput,
} from './inputs/auth.input';

export {
  SocialAuthInput,
  LinkSocialProviderInput,
  UnlinkSocialProviderInput,
} from './inputs/social-auth.input';

export {
  EnableMfaInput,
  DisableMfaInput,
  VerifyMfaTokenInput,
  GenerateBackupCodesInput,
  SetupWebAuthnInput,
  VerifyWebAuthnInput,
} from './inputs/mfa.input';

export {
  GrantPermissionInput,
  RevokePermissionInput,
  AssignRoleInput,
  CreateRoleInput,
  UpdateRolePermissionsInput,
  CheckPermissionInput,
  BulkPermissionInput,
  PermissionFilterInput,
  CreatePolicyInput,
  UpdatePolicyInput,
} from './inputs/permissions.input';

export {
  SecurityConfigInput,
  ThreatDetectionConfigInput,
  ComplianceReportInput,
} from './inputs/security.input';

// Utilities
export { AuthUtils } from './utils/auth.utils';
export { SecurityUtils } from './utils/security.utils';
export { PermissionUtils } from './utils/permission.utils';

// Configuration
export { default as authConfig } from './config/auth.config';

// Middleware
export { AuthSecurityMiddleware } from './middleware/auth-security.middleware';
export { RateLimitMiddleware } from './middleware/rate-limit.middleware';

// Event Types
export { 
  AuthEventType, 
  AuthEvent,
  SecurityEventType,
  SecurityEvent as SecurityEventClass,
} from './events/auth.events';

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic Authentication:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Query(() => String)
 * async protectedQuery(@CurrentUser() user: AuthenticatedUser) {
 *   return `Hello ${user.email}`;
 * }
 * ```
 * 
 * 2. Role-Based Authorization:
 * ```typescript
 * @AdminOnly(['users:manage'])
 * @Mutation(() => MutationResponse)
 * async deleteUser(@Args('userId') userId: string) {
 *   // Only admins with users:manage permission can access
 * }
 * ```
 * 
 * 3. Tier-Based Feature Access:
 * ```typescript
 * @RequireEnterpriseTier()
 * @RequireFeature(['advanced_analytics'])
 * @Query(() => AnalyticsReport)
 * async getAdvancedAnalytics() {
 *   // Requires enterprise tier and advanced analytics feature
 * }
 * ```
 * 
 * 4. Risk-Based Authentication:
 * ```typescript
 * @RiskBasedAuth({ maxRiskScore: 50 })
 * @MfaRequired(['sensitive:operation'])
 * @Mutation(() => MutationResponse)
 * async sensitiveOperation() {
 *   // Requires low risk score and MFA for sensitive operations
 * }
 * ```
 * 
 * 5. Time and Location-Based Access:
 * ```typescript
 * @TimeBasedAuth([9, 10, 11, 12, 13, 14, 15, 16, 17], 'America/New_York')
 * @NetworkBasedAuth(['office', 'vpn'])
 * @Query(() => FinancialReport)
 * async getFinancialReport() {
 *   // Only accessible during business hours from trusted networks
 * }
 * ```
 * 
 * 6. Real-time Security Monitoring:
 * ```typescript
 * subscription {
 *   securityEvents {
 *     type
 *     severity
 *     timestamp
 *     metadata
 *   }
 * }
 * ```
 * 
 * 7. Advanced Permission Management:
 * ```typescript
 * mutation {
 *   createPolicy(input: {
 *     name: "Financial Data Access"
 *     rules: [
 *       {
 *         effect: "allow"
 *         actions: ["read", "export"]
 *         resources: ["financial:*"]
 *         conditions: {
 *           timeRange: { start: "09:00", end: "17:00" }
 *           networkTrust: { min: 80 }
 *           mfaRequired: true
 *         }
 *       }
 *     ]
 *   }) {
 *     success
 *     policy { id name }
 *   }
 * }
 * ```
 */