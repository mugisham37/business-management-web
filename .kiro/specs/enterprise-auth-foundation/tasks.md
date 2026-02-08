# Implementation Plan: Enterprise Authentication & Authorization Foundation

## Overview

This implementation plan breaks down the enterprise authentication and authorization system into discrete, incremental coding tasks. The system is built using NestJS with Fastify, PostgreSQL with Prisma ORM, Redis caching, and Passport.js authentication strategies. Tasks are organized to build infrastructure modules first, then application modules, with property-based tests integrated throughout to validate correctness properties early.

## Tasks

### Phase 1: Project Setup and Infrastructure Foundation

- [x] 1. Initialize NestJS project with Fastify adapter and core dependencies
  - Create NestJS project with Fastify adapter
  - Install dependencies: @nestjs/core, @nestjs/common, @nestjs/platform-fastify, @nestjs/config
  - Install security dependencies: @node-rs/argon2, jsonwebtoken, uuid
  - Install validation dependencies: class-validator, class-transformer
  - Install testing dependencies: @fast-check/jest, jest, @nestjs/testing
  - Configure TypeScript with strict mode
  - Set up project structure: src/modules, src/common, src/config
  - _Requirements: All_

- [x] 2. Set up Prisma ORM with PostgreSQL
  - Install Prisma dependencies: @prisma/client, prisma
  - Initialize Prisma with PostgreSQL provider
  - Configure database connection with environment variables
  - Set up Prisma schema file structure
  - Create database module for NestJS integration
  - _Requirements: 16.1, 16.5_

- [x] 3. Define Prisma schema for all entities
  - [x] 3.1 Define core tenant entities (Organization, User, Location, Department)
    - Create Organization model with subscription and limits fields
    - Create User model with authentication and status fields
    - Create Location model with address and contact fields
    - Create Department model
    - Add indexes for performance (organizationId, email, username)
    - _Requirements: 1.1, 16.5, 20.1_
  
  - [x] 3.2 Define authentication entities (Session, Invitation, MFA, OAuth, Password tokens)
    - Create Session model with device tracking
    - Create Invitation model with delegation data
    - Create MFABackupCode model
    - Create OAuthProvider model with encrypted tokens
    - Create PasswordResetToken model
    - Create EmailVerificationToken model
    - Create PasswordHistory model
    - Add indexes for token lookups
    - _Requirements: 2.1, 4.2, 11.1, 13.3, 14.1, 17.4_
  
  - [x] 3.3 Define authorization entities (Role, Permission, junction tables)
    - Create Role model with system role flag
    - Create Permission model with module/action/resource structure
    - Create RolePermission junction model
    - Create UserRole junction model with scope fields
    - Create UserPermission junction model with effect field
    - Create UserLocation junction model
    - Create UserHierarchy model
    - Add indexes for permission evaluation
    - _Requirements: 7.3, 9.1, 10.1, 19.1, 24.1_
  
  - [x] 3.4 Define audit entity (AuditLog)
    - Create AuditLog model with immutable fields
    - Add indexes for audit queries (organizationId, userId, createdAt)
    - _Requirements: 15.1, 15.5_
  
  - [x] 3.5 Run Prisma migrations
    - Generate initial migration
    - Apply migration to database
    - Generate Prisma Client


- [x] 4. Implement Logger Module (infrastructure)
  - Create LoggerService with structured logging
  - Implement correlation ID injection
  - Implement context-aware logging
  - Implement sensitive data masking
  - Configure log levels and transports
  - _Requirements: 15.7_

- [x] 5. Implement Security Module (infrastructure)
  - [x] 5.1 Implement password hashing with Argon2id
    - Create SecurityService with hashPassword method
    - Create verifyPassword method
    - Configure Argon2id parameters (memory, iterations, parallelism)
    - _Requirements: 1.6_
  
  - [ ]* 5.2 Write property test for password hashing
    - **Property 4: Password Hashing with Argon2id**
    - **Validates: Requirements 1.6**
  
  - [x] 5.3 Implement password strength validation
    - Create validatePasswordStrength method
    - Check minimum 12 characters, uppercase, lowercase, number, special character
    - Return detailed validation result
    - _Requirements: 1.5_
  
  - [ ]* 5.4 Write property test for password strength validation
    - **Property 3: Password Strength Validation**
    - **Validates: Requirements 1.5**
  
  - [x] 5.5 Implement encryption for sensitive data
    - Create encrypt method using AES-256-GCM
    - Create decrypt method
    - Implement key management
    - _Requirements: 23.1, 23.2_
  
  - [ ]* 5.6 Write property test for encryption
    - **Property 73: Sensitive Data Encryption**
    - **Validates: Requirements 23.1, 23.2**
  
  - [x] 5.7 Implement token generation utilities
    - Create generateToken method for random tokens
    - Create generateSecureToken method
    - Ensure uniqueness and cryptographic randomness
    - _Requirements: 2.1, 4.2, 14.1_

- [x] 6. Implement Cache Module (infrastructure)
  - [x] 6.1 Set up Redis connection with ioredis
    - Create CacheService with Redis client
    - Configure connection pooling
    - Implement connection error handling
    - _Requirements: 8.1, 8.2_
  
  - [x] 6.2 Implement L1 (in-memory) and L2 (Redis) caching
    - Create in-memory cache with Map
    - Implement get method (check L1 → L2 → return null)
    - Implement set method (store in both L1 and L2)
    - Implement del method (delete from both layers)
    - Implement delPattern method for wildcard deletion
    - Configure TTL for each layer (L1: 5min, L2: 15min)
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 6.3 Implement pub/sub for cache invalidation
    - Create publish method for invalidation events
    - Create subscribe method with event handlers
    - Implement event-driven L1 cache clearing
    - _Requirements: 8.4, 8.5_


