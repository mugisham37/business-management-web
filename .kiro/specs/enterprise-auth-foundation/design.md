# Design Document: Enterprise Authentication & Authorization Foundation

## Overview

This design specifies an enterprise-grade authentication and authorization system built on NestJS with Fastify, PostgreSQL with Prisma ORM, Redis caching, and Passport.js authentication strategies. The system provides secure multi-tenant authentication, hierarchical user management with permission delegation, sophisticated permission evaluation with multi-layered caching, and comprehensive security features.

### Core Design Principles

1. **Security First**: All security decisions favor protection over convenience
2. **Multi-Tenant Isolation**: Complete data separation at every layer
3. **Performance Through Caching**: Multi-layered caching strategy for sub-10ms permission checks
4. **Hierarchical Delegation**: Users can only grant permissions they possess
5. **Audit Everything**: Comprehensive, immutable audit trail for compliance
6. **Fail Secure**: System defaults to deny access on errors

### Technology Stack

- **Backend Framework**: NestJS 10.x with Fastify adapter
- **Database**: PostgreSQL 15+ with Prisma ORM 5.x
- **Caching**: Redis 7+ with ioredis client
- **Authentication**: Passport.js with JWT, Local, and OAuth strategies
- **Password Hashing**: Argon2id via @node-rs/argon2
- **Token Management**: jsonwebtoken for JWT, uuid for token generation
- **MFA**: Speakeasy for TOTP, qrcode for QR generation
- **Rate Limiting**: @nestjs/throttler with Redis storage
- **Validation**: class-validator and class-transformer
- **Encryption**: Node.js crypto module with AES-256-GCM

## Architecture

### System Architecture

The system follows a modular, layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  (Guards, Interceptors, Rate Limiting, Request Validation)  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Users   │  │  Roles   │  │Permissions│   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Sessions │  │   MFA    │  │Locations │  │   Orgs   │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Logger  │  │  Cache   │  │ Security │  │  Audit   │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│         ┌──────────────┐         ┌──────────────┐          │
│         │  PostgreSQL  │         │    Redis     │          │
│         │   (Prisma)   │         │  (ioredis)   │          │
│         └──────────────┘         └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Module Dependencies


**Infrastructure Modules** (no dependencies on application modules):
- Logger Module: Structured logging with correlation IDs
- Cache Module: Multi-layered caching with Redis
- Security Module: Encryption, hashing, token generation
- Audit Module: Immutable audit logging
- Database Module: Prisma integration with tenant isolation

**Application Modules** (depend on infrastructure):
- Organizations Module: Tenant management
- Locations Module: Location management
- Departments Module: Department management
- Roles Module: Role CRUD and permission assignment
- Permissions Module: Permission evaluation engine
- Users Module: User CRUD, invitation, hierarchy
- Auth Module: Authentication strategies and token management
- Sessions Module: Session lifecycle management
- MFA Module: TOTP and backup code management

### Authentication Flow

**Primary Owner Registration Flow**:
```
User → POST /auth/register
  ↓
Validate input (email, password, org name)
  ↓
Check email uniqueness
  ↓
Hash password with Argon2id
  ↓
Create Organization (tenant)
  ↓
Create User with SUPER_ADMIN role
  ↓
Generate verification token
  ↓
Send verification email
  ↓
Return success response
```

**Team Member Invitation Flow**:
```
Creator → POST /users/invite
  ↓
Validate Creator permissions
  ↓
Validate delegation (Creator has all delegated permissions)
  ↓
Validate location access
  ↓
Generate invitation token (7-day expiry)
  ↓
Create invitation record
  ↓
Send invitation email with company code
  ↓
Return success response

Invitee → POST /auth/register/invitation
  ↓
Validate invitation token
  ↓
Hash password with Argon2id
  ↓
Create User with delegated permissions
  ↓
Create UserHierarchy record (link to Creator)
  ↓
Assign roles with scope
  ↓
Assign locations
  ↓
Mark email as verified
  ↓
Return success response
```

**Authentication Flow (Login)**:
```
User → POST /auth/login
  ↓
Identify user type (email vs company_code + username)
  ↓
Load user with organization context
  ↓
Verify password with Argon2id
  ↓
Check account status (active, not locked)
  ↓
Check MFA requirement
  ↓ (if MFA enabled)
Return temporary token requiring MFA
  ↓ (if MFA disabled or validated)
Load user permissions (with caching)
  ↓
Generate JWT with embedded permissions
  ↓
Generate refresh token
  ↓
Create session record
  ↓
Return tokens and user data
```

### Permission Evaluation Flow

```
Request → Guard extracts JWT
  ↓
Extract user_id, org_id, required_permission
  ↓
Check L1 cache (in-memory, 5min TTL)
  ↓ (miss)
Check L2 cache (Redis, 15min TTL)
  ↓ (miss)
Query database:
  1. Check direct permission grants (allow/deny)
  2. Check role-based permissions
  3. Check location scope
  4. Check department scope
  ↓
Store in L2 cache
  ↓
Store in L1 cache
  ↓
Return permission decision (allow/deny)
```

### Cache Invalidation Strategy

**Event-Driven Invalidation**:
- User permission changed → Invalidate user permission cache
- Role permission changed → Invalidate cache for all users with that role
- User role assigned/removed → Invalidate user permission cache
- User location changed → Invalidate user permission cache
- User status changed → Invalidate user permission cache

**Implementation**:
- Use Redis pub/sub for cache invalidation events
- Each application instance subscribes to invalidation channel
- On event, clear L1 cache entries
- Redis automatically handles L2 cache TTL

## Components and Interfaces

### 1. Auth Module

**Responsibilities**:
- User authentication (local, OAuth)
- Token generation and validation
- Password reset flow
- Email verification flow

**Key Services**:

