import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import { UsersService } from '../users/users.service';
import { SessionsService, SessionMetadata } from '../sessions/sessions.service';
import { MFAService } from '../mfa/mfa.service';
import { PermissionsService } from '../permissions/permissions.service';
import { User } from '@prisma/client';
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
        return null;
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

      // Verify password
      const isPasswordValid = await this.security.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        // Increment failed login attempts
        const newFailedAttempts = user.failedLoginAttempts + 1;
        
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lastLoginAt: new Date(),
          },
        });

        // Lock account after 10 failed attempts
        if (newFailedAttempts >= 10) {
          await this.users.lock(user.id, user.organizationId, 'Too many failed login attempts', 30);
          throw new ForbiddenException('Account locked due to too many failed login attempts. Please try again in 30 minutes.');
        }

        this.logger.debug(`Invalid password for user: ${user.id} (attempt ${newFailedAttempts})`);
        return null;
      }

      // Reset failed login attempts on successful validation
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
}