- [x] 7. Implement Audit Module (infrastructure)
  - [x] 7.1 Create AuditService with log method
    - Implement log method to create AuditLog records
    - Ensure immutability (append-only, no updates/deletes)
    - Include all required fields (timestamp, user, org, action, resource, outcome)
    - Implement sensitive data masking
    - _Requirements: 15.1, 15.5, 15.7_
  
  - [ ]* 7.2 Write property test for audit logging structure
    - **Property 47: Security Event Logging Structure**
    - **Validates: Requirements 15.1**
  
  - [ ]* 7.3 Write property test for audit log immutability
    - **Property 51: Audit Log Immutability**
    - **Validates: Requirements 15.5**
  
  - [ ]* 7.4 Write property test for sensitive data masking
    - **Property 52: Sensitive Data Masking in Logs**
    - **Validates: Requirements 15.7**
  
  - [x] 7.5 Implement query method for audit log retrieval
    - Support filtering by organization, user, action, date range
    - Implement pagination
    - _Requirements: 15.1_

- [ ] 8. Checkpoint - Ensure infrastructure modules are working
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Organizations and Core User Management

- [x] 9. Implement Organizations Module
  - [x] 9.1 Create OrganizationsService with CRUD operations
    - Implement create method (generate unique company code)
    - Implement findById method
    - Implement findByCompanyCode method
    - Implement update method
    - _Requirements: 1.1, 6.1_
  
  - [ ]* 9.2 Write property test for organization initialization
    - **Property 55: Organization Initialization**
    - **Validates: Requirements 16.5**
  
  - [x] 9.3 Implement organization limits enforcement
    - Implement canAddUser method (check currentUserCount < maxUsers)
    - Implement canAddLocation method (check currentLocationCount < maxLocations)
    - Implement incrementUserCount and decrementUserCount methods
    - _Requirements: 16.6_
  
  - [ ]* 9.4 Write property test for organization limit enforcement
    - **Property 56: Organization Limit Enforcement**
    - **Validates: Requirements 16.6**
  
  - [x] 9.5 Implement subscription management
    - Implement updateSubscription method
    - Implement isSubscriptionActive method
    - _Requirements: 16.6_
  
  - [x] 9.6 Implement onboarding methods
    - Implement completeOnboarding method
    - Implement getRecommendedPlans method (plan recommendation logic)
    - _Requirements: 18.5, 18.6_
  
  - [ ]* 9.7 Write property test for plan recommendation
    - **Property 60: Plan Recommendation Based on Onboarding Data**
    - **Validates: Requirements 18.5**


- [x] 10. Implement Locations Module
  - [x] 10.1 Create LocationsService with CRUD operations
    - Implement create method
    - Implement findById method
    - Implement findByOrganization method
    - Implement update and delete methods
    - _Requirements: 10.1_
  
  - [x] 10.2 Implement user-location assignment methods
    - Implement assignUserToLocation method (create UserLocation record)
    - Implement removeUserFromLocation method
    - Implement getUserLocations method
    - _Requirements: 10.1_
  
  - [ ]* 10.3 Write property test for location assignment recording
    - **Property 28: Location Assignment Recording**
    - **Validates: Requirements 10.1**

- [x] 11. Implement Departments Module
  - [x] 11.1 Create DepartmentsService with CRUD operations
    - Implement create method (associate with organization)
    - Implement findById method
    - Implement findByOrganization method
    - Implement update method
    - Implement delete method (check for assigned users)
    - _Requirements: 20.1, 20.4_
  
  - [ ]* 11.2 Write property test for department organization association
    - **Property 66: Department Organization Association**
    - **Validates: Requirements 20.1**
  
  - [ ]* 11.3 Write property test for department deletion prevention
    - **Property 68: Department Deletion Prevention**
    - **Validates: Requirements 20.4**

- [x] 12. Implement Users Module (basic CRUD)
  - [x] 12.1 Create UsersService with basic CRUD operations
    - Implement create method (hash password, set initial status)
    - Implement findById method (with organization context)
    - Implement findByEmail method (with organization context)
    - Implement findByUsername method (with organization context)
    - Implement update method
    - Implement delete method
    - _Requirements: 1.1, 6.1, 16.1, 16.2_
  
  - [ ]* 12.2 Write property test for multi-tenant isolation in user queries
    - **Property 24: Organization Boundary Enforcement**
    - **Validates: Requirements 7.7, 16.2**
  
  - [x] 12.3 Implement user status management methods
    - Implement suspend method (set status, invalidate sessions)
    - Implement reactivate method (set status to active)
    - Implement deactivate method (set status, invalidate sessions)
    - Implement lock method (set lockedUntil timestamp)
    - Implement unlock method (clear lockedUntil)
    - _Requirements: 21.1, 21.2, 21.4, 21.5, 12.3_
  
  - [ ]* 12.4 Write property test for status change session invalidation
    - **Property 69: Status Change Session Invalidation**
    - **Validates: Requirements 21.4**
  
  - [ ]* 12.5 Write property test for reactivation restores access
    - **Property 70: Reactivation Restores Access**
    - **Validates: Requirements 21.5**
  
  - [x] 12.6 Implement department assignment methods
    - Implement assignDepartment method
    - Implement removeDepartment method
    - _Requirements: 20.2_
  
  - [ ]* 12.7 Write property test for department assignment recording
    - **Property 67: Department Assignment Recording**
    - **Validates: Requirements 20.2**


