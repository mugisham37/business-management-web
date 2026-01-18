/**
 * Auth Module - Comprehensive Authentication & Authorization System
 * 
 * This module provides a complete GraphQL-only authentication and authorization system
 * with advanced security features, real-time subscriptions, and comprehensive audit logging.
 * 
 * Features:
 * - JWT-based authentication with refresh tokens
 * - Role-based access control (RBAC) with 6 predefined roles
 * - Granular permission management with wildcard support
 * - Multi-factor authentication (TOTP + backup codes)
 * - Real-time auth event subscriptions via GraphQL
 * - Advanced authorization patterns (resource-based, time-based, IP-restricted, etc.)
 * - Session management with device tracking
 * - Account lockout and brute force protection
 * - Permission caching with automatic invalidation
 * - Bulk permission operations
 * - Comprehensive audit logging
 * - Security middleware with rate limiting
 * - Advanced auth decorators for complex scenarios
 */

// Core Module
export { AuthModule } from './auth.module';

// Services
export { AuthService } from './services/auth.service';
export { PermissionsService } from './services/permissions.service';
export { MfaService } from './services/mfa.service';
export { AuthEventsService } from './services/auth-events.service';

// Resolvers
export { AuthResolver } from './resolvers/auth.resolver';
export { MfaResolver } from './resolvers/mfa.resolver';
export { PermissionsResolver } from './resolvers/permissions.resolver';
export { AuthSubscriptionsResolver } from './resolvers/auth-subscriptions.resolver';

// Guards
export {
  JwtAuthGuard,
  GraphQLJwtAuthGuard,
  LocalAuthGuard,
  PermissionsGuard,
  RolesGuard,
  AdvancedAuthGuard,
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
} from './decorators';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';
export { LocalStrategy } from './strategies/local.strategy';

// Types & Interfaces
export {
  JwtPayload,
  AuthenticatedUser,
  LoginResponse,
  RefreshTokenResponse,
  SessionInfo,
  AuthConfig,
} from './interfaces/auth.interface';

export {
  AuthUser,
  LoginResponse as LoginResponseType,
  RefreshTokenResponse as RefreshTokenResponseType,
  MfaRequirementResponse,
} from './types/auth.types';

export {
  MfaSetupResponse,
  MfaStatusResponse,
} from './types/mfa.types';

export {
  Permission as PermissionType,
  Role,
  UserPermissionsResponse,
  PermissionCheckResponse,
  BulkPermissionResponse,
  AvailablePermissionsResponse,
} from './types/permissions.types';

// Inputs
export {
  LoginInput,
  LoginWithMfaInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './inputs/auth.input';

export {
  EnableMfaInput,
  DisableMfaInput,
  VerifyMfaTokenInput,
  GenerateBackupCodesInput,
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
} from './inputs/permissions.input';

// Utilities
export { AuthUtils } from './utils/auth.utils';

// Configuration
export { default as authConfig } from './config/auth.config';

// Middleware
export { AuthSecurityMiddleware } from './middleware/auth-security.middleware';

// Subscription Events
export { AuthEventType, AuthEvent } from './resolvers/auth-subscriptions.resolver';

/**
 * Usage Examples:
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
 * 3. Resource-Based Authorization:
 * ```typescript
 * @ResourceAuth('users', 'update', ['manager', 'admin'])
 * @Mutation(() => MutationResponse)
 * async updateUser(@Args('input') input: UpdateUserInput) {
 *   // Requires users:update permission and manager/admin role
 * }
 * ```
 * 
 * 4. Advanced Authorization:
 * ```typescript
 * @MfaRequired(['sensitive:operation'])
 * @TimeBasedAuth([9, 10, 11, 12, 13, 14, 15, 16, 17], 'America/New_York')
 * @Mutation(() => MutationResponse)
 * async sensitiveOperation() {
 *   // Requires MFA and only allowed during business hours
 * }
 * ```
 * 
 * 5. Real-time Subscriptions:
 * ```typescript
 * subscription {
 *   userAuthEvents {
 *     type
 *     timestamp
 *     metadata
 *   }
 * }
 * ```
 * 
 * 6. Permission Management:
 * ```typescript
 * mutation {
 *   grantPermission(input: {
 *     userId: "user-id"
 *     permission: "users:read"
 *     resource: "tenant"
 *     expiresAt: "2024-12-31T23:59:59Z"
 *   }) {
 *     success
 *     message
 *   }
 * }
 * ```
 */