# Backend Server API Documentation

## Overview

This is a comprehensive multi-tenant authentication and authorization system built with NestJS, Prisma, PostgreSQL, Redis, and GraphQL. The backend provides enterprise-grade security features including JWT authentication, OAuth2 integration, multi-factor authentication, role-based access control, hierarchical user management, and complete audit logging.

## Technology Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL 14+ with Prisma ORM 7.x
- **Cache & Sessions**: Redis 6+ with ioredis
- **API**: GraphQL with Apollo Server 5.x
- **Authentication**: Passport.js with JWT and Google OAuth2
- **Security**: Helmet, bcrypt (12 rounds), rate limiting, CORS
- **Logging**: Winston with structured logging
- **Testing**: Jest with property-based testing (fast-check)

## Architecture

### Multi-Tenant Design
- Complete data isolation per organization
- Tenant context middleware for automatic filtering
- Organization-scoped user management
- Hierarchical permission inheritance

### Security Features
- JWT access tokens (15 minutes expiration)
- Refresh token rotation with family tracking
- Token reuse detection and automatic revocation
- Rate limiting (5 attempts per 15 minutes for auth)
- Account locking after failed attempts
- Password complexity requirements
- Password history tracking (last 5 passwords)
- MFA with TOTP and backup codes
- Session management with Redis
- Suspicious login detection
- Comprehensive audit logging


## Data Models

### Organization
Represents a tenant in the multi-tenant system.

**Fields:**
- `id` (UUID): Unique organization identifier
- `businessName` (String, required): Organization name
- `businessType` (String): Type of business
- `employeeCount` (String): Number of employees
- `industry` (String): Industry sector
- `country` (String): Country location
- `selectedModules` (String[]): Enabled feature modules
- `primaryGoal` (String): Business objective
- `cloudProvider` (String): Cloud infrastructure provider
- `region` (String): Deployment region
- `storageVolume` (Int): Storage capacity
- `compression` (Boolean): Data compression enabled
- `activeHours` (Int): Active hours per day
- `integrations` (String[]): Third-party integrations
- `selectedPlan` (String): Subscription plan
- `billingCycle` (String): Billing frequency
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### User
Represents users within an organization with hierarchical roles.

**Fields:**
- `id` (UUID): Unique user identifier
- `organizationId` (UUID): Organization reference
- `email` (String, unique per org): User email
- `passwordHash` (String): Bcrypt hashed password
- `firstName` (String, required): First name
- `lastName` (String, required): Last name
- `phone` (String): Phone number
- `role` (Enum): OWNER | MANAGER | WORKER
- `googleId` (String, unique): Google OAuth identifier
- `emailVerified` (Boolean): Email verification status
- `mfaEnabled` (Boolean): MFA enrollment status
- `mfaSecret` (String): TOTP secret key
- `backupCodes` (String[]): Hashed backup codes
- `passwordHistory` (String[]): Last 5 password hashes
- `accountLocked` (Boolean): Account lock status
- `lockUntil` (DateTime): Lock expiration time
- `createdById` (UUID): Creator user reference
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `lastLoginAt` (DateTime): Last successful login

**Relationships:**
- `organization`: Parent organization
- `creator`: User who created this user
- `subordinates`: Users created by this user
- `permissions`: Assigned permissions
- `branchAssignments`: Assigned branches
- `deptAssignments`: Assigned departments
- `refreshTokens`: Active refresh tokens
- `passwordResetTokens`: Password reset tokens


### Branch
Organizational units for geographical or functional divisions.

**Fields:**
- `id` (UUID): Unique branch identifier
- `organizationId` (UUID): Organization reference
- `name` (String, unique per org): Branch name
- `location` (String): Physical location
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Department
Functional divisions within an organization.

**Fields:**
- `id` (UUID): Unique department identifier
- `organizationId` (UUID): Organization reference
- `name` (String, unique per org): Department name
- `description` (String): Department description
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Permission
System-wide permission definitions.

**Fields:**
- `id` (UUID): Unique permission identifier
- `key` (String, unique): Permission key (e.g., "users.create")
- `module` (String): Module name
- `resource` (String): Resource type
- `action` (String): Action type
- `description` (String): Human-readable description
- `createdAt` (DateTime): Creation timestamp

### UserPermission
User-specific permission grants.

**Fields:**
- `id` (UUID): Unique assignment identifier
- `userId` (UUID): User reference
- `organizationId` (UUID): Organization reference
- `permission` (String): Permission key
- `grantedById` (UUID): Granting user reference
- `grantedAt` (DateTime): Grant timestamp

### RefreshToken
JWT refresh tokens with family tracking.

**Fields:**
- `id` (UUID): Unique token identifier
- `userId` (UUID): User reference
- `token` (String, unique): JWT refresh token
- `familyId` (UUID): Token family identifier
- `expiresAt` (DateTime): Expiration timestamp
- `createdAt` (DateTime): Creation timestamp
- `revokedAt` (DateTime): Revocation timestamp

### Session
Active user sessions stored in Redis.

**Fields:**
- `id` (UUID): Unique session identifier
- `sessionId` (String, unique): Session identifier
- `userId` (UUID): User reference
- `organizationId` (UUID): Organization reference
- `deviceInfo` (String): User agent information
- `ipAddress` (String): Client IP address
- `lastActive` (DateTime): Last activity timestamp
- `createdAt` (DateTime): Creation timestamp
- `expiresAt` (DateTime): Expiration timestamp

### AuditLog
Comprehensive audit trail for all system actions.

**Fields:**
- `id` (UUID): Unique log identifier
- `organizationId` (UUID): Organization reference
- `userId` (UUID): User reference (nullable)
- `action` (String): Action type
- `entityType` (String): Affected entity type
- `entityId` (String): Affected entity ID
- `metadata` (JSON): Additional context data
- `ipAddress` (String): Client IP address
- `userAgent` (String): Client user agent
- `createdAt` (DateTime): Event timestamp