- [ ] 13. Checkpoint - Ensure basic modules are working
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Roles and Permissions System

- [x] 14. Implement Permissions Module (core evaluation engine)
  - [x] 14.1 Create PermissionsService with permission evaluation
    - Implement hasPermission method (check direct grants/denials → roles → cache)
    - Implement hasAnyPermission method
    - Implement hasAllPermissions method
    - Implement permission evaluation algorithm from design
    - Integrate with CacheService for L1/L2 caching
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 14.2 Write property test for direct permission denial precedence
    - **Property 21: Direct Permission Denial Precedence**
    - **Validates: Requirements 7.4**
  
  - [ ]* 14.3 Write property test for direct permission grant precedence
    - **Property 22: Direct Permission Grant Precedence**
    - **Validates: Requirements 7.5**
  
  - [ ]* 14.4 Write property test for location-scoped permission enforcement
    - **Property 23: Location-Scoped Permission Enforcement**
    - **Validates: Requirements 7.6, 10.2**
  
  - [ ]* 14.5 Write property test for organization boundary enforcement
    - **Property 24: Organization Boundary Enforcement**
    - **Validates: Requirements 7.7, 16.2**
  
  - [ ]* 14.6 Write property test for department-scoped permission enforcement
    - **Property 25: Department-Scoped Permission Enforcement**
    - **Validates: Requirements 20.3**
  
  - [x] 14.2 Implement permission query methods
    - Implement getUserPermissions method
    - Implement getUserPermissionsWithScope method
    - _Requirements: 7.3_
  
  - [x] 14.3 Implement direct permission grant/deny methods
    - Implement grantPermission method (create UserPermission with effect=allow)
    - Implement denyPermission method (create UserPermission with effect=deny)
    - Implement revokePermission method (delete UserPermission)
    - Trigger cache invalidation on changes
    - _Requirements: 7.4, 7.5_
  
  - [x] 14.4 Implement delegation validation methods
    - Implement validateDelegation method (check creator has all permissions)
    - Implement canDelegate method
    - Traverse hierarchy to validate delegation chain
    - _Requirements: 4.1, 4.4, 9.1, 9.2_
  
  - [ ]* 14.5 Write property test for delegation validation
    - **Property 16: Delegation Validation**
    - **Validates: Requirements 4.1, 4.4, 9.1, 9.2, 19.1**
  
  - [x] 14.6 Implement cache invalidation methods
    - Implement invalidateUserCache method (publish event, clear L1)
    - Implement invalidateRoleCache method (publish event, clear L1 for all users with role)
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 14.7 Write property test for user permission change invalidation
    - **Property 26: User Permission Change Invalidation**
    - **Validates: Requirements 8.4**
  
  - [ ]* 14.8 Write property test for role permission change invalidation
    - **Property 27: Role Permission Change Invalidation**
    - **Validates: Requirements 8.5, 19.3**


- [x] 15. Implement Roles Module
  - [x] 15.1 Create RolesService with CRUD operations
    - Implement create method (validate creator has all permissions)
    - Implement findById method
    - Implement findByOrganization method
    - Implement update method
    - Implement delete method (check for user assignments)
    - Prevent modification/deletion of system roles
    - _Requirements: 19.1, 19.4, 19.6_
  
  - [ ]* 15.2 Write property test for role deletion prevention
    - **Property 64: Role Deletion Prevention**
    - **Validates: Requirements 19.4**
  
  - [ ]* 15.3 Write property test for system role protection
    - **Property 65: System Role Protection**
    - **Validates: Requirements 19.6**
  
  - [x] 15.4 Implement role-permission assignment methods
    - Implement assignPermissions method (create RolePermission records)
    - Implement removePermission method
    - Trigger cache invalidation for all users with role
    - _Requirements: 19.3_
  
  - [x] 15.5 Implement user-role assignment methods
    - Implement assignToUser method (create UserRole with scope)
    - Implement removeFromUser method
    - Validate delegation if assigning to team member
    - _Requirements: 19.2_
  
  - [ ]* 15.6 Write property test for role assignment with scope
    - **Property 63: Role Assignment with Scope**
    - **Validates: Requirements 19.2**
  
  - [ ]* 15.7 Write property test for role-based delegation validation
    - **Property 18: Role-Based Delegation Validation**
    - **Validates: Requirements 4.7**
  
  - [x] 15.8 Implement role query methods
    - Implement getRolePermissions method
    - Implement getUserRoles method (with context filtering)
    - _Requirements: 7.3_

- [ ] 16. Seed system-defined roles and permissions
  - Create seed script for system roles (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, VIEWER)
  - Create seed script for system permissions (module:action:resource format)
  - Assign permissions to system roles
  - _Requirements: 19.5_

- [ ] 17. Checkpoint - Ensure permission system is working
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Authentication System