```typescript
interface AuthService {
  // Registration
  registerPrimaryOwner(dto: RegisterDto): Promise<{ user: User; organization: Organization }>;
  registerTeamMember(token: string, dto: TeamMemberRegisterDto): Promise<User>;
  
  // Authentication
  validateUser(identifier: string, password: string, orgContext?: string): Promise<User | null>;
  login(user: User): Promise<{ accessToken: string; refreshToken: string; user: UserDto }>;
  loginWithMFA(tempToken: string, mfaCode: string): Promise<{ accessToken: string; refreshToken: string }>;
  
  // Token management
  generateTokens(user: User, permissions: Permission[]): Promise<{ accessToken: string; refreshToken: string }>;
  refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  validateToken(token: string): Promise<JwtPayload>;
  
  // Email verification
  sendVerificationEmail(userId: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  
  // Password reset
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}
```

**Passport Strategies**:

```typescript
// Local strategy for email/password
class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  async validate(email: string, password: string): Promise<User>;
}

// JWT strategy for protected routes
class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(payload: JwtPayload): Promise<User>;
}

// OAuth strategies
class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User>;
}

class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User>;
}
```

### 2. Users Module

**Responsibilities**:
- User CRUD operations
- Invitation system
- User hierarchy management
- User-location assignments
- User-department assignments

**Key Services**:

```typescript
interface UsersService {
  // User management
  create(dto: CreateUserDto, creatorId: string): Promise<User>;
  findById(id: string, orgId: string): Promise<User | null>;
  findByEmail(email: string, orgId?: string): Promise<User | null>;
  update(id: string, dto: UpdateUserDto, actorId: string): Promise<User>;
  delete(id: string, actorId: string): Promise<void>;
  
  // Status management
  suspend(id: string, actorId: string, reason: string): Promise<void>;
  reactivate(id: string, actorId: string): Promise<void>;
  deactivate(id: string, actorId: string): Promise<void>;
  lock(id: string, reason: string, durationMinutes: number): Promise<void>;
  unlock(id: string): Promise<void>;
  
  // Invitation system
  createInvitation(dto: InviteUserDto, creatorId: string): Promise<Invitation>;
  validateInvitation(token: string): Promise<Invitation>;
  acceptInvitation(token: string, dto: AcceptInvitationDto): Promise<User>;
  
  // Hierarchy
  getHierarchy(userId: string): Promise<UserHierarchy[]>;
  getCreatedUsers(creatorId: string): Promise<User[]>;
  
  // Location assignments
  assignLocations(userId: string, locationIds: string[], actorId: string): Promise<void>;
  removeLocation(userId: string, locationId: string, actorId: string): Promise<void>;
  
  // Department assignments
  assignDepartment(userId: string, departmentId: string, actorId: string): Promise<void>;
  removeDepartment(userId: string, actorId: string): Promise<void>;
}
```

### 3. Permissions Module

**Responsibilities**:
- Permission evaluation engine
- Permission caching
- Permission queries

**Key Services**:

```typescript
interface PermissionsService {
  // Permission evaluation
  hasPermission(userId: string, permission: string, context?: PermissionContext): Promise<boolean>;
  hasAnyPermission(userId: string, permissions: string[], context?: PermissionContext): Promise<boolean>;
  hasAllPermissions(userId: string, permissions: string[], context?: PermissionContext): Promise<boolean>;
  
  // Permission queries
  getUserPermissions(userId: string): Promise<Permission[]>;
  getUserPermissionsWithScope(userId: string): Promise<ScopedPermission[]>;
  
  // Direct permission grants
  grantPermission(userId: string, permission: string, actorId: string, scope?: PermissionScope): Promise<void>;
  denyPermission(userId: string, permission: string, actorId: string): Promise<void>;
  revokePermission(userId: string, permission: string, actorId: string): Promise<void>;
  
  // Delegation validation
  validateDelegation(creatorId: string, permissions: string[]): Promise<boolean>;
  canDelegate(creatorId: string, permission: string): Promise<boolean>;
  
  // Cache management
  invalidateUserCache(userId: string): Promise<void>;
  invalidateRoleCache(roleId: string): Promise<void>;
}

interface PermissionContext {
  organizationId: string;
  locationId?: string;
  departmentId?: string;
  resourceOwnerId?: string;
}

interface ScopedPermission {
  permission: string;
  scope: 'global' | 'location' | 'department';
  locationId?: string;
  departmentId?: string;
  source: 'direct' | 'role';
}
```

**Permission Evaluation Algorithm**:

```typescript
async function evaluatePermission(
  userId: string,
  permission: string,
  context: PermissionContext
): Promise<boolean> {
  // 1. Check cache (L1 → L2)
  const cached = await checkCache(userId, permission, context);
  if (cached !== null) return cached;
  
  // 2. Check direct permission grants/denials
  const directPermission = await getDirectPermission(userId, permission);
  if (directPermission === 'deny') return false;
  if (directPermission === 'allow') return true;
  
  // 3. Check role-based permissions
  const roles = await getUserRoles(userId, context);
  for (const role of roles) {
    if (await roleHasPermission(role, permission, context)) {
      await cacheResult(userId, permission, context, true);
      return true;
    }
  }
  
  // 4. Default deny
  await cacheResult(userId, permission, context, false);
  return false;
}
```

### 4. Roles Module

**Responsibilities**:
- Role CRUD operations
- Role-permission assignments
- User-role assignments with scope

**Key Services**:

```typescript
interface RolesService {
  // Role management
  create(dto: CreateRoleDto, creatorId: string): Promise<Role>;
  findById(id: string, orgId: string): Promise<Role | null>;
  update(id: string, dto: UpdateRoleDto, actorId: string): Promise<Role>;
  delete(id: string, actorId: string): Promise<void>;
  
  // Permission assignments
  assignPermissions(roleId: string, permissions: string[], actorId: string): Promise<void>;
  removePermission(roleId: string, permission: string, actorId: string): Promise<void>;
  
  // User-role assignments
  assignToUser(userId: string, roleId: string, scope: RoleScope, actorId: string): Promise<void>;
  removeFromUser(userId: string, roleId: string, actorId: string): Promise<void>;
  
  // Queries
  getRolePermissions(roleId: string): Promise<Permission[]>;
  getUserRoles(userId: string, context?: PermissionContext): Promise<Role[]>;
}

interface RoleScope {
  type: 'global' | 'location' | 'department';
  locationId?: string;
  departmentId?: string;
}
```

### 5. Sessions Module

**Responsibilities**:
- Session lifecycle management
- Session tracking and queries
- Session revocation

**Key Services**:

```typescript
interface SessionsService {
  // Session management
  create(userId: string, refreshToken: string, metadata: SessionMetadata): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByRefreshToken(token: string): Promise<Session | null>;
  findUserSessions(userId: string): Promise<Session[]>;
  
  // Session validation
  isValid(sessionId: string): Promise<boolean>;
  validateRefreshToken(token: string): Promise<Session>;
  
  // Session revocation
  revoke(sessionId: string): Promise<void>;
  revokeAllExcept(userId: string, currentSessionId: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
  
  // Token rotation
  rotateRefreshToken(oldToken: string): Promise<{ newToken: string; session: Session }>;
  
  // Cleanup
  cleanupExpired(): Promise<number>;
}

interface SessionMetadata {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  location?: string;
}
```

### 6. MFA Module

**Responsibilities**:
- TOTP setup and validation
- Backup code generation and validation
- MFA status management

**Key Services**:

```typescript
interface MFAService {
  // TOTP setup
  generateSecret(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  enableTOTP(userId: string, token: string): Promise<void>;
  disableTOTP(userId: string, password: string, token: string): Promise<void>;
  
  // TOTP validation
  validateTOTP(userId: string, token: string): Promise<boolean>;
  
  // Backup codes
  generateBackupCodes(userId: string): Promise<string[]>;
  validateBackupCode(userId: string, code: string): Promise<boolean>;
  getRemainingBackupCodes(userId: string): Promise<number>;
  
  // Status
  isMFAEnabled(userId: string): Promise<boolean>;
  getMFAStatus(userId: string): Promise<MFAStatus>;
}

interface MFAStatus {
  enabled: boolean;
  totpEnabled: boolean;
  backupCodesRemaining: number;
}
```

### 7. Organizations Module

**Responsibilities**:
- Organization CRUD
- Subscription management
- Organization limits enforcement

**Key Services**:

```typescript
interface OrganizationsService {
  // Organization management
  create(dto: CreateOrganizationDto): Promise<Organization>;
  findById(id: string): Promise<Organization | null>;
  findByCompanyCode(code: string): Promise<Organization | null>;
  update(id: string, dto: UpdateOrganizationDto): Promise<Organization>;
  
  // Limits enforcement
  canAddUser(orgId: string): Promise<boolean>;
  canAddLocation(orgId: string): Promise<boolean>;
  incrementUserCount(orgId: string): Promise<void>;
  decrementUserCount(orgId: string): Promise<void>;
  
  // Subscription
  updateSubscription(orgId: string, plan: string, status: string): Promise<void>;
  isSubscriptionActive(orgId: string): Promise<boolean>;
  
  // Onboarding
  completeOnboarding(orgId: string, data: OnboardingData): Promise<void>;
  getRecommendedPlans(data: OnboardingData): Promise<Plan[]>;
}
```

### 8. Infrastructure Modules

**Cache Module**:
```typescript
interface CacheService {
  // L1 + L2 caching
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  
  // Pub/sub for invalidation
  publish(channel: string, message: any): Promise<void>;
  subscribe(channel: string, handler: (message: any) => void): void;
}
```

**Security Module**:
```typescript
interface SecurityService {
  // Password hashing
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  validatePasswordStrength(password: string): ValidationResult;
  
  // Encryption
  encrypt(data: string): string;
  decrypt(encrypted: string): string;
  
  // Token generation
  generateToken(length?: number): string;
  generateSecureToken(): string;
}
```

**Audit Module**:
```typescript
interface AuditService {
  log(event: AuditEvent): Promise<void>;
  query(filters: AuditFilters): Promise<AuditEvent[]>;
}

interface AuditEvent {
  timestamp: Date;
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
```

**Logger Module**:
```typescript
interface LoggerService {
  log(message: string, context?: string, metadata?: any): void;
  error(message: string, trace?: string, context?: string, metadata?: any): void;
  warn(message: string, context?: string, metadata?: any): void;
  debug(message: string, context?: string, metadata?: any): void;
}
```

## Data Models

### Core Entities

**Organization (Tenant)**:
```typescript
model Organization {
  id: string (UUID, PK)
  companyCode: string (unique, 6-char alphanumeric)
  name: string
  email: string
  phone?: string
  address?: string
  
  // Subscription
  subscriptionPlan?: string
  subscriptionStatus: enum (trial, active, suspended, cancelled)
  trialEndsAt?: DateTime
  
  // Limits
  maxUsers: number (default: 10)
  maxLocations: number (default: 1)
  currentUserCount: number (default: 0)
  currentLocationCount: number (default: 0)
  
  // Onboarding
  onboardingCompleted: boolean (default: false)
  onboardingData?: JSON
  
  // Timestamps
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  users: User[]
  locations: Location[]
  departments: Department[]
  roles: Role[]
  auditLogs: AuditLog[]
}
```