## GraphQL API Endpoints

### Base URL
- **GraphQL Endpoint**: `/graphql`
- **GraphQL Playground**: `/graphql` (enabled in development)

### Authentication Header
All authenticated requests require:
```
Authorization: Bearer <access_token>
```

---

## Authentication & Authorization

### 1. Register Organization
Creates a new organization with an owner user.

**Mutation:**
```graphql
mutation RegisterOrganization($input: RegisterOrganizationInput!) {
  registerOrganization(input: $input) {
    accessToken
    refreshToken
    requiresMFA
    user {
      id
      email
      firstName
      lastName
      role
      organizationId
      emailVerified
      mfaEnabled
    }
  }
}
```

**Input:**
```typescript
{
  businessName: string (required)
  email: string (required)
  password: string (required)
  firstName: string (required)
  lastName: string (required)
  phone?: string
  acceptedTerms: boolean (required, must be true)
  businessType?: string
  employeeCount?: string
  industry?: string
  country?: string
  selectedModules?: string[]
  primaryGoal?: string
  cloudProvider?: string
  region?: string
  storageVolume?: number
  compression?: boolean
  activeHours?: number
  integrations?: string[]
  selectedPlan?: string
  billingCycle?: string
}
```

**Response:**
```typescript
{
  accessToken: string        // JWT access token (15 min expiry)
  refreshToken: string       // JWT refresh token (7 day expiry)
  requiresMFA: boolean       // Always false for new registrations
  user: User                 // User object with sanitized data
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Business Logic:**
- Creates organization with UUID
- Creates owner user with OWNER role
- Hashes password with bcrypt (12 rounds)
- Generates JWT access and refresh tokens
- Stores refresh token with family tracking
- Logs user creation in audit log
- Assigns module permissions if selectedModules provided
- Email verification required (link sent via email)

**Error Codes:**
- `400`: Validation error (missing fields, weak password)
- `409`: Email already exists in organization
- `500`: Internal server error


### 2. Login with Email/Password
Authenticates user with email and password.

**Mutation:**
```graphql
mutation Login($email: String!, $password: String!, $organizationId: ID!) {
  login(email: $email, password: $password, organizationId: $organizationId) {
    accessToken
    refreshToken
    requiresMFA
    user {
      id
      email
      firstName
      lastName
      role
      mfaEnabled
    }
  }
}
```

**Input:**
```typescript
{
  email: string
  password: string
  organizationId: string (UUID)
}
```

**Response:**
```typescript
{
  accessToken: string        // Empty if MFA required
  refreshToken: string       // Empty if MFA required
  requiresMFA: boolean       // True if MFA enabled
  user: User
}
```

**Business Logic:**
- Validates email and password
- Checks account lock status (30 min lock after 5 failures)
- Verifies email verification status
- Implements rate limiting (5 attempts per 15 minutes)
- If MFA enabled, returns requiresMFA: true
- Creates session in Redis
- Detects suspicious logins (new device/IP)
- Updates last login timestamp
- Logs login attempt in audit log

**Error Codes:**
- `401`: Invalid credentials, account locked, email not verified
- `500`: Internal server error

---

### 3. Login with Google OAuth
Authenticates or registers user via Google OAuth2.

**Mutation:**
```graphql
mutation LoginWithGoogle($code: String!, $organizationId: ID) {
  loginWithGoogle(code: $code, organizationId: $organizationId) {
    accessToken
    refreshToken
    requiresMFA
    user {
      id
      email
      firstName
      lastName
      role
      googleId
    }
  }
}
```

**Note:** This mutation is currently not fully implemented via GraphQL. Use the REST endpoint `/auth/google` for OAuth flow.

**Business Logic:**
- Finds user by Google ID or email
- If multiple organizations with same email, prompts for selection
- Creates new organization if user doesn't exist
- Links Google ID to existing user
- Marks email as verified for Google users
- Generates JWT tokens and creates session


### 4. Verify MFA
Completes login after MFA code verification.

**Mutation:**
```graphql
mutation VerifyMFA($userId: ID!, $token: String!, $organizationId: ID!) {
  verifyMFA(userId: $userId, token: $token, organizationId: $organizationId) {
    accessToken
    refreshToken
    requiresMFA
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

**Input:**
```typescript
{
  userId: string (UUID)
  token: string              // 6-digit TOTP code or backup code
  organizationId: string (UUID)
}
```

**Business Logic:**
- Verifies TOTP code with 1-step window for clock skew
- Falls back to backup codes if TOTP fails
- Marks backup code as consumed after use
- Implements failure counter (3 attempts)
- Locks account for 15 minutes after 3 failures
- Generates JWT tokens on success
- Creates session and logs login

**Error Codes:**
- `401`: Invalid MFA code, account locked, user not found
- `500`: Internal server error

---

### 5. Refresh Tokens
Obtains new access and refresh tokens.

**Mutation:**
```graphql
mutation RefreshTokens($refreshToken: String!) {
  refreshTokens(refreshToken: $refreshToken) {
    accessToken
    refreshToken
    requiresMFA
    user {
      id
      email
      role
    }
  }
}
```

**Input:**
```typescript
{
  refreshToken: string       // Current refresh token
}
```

**Business Logic:**
- Verifies refresh token signature and expiration
- Detects token reuse (revokes entire family if reused)
- Marks old token as revoked
- Generates new tokens with same family ID
- Maintains token family lineage
- Logs token rotation in audit log

**Error Codes:**
- `401`: Invalid token, expired token, token reuse detected
- `500`: Internal server error

---

### 6. Logout
Logs out user from current session.

**Mutation:**
```graphql
mutation Logout {
  logout
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Blacklists access token in Redis
- Deletes current session
- Token remains blacklisted until expiration

---

### 7. Logout All Devices
Logs out user from all sessions.

**Mutation:**
```graphql
mutation LogoutAllDevices {
  logoutAllDevices
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Revokes all refresh tokens
- Blacklists all tokens in Redis
- Deletes all sessions
- Forces re-login on all devices


### 8. Enable MFA
Enables multi-factor authentication for user.

**Mutation:**
```graphql
mutation EnableMFA {
  enableMFA {
    secret
    qrCodeUrl
    backupCodes
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
{
  secret: string             // Base32 TOTP secret
  qrCodeUrl: string          // Data URL for QR code image
  backupCodes: string[]      // 10 backup codes (8 chars each)
}
```

**Business Logic:**
- Generates TOTP secret with speakeasy
- Creates QR code for authenticator apps
- Generates 10 backup codes
- Hashes backup codes before storage
- Enables MFA flag on user
- Logs MFA enablement in audit log

**Error Codes:**
- `400`: MFA already enabled
- `401`: Unauthorized
- `500`: Internal server error

---

### 9. Disable MFA
Disables multi-factor authentication for user.

**Mutation:**
```graphql
mutation DisableMFA($totpToken: String!, $currentPassword: String!) {
  disableMFA(totpToken: $totpToken, currentPassword: $currentPassword)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Input:**
```typescript
{
  totpToken: string          // Current TOTP code
  currentPassword: string    // User's password
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Verifies current password
- Verifies TOTP code
- Clears MFA secret and backup codes
- Disables MFA flag
- Logs MFA disablement in audit log

**Error Codes:**
- `400`: MFA not enabled
- `401`: Invalid password or TOTP code
- `500`: Internal server error

---

### 10. Request Password Reset
Initiates password reset process.

**Mutation:**
```graphql
mutation RequestPasswordReset($email: String!, $organizationId: ID) {
  requestPasswordReset(email: $email, organizationId: $organizationId)
}
```

**Input:**
```typescript
{
  email: string
  organizationId?: string    // Optional
}
```

**Response:**
```typescript
boolean                      // Always true (doesn't reveal if email exists)
```

**Business Logic:**
- Finds user by email and organization
- Generates unique reset token (UUID)
- Sets 1-hour expiration
- Stores token in database
- Sends reset email with time-limited link
- Always returns success to prevent email enumeration

---

### 11. Reset Password
Resets password using reset token.

**Mutation:**
```graphql
mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword)
}
```

**Input:**
```typescript
{
  token: string              // Reset token from email
  newPassword: string        // New password
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Validates reset token
- Checks token expiration (1 hour)
- Ensures single use (marks as used)
- Validates password complexity
- Checks password history (last 5)
- Hashes new password
- Updates password and history
- Sends confirmation email

**Error Codes:**
- `400`: Password complexity error, password in history
- `401`: Invalid token, expired token, token already used
- `500`: Internal server error


### 12. Change Password
Changes password for authenticated user.

**Mutation:**
```graphql
mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Input:**
```typescript
{
  currentPassword: string
  newPassword: string
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Verifies current password
- Validates new password complexity
- Checks password history (last 5)
- Hashes new password
- Updates password and history
- Invalidates all refresh tokens
- Deletes all sessions (forces re-login)
- Sends confirmation email

**Error Codes:**
- `400`: Password complexity error, password in history
- `401`: Invalid current password
- `500`: Internal server error

---

### 13. List Active Sessions
Lists all active sessions for user.

**Mutation:**
```graphql
mutation ListActiveSessions {
  listActiveSessions {
    sessionId
    deviceInfo
    ipAddress
    lastActive
    createdAt
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
[
  {
    sessionId: string
    deviceInfo: string       // User agent
    ipAddress: string
    lastActive: DateTime
    createdAt: DateTime
  }
]
```

---

### 14. Revoke Session
Revokes a specific session.

**Mutation:**
```graphql
mutation RevokeSession($sessionId: ID!) {
  revokeSession(sessionId: $sessionId)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Input:**
```typescript
{
  sessionId: string          // Session ID to revoke
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Verifies session belongs to user
- Deletes session from Redis
- Blacklists associated tokens

---

## User Management

### 15. Get Current User
Retrieves authenticated user's profile.

**Query:**
```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    phone
    role
    organizationId
    emailVerified
    mfaEnabled
    accountLocked
    createdAt
    updatedAt
    lastLoginAt
    organization {
      id
      businessName
    }
    branches {
      id
      name
      location
    }
    departments {
      id
      name
      description
    }
    permissions
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response:**
```typescript
User                         // Full user object with relations
```


### 16. Get User by ID
Retrieves user by ID.

**Query:**
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    role
    branches {
      id
      name
    }
    departments {
      id
      name
    }
    permissions
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.view`

**Input:**
```typescript
{
  id: string (UUID)
}
```

**Response:**
```typescript
User | null                  // User object or null if not found
```

---

### 17. List Users
Lists users with optional filters.

**Query:**
```graphql
query ListUsers($filters: UserFilters) {
  users(filters: $filters) {
    id
    email
    firstName
    lastName
    role
    createdAt
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.view`

**Input:**
```typescript
{
  filters?: {
    role?: UserRole          // OWNER | MANAGER | WORKER
    branchId?: string
    departmentId?: string
  }
}
```

**Response:**
```typescript
User[]                       // Array of users
```

---

### 18. Create Manager
Creates a new manager user.

**Mutation:**
```graphql
mutation CreateManager($input: CreateManagerInput!) {
  createManager(input: $input) {
    id
    email
    firstName
    lastName
    role
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.create`
- Only OWNER can create managers

**Input:**
```typescript
{
  email: string (required)
  firstName: string (required)
  lastName: string (required)
  phone?: string
  branchIds?: string[]       // At least one branch or department required
  departmentIds?: string[]
  permissions?: string[]     // Permission keys to grant
}
```

**Response:**
```typescript
User                         // Created manager user
```

**Business Logic:**
- Validates creator is OWNER
- Requires at least one branch or department
- Checks email uniqueness within organization
- Creates user with MANAGER role
- Assigns branches and departments
- Sends invitation email
- Logs user creation in audit log

**Error Codes:**
- `400`: Missing required fields, no branch/department
- `403`: Only owners can create managers
- `409`: Email already exists
- `500`: Internal server error


### 19. Create Worker
Creates a new worker user.

**Mutation:**
```graphql
mutation CreateWorker($input: CreateWorkerInput!) {
  createWorker(input: $input) {
    id
    email
    firstName
    lastName
    role
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.create`
- OWNER or MANAGER can create workers

**Input:**
```typescript
{
  email: string (required)
  firstName: string (required)
  lastName: string (required)
  phone?: string
  permissions?: string[]     // Permission keys to grant
}
```

**Response:**
```typescript
User                         // Created worker user
```

**Business Logic:**
- Validates creator is OWNER or MANAGER
- Checks email uniqueness within organization
- Creates user with WORKER role
- Inherits branches/departments from creator
- Sends invitation email
- Logs user creation in audit log

**Error Codes:**
- `400`: Missing required fields
- `403`: Workers cannot create users
- `409`: Email already exists
- `500`: Internal server error

---

### 20. Update User
Updates user information.

**Mutation:**
```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    firstName
    lastName
    phone
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.edit`

**Input:**
```typescript
{
  id: string (UUID)
  input: {
    firstName?: string
    lastName?: string
    phone?: string
  }
}
```

**Response:**
```typescript
User                         // Updated user
```

---

### 21. Delete User
Deletes a user.

**Mutation:**
```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.delete`

**Input:**
```typescript
{
  id: string (UUID)
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Verifies user exists
- Prevents deletion of OWNER users
- Cascading deletes handle related records
- Logs deletion in audit log

**Error Codes:**
- `400`: Cannot delete owner user
- `404`: User not found
- `500`: Internal server error

---

### 22. Transfer Ownership
Transfers organization ownership to another user.

**Mutation:**
```graphql
mutation TransferOwnership($newOwnerId: ID!) {
  transferOwnership(newOwnerId: $newOwnerId)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- Must be current OWNER

**Input:**
```typescript
{
  newOwnerId: string (UUID)
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Validates current user is OWNER
- Validates new owner is in same organization
- Prevents self-transfer
- Demotes current owner to MANAGER
- Promotes new user to OWNER
- Migrates created_by_id references
- Grants all permissions to new owner
- Logs role changes in audit log
- Sends email notifications

**Error Codes:**
- `400`: Not owner, same user, invalid target
- `404`: User not found
- `500`: Internal server error


## Permission Management

### 23. Get Available Permissions
Lists all system permissions.

**Query:**
```graphql
query AvailablePermissions {
  availablePermissions {
    key
    module
    resource
    action
    description
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `permissions.view`

**Response:**
```typescript
[
  {
    key: string              // e.g., "users.create"
    module: string           // e.g., "users"
    resource: string         // e.g., "user"
    action: string           // e.g., "create"
    description: string
  }
]
```

---

### 24. Get Modules
Lists all registered modules with permissions.

**Query:**
```graphql
query Modules {
  modules {
    name
    enabled
    permissions {
      key
      module
      resource
      action
      description
    }
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `permissions.view`

**Response:**
```typescript
[
  {
    name: string
    enabled: boolean
    permissions: PermissionDefinition[]
  }
]
```

---

### 25. Get Permissions by Module
Lists permissions grouped by module.

**Query:**
```graphql
query PermissionsByModule {
  permissionsByModule {
    module
    permissions {
      key
      description
    }
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `permissions.view`

**Response:**
```typescript
[
  {
    module: string
    permissions: PermissionDefinition[]
  }
]
```

---

### 26. Assign Permissions
Grants permissions to a user.

**Mutation:**
```graphql
mutation AssignPermissions($userId: ID!, $permissions: [String!]!) {
  assignPermissions(userId: $userId, permissions: $permissions)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `permissions.assign`

**Input:**
```typescript
{
  userId: string (UUID)
  permissions: string[]      // Permission keys (e.g., ["users.create", "users.view"])
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Validates all permission keys exist
- Managers can only grant permissions they have
- Owners can grant any permission
- Creates UserPermission records
- Logs permission grants in audit log

**Error Codes:**
- `400`: Invalid permission key
- `403`: Cannot grant permissions you don't have
- `404`: User not found
- `500`: Internal server error

---

### 27. Revoke Permissions
Revokes permissions from a user.

**Mutation:**
```graphql
mutation RevokePermissions($userId: ID!, $permissions: [String!]!) {
  revokePermissions(userId: $userId, permissions: $permissions)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `permissions.revoke`

**Input:**
```typescript
{
  userId: string (UUID)
  permissions: string[]      // Permission keys to revoke
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Deletes UserPermission records
- Logs permission revocations in audit log


## Branch Management

### 28. List Branches
Lists all branches in organization.

**Query:**
```graphql
query Branches {
  branches {
    id
    name
    location
    organizationId
    createdAt
    updatedAt
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `branches.view`

**Response:**
```typescript
Branch[]                     // Array of branches
```

---

### 29. Create Branch
Creates a new branch.

**Mutation:**
```graphql
mutation CreateBranch($input: CreateBranchInput!) {
  createBranch(input: $input) {
    id
    name
    location
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `branches.create`

**Input:**
```typescript
{
  name: string (required)
  location?: string
}
```

**Response:**
```typescript
Branch                       // Created branch
```

**Business Logic:**
- Validates name uniqueness within organization
- Creates branch record
- Logs creation in audit log

**Error Codes:**
- `400`: Missing name
- `409`: Branch name already exists
- `500`: Internal server error

---

### 30. Assign Branches to User
Assigns branches to a user.

**Mutation:**
```graphql
mutation AssignBranches($userId: ID!, $branchIds: [ID!]!) {
  assignBranches(userId: $userId, branchIds: $branchIds)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.edit`

**Input:**
```typescript
{
  userId: string (UUID)
  branchIds: string[]        // Array of branch UUIDs
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Validates all branches exist in organization
- Removes existing assignments
- Creates new assignments
- Logs scope changes in audit log

**Error Codes:**
- `400`: Invalid branch IDs
- `404`: User or branch not found
- `500`: Internal server error

---

## Department Management

### 31. List Departments
Lists all departments in organization.

**Query:**
```graphql
query Departments {
  departments {
    id
    name
    description
    organizationId
    createdAt
    updatedAt
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `departments.view`

**Response:**
```typescript
Department[]                 // Array of departments
```

---

### 32. Create Department
Creates a new department.

**Mutation:**
```graphql
mutation CreateDepartment($input: CreateDepartmentInput!) {
  createDepartment(input: $input) {
    id
    name
    description
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `departments.create`

**Input:**
```typescript
{
  name: string (required)
  description?: string
}
```

**Response:**
```typescript
Department                   // Created department
```

**Business Logic:**
- Validates name uniqueness within organization
- Creates department record
- Logs creation in audit log

**Error Codes:**
- `400`: Missing name
- `409`: Department name already exists
- `500`: Internal server error

---

### 33. Assign Departments to User
Assigns departments to a user.

**Mutation:**
```graphql
mutation AssignDepartments($userId: ID!, $departmentIds: [ID!]!) {
  assignDepartments(userId: $userId, departmentIds: $departmentIds)
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- `users.edit`

**Input:**
```typescript
{
  userId: string (UUID)
  departmentIds: string[]    // Array of department UUIDs
}
```

**Response:**
```typescript
boolean                      // true on success
```

**Business Logic:**
- Validates all departments exist in organization
- Removes existing assignments
- Creates new assignments
- Logs scope changes in audit log

**Error Codes:**
- `400`: Invalid department IDs
- `404`: User or department not found
- `500`: Internal server error


## Audit Logging

### 34. Get Audit Logs
Retrieves audit logs with filters.

**Query:**
```graphql
query AuditLogs($filters: AuditLogFilters) {
  auditLogs(filters: $filters) {
    id
    organizationId
    userId
    action
    entityType
    entityId
    metadata
    ipAddress
    userAgent
    createdAt
  }
}
```

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Permissions Required:**
- Access to audit logs (typically OWNER only)

**Input:**
```typescript
{
  filters?: {
    userId?: string
    action?: string
    startDate?: DateTime
    endDate?: DateTime
    limit?: number           // Default: 100
    offset?: number          // Default: 0
  }
}
```

**Response:**
```typescript
[
  {
    id: string
    organizationId: string
    userId: string | null
    action: string           // e.g., "LOGIN", "USER_CREATED", "PERMISSION_GRANT"
    entityType: string       // e.g., "USER", "BRANCH", "PERMISSION"
    entityId: string
    metadata: JSON           // Additional context
    ipAddress: string
    userAgent: string
    createdAt: DateTime
  }
]
```

**Logged Actions:**
- `LOGIN`: User login attempts (success/failure)
- `AUTH_FAILURE`: Failed authentication
- `USER_CREATED`: User creation
- `PERMISSION_GRANT`: Permission assignment
- `PERMISSION_REVOKE`: Permission revocation
- `ROLE_CHANGED`: Role modification
- `TOKEN_ROTATED`: Token refresh
- `MFA_ENABLE`: MFA enablement
- `MFA_DISABLE`: MFA disablement
- `SCOPE_ASSIGN`: Branch/department assignment
- `SCOPE_REVOKE`: Branch/department removal
- `OWNERSHIP_TRANSFERRED`: Ownership transfer

---

## REST Endpoints

### Health Check
**GET** `/health`

Checks system health status.

**Response:**
```typescript
{
  status: "healthy" | "unhealthy"
  timestamp: string
  services: {
    database: {
      status: "healthy" | "unhealthy"
      message: string
    }
    redis: {
      status: "healthy" | "unhealthy"
      message: string
    }
  }
}
```

**Status Codes:**
- `200`: System healthy
- `503`: System unhealthy

---

### Metrics (Prometheus)
**GET** `/metrics`

Returns Prometheus-formatted metrics.

**Response:**
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234
...
```

**Content-Type:** `text/plain; version=0.0.4`

---

### Metrics (JSON)
**GET** `/metrics/json`

Returns metrics in JSON format.

**Response:**
```typescript
{
  httpRequests: {
    total: number
    byMethod: { [method: string]: number }
    byStatus: { [status: string]: number }
  }
  authMetrics: {
    loginAttempts: number
    loginFailures: number
    mfaVerifications: number
  }
  // ... additional metrics
}
```

---

## Permission System

### Permission Format
Permissions use dot notation: `module.resource.action`

**Examples:**
- `users.create`: Create users
- `users.view`: View users
- `users.edit`: Edit users
- `users.delete`: Delete users
- `branches.create`: Create branches
- `branches.view`: View branches
- `departments.create`: Create departments
- `departments.view`: View departments
- `permissions.view`: View permissions
- `permissions.assign`: Assign permissions
- `permissions.revoke`: Revoke permissions

### Wildcard Permissions
- `users.*`: All user permissions
- `branches.*`: All branch permissions
- `*`: All permissions (typically OWNER only)

### Role-Based Permissions

**OWNER:**
- Bypasses all permission checks
- Has implicit access to all operations
- Can create managers
- Can transfer ownership
- Can assign any permission

**MANAGER:**
- Can create workers
- Can only grant permissions they possess
- Limited to assigned branches/departments
- Cannot create other managers

**WORKER:**
- Cannot create users
- Limited to assigned branches/departments
- Requires explicit permission grants


## Data Scoping

### Scope-Based Access Control
Users are restricted to data within their assigned branches and departments.

**OWNER:**
- Sees all organization data
- No scope restrictions

**MANAGER:**
- Sees data from assigned branches
- Sees data from assigned departments
- Uses OR logic (branch OR department)

**WORKER:**
- Inherits scope from creator
- Sees data from assigned branches
- Sees data from assigned departments
- Uses OR logic (branch OR department)

### Automatic Filtering
The `DataScopeService` automatically applies filters to queries based on user scope.

---

## Security Features

### Password Security
- **Hashing**: bcrypt with 12 rounds
- **Complexity Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **History**: Last 5 passwords tracked
- **Reset**: Time-limited tokens (1 hour)
- **Single Use**: Reset tokens can only be used once

### Token Security
- **Access Token**: JWT, 15 minutes expiration
- **Refresh Token**: JWT, 7 days expiration
- **Token Rotation**: New tokens on each refresh
- **Family Tracking**: Detects token reuse
- **Blacklisting**: Revoked tokens stored in Redis
- **Reuse Detection**: Invalidates entire token family

### Rate Limiting
- **General Endpoints**: 100 requests per minute
- **Auth Endpoints**: 5 requests per 15 minutes
- **Login Failures**: Account lock after 5 attempts (30 min)
- **MFA Failures**: Account lock after 3 attempts (15 min)

### Session Management
- **Storage**: Redis with TTL
- **Tracking**: Device info, IP address, timestamps
- **Activity**: Last active timestamp updated
- **Revocation**: Individual or all sessions
- **Suspicious Login**: Detects new device/IP combinations

### Multi-Factor Authentication
- **TOTP**: Time-based one-time passwords
- **Backup Codes**: 10 codes, single-use
- **QR Code**: For authenticator app setup
- **Failure Handling**: Account lock after 3 failures
- **Clock Skew**: 1-step window tolerance

### CORS Configuration
- **Origin Whitelist**: Configurable via environment
- **Credentials**: Enabled for authenticated requests
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With

### Security Headers (Helmet)
- Content Security Policy
- Cross-Origin Embedder Policy
- Cross-Origin Opener Policy
- DNS Prefetch Control
- Frame Guard (deny)
- HSTS (1 year, includeSubDomains, preload)
- No Sniff
- Referrer Policy (no-referrer)
- XSS Filter

---

## Error Handling

### Error Response Format
```typescript
{
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
}
```

### Common Error Codes

**400 Bad Request:**
- Validation errors
- Missing required fields
- Password complexity failures
- Business logic violations

**401 Unauthorized:**
- Invalid credentials
- Expired tokens
- Account locked
- Email not verified
- MFA required

**403 Forbidden:**
- Insufficient permissions
- Role restrictions
- Scope violations

**404 Not Found:**
- Resource not found
- User not found
- Organization not found

**409 Conflict:**
- Email already exists
- Duplicate resource names
- Unique constraint violations

**429 Too Many Requests:**
- Rate limit exceeded
- Retry-After header included

**500 Internal Server Error:**
- Unexpected errors
- Database errors
- Redis errors

**503 Service Unavailable:**
- Health check failures
- Database unavailable
- Redis unavailable

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Secrets
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional-password

# Server
PORT=3000
NODE_ENV=development|production

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Optional Variables

```bash
# Logging
LOG_LEVEL=info|debug|warn|error

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_TTL=900000
AUTH_RATE_LIMIT_MAX=5

# Session
SESSION_TTL=86400

# Email (Future)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
EMAIL_FROM=noreply@example.com
```


## Frontend Integration Guide

### Authentication Flow

#### 1. Organization Registration
```typescript
// Register new organization
const response = await graphqlClient.mutate({
  mutation: REGISTER_ORGANIZATION,
  variables: {
    input: {
      businessName: "Acme Corp",
      email: "owner@acme.com",
      password: "SecurePass123!",
      firstName: "John",
      lastName: "Doe",
      acceptedTerms: true,
      selectedModules: ["users", "inventory", "reports"]
    }
  }
});

// Store tokens
localStorage.setItem('accessToken', response.data.registerOrganization.accessToken);
localStorage.setItem('refreshToken', response.data.registerOrganization.refreshToken);
```

#### 2. Login Flow
```typescript
// Step 1: Login with credentials
const loginResponse = await graphqlClient.mutate({
  mutation: LOGIN,
  variables: {
    email: "user@acme.com",
    password: "SecurePass123!",
    organizationId: "org-uuid"
  }
});

// Step 2: Check if MFA required
if (loginResponse.data.login.requiresMFA) {
  // Prompt user for MFA code
  const mfaCode = await promptUserForMFA();
  
  // Step 3: Verify MFA
  const mfaResponse = await graphqlClient.mutate({
    mutation: VERIFY_MFA,
    variables: {
      userId: loginResponse.data.login.user.id,
      token: mfaCode,
      organizationId: "org-uuid"
    }
  });
  
  // Store tokens
  localStorage.setItem('accessToken', mfaResponse.data.verifyMFA.accessToken);
  localStorage.setItem('refreshToken', mfaResponse.data.verifyMFA.refreshToken);
} else {
  // Store tokens directly
  localStorage.setItem('accessToken', loginResponse.data.login.accessToken);
  localStorage.setItem('refreshToken', loginResponse.data.login.refreshToken);
}
```

#### 3. Token Refresh
```typescript
// Implement automatic token refresh
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    const response = await graphqlClient.mutate({
      mutation: REFRESH_TOKENS,
      variables: { refreshToken }
    });
    
    localStorage.setItem('accessToken', response.data.refreshTokens.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshTokens.refreshToken);
    
    return response.data.refreshTokens.accessToken;
  } catch (error) {
    // Token refresh failed, redirect to login
    localStorage.clear();
    window.location.href = '/login';
  }
};

// Add interceptor to handle 401 errors
graphqlClient.onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      if (error.extensions?.code === 'UNAUTHENTICATED') {
        // Try to refresh token
        return refreshAccessToken();
      }
    }
  }
});
```

#### 4. Authenticated Requests
```typescript
// Configure GraphQL client with auth header
const graphqlClient = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  request: (operation) => {
    const token = localStorage.getItem('accessToken');
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    });
  }
});
```

### User Management

#### Create Manager
```typescript
const createManager = async (managerData) => {
  const response = await graphqlClient.mutate({
    mutation: CREATE_MANAGER,
    variables: {
      input: {
        email: managerData.email,
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        phone: managerData.phone,
        branchIds: managerData.branches,
        departmentIds: managerData.departments,
        permissions: [
          "users.view",
          "users.create",
          "branches.view",
          "departments.view"
        ]
      }
    }
  });
  
  return response.data.createManager;
};
```

#### Create Worker
```typescript
const createWorker = async (workerData) => {
  const response = await graphqlClient.mutate({
    mutation: CREATE_WORKER,
    variables: {
      input: {
        email: workerData.email,
        firstName: workerData.firstName,
        lastName: workerData.lastName,
        permissions: [
          "inventory.view",
          "reports.view"
        ]
      }
    }
  });
  
  return response.data.createWorker;
};
```

### Permission Management

#### Check User Permissions
```typescript
// Get current user with permissions
const getCurrentUser = async () => {
  const response = await graphqlClient.query({
    query: ME_QUERY
  });
  
  return response.data.me;
};

// Check if user has permission
const hasPermission = (user, permission) => {
  return user.permissions.includes(permission) || 
         user.role === 'OWNER'; // Owners bypass all checks
};

// Usage in UI
const user = await getCurrentUser();
if (hasPermission(user, 'users.create')) {
  // Show create user button
}
```

#### Assign Permissions
```typescript
const assignPermissions = async (userId, permissions) => {
  await graphqlClient.mutate({
    mutation: ASSIGN_PERMISSIONS,
    variables: {
      userId,
      permissions
    }
  });
};
```

### MFA Management

#### Enable MFA
```typescript
const enableMFA = async () => {
  const response = await graphqlClient.mutate({
    mutation: ENABLE_MFA
  });
  
  const { secret, qrCodeUrl, backupCodes } = response.data.enableMFA;
  
  // Display QR code to user
  displayQRCode(qrCodeUrl);
  
  // Display backup codes (user must save these)
  displayBackupCodes(backupCodes);
  
  return { secret, qrCodeUrl, backupCodes };
};
```

#### Disable MFA
```typescript
const disableMFA = async (totpToken, currentPassword) => {
  await graphqlClient.mutate({
    mutation: DISABLE_MFA,
    variables: {
      totpToken,
      currentPassword
    }
  });
};
```

### Session Management

#### List Active Sessions
```typescript
const listSessions = async () => {
  const response = await graphqlClient.mutate({
    mutation: LIST_ACTIVE_SESSIONS
  });
  
  return response.data.listActiveSessions;
};

// Display sessions in UI
const sessions = await listSessions();
sessions.forEach(session => {
  console.log(`Device: ${session.deviceInfo}`);
  console.log(`IP: ${session.ipAddress}`);
  console.log(`Last Active: ${session.lastActive}`);
});
```

#### Revoke Session
```typescript
const revokeSession = async (sessionId) => {
  await graphqlClient.mutate({
    mutation: REVOKE_SESSION,
    variables: { sessionId }
  });
};
```

### Password Management

#### Change Password
```typescript
const changePassword = async (currentPassword, newPassword) => {
  try {
    await graphqlClient.mutate({
      mutation: CHANGE_PASSWORD,
      variables: {
        currentPassword,
        newPassword
      }
    });
    
    // Password changed successfully
    // User will be logged out from all devices
    // Redirect to login
    localStorage.clear();
    window.location.href = '/login';
  } catch (error) {
    // Handle errors (weak password, password in history, etc.)
    console.error(error);
  }
};
```

#### Request Password Reset
```typescript
const requestPasswordReset = async (email, organizationId) => {
  await graphqlClient.mutate({
    mutation: REQUEST_PASSWORD_RESET,
    variables: { email, organizationId }
  });
  
  // Always shows success message (doesn't reveal if email exists)
  showMessage("If an account exists, a reset link has been sent.");
};
```

#### Reset Password
```typescript
const resetPassword = async (token, newPassword) => {
  try {
    await graphqlClient.mutate({
      mutation: RESET_PASSWORD,
      variables: { token, newPassword }
    });
    
    // Password reset successful
    window.location.href = '/login';
  } catch (error) {
    // Handle errors (invalid token, expired, weak password)
    console.error(error);
  }
};
```


### Branch & Department Management

#### List and Assign Branches
```typescript
// Get all branches
const getBranches = async () => {
  const response = await graphqlClient.query({
    query: BRANCHES_QUERY
  });
  return response.data.branches;
};

// Create branch
const createBranch = async (name, location) => {
  const response = await graphqlClient.mutate({
    mutation: CREATE_BRANCH,
    variables: {
      input: { name, location }
    }
  });
  return response.data.createBranch;
};

// Assign branches to user
const assignBranches = async (userId, branchIds) => {
  await graphqlClient.mutate({
    mutation: ASSIGN_BRANCHES,
    variables: { userId, branchIds }
  });
};
```

#### List and Assign Departments
```typescript
// Get all departments
const getDepartments = async () => {
  const response = await graphqlClient.query({
    query: DEPARTMENTS_QUERY
  });
  return response.data.departments;
};

// Create department
const createDepartment = async (name, description) => {
  const response = await graphqlClient.mutate({
    mutation: CREATE_DEPARTMENT,
    variables: {
      input: { name, description }
    }
  });
  return response.data.createDepartment;
};

// Assign departments to user
const assignDepartments = async (userId, departmentIds) => {
  await graphqlClient.mutate({
    mutation: ASSIGN_DEPARTMENTS,
    variables: { userId, departmentIds }
  });
};
```

### Audit Logging

#### View Audit Logs
```typescript
const getAuditLogs = async (filters) => {
  const response = await graphqlClient.query({
    query: AUDIT_LOGS_QUERY,
    variables: {
      filters: {
        userId: filters.userId,
        action: filters.action,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      }
    }
  });
  
  return response.data.auditLogs;
};

// Example: Get login history for a user
const loginHistory = await getAuditLogs({
  userId: "user-uuid",
  action: "LOGIN",
  startDate: new Date("2024-01-01"),
  endDate: new Date()
});
```

---

## GraphQL Schema Examples

### Complete Mutation Examples

```graphql
# Register Organization
mutation {
  registerOrganization(input: {
    businessName: "Acme Corporation"
    email: "owner@acme.com"
    password: "SecurePass123!"
    firstName: "John"
    lastName: "Doe"
    acceptedTerms: true
    selectedModules: ["users", "inventory", "reports"]
    businessType: "Technology"
    industry: "Software"
    country: "USA"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      role
    }
  }
}

# Login
mutation {
  login(
    email: "user@acme.com"
    password: "SecurePass123!"
    organizationId: "org-uuid"
  ) {
    accessToken
    refreshToken
    requiresMFA
    user {
      id
      email
      firstName
      lastName
      role
      mfaEnabled
    }
  }
}

# Create Manager
mutation {
  createManager(input: {
    email: "manager@acme.com"
    firstName: "Jane"
    lastName: "Smith"
    phone: "+1234567890"
    branchIds: ["branch-uuid-1", "branch-uuid-2"]
    departmentIds: ["dept-uuid-1"]
    permissions: [
      "users.view"
      "users.create"
      "branches.view"
      "departments.view"
    ]
  }) {
    id
    email
    role
  }
}

# Assign Permissions
mutation {
  assignPermissions(
    userId: "user-uuid"
    permissions: [
      "inventory.view"
      "inventory.create"
      "reports.view"
    ]
  )
}

# Enable MFA
mutation {
  enableMFA {
    secret
    qrCodeUrl
    backupCodes
  }
}

# Change Password
mutation {
  changePassword(
    currentPassword: "OldPass123!"
    newPassword: "NewPass456!"
  )
}
```

### Complete Query Examples

```graphql
# Get Current User
query {
  me {
    id
    email
    firstName
    lastName
    phone
    role
    organizationId
    emailVerified
    mfaEnabled
    createdAt
    lastLoginAt
    organization {
      id
      businessName
      selectedModules
    }
    branches {
      id
      name
      location
    }
    departments {
      id
      name
      description
    }
    permissions
  }
}

# List Users
query {
  users(filters: {
    role: MANAGER
  }) {
    id
    email
    firstName
    lastName
    role
    createdAt
  }
}

# Get Available Permissions
query {
  availablePermissions {
    key
    module
    resource
    action
    description
  }
}

# Get Modules
query {
  modules {
    name
    enabled
    permissions {
      key
      description
    }
  }
}

# List Branches
query {
  branches {
    id
    name
    location
    createdAt
  }
}

# List Departments
query {
  departments {
    id
    name
    description
    createdAt
  }
}

# Get Audit Logs
query {
  auditLogs(filters: {
    action: "LOGIN"
    startDate: "2024-01-01T00:00:00Z"
    endDate: "2024-12-31T23:59:59Z"
    limit: 50
  }) {
    id
    userId
    action
    entityType
    entityId
    metadata
    ipAddress
    userAgent
    createdAt
  }
}
```

---

## Testing

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Test Coverage
The backend includes comprehensive tests for:
- Authentication flows
- Password validation
- Token management
- Permission checks
- User creation
- Audit logging
- Property-based testing with fast-check

---

## Deployment

### Production Checklist

1. **Environment Variables**
   - Set strong JWT secrets (min 32 characters)
   - Configure production database URL
   - Set Redis connection details
   - Configure CORS origins
   - Set NODE_ENV=production

2. **Database**
   - Run migrations: `npx prisma migrate deploy`
   - Generate Prisma client: `npx prisma generate`
   - Verify connection pooling settings

3. **Redis**
   - Configure Redis persistence
   - Set appropriate memory limits
   - Enable authentication

4. **Security**
   - Enable HTTPS
   - Configure firewall rules
   - Set up rate limiting
   - Enable security headers
   - Configure CORS properly

5. **Monitoring**
   - Set up health check monitoring
   - Configure Prometheus metrics collection
   - Set up log aggregation
   - Configure alerts for errors

6. **Performance**
   - Enable Redis caching
   - Configure connection pooling
   - Set up CDN for static assets
   - Enable compression

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Support & Troubleshooting

### Common Issues

**Issue: "Invalid credentials" on login**
- Verify email and password are correct
- Check if email is verified
- Verify organizationId is correct
- Check if account is locked

**Issue: "Token expired" errors**
- Implement automatic token refresh
- Check token expiration times
- Verify refresh token is valid

**Issue: "Permission denied" errors**
- Check user permissions with `me` query
- Verify user role
- Check if permission exists in system

**Issue: Database connection errors**
- Verify DATABASE_URL is correct
- Check database is running
- Verify network connectivity
- Check connection pool settings

**Issue: Redis connection errors**
- Verify REDIS_HOST and REDIS_PORT
- Check Redis is running
- Verify authentication if enabled

### Logging

Logs are written to:
- Console (all environments)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

Log levels: `error`, `warn`, `info`, `debug`

---

## API Versioning

Current API version: **v1**

The API uses GraphQL which provides built-in versioning through schema evolution:
- New fields can be added without breaking changes
- Deprecated fields are marked with `@deprecated` directive
- Breaking changes require new types or fields

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General | 100 requests | 1 minute |
| Authentication | 5 requests | 15 minutes |
| Password Reset | 3 requests | 1 hour |

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp
- `Retry-After`: Seconds until retry (when limited)

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Multi-tenant authentication
- JWT with refresh token rotation
- MFA with TOTP and backup codes
- Role-based access control
- Hierarchical user management
- Branch and department scoping
- Comprehensive audit logging
- Session management
- Password management
- GraphQL API
- Health checks and metrics

---

## License

UNLICENSED - Proprietary Software

---

## Contact & Support

For technical support or questions about the API, please contact the development team.