- [x] 18. Implement Sessions Module
  - [x] 18.1 Create SessionsService with session lifecycle methods
    - Implement create method (store refresh token hash, device info)
    - Implement findById method
    - Implement findByRefreshToken method
    - Implement findUserSessions method
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 18.2 Write property test for session creation
    - **Property 11: Session Creation on Authentication**
    - **Validates: Requirements 3.3, 11.1**
  
  - [ ]* 18.3 Write property test for session independence
    - **Property 31: Session Independence**
    - **Validates: Requirements 11.2**
  
  - [x] 18.4 Implement session validation methods
    - Implement isValid method (check expiration, revocation)
    - Implement validateRefreshToken method
    - _Requirements: 11.7, 22.5_
  
  - [ ]* 18.5 Write property test for session expiration enforcement
    - **Property 35: Session Expiration Enforcement**
    - **Validates: Requirements 11.7**
  
  - [ ]* 18.6 Write property test for revoked token rejection
    - **Property 72: Revoked Token Rejection**
    - **Validates: Requirements 22.5**


  - [x] 18.7 Implement session revocation methods
    - Implement revoke method (set isRevoked=true)
    - Implement revokeAllExcept method (revoke all except current)
    - Implement revokeAll method
    - _Requirements: 11.3, 11.4_
  
  - [ ]* 18.8 Write property test for session revocation
    - **Property 32: Session Revocation**
    - **Validates: Requirements 11.3**
  
  - [ ]* 18.9 Write property test for logout all except current
    - **Property 33: Logout All Except Current**
    - **Validates: Requirements 11.4**
  
  - [x] 18.10 Implement token rotation
    - Implement rotateRefreshToken method (create new token, revoke old)
    - _Requirements: 11.6_
  
  - [ ]* 18.11 Write property test for refresh token rotation
    - **Property 34: Refresh Token Rotation**
    - **Validates: Requirements 11.6**
  
  - [x] 18.12 Implement cleanup method
    - Implement cleanupExpired method (delete expired sessions)
    - _Requirements: 11.7_

- [x] 19. Implement MFA Module
  - [x] 19.1 Create MFAService with TOTP methods
    - Implement generateSecret method (create TOTP secret, QR code, backup codes)
    - Implement enableTOTP method (validate code, set mfaEnabled=true)
    - Implement disableTOTP method (validate password and code)
    - Implement validateTOTP method
    - _Requirements: 13.1, 13.2, 13.7_
  
  - [ ]* 19.2 Write property test for MFA setup
    - **Property 40: MFA Setup Generates Secret and Backup Codes**
    - **Validates: Requirements 13.1, 13.3**
  
  - [ ]* 19.3 Write property test for MFA activation validation
    - **Property 41: MFA Activation Requires Validation**
    - **Validates: Requirements 13.2**
  
  - [ ]* 19.4 Write property test for MFA disable security
    - **Property 43: MFA Disable Requires Authentication**
    - **Validates: Requirements 13.7**
  
  - [x] 19.5 Implement backup code methods
    - Implement generateBackupCodes method (create 10 hashed codes)
    - Implement validateBackupCode method (check hash, mark as used)
    - Implement getRemainingBackupCodes method
    - _Requirements: 13.3, 13.5_
  
  - [ ]* 19.6 Write property test for backup code single use
    - **Property 42: Backup Code Single Use**
    - **Validates: Requirements 13.5**
  
  - [x] 19.7 Implement MFA status methods
    - Implement isMFAEnabled method
    - Implement getMFAStatus method
    - _Requirements: 13.4_


- [x] 20. Implement Auth Module (core authentication)
  - [x] 20.1 Create AuthService with token generation
    - Implement generateTokens method (create JWT with embedded permissions, refresh token)
    - Set token expiration (access: 15min, refresh: 7 days)
    - Embed user ID, org ID, roles, permissions in JWT
    - _Requirements: 3.4, 22.1, 22.2, 22.3_
  
  - [ ]* 20.2 Write property test for JWT structure
    - **Property 12: JWT Contains Required Claims**
    - **Validates: Requirements 3.4, 22.1**
  
  - [ ]* 20.3 Write property test for token expiration configuration
    - **Property 36: Token Expiration Configuration**
    - **Validates: Requirements 22.2, 22.3**
  
  - [x] 20.4 Implement token validation
    - Implement validateToken method (verify signature, expiration, org context)
    - _Requirements: 22.4, 16.3_
  
  - [ ]* 20.5 Write property test for token validation checks
    - **Property 71: Token Validation Checks**
    - **Validates: Requirements 22.4**
  
  - [ ]* 20.6 Write property test for JWT organization context enforcement
    - **Property 54: JWT Organization Context Enforcement**
    - **Validates: Requirements 16.3**
  
  - [x] 20.7 Implement token refresh
    - Implement refreshTokens method (validate refresh token, rotate, issue new tokens)
    - _Requirements: 11.6, 22.5_
  
  - [x] 20.8 Implement user validation for authentication
    - Implement validateUser method (find user, verify password, check status)
    - Check emailVerified, status (active), lockedUntil
    - Increment failedLoginAttempts on failure
    - _Requirements: 3.1, 3.2, 2.4, 6.4_
  
  - [ ]* 20.9 Write property test for invalid credentials increment counter
    - **Property 10: Invalid Credentials Increment Counter**
    - **Validates: Requirements 3.2**
  
  - [ ]* 20.10 Write property test for unverified email blocks login
    - **Property 14: Unverified Email Blocks Login**
    - **Validates: Requirements 2.4**
  
  - [ ]* 20.11 Write property test for inactive status blocks authentication
    - **Property 15: Inactive Status Blocks Authentication**
    - **Validates: Requirements 6.4, 21.1, 21.2, 12.4**
  
  - [x] 20.12 Implement login method
    - Implement login method (validate user, check MFA, generate tokens, create session)
    - Return temporary token if MFA required
    - _Requirements: 3.1, 3.6_
  
  - [ ]* 20.13 Write property test for valid credentials produce tokens
    - **Property 9: Valid Credentials Produce Tokens**
    - **Validates: Requirements 3.1, 6.1**
  
  - [ ]* 20.14 Write property test for MFA enforcement
    - **Property 13: MFA Enforcement**
    - **Validates: Requirements 3.6, 13.4**
  
  - [x] 20.15 Implement loginWithMFA method
    - Validate temporary token
    - Validate MFA code (TOTP or backup code)
    - Generate final tokens
    - _Requirements: 3.6, 13.4_