**User**:
```typescript
model User {
  id: string (UUID, PK)
  organizationId: string (FK)
  
  // Identity
  email: string (unique within org)
  username?: string (unique within org)
  passwordHash: string
  
  // Profile
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  
  // Status
  status: enum (active, suspended, deactivated, locked)
  emailVerified: boolean (default: false)
  lockedUntil?: DateTime
  failedLoginAttempts: number (default: 0)
  lastLoginAt?: DateTime
  
  // MFA
  mfaEnabled: boolean (default: false)
  mfaSecret?: string (encrypted)
  
  // OAuth
  oauthProviders: OAuthProvider[]
  
  // Timestamps
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  organization: Organization
  createdBy?: User (self-reference)
  createdUsers: User[] (self-reference)
  hierarchy: UserHierarchy[]
  roles: UserRole[]
  permissions: UserPermission[]
  locations: UserLocation[]
  department?: Department
  sessions: Session[]
  mfaBackupCodes: MFABackupCode[]
  auditLogs: AuditLog[]
}
```

**Location**:
```typescript
model Location {
  id: string (UUID, PK)
  organizationId: string (FK)
  
  name: string
  code: string (unique within org)
  type: enum (headquarters, branch, warehouse, store)
  
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  
  phone?: string
  email?: string
  
  isActive: boolean (default: true)
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  organization: Organization
  users: UserLocation[]
  roles: UserRole[]
}
```

**Department**:
```typescript
model Department {
  id: string (UUID, PK)
  organizationId: string (FK)
  
  name: string
  code: string (unique within org)
  description?: string
  
  isActive: boolean (default: true)
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  organization: Organization
  users: User[]
  roles: UserRole[]
}
```

**Role**:
```typescript
model Role {
  id: string (UUID, PK)
  organizationId: string (FK)
  
  name: string
  code: string (unique within org)
  description?: string
  
  isSystem: boolean (default: false)
  isActive: boolean (default: true)
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  organization: Organization
  permissions: RolePermission[]
  users: UserRole[]
}
```

**Permission**:
```typescript
model Permission {
  id: string (UUID, PK)
  
  module: string (e.g., 'users', 'inventory', 'sales')
  action: string (e.g., 'create', 'read', 'update', 'delete')
  resource: string (e.g., 'user', 'product', 'order')
  code: string (unique, format: 'module:action:resource')
  
  description: string
  isSystem: boolean (default: true)
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  roles: RolePermission[]
  users: UserPermission[]
}
```

### Junction/Relationship Entities

**UserRole** (with scope):
```typescript
model UserRole {
  id: string (UUID, PK)
  userId: string (FK)
  roleId: string (FK)
  
  // Scope
  scopeType: enum (global, location, department)
  locationId?: string (FK, nullable)
  departmentId?: string (FK, nullable)
  
  assignedBy: string (FK to User)
  assignedAt: DateTime
  
  // Relations
  user: User
  role: Role
  location?: Location
  department?: Department
  assignedByUser: User
}
```

**UserPermission** (direct grants/denials):
```typescript
model UserPermission {
  id: string (UUID, PK)
  userId: string (FK)
  permissionId: string (FK)
  
  effect: enum (allow, deny)
  
  // Scope
  scopeType: enum (global, location, department)
  locationId?: string (FK, nullable)
  departmentId?: string (FK, nullable)
  
  grantedBy: string (FK to User)
  grantedAt: DateTime
  expiresAt?: DateTime
  
  // Relations
  user: User
  permission: Permission
  location?: Location
  department?: Department
  grantedByUser: User
}
```

**RolePermission**:
```typescript
model RolePermission {
  id: string (UUID, PK)
  roleId: string (FK)
  permissionId: string (FK)
  
  assignedBy: string (FK to User)
  assignedAt: DateTime
  
  // Relations
  role: Role
  permission: Permission
  assignedByUser: User
}
```

**UserLocation**:
```typescript
model UserLocation {
  id: string (UUID, PK)
  userId: string (FK)
  locationId: string (FK)
  
  isPrimary: boolean (default: false)
  
  assignedBy: string (FK to User)
  assignedAt: DateTime
  
  // Relations
  user: User
  location: Location
  assignedByUser: User
}
```

**UserHierarchy**:
```typescript
model UserHierarchy {
  id: string (UUID, PK)
  userId: string (FK)
  parentId: string (FK to User)
  
  depth: number (0 = direct report)
  
  createdAt: DateTime
  
  // Relations
  user: User
  parent: User
}
```

### Authentication Entities

**Session**:
```typescript
model Session {
  id: string (UUID, PK)
  userId: string (FK)
  
  refreshToken: string (unique, indexed)
  refreshTokenHash: string
  
  ipAddress: string
  userAgent: string
  deviceFingerprint?: string
  location?: string
  
  isRevoked: boolean (default: false)
  revokedAt?: DateTime
  revokedReason?: string
  
  expiresAt: DateTime
  lastActivityAt: DateTime
  
  createdAt: DateTime
  
  // Relations
  user: User
}
```

**Invitation**:
```typescript
model Invitation {
  id: string (UUID, PK)
  organizationId: string (FK)
  
  email: string
  token: string (unique, indexed)
  
  // Delegated access
  roles: JSON (array of {roleId, scope})
  permissions: JSON (array of {permissionId, effect, scope})
  locations: JSON (array of locationIds)
  departmentId?: string
  
  createdBy: string (FK to User)
  acceptedBy?: string (FK to User)
  
  status: enum (pending, accepted, expired, revoked)
  
  expiresAt: DateTime
  acceptedAt?: DateTime
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  organization: Organization
  creator: User
  acceptedUser?: User
}
```

**MFABackupCode**:
```typescript
model MFABackupCode {
  id: string (UUID, PK)
  userId: string (FK)
  
  codeHash: string
  
  isUsed: boolean (default: false)
  usedAt?: DateTime
  
  createdAt: DateTime
  
  // Relations
  user: User
}
```

