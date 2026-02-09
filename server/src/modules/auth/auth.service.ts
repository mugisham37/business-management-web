import { Injectable, UnauthorizedException, ForbiddenException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { UsersService } from '../users/users.service';
import { SessionsService, SessionMetadata } from '../sessions/sessions.service';
import { MFAService } from '../mfa/mfa.service';
import { PermissionsService } from '../permissions/permissions.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { AuditService } from '../../common/audit/audit.service';
import { RateLimitService } from '../../common/rate-limit/rate-limit.service';
import { User, Organization } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult extends TokenPair {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
  };
}

export interface MFARequiredResult {
  requiresMFA: true;
  tempToken: string;
  userId: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  organizationName: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    companyCode: string;
  };
  message: string;
}

/**
 * Auth Service for core authentication operations
 * 
 * Features:
 * - Token generation (JWT access tokens and refresh tokens)
 * - Token validation and refresh
 * - User validation for authentication
 * - Login with MFA support
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.6, 11.6, 22.1, 22.2, 22.3, 22.4, 22.5
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // JWT configuration
  private readonly JWT_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days
  private readonly TEMP_TOKEN_EXPIRY = '5m'; // 5 minutes for MFA flow

  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly mfa: MFAService,
    private readonly permissions: PermissionsService,
    private readonly organizations: OrganizationsService,
    private readonly audit: AuditService,
    private readonly rateLimit: RateLimitService,
  ) {
    // Initialize JWT secret from environment
    this.JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
    if (this.JWT_SECRET === 'development-secret-change-in-production') {
      this.logger.warn('WARNING: Using default JWT secret. Set JWT_SECRET in production.');
    }
  }

  /**
   * Generate access and refresh tokens
   * 
   * Requirement 3.4: WHEN authentication succeeds, THE Auth_System SHALL return 
   * a JWT containing user ID, organization ID, and embedded permissions
   * 
   * Requirement 22.1: WHEN an access token is generated, THE Auth_System SHALL 
   * embed user ID, organization ID, roles, and permissions
   * 
   * Requirement 22.2: WHEN an access token is generated, THE Auth_System SHALL 
   * set expiration to 15 minutes
   * 
   * Requirement 22.3: WHEN a refresh token is generated, THE Auth_System SHALL 
   * set expiration to 7 days
   * 
   * @param user - User object
   * @param permissionCodes - Array of permission codes
   * @returns Token pair (access token and refresh token)
   */
  async generateTokens(user: User, permissionCodes: string[]): Promise<TokenPair> {
    try {
      // Get user roles
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: {
          role: true,
        },
      });

      const roleCodes = userRoles.map(ur => ur.role.code);

      // Create JWT payload
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
        roles: roleCodes,
        permissions: permissionCodes,
      };

      // Generate access token (15 minutes)
      const accessToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      });

      // Generate refresh token (secure random token)
      const refreshToken = this.security.generateSecureToken();

      this.logger.debug(`Tokens generated for user: ${user.id}`);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(`Failed to generate tokens for user: ${user.id}`, error);
      throw error;
    }
  }

  /**
   * Validate a JWT token
   * 
   * Requirement 22.4: WHEN a token is validated, THE Auth_System SHALL verify 
   * signature, expiration, and organization context
   * 
   * Requirement 16.3: WHEN a JWT is validated, THE Auth_System SHALL extract 
   * and enforce the organization context
   * 
   * @param token - JWT access token
   * @returns Decoded JWT payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      // Verify and decode token
      const payload = jwt.verify(token, this.JWT_SECRET) as JwtPayload;

      // Verify user still exists and is active
      const user = await this.users.findById(payload.sub, payload.organizationId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('User account is not active');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw error;
    }
  }

  /**
   * Refresh access and refresh tokens
   * 
   * Requirement 11.6: WHEN a refresh token is used, THE Session_Manager SHALL 
   * rotate the refresh token and invalidate the old one
   * 
   * Requirement 22.5: WHEN a refresh token is used, THE Auth_System SHALL 
   * validate it has not been revoked
   * 
   * @param refreshToken - Current refresh token
   * @returns New token pair
   * @throws UnauthorizedException if refresh token is invalid or revoked
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Rotate refresh token (validates and creates new one)
      const { newToken, session } = await this.sessions.rotateRefreshToken(refreshToken);

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new UnauthorizedException('User account is not active');
      }

      // Get user permissions
      const permissionCodes = await this.permissions.getUserPermissions(user.id);

      // Generate new access token
      const tokens = await this.generateTokens(user, permissionCodes);

      // Return new access token with rotated refresh token
      return {
        accessToken: tokens.accessToken,
        refreshToken: newToken,
      };
    } catch (error) {
      this.logger.error('Failed to refresh tokens:', error);
      throw error;
    }
  }

  /**
   * Validate user credentials for authentication
   * 
   * Requirement 3.1: WHEN a user submits valid email and password credentials, 
   * THE Auth_System SHALL authenticate the user and return access and refresh tokens
   * 
   * Requirement 3.2: WHEN invalid credentials are submitted, THE Auth_System SHALL 
   * reject authentication and increment failed attempt counter
   * 
   * Requirement 2.4: WHEN a user attempts to login with an unverified email, 
   * THE Auth_System SHALL prevent login and prompt for verification
   * 
   * Requirement 6.4: WHEN a Team_Member account is suspended or deactivated, 
   * THE Auth_System SHALL reject authentication
   * 
   * Requirement 12.2: WHEN authentication attempts fail 5 times for a user, 
   * THE Rate_Limiter SHALL implement progressive delays (1s, 2s, 4s, 8s, 16s)
   * 
   * Requirement 12.3: WHEN authentication attempts fail 10 times for a user, 
   * THE Auth_System SHALL lock the account for 30 minutes
   * 
   * @param identifier - Email or username
   * @param password - Plain text password
   * @param organizationId - Organization ID (required for team members)
   * @returns User if valid, null otherwise
   */
  async validateUser(
    identifier: string,
    password: string,
    organizationId?: string,
  ): Promise<User | null> {
    try {
      let user: User | null = null;

      // Find user by email or username
      if (organizationId) {
        // Team member login (username + company code)
        user = await this.users.findByUsername(identifier, organizationId);
        if (!user) {
          user = await this.users.findByEmail(identifier, organizationId);
        }
      } else {
        // Primary owner login (email only)
        // Need to find organization by email first
        const userWithOrg = await this.prisma.user.findFirst({
          where: { email: identifier },
        });
        if (userWithOrg) {
          user = userWithOrg;
          organizationId = userWithOrg.organizationId;
        }
      }

      if (!user) {
        this.logger.debug(`User not found: ${identifier}`);
        
        // Track failed login attempt in Redis (for rate limiting)
        await this.rateLimit.trackFailedLogin(identifier);
        
        return null;
      }

      // Check Redis-based account lock (from brute force protection)
      const lockStatus = await this.rateLimit.isAccountLocked(user.id);
      if (lockStatus.locked) {
        throw new ForbiddenException(
          `Account is temporarily locked due to too many failed login attempts. Please try again later. Lock expires at: ${lockStatus.expiresAt}`,
        );
      }

      // Check if email is verified
      if (!user.emailVerified) {
        this.logger.debug(`Email not verified for user: ${user.id}`);
        throw new ForbiddenException('Email not verified. Please verify your email before logging in.');
      }

      // Check user status
      if (user.status === 'suspended') {
        throw new ForbiddenException('Account is suspended');
      }

      if (user.status === 'deactivated') {
        throw new ForbiddenException('Account is deactivated');
      }

      if (user.status === 'locked') {
        // Check if lock has expired
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new ForbiddenException(`Account is locked until ${user.lockedUntil.toISOString()}`);
        } else {
          // Auto-unlock if lock period has passed
          await this.users.unlock(user.id, user.organizationId);
          user.status = 'active';
          user.lockedUntil = null;
          user.failedLoginAttempts = 0;
        }
      }

      // Get failed login count from Redis
      const failedAttempts = await this.rateLimit.getFailedLoginCount(identifier);

      // Calculate and apply progressive delay if needed (after 5 failures)
      const delay = this.rateLimit.calculateProgressiveDelay(failedAttempts);
      if (delay > 0) {
        this.logger.warn(
          `Applying progressive delay of ${delay}ms for user ${identifier} (${failedAttempts} failed attempts)`,
        );
        await this.rateLimit.applyProgressiveDelay(delay);
      }

      // Verify password
      const isPasswordValid = await this.security.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        // Track failed login attempt in Redis
        const newFailedAttempts = await this.rateLimit.trackFailedLogin(identifier);

        // Also increment database counter for consistency
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lastLoginAt: new Date(),
          },
        });

        // Check if account should be locked (10 failures)
        if (this.rateLimit.shouldLockAccount(newFailedAttempts)) {
          // Lock account in Redis (30 minutes)
          await this.rateLimit.lockAccount(
            user.id,
            'Too many failed login attempts',
          );

          // Also lock in database
          await this.users.lock(
            user.id,
            user.organizationId,
            'Too many failed login attempts',
            30,
          );

          throw new ForbiddenException(
            'Account locked due to too many failed login attempts. Please try again in 30 minutes.',
          );
        }

        this.logger.debug(`Invalid password for user: ${user.id} (attempt ${newFailedAttempts})`);
        return null;
      }

      // Reset failed login attempts on successful validation
      await this.rateLimit.resetFailedLogins(identifier);
      
      if (user.failedLoginAttempts > 0) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Failed to validate user:', error);
      return null;
    }
  }

  /**
   * Login user and generate tokens
   * 
   * Requirement 3.1: WHEN a user submits valid email and password credentials, 
   * THE Auth_System SHALL authenticate the user and return access and refresh tokens
   * 
   * Requirement 3.6: WHEN a user has MFA enabled, THE Auth_System SHALL require 
   * MFA validation before issuing tokens
   * 
   * Requirement 15.2: WHEN authentication succeeds or fails, THE Audit_Logger SHALL 
   * record the event with IP address and device information
   * 
   * @param user - Validated user
   * @param metadata - Session metadata (IP, user agent, etc.)
   * @returns Login result with tokens or MFA required response
   */
  async login(
    user: User,
    metadata: SessionMetadata,
  ): Promise<LoginResult | MFARequiredResult> {
    try {
      // Check if MFA is enabled
      const mfaEnabled = await this.mfa.isMFAEnabled(user.id, user.organizationId);

      if (mfaEnabled) {
        // Generate temporary token for MFA flow
        const tempPayload = {
          sub: user.id,
          email: user.email,
          organizationId: user.organizationId,
          type: 'mfa-temp',
        };

        const tempToken = jwt.sign(tempPayload, this.JWT_SECRET, {
          expiresIn: this.TEMP_TOKEN_EXPIRY,
        });

        // Audit log MFA required
        await this.audit.log({
          organizationId: user.organizationId,
          userId: user.id,
          action: 'login_mfa_required',
          resource: 'authentication',
          resourceId: user.id,
          outcome: 'success',
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          metadata: {
            email: user.email,
            deviceFingerprint: metadata.deviceFingerprint,
            location: metadata.location,
          },
        });

        this.logger.log(`MFA required for user: ${user.id}`);

        return {
          requiresMFA: true,
          tempToken,
          userId: user.id,
        };
      }

      // Get user permissions
      const permissionCodes = await this.permissions.getUserPermissions(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user, permissionCodes);

      // Create session
      await this.sessions.create(user.id, tokens.refreshToken, metadata);

      // Update last login time
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      // Audit log successful authentication
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'login_success',
        resource: 'authentication',
        resourceId: user.id,
        outcome: 'success',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: {
          email: user.email,
          deviceFingerprint: metadata.deviceFingerprint,
          location: metadata.location,
          permissionCount: permissionCodes.length,
        },
      });

      this.logger.log(`User logged in: ${user.id}`);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
        },
      };
    } catch (error) {
      // Audit log failed authentication
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'login_failed',
        resource: 'authentication',
        resourceId: user.id,
        outcome: 'failure',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: {
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      this.logger.error(`Failed to login user: ${user.id}`, error);
      throw error;
    }
  }

  /**
   * Complete login with MFA validation
   * 
   * Requirement 3.6: WHEN a user has MFA enabled, THE Auth_System SHALL require 
   * MFA validation before issuing tokens
   * 
   * Requirement 13.4: WHEN a user has MFA enabled, THE Auth_System SHALL require 
   * a valid TOTP code or backup code
   * 
   * Requirement 15.2: WHEN authentication succeeds or fails, THE Audit_Logger SHALL 
   * record the event with IP address and device information
   * 
   * @param tempToken - Temporary token from initial login
   * @param mfaCode - TOTP code or backup code
   * @param metadata - Session metadata (IP, user agent, etc.)
   * @returns Login result with tokens
   * @throws UnauthorizedException if MFA code is invalid
   */
  async loginWithMFA(
    tempToken: string,
    mfaCode: string,
    metadata: SessionMetadata,
  ): Promise<LoginResult> {
    try {
      // Validate temporary token
      let payload: any;
      try {
        payload = jwt.verify(tempToken, this.JWT_SECRET);
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired temporary token');
      }

      // Verify it's a temp token
      if (payload.type !== 'mfa-temp') {
        throw new UnauthorizedException('Invalid token type');
      }

      const userId = payload.sub;
      const organizationId = payload.organizationId;

      // Get user
      const user = await this.users.findById(userId, organizationId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Validate MFA code (try TOTP first, then backup code)
      let isValid = await this.mfa.validateTOTP(userId, organizationId, mfaCode);

      if (!isValid) {
        // Try backup code
        isValid = await this.mfa.validateBackupCode(userId, organizationId, mfaCode);
      }

      if (!isValid) {
        // Audit log failed MFA validation
        await this.audit.log({
          organizationId: user.organizationId,
          userId: user.id,
          action: 'login_mfa_failed',
          resource: 'authentication',
          resourceId: user.id,
          outcome: 'failure',
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          metadata: {
            email: user.email,
            reason: 'Invalid MFA code',
          },
        });

        throw new UnauthorizedException('Invalid MFA code');
      }

      // Get user permissions
      const permissionCodes = await this.permissions.getUserPermissions(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user, permissionCodes);

      // Create session
      await this.sessions.create(user.id, tokens.refreshToken, metadata);

      // Update last login time
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      // Audit log successful MFA authentication
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'login_mfa_success',
        resource: 'authentication',
        resourceId: user.id,
        outcome: 'success',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: {
          email: user.email,
          deviceFingerprint: metadata.deviceFingerprint,
          location: metadata.location,
          permissionCount: permissionCodes.length,
        },
      });

      this.logger.log(`User logged in with MFA: ${user.id}`);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Failed to login with MFA:', error);
      throw new UnauthorizedException('MFA validation failed');
    }
  }

  /**
   * Register a primary owner with organization
   * 
   * Requirement 1.1: WHEN a user submits registration with email, password, and 
   * organization name, THE Auth_System SHALL create both an organization and a user account
   * 
   * Requirement 1.2: WHEN a user registers, THE Auth_System SHALL assign the 
   * SUPER_ADMIN role to the Primary_Owner
   * 
   * Requirement 1.3: WHEN registration is submitted, THE Auth_System SHALL send 
   * a verification email to the provided address
   * 
   * Requirement 1.4: WHEN a user attempts to register with an existing email, 
   * THE Auth_System SHALL reject the registration with a descriptive error
   * 
   * Requirement 1.5: WHEN a password is provided during registration, THE Auth_System 
   * SHALL validate it meets minimum strength requirements
   * 
   * Requirement 1.6: WHEN a password is stored, THE Auth_System SHALL hash it 
   * using Argon2id with secure parameters
   * 
   * Requirement 1.7: WHEN registration completes, THE Auth_System SHALL create 
   * an unverified user account that requires email verification before full access
   * 
   * @param dto - Registration data (email, password, organizationName)
   * @returns Registration result with user and organization data
   */
  async registerPrimaryOwner(dto: RegisterDto): Promise<RegisterResult> {
    try {
      // Validate email uniqueness across all organizations
      const existingUser = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email address is already registered');
      }

      // Validate password strength
      const passwordValidation = this.security.validatePasswordStrength(dto.password);
      if (!passwordValidation.isValid) {
        throw new ForbiddenException(
          `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
        );
      }

      // Create organization
      const organization = await this.organizations.create({
        name: dto.organizationName,
        email: dto.email,
      });

      this.logger.log(`Organization created: ${organization.id} (${organization.companyCode})`);

      // Hash password with Argon2id
      const passwordHash = await this.security.hashPassword(dto.password);

      // Use provided names or extract from email as fallback
      let firstName = dto.firstName || '';
      let lastName = dto.lastName || '';

      if (!firstName || !lastName) {
        // Extract first and last name from email (simple approach)
        const emailLocalPart = dto.email.split('@')[0];
        const nameParts = emailLocalPart.split(/[._-]/);
        firstName = firstName || nameParts[0] || 'User';
        lastName = lastName || nameParts[1] || 'Owner';
      }

      // Create user with SUPER_ADMIN role
      // Note: emailVerified is set to false by default
      const user = await this.prisma.user.create({
        data: {
          organizationId: organization.id,
          email: dto.email,
          passwordHash,
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
          lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase(),
          status: 'active',
          emailVerified: false,
        },
      });

      this.logger.log(`Primary owner created: ${user.id} (${user.email})`);

      // Assign SUPER_ADMIN role
      // First, find the SUPER_ADMIN role for this organization
      const superAdminRole = await this.prisma.role.findFirst({
        where: {
          organizationId: organization.id,
          code: 'SUPER_ADMIN',
          isSystem: true,
        },
      });

      if (superAdminRole) {
        // Assign role with global scope
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: superAdminRole.id,
            scopeType: 'global',
            assignedById: user.id, // Self-assigned for primary owner
          },
        });

        this.logger.log(`SUPER_ADMIN role assigned to user: ${user.id}`);
      } else {
        this.logger.warn(
          `SUPER_ADMIN role not found for organization: ${organization.id}. Role seeding may be required.`,
        );
      }

      // Increment organization user count
      await this.organizations.incrementUserCount(organization.id);

      // Grant Primary_Owner access to all existing locations
      // Requirement 10.4: WHEN a Primary_Owner is created, THE Auth_System SHALL 
      // grant access to all current and future locations
      const existingLocations = await this.prisma.location.findMany({
        where: {
          organizationId: organization.id,
          isActive: true,
        },
      });

      for (const location of existingLocations) {
        await this.prisma.userLocation.create({
          data: {
            userId: user.id,
            locationId: location.id,
            assignedById: user.id, // Self-assigned for primary owner
            isPrimary: existingLocations.indexOf(location) === 0, // First location is primary
          },
        });
      }

      if (existingLocations.length > 0) {
        this.logger.log(
          `Primary owner ${user.id} granted access to ${existingLocations.length} existing location(s)`,
        );
      }

      // Generate and send verification email
      await this.sendVerificationEmail(user.id, organization.id);

      // Audit log successful registration
      await this.audit.log({
        organizationId: organization.id,
        userId: user.id,
        action: 'user_registered',
        resource: 'user',
        resourceId: user.id,
        outcome: 'success',
        metadata: {
          email: user.email,
          organizationName: organization.name,
          companyCode: organization.companyCode,
          role: 'SUPER_ADMIN',
          userType: 'primary_owner',
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          companyCode: organization.companyCode,
        },
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Failed to register primary owner:', error);
      throw error;
    }
  }

  /**
   * Send email verification token
   * 
   * Requirement 2.1: WHEN a verification email is sent, THE Auth_System SHALL 
   * include a unique, time-limited token valid for 24 hours
   * 
   * Requirement 2.5: WHEN a user requests a new verification email, THE Auth_System 
   * SHALL invalidate previous tokens and send a new one
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   */
  async sendVerificationEmail(userId: string, organizationId: string): Promise<void> {
    try {
      // Verify user exists
      const user = await this.users.findById(userId, organizationId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate all previous verification tokens for this user
      await this.prisma.emailVerificationToken.updateMany({
        where: {
          userId,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Generate unique verification token (24-hour expiry)
      const token = this.security.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create verification token record
      await this.prisma.emailVerificationToken.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      });

      // TODO: Send actual email with verification link
      // For now, just log the token (in production, integrate with email service)
      this.logger.log(
        `Verification email would be sent to ${user.email} with token: ${token}`,
      );
      this.logger.log(`Verification link: http://localhost:3000/auth/verify-email?token=${token}`);

      this.logger.log(`Verification email sent to user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Verify user email with token
   * 
   * Requirement 2.2: WHEN a user clicks the verification link, THE Auth_System 
   * SHALL validate the token and mark the email as verified
   * 
   * Requirement 2.3: WHEN an expired token is submitted, THE Auth_System SHALL 
   * reject it and provide an option to resend
   * 
   * Requirement 18.1: WHEN a Primary_Owner verifies their email, THE Auth_System 
   * SHALL initiate the onboarding flow
   * 
   * @param token - Verification token
   * @returns Success message
   */
  async verifyEmail(token: string): Promise<{ message: string; shouldOnboard: boolean }> {
    try {
      // Find verification token
      const verificationToken = await this.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: {
          user: true,
        },
      });

      if (!verificationToken) {
        throw new UnauthorizedException('Invalid verification token');
      }

      // Check if token is already used
      if (verificationToken.isUsed) {
        throw new UnauthorizedException('Verification token has already been used');
      }

      // Check if token is expired
      if (verificationToken.expiresAt < new Date()) {
        throw new UnauthorizedException(
          'Verification token has expired. Please request a new verification email.',
        );
      }

      // Mark token as used
      await this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Mark user email as verified
      await this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
        },
      });

      this.logger.log(`Email verified for user: ${verificationToken.userId}`);

      // Check if user is a primary owner (no createdBy)
      const isPrimaryOwner = !verificationToken.user.createdById;

      // Check if organization has completed onboarding
      const organization = await this.organizations.findById(
        verificationToken.user.organizationId,
      );
      const shouldOnboard = isPrimaryOwner && !!organization && !organization.onboardingCompleted;

      return {
        message: 'Email verified successfully',
        shouldOnboard,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Failed to verify email:', error);
      throw new UnauthorizedException('Email verification failed');
    }
  }

  /**
   * Request password reset
   * 
   * Requirement 14.1: WHEN a user requests password reset, THE Auth_System SHALL 
   * send a reset email with a time-limited token (1 hour)
   * 
   * Requirement 14.6: WHEN multiple password reset requests are made, THE Auth_System 
   * SHALL invalidate previous tokens
   * 
   * @param email - User email address
   * @param ipAddress - Request IP address for audit logging
   * @returns Success message
   */
  async requestPasswordReset(email: string, ipAddress?: string): Promise<{ message: string }> {
    try {
      // Find user by email (across all organizations)
      const user = await this.prisma.user.findFirst({
        where: { email },
      });

      // Always return success message to prevent email enumeration
      // But only send email if user exists
      if (!user) {
        this.logger.debug(`Password reset requested for non-existent email: ${email}`);
        return {
          message: 'If an account with that email exists, a password reset link has been sent.',
        };
      }

      // Invalidate all previous password reset tokens for this user
      await this.prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Generate unique reset token (1-hour expiry)
      const token = this.security.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Create password reset token record
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Audit log the password reset request
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'password_reset_requested',
        resource: 'user',
        resourceId: user.id,
        outcome: 'success',
        ipAddress,
        metadata: {
          email: user.email,
        },
      });

      // TODO: Send actual email with reset link
      // For now, just log the token (in production, integrate with email service)
      this.logger.log(
        `Password reset email would be sent to ${user.email} with token: ${token}`,
      );
      this.logger.log(`Reset link: http://localhost:3000/auth/reset-password?token=${token}`);

      this.logger.log(`Password reset requested for user: ${user.id}`);

      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (error) {
      this.logger.error('Failed to request password reset:', error);
      // Return generic message to prevent information leakage
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }
  }

  /**
   * Reset password with token
   * 
   * Requirement 14.2: WHEN a reset token is submitted with a new password, 
   * THE Auth_System SHALL validate the token and update the password
   * 
   * Requirement 14.3: WHEN a password is changed, THE Auth_System SHALL 
   * invalidate all existing sessions except the current one
   * 
   * Requirement 14.4: WHEN a new password is set, THE Auth_System SHALL 
   * verify it differs from the last 5 passwords
   * 
   * Requirement 14.5: WHEN a password reset is completed, THE Audit_Logger 
   * SHALL record the event
   * 
   * @param token - Password reset token
   * @param newPassword - New password
   * @param ipAddress - Request IP address for audit logging
   * @param userAgent - Request user agent for audit logging
   * @returns Success message
   */
  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    try {
      // Find password reset token
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: {
          user: true,
        },
      });

      if (!resetToken) {
        throw new UnauthorizedException('Invalid password reset token');
      }

      // Check if token is already used
      if (resetToken.isUsed) {
        throw new UnauthorizedException('Password reset token has already been used');
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        throw new UnauthorizedException(
          'Password reset token has expired. Please request a new password reset.',
        );
      }

      const user = resetToken.user;

      // Validate password strength
      const passwordValidation = this.security.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(
          `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
        );
      }

      // Check password history (last 5 passwords)
      const passwordHistory = await this.prisma.passwordHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Verify new password differs from previous passwords
      for (const historyEntry of passwordHistory) {
        const isSamePassword = await this.security.verifyPassword(
          newPassword,
          historyEntry.passwordHash,
        );
        if (isSamePassword) {
          throw new BadRequestException(
            'New password must differ from your last 5 passwords',
          );
        }
      }

      // Hash new password
      const newPasswordHash = await this.security.hashPassword(newPassword);

      // Update user password
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          failedLoginAttempts: 0, // Reset failed attempts
        },
      });

      // Add old password to history
      await this.prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.passwordHash,
        },
      });

      // Mark token as used
      await this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Invalidate all sessions (user must login again)
      await this.sessions.revokeAll(user.id);

      // Audit log the password reset
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'password_reset_completed',
        resource: 'user',
        resourceId: user.id,
        outcome: 'success',
        ipAddress,
        userAgent,
        metadata: {
          email: user.email,
          sessionsInvalidated: true,
        },
      });

      this.logger.log(`Password reset completed for user: ${user.id}`);

      return {
        message: 'Password has been reset successfully. Please login with your new password.',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Failed to reset password:', error);
      throw new UnauthorizedException('Password reset failed');
    }
  }

  /**
   * Change password for authenticated user
   * 
   * Requirement 14.3: WHEN a password is changed, THE Auth_System SHALL 
   * invalidate all existing sessions except the current one
   * 
   * Requirement 14.4: WHEN a new password is set, THE Auth_System SHALL 
   * verify it differs from the last 5 passwords
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @param currentSessionId - Current session ID to preserve
   * @param ipAddress - Request IP address for audit logging
   * @param userAgent - Request user agent for audit logging
   * @returns Success message
   */
  async changePassword(
    userId: string,
    organizationId: string,
    oldPassword: string,
    newPassword: string,
    currentSessionId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    try {
      // Get user
      const user = await this.users.findById(userId, organizationId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await this.security.verifyPassword(
        oldPassword,
        user.passwordHash,
      );

      if (!isOldPasswordValid) {
        // Audit log failed attempt
        await this.audit.log({
          organizationId: user.organizationId,
          userId: user.id,
          action: 'password_change_failed',
          resource: 'user',
          resourceId: user.id,
          outcome: 'failure',
          ipAddress,
          userAgent,
          metadata: {
            reason: 'Invalid old password',
          },
        });

        throw new UnauthorizedException('Current password is incorrect');
      }

      // Validate new password strength
      const passwordValidation = this.security.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(
          `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`,
        );
      }

      // Check if new password is same as old password
      const isSameAsOld = await this.security.verifyPassword(newPassword, user.passwordHash);
      if (isSameAsOld) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Check password history (last 5 passwords)
      const passwordHistory = await this.prisma.passwordHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Verify new password differs from previous passwords
      for (const historyEntry of passwordHistory) {
        const isSamePassword = await this.security.verifyPassword(
          newPassword,
          historyEntry.passwordHash,
        );
        if (isSamePassword) {
          throw new BadRequestException(
            'New password must differ from your last 5 passwords',
          );
        }
      }

      // Hash new password
      const newPasswordHash = await this.security.hashPassword(newPassword);

      // Update user password
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      // Add old password to history
      await this.prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.passwordHash,
        },
      });

      // Invalidate all sessions except current one
      if (currentSessionId) {
        await this.sessions.revokeAllExcept(user.id, currentSessionId);
      } else {
        // If no current session provided, invalidate all sessions
        await this.sessions.revokeAll(user.id);
      }

      // Audit log the password change
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'password_changed',
        resource: 'user',
        resourceId: user.id,
        outcome: 'success',
        ipAddress,
        userAgent,
        metadata: {
          email: user.email,
          sessionsInvalidated: true,
          currentSessionPreserved: !!currentSessionId,
        },
      });

      this.logger.log(`Password changed for user: ${user.id}`);

      return {
        message: 'Password has been changed successfully. Other sessions have been logged out.',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to change password for user: ${userId}`, error);
      throw new UnauthorizedException('Password change failed');
    }
  }

  /**
   * Handle OAuth authentication callback
   * 
   * Requirement 17.2: WHERE OAuth is configured, WHEN the provider returns an 
   * authorization code, THE Auth_System SHALL exchange it for tokens
   * 
   * Requirement 17.3: WHERE OAuth is configured, WHEN OAuth authentication succeeds, 
   * THE Auth_System SHALL create or link a user account
   * 
   * Requirement 17.4: WHERE OAuth is configured, WHEN a user links an OAuth account, 
   * THE Auth_System SHALL store encrypted provider tokens
   * 
   * @param oauthData - OAuth user data from provider
   * @param metadata - Session metadata (IP, user agent, etc.)
   * @returns Login result with tokens
   */
  async handleOAuthCallback(
    oauthData: OAuthUserData,
    metadata: SessionMetadata,
  ): Promise<LoginResult> {
    try {
      // Check if OAuth provider already exists
      const existingOAuthProvider = await this.prisma.oAuthProvider.findUnique({
        where: {
          provider_providerId: {
            provider: oauthData.provider,
            providerId: oauthData.providerId,
          },
        },
        include: {
          user: true,
        },
      });

      let user: User;

      if (existingOAuthProvider) {
        // User already linked with this OAuth provider
        user = existingOAuthProvider.user;

        // Update OAuth tokens
        await this.updateOAuthTokens(
          existingOAuthProvider.id,
          oauthData.accessToken,
          oauthData.refreshToken,
        );

        this.logger.log(
          `Existing OAuth user logged in: ${user.id} (${oauthData.provider})`,
        );
      } else {
        // Check if user exists with this email
        const existingUser = await this.prisma.user.findFirst({
          where: { email: oauthData.email },
        });

        if (existingUser) {
          // Link OAuth provider to existing user
          user = existingUser;

          await this.linkOAuthProvider(user.id, oauthData);

          this.logger.log(
            `OAuth provider linked to existing user: ${user.id} (${oauthData.provider})`,
          );
        } else {
          // Create new user with OAuth provider
          user = await this.createOAuthUser(oauthData);

          this.logger.log(
            `New OAuth user created: ${user.id} (${oauthData.provider})`,
          );
        }
      }

      // Check user status
      if (user.status !== 'active') {
        throw new ForbiddenException('User account is not active');
      }

      // Check if MFA is enabled
      const mfaEnabled = await this.mfa.isMFAEnabled(user.id, user.organizationId);

      if (mfaEnabled) {
        // Generate temporary token for MFA flow
        const tempPayload = {
          sub: user.id,
          email: user.email,
          organizationId: user.organizationId,
          type: 'mfa-temp',
        };

        const tempToken = jwt.sign(tempPayload, this.JWT_SECRET, {
          expiresIn: this.TEMP_TOKEN_EXPIRY,
        });

        // Audit log MFA required
        await this.audit.log({
          organizationId: user.organizationId,
          userId: user.id,
          action: 'oauth_login_mfa_required',
          resource: 'authentication',
          resourceId: user.id,
          outcome: 'success',
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          metadata: {
            email: user.email,
            provider: oauthData.provider,
            deviceFingerprint: metadata.deviceFingerprint,
            location: metadata.location,
          },
        });

        this.logger.log(`MFA required for OAuth user: ${user.id}`);

        return {
          requiresMFA: true,
          tempToken,
          userId: user.id,
        } as any; // Type assertion needed for MFA flow
      }

      // Get user permissions
      const permissionCodes = await this.permissions.getUserPermissions(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user, permissionCodes);

      // Create session
      await this.sessions.create(user.id, tokens.refreshToken, metadata);

      // Update last login time
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      // Audit log successful OAuth authentication
      await this.audit.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'oauth_login_success',
        resource: 'authentication',
        resourceId: user.id,
        outcome: 'success',
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        metadata: {
          email: user.email,
          provider: oauthData.provider,
          deviceFingerprint: metadata.deviceFingerprint,
          location: metadata.location,
          permissionCount: permissionCodes.length,
        },
      });

      this.logger.log(`OAuth user logged in: ${user.id} (${oauthData.provider})`);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
        },
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Failed to handle OAuth callback:', error);
      throw error;
    }
  }

  /**
   * Create new user from OAuth data
   * 
   * Requirement 17.3: WHERE OAuth is configured, WHEN OAuth authentication succeeds, 
   * THE Auth_System SHALL create or link a user account
   * 
   * @param oauthData - OAuth user data
   * @returns Created user
   */
  private async createOAuthUser(oauthData: OAuthUserData): Promise<User> {
    try {
      // Create organization for new OAuth user
      const organization = await this.organizations.create({
        name: `${oauthData.firstName} ${oauthData.lastName}'s Organization`,
        email: oauthData.email,
      });

      this.logger.log(
        `Organization created for OAuth user: ${organization.id} (${organization.companyCode})`,
      );

      // Generate a random password hash (OAuth users don't use password login)
      const randomPassword = this.security.generateSecureToken();
      const passwordHash = await this.security.hashPassword(randomPassword);

      // Create user with OAuth provider
      // Note: emailVerified is set to true for OAuth users
      const user = await this.prisma.user.create({
        data: {
          organizationId: organization.id,
          email: oauthData.email,
          passwordHash,
          firstName: oauthData.firstName,
          lastName: oauthData.lastName,
          avatar: oauthData.avatar,
          status: 'active',
          emailVerified: true, // OAuth users are pre-verified
        },
      });

      this.logger.log(`OAuth user created: ${user.id} (${user.email})`);

      // Assign SUPER_ADMIN role (OAuth users are primary owners)
      const superAdminRole = await this.prisma.role.findFirst({
        where: {
          organizationId: organization.id,
          code: 'SUPER_ADMIN',
          isSystem: true,
        },
      });

      if (superAdminRole) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: superAdminRole.id,
            scopeType: 'global',
            assignedById: user.id, // Self-assigned for primary owner
          },
        });

        this.logger.log(`SUPER_ADMIN role assigned to OAuth user: ${user.id}`);
      }

      // Increment organization user count
      await this.organizations.incrementUserCount(organization.id);

      // Link OAuth provider
      await this.linkOAuthProvider(user.id, oauthData);

      // Audit log OAuth user creation
      await this.audit.log({
        organizationId: organization.id,
        userId: user.id,
        action: 'oauth_user_created',
        resource: 'user',
        resourceId: user.id,
        outcome: 'success',
        metadata: {
          email: user.email,
          provider: oauthData.provider,
          organizationName: organization.name,
          companyCode: organization.companyCode,
          role: 'SUPER_ADMIN',
          userType: 'oauth_primary_owner',
        },
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to create OAuth user:', error);
      throw error;
    }
  }

  /**
   * Link OAuth provider to existing user
   * 
   * Requirement 17.4: WHERE OAuth is configured, WHEN a user links an OAuth account, 
   * THE Auth_System SHALL store encrypted provider tokens
   * 
   * Requirement 23.2: WHEN OAuth tokens are stored, THE Auth_System SHALL encrypt 
   * them using AES-256-GCM
   * 
   * @param userId - User ID
   * @param oauthData - OAuth user data
   */
  private async linkOAuthProvider(
    userId: string,
    oauthData: OAuthUserData,
  ): Promise<void> {
    try {
      // Encrypt OAuth tokens
      const encryptedAccessToken = this.security.encrypt(oauthData.accessToken);
      const encryptedRefreshToken = oauthData.refreshToken
        ? this.security.encrypt(oauthData.refreshToken)
        : null;

      // Calculate token expiration (default 1 hour if not provided)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Create OAuth provider record
      await this.prisma.oAuthProvider.create({
        data: {
          userId,
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          profile: oauthData.profile,
        },
      });

      this.logger.log(
        `OAuth provider linked: ${oauthData.provider} for user ${userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to link OAuth provider:', error);
      throw error;
    }
  }

  /**
   * Update OAuth tokens
   * 
   * Requirement 17.4: WHERE OAuth is configured, WHEN a user links an OAuth account, 
   * THE Auth_System SHALL store encrypted provider tokens
   * 
   * Requirement 23.2: WHEN OAuth tokens are stored, THE Auth_System SHALL encrypt 
   * them using AES-256-GCM
   * 
   * @param oauthProviderId - OAuth provider ID
   * @param accessToken - New access token
   * @param refreshToken - New refresh token
   */
  private async updateOAuthTokens(
    oauthProviderId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      // Encrypt OAuth tokens
      const encryptedAccessToken = this.security.encrypt(accessToken);
      const encryptedRefreshToken = refreshToken
        ? this.security.encrypt(refreshToken)
        : null;

      // Calculate token expiration (default 1 hour if not provided)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Update OAuth provider tokens
      await this.prisma.oAuthProvider.update({
        where: { id: oauthProviderId },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`OAuth tokens updated for provider: ${oauthProviderId}`);
    } catch (error) {
      this.logger.error('Failed to update OAuth tokens:', error);
      throw error;
    }
  }

  /**
   * Refresh OAuth tokens
   * 
   * Requirement 17.5: WHERE OAuth is configured, WHEN OAuth tokens expire, 
   * THE Auth_System SHALL refresh them automatically
   * 
   * @param userId - User ID
   * @param provider - OAuth provider (google)
   * @returns Decrypted access token
   */
  async refreshOAuthTokens(
    userId: string,
    provider: 'google',
  ): Promise<string> {
    try {
      // Get OAuth provider
      const oauthProvider = await this.prisma.oAuthProvider.findFirst({
        where: {
          userId,
          provider,
        },
      });

      if (!oauthProvider) {
        throw new UnauthorizedException('OAuth provider not found');
      }

      // Check if token is expired
      if (oauthProvider.expiresAt && oauthProvider.expiresAt > new Date()) {
        // Token still valid, decrypt and return
        return this.security.decrypt(oauthProvider.accessToken);
      }

      // Token expired, need to refresh
      // Note: Actual token refresh would require provider-specific API calls
      // This is a placeholder for the refresh logic
      this.logger.warn(
        `OAuth token refresh not implemented for provider: ${provider}. Returning existing token.`,
      );

      // Decrypt and return existing token
      return this.security.decrypt(oauthProvider.accessToken);
    } catch (error) {
      this.logger.error('Failed to refresh OAuth tokens:', error);
      throw error;
    }
  }
}

/**
 * OAuth user data interface
 */
export interface OAuthUserData {
  provider: 'google';
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  accessToken: string;
  refreshToken: string;
  profile: any;
}