- [x] 21. Implement primary owner registration flow
  - [x] 21.1 Implement registerPrimaryOwner method
    - Validate input (email uniqueness, password strength)
    - Create organization (generate company code)
    - Hash password with Argon2id
    - Create user with SUPER_ADMIN role
    - Set emailVerified=false
    - Generate verification token
    - Send verification email
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ]* 21.2 Write property test for primary owner registration
    - **Property 1: Primary Owner Registration Creates Both Entities**
    - **Validates: Requirements 1.1**
  
  - [ ]* 21.3 Write property test for SUPER_ADMIN role assignment
    - **Property 2: Primary Owner Receives SUPER_ADMIN Role**
    - **Validates: Requirements 1.2**
  
  - [ ]* 21.4 Write property test for new accounts start unverified
    - **Property 5: New Accounts Start Unverified**
    - **Validates: Requirements 1.7**
  
  - [x] 21.5 Implement email verification flow
    - Implement sendVerificationEmail method (generate token, send email)
    - Implement verifyEmail method (validate token, set emailVerified=true)
    - Invalidate old tokens on new request
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [ ]* 21.6 Write property test for token uniqueness and expiration
    - **Property 6: Token Uniqueness and Expiration**
    - **Validates: Requirements 2.1, 4.2, 14.1**
  
  - [ ]* 21.7 Write property test for token invalidation on new request
    - **Property 7: Token Invalidation on New Request**
    - **Validates: Requirements 2.5, 14.6**
  
  - [x] 21.8 Implement onboarding initiation
    - Trigger onboarding flow after email verification for primary owners
    - _Requirements: 18.1_
  
  - [ ]* 21.9 Write property test for onboarding initiation
    - **Property 59: Onboarding Initiation for Primary Owners**
    - **Validates: Requirements 18.1**

- [x] 22. Implement password management
  - [x] 22.1 Implement password reset flow
    - Implement requestPasswordReset method (generate token, send email)
    - Implement resetPassword method (validate token, check password history, update password)
    - Invalidate sessions on password change
    - Audit log password reset
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ]* 22.2 Write property test for password reset token validation
    - **Property 44: Password Reset Token Validation**
    - **Validates: Requirements 14.2**
  
  - [ ]* 22.3 Write property test for password change invalidates sessions
    - **Property 45: Password Change Invalidates Sessions**
    - **Validates: Requirements 14.3**
  
  - [ ]* 22.4 Write property test for password history enforcement
    - **Property 46: Password History Enforcement**
    - **Validates: Requirements 14.4**
  
  - [x] 22.5 Implement changePassword method
    - Validate old password
    - Check password history
    - Update password
    - Invalidate sessions except current
    - _Requirements: 14.3, 14.4_

- [ ] 23. Checkpoint - Ensure authentication system is working
  - Ensure all tests pass, ask the user if questions arise.


### Phase 5: Invitation and Hierarchical User Management

- [x] 24. Implement invitation system in Users Module
  - [x] 24.1 Implement createInvitation method
    - Validate creator permissions (delegation validation)
    - Validate location access
    - Validate role permissions
    - Generate invitation token (7-day expiry)
    - Create invitation record with delegation data
    - Send invitation email with company code
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_
  
  - [ ]* 24.2 Write property test for location-scoped delegation validation
    - **Property 17: Location-Scoped Delegation Validation**
    - **Validates: Requirements 4.6**
  
  - [x] 24.3 Implement validateInvitation method
    - Check token validity (not expired, not used)
    - Return invitation with delegation data
    - _Requirements: 5.1_
  
  - [x] 24.4 Implement acceptInvitation method (team member registration)
    - Validate invitation token
    - Hash password
    - Create user with delegated permissions
    - Create hierarchy record (link to creator)
    - Assign roles with scope
    - Assign locations
    - Mark email as verified
    - Skip onboarding flow
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_
  
  - [ ]* 24.5 Write property test for hierarchy recording
    - **Property 19: Hierarchy Recording**
    - **Validates: Requirements 4.5, 5.2, 24.1**
  
  - [ ]* 24.6 Write property test for team member email auto-verification
    - **Property (combined with 5.5): Team member accounts start verified**
    - **Validates: Requirements 5.5**
  
  - [ ]* 24.7 Write property test for team members skip onboarding
    - **Property 62: Team Members Skip Onboarding**
    - **Validates: Requirements 18.7**

- [x] 25. Implement user hierarchy methods
  - [x] 25.1 Implement getHierarchy method
    - Traverse hierarchy chain to Primary_Owner
    - Return complete parent chain
    - _Requirements: 24.2_
  
  - [ ]* 25.2 Write property test for hierarchy chain completeness
    - **Property 20: Hierarchy Chain Completeness**
    - **Validates: Requirements 24.2**
  
  - [x] 25.3 Implement getCreatedUsers method
    - Query users where createdBy = creatorId
    - Support filtering by creator
    - _Requirements: 24.4_
  
  - [ ]* 25.4 Write property test for creator filtering
    - **Property 75: Creator Filtering**
    - **Validates: Requirements 24.4**

- [x] 26. Implement automatic location access for Primary_Owner
  - [x] 26.1 Add logic to grant Primary_Owner access to all locations
    - On Primary_Owner creation, grant access to all existing locations
    - On new location creation, grant access to Primary_Owner
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 26.2 Write property test for primary owner automatic location access
    - **Property 29: Primary Owner Automatic Location Access**
    - **Validates: Requirements 10.4, 10.5**