**OAuthProvider**:
```typescript
model OAuthProvider {
  id: string (UUID, PK)
  userId: string (FK)
  
  provider: enum (google, microsoft)
  providerId: string (unique per provider)
  
  accessToken: string (encrypted)
  refreshToken?: string (encrypted)
  expiresAt?: DateTime
  
  profile: JSON
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  user: User
}
```

**PasswordHistory**:
```typescript
model PasswordHistory {
  id: string (UUID, PK)
  userId: string (FK)
  
  passwordHash: string
  
  createdAt: DateTime
  
  // Relations
  user: User
}
```

**PasswordResetToken**:
```typescript
model PasswordResetToken {
  id: string (UUID, PK)
  userId: string (FK)
  
  token: string (unique, indexed)
  
  isUsed: boolean (default: false)
  usedAt?: DateTime
  
  expiresAt: DateTime
  createdAt: DateTime
  
  // Relations
  user: User
}
```

**EmailVerificationToken**:
```typescript
model EmailVerificationToken {
  id: string (UUID, PK)
  userId: string (FK)
  
  token: string (unique, indexed)
  
  isUsed: boolean (default: false)
  usedAt?: DateTime
  
  expiresAt: DateTime
  createdAt: DateTime
  
  // Relations
  user: User
}
```

### Audit Entity

**AuditLog**:
```typescript
model AuditLog {
  id: string (UUID, PK)
  organizationId: string (FK)
  userId?: string (FK, nullable)
  
  action: string
  resource: string
  resourceId?: string
  
  outcome: enum (success, failure)
  
  beforeState?: JSON
  afterState?: JSON
  
  ipAddress?: string
  userAgent?: string
  
  metadata?: JSON
  
  createdAt: DateTime (indexed)
  
  // Relations
  organization: Organization
  user?: User
}
```

### Database Indexes