- [ ] 27. Checkpoint - Ensure invitation system is working
  - Ensure all tests pass, ask the user if questions arise.


### Phase 6: Rate Limiting and Security Features

- [x] 28. Implement Rate Limiting Module
  - [x] 28.1 Set up @nestjs/throttler with Redis storage
    - Install @nestjs/throttler
    - Configure ThrottlerModule with Redis storage
    - Set global rate limits
    - _Requirements: 12.1_
  
  - [x] 28.2 Implement custom rate limiting guards
    - Create IP-based rate limiter (per-endpoint limits)
    - Create user-based rate limiter (authenticated user limits)
    - Implement sliding window algorithm
    - _Requirements: 12.6, 12.7_
  
  - [ ]* 28.3 Write property test for rate limit enforcement
    - **Property 37: Rate Limit Enforcement**
    - **Validates: Requirements 12.1, 12.6, 12.7**
  
  - [x] 28.4 Implement brute force protection
    - Track failed login attempts per user
    - Implement progressive delays (1s, 2s, 4s, 8s, 16s) after 5 failures
    - Lock account for 30 minutes after 10 failures
    - _Requirements: 12.2, 12.3_
  
  - [ ]* 28.5 Write property test for progressive delay implementation
    - **Property 38: Progressive Delay Implementation**
    - **Validates: Requirements 12.2**
  
  - [ ]* 28.6 Write property test for account lockout
    - **Property 39: Account Lockout After Threshold**
    - **Validates: Requirements 12.3**

- [x] 29. Implement audit logging for authentication events
  - [x] 29.1 Add audit logging to authentication flows
    - Log authentication success/failure with IP and device info
    - Log permission changes with before/after states
    - Log user lifecycle events with actor info
    - _Requirements: 15.2, 15.3, 15.4_
  
  - [ ]* 29.2 Write property test for authentication event logging
    - **Property 48: Authentication Event Logging**
    - **Validates: Requirements 15.2**
  
  - [ ]* 29.3 Write property test for permission change logging
    - **Property 49: Permission Change Logging**
    - **Validates: Requirements 15.3**
  
  - [ ]* 29.4 Write property test for user lifecycle event logging
    - **Property 50: User Lifecycle Event Logging**
    - **Validates: Requirements 15.4**

- [x] 30. Implement cross-tenant access prevention
  - [x] 30.1 Create tenant isolation middleware
    - Extract organization ID from JWT
    - Inject into request context
    - Validate all queries include organization filter
    - _Requirements: 16.1, 16.3_
  
  - [ ]* 30.2 Write property test for cross-tenant access denial
    - **Property 53: Cross-Tenant Access Denial**
    - **Validates: Requirements 16.4**

- [ ] 31. Checkpoint - Ensure security features are working
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: OAuth Integration

- [x] 32. Implement OAuth Module
  - [x] 32.1 Set up Passport OAuth strategies
    - Install @nestjs/passport, passport-google-oauth20, passport-microsoft
    - Configure GoogleStrategy
    - Configure MicrosoftStrategy
    - _Requirements: 17.1, 17.6_
  
  - [x] 32.2 Implement OAuth authentication flow
    - Implement OAuth callback handler
    - Exchange authorization code for tokens
    - Create or link user account based on email
    - Store encrypted OAuth tokens
    - _Requirements: 17.2, 17.3, 17.4_
  
  - [ ]* 32.3 Write property test for OAuth account linking
    - **Property 57: OAuth Account Linking**
    - **Validates: Requirements 17.3**
  
  - [ ]* 32.4 Write property test for OAuth token encryption
    - **Property 58: OAuth Token Encryption**
    - **Validates: Requirements 17.4, 23.2**


### Phase 8: API Layer and Guards

- [x] 33. Implement Passport strategies for local authentication
  - [x] 33.1 Create LocalStrategy for email/password authentication
    - Implement validate method (call AuthService.validateUser)
    - Handle primary owner login (email + password)
    - _Requirements: 3.1_
  
  - [x] 33.2 Create LocalTeamMemberStrategy for company code authentication
    - Implement validate method with company code context
    - Handle team member login (company code + username + password)
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 33.3 Write property test for team member authentication with company code
    - **Property (combined with 6.1): Team member authentication requires company code**
    - **Validates: Requirements 6.1, 6.2**
  
  - [x] 33.4 Create JwtStrategy for protected routes
    - Implement validate method (extract user from JWT payload)
    - Validate organization context
    - _Requirements: 22.4, 16.3_

- [x] 34. Implement authentication guards
  - [x] 34.1 Create JwtAuthGuard
    - Extend @nestjs/passport AuthGuard('jwt')
    - Extract and validate JWT
    - Inject user into request
    - _Requirements: 3.4, 22.4_
  
  - [x] 34.2 Create PermissionsGuard
    - Extract required permissions from route metadata
    - Call PermissionsService.hasPermission
    - Deny access if permission check fails
    - _Requirements: 7.3, 7.4, 7.5_
  
  - [x] 34.3 Create RolesGuard
    - Extract required roles from route metadata
    - Check user roles
    - Deny access if role check fails
    - _Requirements: 19.2_

- [x] 35. Implement decorators for route protection
  - [x] 35.1 Create @Permissions decorator
    - Accept permission strings
    - Set metadata for PermissionsGuard
    - _Requirements: 7.3_
  
  - [x] 35.2 Create @Roles decorator
    - Accept role strings
    - Set metadata for RolesGuard
    - _Requirements: 19.2_
  
  - [x] 35.3 Create @CurrentUser decorator
    - Extract user from request
    - Provide user object to controller methods
    - _Requirements: 3.4_
  
  - [x] 35.4 Create @Organization decorator
    - Extract organization ID from request
    - Provide organization context to controller methods
    - _Requirements: 16.3_