**Critical Indexes for Performance**:
```typescript
// User lookups
@@index([organizationId, email])
@@index([organizationId, username])
@@index([organizationId, status])

// Permission evaluation
@@index([userId, permissionId])
@@index([roleId, permissionId])
@@index([userId, roleId])

// Session management
@@index([refreshToken])
@@index([userId, isRevoked])
@@index([expiresAt])

// Audit queries
@@index([organizationId, createdAt])
@@index([userId, createdAt])
@@index([action, createdAt])

// Token lookups
@@index([token, expiresAt])

// Location/Department scoping
@@index([userId, locationId])
@@index([userId, departmentId])
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Registration and Account Creation Properties

**Property 1: Primary Owner Registration Creates Both Entities**
*For any* valid registration input (email, password, organization name), the registration process should create both an organization record and a user record with the correct relationship (user.organizationId === organization.id).
**Validates: Requirements 1.1**

**Property 2: Primary Owner Receives SUPER_ADMIN Role**
*For any* primary owner registration, the created user should be assigned the SUPER_ADMIN role with global scope.
**Validates: Requirements 1.2**

**Property 3: Password Strength Validation**
*For any* password that violates strength requirements (< 12 characters, missing uppercase, lowercase, number, or special character), the registration should be rejected with a descriptive error.
**Validates: Requirements 1.5**

**Property 4: Password Hashing with Argon2id**
*For any* stored password, it should be hashed using Argon2id and never stored in plaintext (the stored value should not equal the input password).
**Validates: Requirements 1.6**

**Property 5: New Accounts Start Unverified**
*For any* primary owner registration, the created user should have emailVerified=false.
**Validates: Requirements 1.7**

### Token Generation and Validation Properties

**Property 6: Token Uniqueness and Expiration**
*For any* generated token (verification, invitation, password reset), it should be unique across all tokens and have an expiration time set according to its type (verification: 24h, invitation: 7 days, password reset: 1h).
**Validates: Requirements 2.1, 4.2, 14.1**

**Property 7: Token Invalidation on New Request**
*For any* user requesting a new token of the same type, all previous unused tokens of that type should be invalidated (cannot be used after new token is generated).
**Validates: Requirements 2.5, 14.6**

**Property 8: Expired Token Rejection**
*For any* token with expiration time in the past, validation should fail and the token should not be usable.
**Validates: Requirements 2.3, 5.4 (edge cases)**

### Authentication Properties

**Property 9: Valid Credentials Produce Tokens**
*For any* user with valid credentials (correct email/password or company_code/username/password) and active status, authentication should succeed and return both access and refresh tokens.
**Validates: Requirements 3.1, 6.1**

**Property 10: Invalid Credentials Increment Counter**
*For any* authentication attempt with invalid credentials, the failed attempt counter should increment and authentication should be rejected.
**Validates: Requirements 3.2**

**Property 11: Session Creation on Authentication**
*For any* successful authentication, a session record should be created with device information (IP address, user agent, device fingerprint).
**Validates: Requirements 3.3, 11.1**

**Property 12: JWT Contains Required Claims**
*For any* generated JWT (access token), it should contain user ID, organization ID, roles, and permissions as claims.
**Validates: Requirements 3.4, 22.1**

**Property 13: MFA Enforcement**
*For any* user with mfaEnabled=true, authentication should not issue final tokens without valid MFA validation (TOTP or backup code).
**Validates: Requirements 3.6, 13.4**

**Property 14: Unverified Email Blocks Login**
*For any* user with emailVerified=false, authentication should be rejected with a verification prompt.
**Validates: Requirements 2.4**

**Property 15: Inactive Status Blocks Authentication**
*For any* user with status in (suspended, deactivated, locked), authentication should be rejected.
**Validates: Requirements 6.4, 21.1, 21.2, 12.4**

### Delegation and Hierarchy Properties

**Property 16: Delegation Validation**
*For any* invitation or permission assignment, the creator must possess all permissions being delegated, otherwise the operation should be rejected.
**Validates: Requirements 4.1, 4.4, 9.1, 9.2, 19.1**

**Property 17: Location-Scoped Delegation Validation**
*For any* invitation that includes location assignments, the creator must have access to all specified locations, otherwise the invitation should be rejected.
**Validates: Requirements 4.6**

**Property 18: Role-Based Delegation Validation**
*For any* invitation that includes role assignments, all permissions from those roles must be possessed by the creator, otherwise the invitation should be rejected.
**Validates: Requirements 4.7**

**Property 19: Hierarchy Recording**
*For any* team member created through invitation, a hierarchy record should be created linking the new user to their creator as parent.
**Validates: Requirements 4.5, 5.2, 24.1**

**Property 20: Hierarchy Chain Completeness**
*For any* user, querying their hierarchy should return the complete chain of parent relationships up to the Primary_Owner.
**Validates: Requirements 24.2**

### Permission Evaluation Properties

**Property 21: Direct Permission Denial Precedence**
*For any* user with a direct permission denial, permission evaluation should return false regardless of role-based permissions.
**Validates: Requirements 7.4**

**Property 22: Direct Permission Grant Precedence**
*For any* user with a direct permission grant (and no denial), permission evaluation should return true regardless of role-based permissions.
**Validates: Requirements 7.5**

**Property 23: Location-Scoped Permission Enforcement**
*For any* permission check with a location context, the user must have access to that location, otherwise permission should be denied.
**Validates: Requirements 7.6, 10.2**

**Property 24: Organization Boundary Enforcement**
*For any* permission check, the user's organization ID must match the resource's organization ID, otherwise permission should be denied.
**Validates: Requirements 7.7, 16.2**

**Property 25: Department-Scoped Permission Enforcement**
*For any* role assigned with department scope, permissions from that role should only apply when the context matches the department.
**Validates: Requirements 20.3**

### Cache Invalidation Properties

**Property 26: User Permission Change Invalidation**
*For any* change to a user's permissions (direct grants, role assignments, location assignments), all cached permission data for that user should be invalidated.
**Validates: Requirements 8.4**

**Property 27: Role Permission Change Invalidation**
*For any* change to a role's permissions, cached permission data for all users with that role should be invalidated.
**Validates: Requirements 8.5, 19.3**

### Multi-Location Access Properties

**Property 28: Location Assignment Recording**
*For any* location assignment to a user, a UserLocation record should be created.
**Validates: Requirements 10.1**

**Property 29: Primary Owner Automatic Location Access**
*For any* Primary_Owner, they should have access to all locations in their organization (both existing and newly created).
**Validates: Requirements 10.4, 10.5**

**Property 30: No Location Access Denies Operations**
*For any* user with zero location assignments (excluding Primary_Owner), all location-scoped operations should be denied.
**Validates: Requirements 10.3 (edge case)**

### Session Management Properties

**Property 31: Session Independence**
*For any* user with multiple active sessions, revoking one session should not affect other sessions.
**Validates: Requirements 11.2**

**Property 32: Session Revocation**
*For any* revoked session, subsequent attempts to use its refresh token should fail.
**Validates: Requirements 11.3**

**Property 33: Logout All Except Current**
*For any* "logout all devices" operation, all sessions except the current one should be revoked.
**Validates: Requirements 11.4**

**Property 34: Refresh Token Rotation**
*For any* successful refresh token use, a new refresh token should be issued and the old one should be invalidated.
**Validates: Requirements 11.6**

**Property 35: Session Expiration Enforcement**
*For any* session with expiresAt in the past, authentication using that session should fail.
**Validates: Requirements 11.7**

**Property 36: Token Expiration Configuration**
*For any* generated token pair, the access token should expire in 15 minutes and the refresh token should expire in 7 days.
**Validates: Requirements 22.2, 22.3**

### Rate Limiting and Security Properties

**Property 37: Rate Limit Enforcement**
*For any* request pattern that exceeds configured rate limits (per-IP, per-user, per-endpoint), subsequent requests should be rejected with HTTP 429.
**Validates: Requirements 12.1, 12.6, 12.7**

**Property 38: Progressive Delay Implementation**
*For any* user with 5+ failed authentication attempts, subsequent attempts should experience progressive delays (1s, 2s, 4s, 8s, 16s).
**Validates: Requirements 12.2**

**Property 39: Account Lockout After Threshold**
*For any* user with 10 failed authentication attempts, the account should be locked for 30 minutes.
**Validates: Requirements 12.3**

### MFA Properties

**Property 40: MFA Setup Generates Secret and Backup Codes**
*For any* MFA enablement, the system should generate a TOTP secret and exactly 10 backup codes.
**Validates: Requirements 13.1, 13.3**

**Property 41: MFA Activation Requires Validation**
*For any* MFA enablement attempt, the system should require validation of a TOTP code before setting mfaEnabled=true.
**Validates: Requirements 13.2**

**Property 42: Backup Code Single Use**
*For any* backup code used for authentication, that code should be marked as used and cannot be used again.
**Validates: Requirements 13.5**

**Property 43: MFA Disable Requires Authentication**
*For any* MFA disable attempt, the system should require both current password and a valid TOTP code.
**Validates: Requirements 13.7**

### Password Management Properties

**Property 44: Password Reset Token Validation**
*For any* password reset attempt, the token must be valid (not expired, not used) and the new password must meet strength requirements.
**Validates: Requirements 14.2**

**Property 45: Password Change Invalidates Sessions**
*For any* password change, all sessions except the current one should be invalidated.
**Validates: Requirements 14.3**

**Property 46: Password History Enforcement**
*For any* new password, it should differ from the last 5 passwords used by that user.
**Validates: Requirements 14.4**

### Audit Logging Properties

**Property 47: Security Event Logging Structure**
*For any* security event (authentication, permission change, user lifecycle), an audit log should be created with timestamp, user, organization, action, resource, and outcome.
**Validates: Requirements 15.1**

**Property 48: Authentication Event Logging**
*For any* authentication attempt (success or failure), an audit log should be created with IP address and device information.
**Validates: Requirements 15.2**

**Property 49: Permission Change Logging**
*For any* permission modification, an audit log should be created with before and after states.
**Validates: Requirements 15.3**

**Property 50: User Lifecycle Event Logging**
*For any* user creation, modification, or deletion, an audit log should be created with actor information.
**Validates: Requirements 15.4**

**Property 51: Audit Log Immutability**
*For any* audit log record, it should never be modified or deleted after creation (append-only).
**Validates: Requirements 15.5**

**Property 52: Sensitive Data Masking in Logs**
*For any* audit log containing sensitive data (passwords, tokens, secrets), that data should be masked or redacted.
**Validates: Requirements 15.7**

### Multi-Tenant Isolation Properties

**Property 53: Cross-Tenant Access Denial**
*For any* attempt to access a resource from a different organization, the request should be rejected with HTTP 403.
**Validates: Requirements 16.4**

**Property 54: JWT Organization Context Enforcement**
*For any* JWT validation, the organization ID claim should be extracted and enforced in all subsequent operations.
**Validates: Requirements 16.3**

**Property 55: Organization Initialization**
*For any* new organization creation, isolated data structures should be initialized (no shared data with other organizations).
**Validates: Requirements 16.5**

**Property 56: Organization Limit Enforcement**
*For any* organization with defined limits (maxUsers, maxLocations), creation operations should be rejected when limits are reached.
**Validates: Requirements 16.6**

### OAuth Properties

**Property 57: OAuth Account Linking**
*For any* successful OAuth authentication, the system should either create a new user or link to an existing user based on email.
**Validates: Requirements 17.3**

**Property 58: OAuth Token Encryption**
*For any* stored OAuth tokens (access token, refresh token), they should be encrypted using AES-256-GCM.
**Validates: Requirements 17.4, 23.2**

### Onboarding Properties

**Property 59: Onboarding Initiation for Primary Owners**
*For any* Primary_Owner who verifies their email, the onboarding flow should be initiated (onboardingCompleted=false).
**Validates: Requirements 18.1**

**Property 60: Plan Recommendation Based on Onboarding Data**
*For any* completed onboarding, the Plan_Recommender should analyze the collected data and return recommended plans.
**Validates: Requirements 18.5**

**Property 61: Onboarding Completion Marking**
*For any* completed onboarding flow, the organization should be marked as onboarded (onboardingCompleted=true).
**Validates: Requirements 18.6**

**Property 62: Team Members Skip Onboarding**
*For any* team member registration (via invitation), the onboarding flow should be skipped.
**Validates: Requirements 18.7**

### Role Management Properties

**Property 63: Role Assignment with Scope**
*For any* role assignment to a user, the scope (global, location, department) should be recorded correctly.
**Validates: Requirements 19.2**

**Property 64: Role Deletion Prevention**
*For any* role with active user assignments, deletion should be prevented.
**Validates: Requirements 19.4**

**Property 65: System Role Protection**
*For any* system-defined role (isSystem=true), modification and deletion operations should be rejected.
**Validates: Requirements 19.6**

### Department Management Properties

**Property 66: Department Organization Association**
*For any* created department, it should be associated with the correct organization.
**Validates: Requirements 20.1**

**Property 67: Department Assignment Recording**
*For any* user assigned to a department, the assignment should be recorded (user.departmentId should be set).
**Validates: Requirements 20.2**

**Property 68: Department Deletion Prevention**
*For any* department with assigned users, deletion should be prevented until all users are reassigned.
**Validates: Requirements 20.4**

### User Status Management Properties

**Property 69: Status Change Session Invalidation**
*For any* user status change to suspended or deactivated, all active sessions should be invalidated.
**Validates: Requirements 21.4**

**Property 70: Reactivation Restores Access**
*For any* suspended user who is reactivated, authentication should succeed (status changes to active).
**Validates: Requirements 21.5**

### Token Validation Properties

**Property 71: Token Validation Checks**
*For any* token validation, the system should verify signature, expiration, and organization context.
**Validates: Requirements 22.4**

**Property 72: Revoked Token Rejection**
*For any* refresh token that has been revoked (session.isRevoked=true), validation should fail.
**Validates: Requirements 22.5**

### Encryption Properties

**Property 73: Sensitive Data Encryption**
*For any* stored sensitive data (MFA secrets, OAuth tokens), it should be encrypted using AES-256-GCM.
**Validates: Requirements 23.1, 23.2**

**Property 74: Backup Code Hashing**
*For any* stored backup code, it should be hashed using Argon2id (not stored in plaintext).
**Validates: Requirements 23.3**

### Query and Filtering Properties

**Property 75: Creator Filtering**
*For any* user list query with creator filter, only users created by the specified creator should be returned.
**Validates: Requirements 24.4**

## Error Handling

### Error Categories

1. **Validation Errors** (HTTP 400)
   - Invalid input format
   - Missing required fields
   - Password strength violations
   - Email format violations

2. **Authentication Errors** (HTTP 401)
   - Invalid credentials
   - Expired tokens
   - Revoked sessions
   - Unverified email
   - MFA required

3. **Authorization Errors** (HTTP 403)
   - Insufficient permissions
   - Cross-tenant access attempts
   - Delegation validation failures
   - Location access violations

4. **Resource Errors** (HTTP 404)
   - User not found
   - Organization not found
   - Role not found
   - Session not found

5. **Conflict Errors** (HTTP 409)
   - Duplicate email
   - Duplicate username
   - Organization limit reached

6. **Rate Limit Errors** (HTTP 429)
   - Too many requests
   - Brute force protection triggered

7. **Server Errors** (HTTP 500)
   - Database errors
   - Cache errors
   - Encryption errors
   - External service failures

### Error Response Format

All errors should follow a consistent format:

```typescript
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: Record<string, any>;
}
```

### Error Handling Strategies

1. **Fail Secure**: Default to deny access on errors
2. **Graceful Degradation**: Cache failures fall back to database
3. **Detailed Logging**: All errors logged with context
4. **User-Friendly Messages**: No sensitive information in error messages
5. **Correlation IDs**: Track errors across services

### Critical Error Scenarios

**Database Connection Failure**:
- Return HTTP 503 Service Unavailable
- Log error with full context
- Retry with exponential backoff
- Alert operations team

**Cache Failure**:
- Fall back to database queries
- Log warning
- Continue operation (degraded performance)
- Monitor cache health

**Encryption/Decryption Failure**:
- Return HTTP 500 Internal Server Error
- Log error with correlation ID
- Do not expose encryption details
- Alert security team

**Token Validation Failure**:
- Return HTTP 401 Unauthorized
- Log attempt with IP and user agent
- Increment security metrics
- Check for attack patterns

**Delegation Validation Failure**:
- Return HTTP 403 Forbidden
- Log attempt with actor and target
- Provide clear error message
- Audit the attempt

## Testing Strategy

### Dual Testing Approach

This system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Specific authentication scenarios
- Integration points between modules
- Edge cases (empty inputs, boundary values)
- Error handling paths
- Mock external dependencies

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random valid inputs
- Test properties hold for all generated cases
- Minimum 100 iterations per property test
- Catch edge cases through randomization

Together, unit tests catch concrete bugs while property tests verify general correctness.

### Property-Based Testing Configuration

**Library Selection**: Use `@fast-check/jest` for TypeScript/NestJS

**Test Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `// Feature: enterprise-auth-foundation, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';