- [x] 36. Implement Auth Controller (API endpoints)
  - [x] 36.1 Create POST /auth/register endpoint
    - Accept RegisterDto (email, password, organizationName)
    - Call AuthService.registerPrimaryOwner
    - Return success response
    - _Requirements: 1.1_
  
  - [x] 36.2 Create POST /auth/verify-email endpoint
    - Accept token
    - Call AuthService.verifyEmail
    - Return success response
    - _Requirements: 2.2_
  
  - [x] 36.3 Create POST /auth/resend-verification endpoint
    - Accept email
    - Call AuthService.sendVerificationEmail
    - Return success response
    - _Requirements: 2.5_
  
  - [x] 36.4 Create POST /auth/login endpoint
    - Use LocalStrategy guard
    - Call AuthService.login
    - Return tokens and user data
    - _Requirements: 3.1_
  
  - [x] 36.5 Create POST /auth/login/team-member endpoint
    - Use LocalTeamMemberStrategy guard
    - Call AuthService.login
    - Return tokens and user data
    - _Requirements: 6.1_
  
  - [x] 36.6 Create POST /auth/login/mfa endpoint
    - Accept temporary token and MFA code
    - Call AuthService.loginWithMFA
    - Return final tokens
    - _Requirements: 3.6_
  
  - [x] 36.7 Create POST /auth/refresh endpoint
    - Accept refresh token
    - Call AuthService.refreshTokens
    - Return new tokens
    - _Requirements: 11.6_
  
  - [x] 36.8 Create POST /auth/logout endpoint
    - Use JwtAuthGuard
    - Call SessionsService.revoke
    - Return success response
    - _Requirements: 11.3_
  
  - [x] 36.9 Create POST /auth/logout-all endpoint
    - Use JwtAuthGuard
    - Call SessionsService.revokeAllExcept
    - Return success response
    - _Requirements: 11.4_
  
  - [x] 36.10 Create POST /auth/password-reset/request endpoint
    - Accept email
    - Call AuthService.requestPasswordReset
    - Return success response
    - _Requirements: 14.1_
  
  - [x] 36.11 Create POST /auth/password-reset/confirm endpoint
    - Accept token and new password
    - Call AuthService.resetPassword
    - Return success response
    - _Requirements: 14.2_
  
  - [x] 36.12 Create POST /auth/password/change endpoint
    - Use JwtAuthGuard
    - Accept old password and new password
    - Call AuthService.changePassword
    - Return success response
    - _Requirements: 14.3_


- [x] 37. Implement Users Controller (API endpoints)
  - [x] 37.1 Create POST /users/invite endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Accept InviteUserDto
    - Call UsersService.createInvitation
    - Return invitation details
    - _Requirements: 4.1_
  
  - [x] 37.2 Create POST /users/register/invitation endpoint
    - Accept invitation token and AcceptInvitationDto
    - Call UsersService.acceptInvitation
    - Return success response
    - _Requirements: 5.1_
  
  - [x] 37.3 Create GET /users/:id endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Call UsersService.findById
    - Return user data
    - _Requirements: 16.2_
  
  - [x] 37.4 Create PATCH /users/:id endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Accept UpdateUserDto
    - Call UsersService.update
    - Return updated user
    - _Requirements: 15.4_
  
  - [x] 37.5 Create DELETE /users/:id endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Call UsersService.delete
    - Return success response
    - _Requirements: 15.4_
  
  - [x] 37.6 Create POST /users/:id/suspend endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Call UsersService.suspend
    - Return success response
    - _Requirements: 21.1_
  
  - [x] 37.7 Create POST /users/:id/reactivate endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Call UsersService.reactivate
    - Return success response
    - _Requirements: 21.5_
  
  - [x] 37.8 Create GET /users/:id/hierarchy endpoint
    - Use JwtAuthGuard
    - Call UsersService.getHierarchy
    - Return hierarchy chain
    - _Requirements: 24.2_
  
  - [x] 37.9 Create GET /users/:id/created-users endpoint
    - Use JwtAuthGuard
    - Call UsersService.getCreatedUsers
    - Return created users list
    - _Requirements: 24.4_

- [x] 38. Implement Roles Controller (API endpoints)
  - [x] 38.1 Create POST /roles endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Accept CreateRoleDto
    - Call RolesService.create
    - Return created role
    - _Requirements: 19.1_
  
  - [x] 38.2 Create GET /roles/:id endpoint
    - Use JwtAuthGuard
    - Call RolesService.findById
    - Return role data
    - _Requirements: 19.1_
  
  - [x] 38.3 Create PATCH /roles/:id endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Accept UpdateRoleDto
    - Call RolesService.update
    - Return updated role
    - _Requirements: 19.6_
  
  - [x] 38.4 Create DELETE /roles/:id endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Call RolesService.delete
    - Return success response
    - _Requirements: 19.4_
  
  - [x] 38.5 Create POST /roles/:id/permissions endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Accept permission IDs
    - Call RolesService.assignPermissions
    - Return success response
    - _Requirements: 19.3_
  
  - [x] 38.6 Create POST /roles/:id/assign endpoint
    - Use JwtAuthGuard and PermissionsGuard
    - Accept user ID and scope
    - Call RolesService.assignToUser
    - Return success response
    - _Requirements: 19.2_