describe('Permission Evaluation Properties', () => {
  // Feature: enterprise-auth-foundation, Property 21: Direct Permission Denial Precedence
  it('should deny access when user has direct permission denial regardless of roles', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          permission: fc.string(),
          hasDirectDenial: fc.constant(true),
          hasRoleGrant: fc.boolean(),
        }),
        async ({ userId, permission, hasDirectDenial, hasRoleGrant }) => {
          // Setup: Create user with direct denial and optionally role grant
          // Act: Evaluate permission
          // Assert: Should return false
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Requirements

**Unit Test Coverage**:
- Minimum 80% code coverage
- 100% coverage of error handling paths
- All edge cases documented in requirements

**Property Test Coverage**:
- One property test per correctness property (75 properties)
- Each property test runs minimum 100 iterations
- All testable acceptance criteria covered

### Testing Layers

**1. Unit Tests** (Jest):
- Service layer logic
- Utility functions
- Validation logic
- Error handling
- Mock external dependencies

**2. Property-Based Tests** (@fast-check/jest):
- Permission evaluation properties
- Delegation validation properties
- Token generation properties
- Cache invalidation properties
- Multi-tenant isolation properties

**3. Integration Tests** (Jest + Test Database):
- Database operations
- Cache operations
- Multi-module workflows
- Transaction handling

**4. E2E Tests** (Supertest):
- Complete authentication flows
- Complete invitation flows
- API endpoint validation
- Error response validation

### Test Data Generation

**Generators for Property Tests**:

```typescript
// User generator
const userArbitrary = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  organizationId: fc.uuid(),
  status: fc.constantFrom('active', 'suspended', 'deactivated', 'locked'),
  emailVerified: fc.boolean(),
  mfaEnabled: fc.boolean(),
});

// Permission generator
const permissionArbitrary = fc.record({
  module: fc.constantFrom('users', 'roles', 'locations'),
  action: fc.constantFrom('create', 'read', 'update', 'delete'),
  resource: fc.string(),
});

// Organization generator
const organizationArbitrary = fc.record({
  id: fc.uuid(),
  companyCode: fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), { minLength: 6, maxLength: 6 }),
  maxUsers: fc.integer({ min: 1, max: 1000 }),
  currentUserCount: fc.integer({ min: 0, max: 1000 }),
});
```

### Mocking Strategy

**External Services to Mock**:
- Email service (SMTP)
- OAuth providers (Google, Microsoft)
- Redis (for unit tests, use real Redis for integration tests)
- Time-dependent functions (for testing expiration)

**Mock Implementation**:
```typescript
// Email service mock
const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
};

// OAuth provider mock
const mockOAuthProvider = {
  exchangeCodeForTokens: jest.fn().mockResolvedValue({
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    expiresIn: 3600,
  }),
};
```

### Performance Testing

While not part of unit/property tests, performance requirements should be validated:

**Load Testing** (Artillery or k6):
- Authentication endpoint: 200ms p95
- Permission check (cached): 5ms p95
- Permission check (uncached): 50ms p95
- Token refresh: 100ms p95

**Stress Testing**:
- Concurrent authentication attempts
- Cache invalidation under load
- Database connection pool limits
- Rate limiter effectiveness

### Security Testing

**Automated Security Tests**:
- SQL injection attempts (parameterized queries)
- XSS attempts (input validation)
- CSRF protection (token validation)
- Brute force protection (rate limiting)
- Session fixation (token rotation)

**Manual Security Review**:
- Code review for security vulnerabilities
- Dependency vulnerability scanning
- Penetration testing
- Security audit of encryption implementation

### Continuous Integration

**CI Pipeline**:
1. Lint and format check
2. Unit tests (with coverage report)
3. Property-based tests
4. Integration tests
5. E2E tests
6. Security scanning
7. Build and package

**Quality Gates**:
- All tests must pass
- Code coverage ≥ 80%
- No high-severity security vulnerabilities
- No linting errors