- [x] 39. Implement MFA Controller (API endpoints)
  - [x] 39.1 Create POST /mfa/setup endpoint
    - Use JwtAuthGuard
    - Call MFAService.generateSecret
    - Return secret, QR code, backup codes
    - _Requirements: 13.1_
  
  - [x] 39.2 Create POST /mfa/enable endpoint
    - Use JwtAuthGuard
    - Accept TOTP code
    - Call MFAService.enableTOTP
    - Return success response
    - _Requirements: 13.2_
  
  - [x] 39.3 Create POST /mfa/disable endpoint
    - Use JwtAuthGuard
    - Accept password and TOTP code
    - Call MFAService.disableTOTP
    - Return success response
    - _Requirements: 13.7_
  
  - [x] 39.4 Create GET /mfa/status endpoint
    - Use JwtAuthGuard
    - Call MFAService.getMFAStatus
    - Return MFA status
    - _Requirements: 13.4_
  
  - [x] 39.5 Create POST /mfa/backup-codes/regenerate endpoint
    - Use JwtAuthGuard
    - Call MFAService.generateBackupCodes
    - Return new backup codes
    - _Requirements: 13.3_

- [ ] 40. Implement Sessions Controller (API endpoints)
  - [ ] 40.1 Create GET /sessions endpoint
    - Use JwtAuthGuard
    - Call SessionsService.findUserSessions
    - Return active sessions list
    - _Requirements: 11.2_
  
  - [ ] 40.2 Create DELETE /sessions/:id endpoint
    - Use JwtAuthGuard
    - Call SessionsService.revoke
    - Return success response
    - _Requirements: 11.3_

- [ ] 41. Checkpoint - Ensure API layer is working
  - Ensure all tests pass, ask the user if questions arise.


### Phase 9: Integration Testing and Final Validation

- [ ] 42. Write integration tests for complete authentication flows
  - [ ]* 42.1 Write integration test for primary owner registration flow
    - Test complete flow: register → verify email → login
    - Verify organization and user creation
    - Verify SUPER_ADMIN role assignment
    - _Requirements: 1.1, 1.2, 2.2, 3.1_
  
  - [ ]* 42.2 Write integration test for team member invitation flow
    - Test complete flow: invite → accept → login
    - Verify delegation validation
    - Verify hierarchy creation
    - _Requirements: 4.1, 5.1, 6.1_
  
  - [ ]* 42.3 Write integration test for MFA flow
    - Test complete flow: enable MFA → login with MFA → use backup code
    - Verify TOTP validation
    - Verify backup code single use
    - _Requirements: 13.1, 13.2, 13.4, 13.5_
  
  - [ ]* 42.4 Write integration test for password reset flow
    - Test complete flow: request reset → reset password → login
    - Verify token validation
    - Verify session invalidation
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 42.5 Write integration test for session management
    - Test multiple sessions
    - Test session revocation
    - Test logout all devices
    - _Requirements: 11.2, 11.3, 11.4_
  
  - [ ]* 42.6 Write integration test for permission evaluation
    - Test direct grants/denials
    - Test role-based permissions
    - Test location-scoped permissions
    - Test cache invalidation
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 8.4_
  
  - [ ]* 42.7 Write integration test for multi-tenant isolation
    - Test cross-tenant access prevention
    - Test organization boundary enforcement
    - _Requirements: 16.2, 16.4_
  
  - [ ]* 42.8 Write integration test for rate limiting
    - Test rate limit enforcement
    - Test brute force protection
    - Test account lockout
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 43. Write E2E tests for API endpoints
  - [ ]* 43.1 Write E2E tests for auth endpoints
    - Test POST /auth/register
    - Test POST /auth/login
    - Test POST /auth/refresh
    - Test POST /auth/logout
    - _Requirements: 1.1, 3.1, 11.6, 11.3_
  
  - [ ]* 43.2 Write E2E tests for user endpoints
    - Test POST /users/invite
    - Test POST /users/register/invitation
    - Test GET /users/:id
    - Test PATCH /users/:id
    - _Requirements: 4.1, 5.1, 16.2_
  
  - [ ]* 43.3 Write E2E tests for role endpoints
    - Test POST /roles
    - Test POST /roles/:id/permissions
    - Test POST /roles/:id/assign
    - _Requirements: 19.1, 19.3, 19.2_
  
  - [ ]* 43.4 Write E2E tests for MFA endpoints
    - Test POST /mfa/setup
    - Test POST /mfa/enable
    - Test POST /mfa/disable
    - _Requirements: 13.1, 13.2, 13.7_

- [ ] 44. Implement error handling and validation
  - [ ] 44.1 Create global exception filter
    - Implement consistent error response format
    - Add correlation IDs
    - Log errors with context
    - Mask sensitive information
    - _Requirements: Error Handling section_
  
  - [ ] 44.2 Create validation pipes
    - Use class-validator for DTO validation
    - Return detailed validation errors
    - _Requirements: Error Handling section_
  
  - [ ] 44.3 Implement error responses for all error categories
    - Validation errors (400)
    - Authentication errors (401)
    - Authorization errors (403)
    - Resource errors (404)
    - Conflict errors (409)
    - Rate limit errors (429)
    - Server errors (500)
    - _Requirements: Error Handling section_

- [ ] 45. Final checkpoint - Comprehensive system validation
  - Run all unit tests
  - Run all property-based tests (75 properties)
  - Run all integration tests
  - Run all E2E tests
  - Verify code coverage ≥ 80%
  - Verify all 25 requirements are covered
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (75 total)
- Integration tests validate complete workflows
- E2E tests validate API endpoints
- The system is built in phases: infrastructure → core modules → authentication → invitation → security → API → testing
- All property-based tests run minimum 100 iterations
- Each property test references its design document property number
