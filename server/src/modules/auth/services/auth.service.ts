import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { DrizzleService } from '../../database/drizzle.service';
import { users, userSessions, tenants } from '../../database/schema';
import { businessTierEnum } from '../../database/schema/enums';
import { AuthEventsService } from './auth-events.service';
import { SecurityService } from './security.service';
import { SessionService } from './session.service';
import { RiskAssessmentService } from './risk-assessment.service';
import { CacheService } from '../../cache/cache.service';
import { CustomLoggerService } from '../../logger/logger.service';
import {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../inputs/auth.input';
import { 
  JwtPayload, 
  AuthenticatedUser, 
  LoginResponse, 
  RefreshTokenResponse, 
  SessionInfo,
  AuthConfig,
  SecurityContext,
  AuthenticationResult,
  RiskAssessment,
  DeviceFingerprint,
  TokenPair,
} from '../interfaces/auth.interface';
import { eq, and, gt } from 'drizzle-orm';

@Injectable()
export class AuthService {
  private readonly authConfig: AuthConfig;

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authEventsService: AuthEventsService,
    private readonly securityService: SecurityService,
    private readonly sessionService: SessionService,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly cacheService: CacheService,
    private readonly logger: CustomLoggerService,
  ) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required but not provided');
    }
    
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is required but not provided');
    }

    this.authConfig = {
      jwtSecret,
      jwtExpiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      jwtRefreshSecret,
      jwtRefreshExpiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      bcryptRounds: this.configService.get<number>('BCRYPT_ROUNDS', 12),
      maxFailedAttempts: this.configService.get<number>('MAX_FAILED_ATTEMPTS', 5),
      lockoutDuration: this.configService.get<number>('LOCKOUT_DURATION', 15 * 60 * 1000), // 15 minutes
      passwordResetExpiration: this.configService.get<number>('PASSWORD_RESET_EXPIRATION', 60 * 60 * 1000), // 1 hour
      deviceTrustThreshold: this.configService.get<number>('DEVICE_TRUST_THRESHOLD', 70),
      riskScoreThreshold: this.configService.get<number>('RISK_SCORE_THRESHOLD', 50),
      mfaGracePeriod: this.configService.get<number>('MFA_GRACE_PERIOD_DAYS', 7) * 24 * 60 * 60 * 1000,
      sessionExtendOnActivity: this.configService.get<boolean>('SESSION_EXTEND_ON_ACTIVITY', true),
      requireReauthHours: this.configService.get<number>('SESSION_REQUIRE_REAUTH_HOURS', 24),
    };

    this.logger.setContext('AuthService');
  }

  /**
   * Enhanced registration with security validation and risk assessment
   */
  async register(
    registerDto: RegisterInput, 
    ipAddress?: string, 
    userAgent?: string,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<LoginResponse> {
    const db = this.drizzleService.getDb();

    try {
      // Security validation
      await this.securityService.validateRegistrationAttempt(registerDto.email, ipAddress);

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, registerDto.email),
          eq(users.tenantId, registerDto.tenantId)
        ))
        .limit(1);

      if (existingUser.length > 0) {
        throw new ConflictException('User with this email already exists in this tenant');
      }

      // Validate password strength
      await this.validatePasswordStrength(registerDto.password);

      // Hash password
      const passwordHash = await this.hashPassword(registerDto.password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          tenantId: registerDto.tenantId,
          email: registerDto.email,
          passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          phone: registerDto.phone,
          displayName: `${registerDto.firstName} ${registerDto.lastName}`,
          role: 'employee', // Default role
          emailVerified: false, // Will be verified later
          createdBy: null, // Self-registration
          updatedBy: null,
        })
        .returning();

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Log security event
      await this.securityService.logSecurityEvent({
        type: 'user_registered',
        severity: 'low',
        userId: newUser.id,
        tenantId: newUser.tenantId,
        ipAddress,
        userAgent,
        metadata: {
          email: newUser.email,
          registrationMethod: 'email_password',
        },
      });

      // Emit user registered event
      this.eventEmitter.emit('user.registered', {
        userId: newUser.id,
        tenantId: newUser.tenantId,
        email: newUser.email,
        timestamp: new Date(),
      });

      // Publish auth events
      await this.authEventsService.publishUserRegistered(
        newUser.id,
        newUser.tenantId,
        newUser.email,
        newUser.role,
      );

      // Create session and return login response
      return this.createUserSession(newUser, ipAddress, userAgent, false, deviceFingerprint);
    } catch (error) {
      this.logger.error(`Registration failed for ${registerDto.email} in tenant ${registerDto.tenantId} from ${ipAddress}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enhanced login with risk assessment and security validation
   */
  async login(
    loginDto: LoginInput, 
    ipAddress?: string, 
    userAgent?: string,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<LoginResponse> {
    const db = this.drizzleService.getDb();

    try {
      // Security pre-validation
      await this.securityService.validateLoginAttempt(loginDto.email, ipAddress);

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, loginDto.email))
        .limit(1);

      if (!user) {
        await this.handleFailedLogin(null, loginDto.email, ipAddress, 'user_not_found');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const lockoutRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
        await this.securityService.logSecurityEvent({
          type: 'login_attempt_while_locked',
          severity: 'medium',
          userId: user.id,
          tenantId: user.tenantId,
          ipAddress,
          userAgent,
          metadata: { lockoutRemaining },
        });
        throw new UnauthorizedException(`Account is temporarily locked. Try again in ${lockoutRemaining} minutes.`);
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(loginDto.password, user.passwordHash || '');
      
      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id, loginDto.email, ipAddress, 'invalid_password');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        await this.securityService.logSecurityEvent({
          type: 'login_attempt_inactive_user',
          severity: 'medium',
          userId: user.id,
          tenantId: user.tenantId,
          ipAddress,
          userAgent,
        });
        throw new UnauthorizedException('Account is deactivated');
      }

      // Perform risk assessment
      const riskAssessment = await this.riskAssessmentService.assessLoginRisk({
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        deviceFingerprint,
        loginTime: new Date(),
        userHistory: {
          lastLoginAt: user.lastLoginAt,
          lastLoginIp: user.lastLoginIp,
          failedAttempts: user.failedLoginAttempts || 0,
        },
      });

      // Handle high-risk logins
      if (riskAssessment.level === 'high' || riskAssessment.level === 'critical') {
        await this.securityService.logSecurityEvent({
          type: 'high_risk_login',
          severity: riskAssessment.level === 'critical' ? 'critical' : 'high',
          userId: user.id,
          tenantId: user.tenantId,
          ipAddress,
          userAgent,
          metadata: { riskScore: riskAssessment.score, factors: riskAssessment.factors },
        });

        // Block critical risk logins
        if (riskAssessment.level === 'critical') {
          throw new ForbiddenException('Login blocked due to high security risk. Please contact support.');
        }
      }

      // Check if MFA is required
      const mfaRequired = user.mfaEnabled || riskAssessment.requiredActions.includes('require_mfa');
      
      if (mfaRequired && !user.mfaEnabled) {
        // Temporary MFA requirement due to risk
        return {
          user: this.mapUserToAuthenticatedUser(user),
          accessToken: '',
          refreshToken: '',
          expiresIn: 0,
          tokenType: 'Bearer',
          requiresMfa: true,
          mfaToken: await this.generateTemporaryMfaToken(user.id),
          riskAssessment,
        };
      } else if (user.mfaEnabled) {
        // Standard MFA flow
        throw new UnauthorizedException('MFA required. Use MFA login endpoint.');
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(user.id);

      // Update last login information
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Log successful login
      await this.securityService.logSecurityEvent({
        type: 'successful_login',
        severity: 'low',
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        metadata: { 
          riskScore: riskAssessment.score,
          mfaUsed: false,
          deviceTrusted: deviceFingerprint?.trustScore >= this.authConfig.deviceTrustThreshold,
        },
      });

      // Emit login event
      this.eventEmitter.emit('user.login', {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        ipAddress,
        userAgent,
        riskScore: riskAssessment.score,
        timestamp: new Date(),
      });

      // Create session and return login response
      const loginResponse = await this.createUserSession(
        user, 
        ipAddress, 
        userAgent, 
        loginDto.rememberMe,
        deviceFingerprint
      );

      return {
        ...loginResponse,
        riskAssessment,
      };
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto.email} from ${ipAddress}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enhanced MFA login with risk assessment
   */
  async loginWithMfa(
    email: string, 
    password: string, 
    mfaToken: string, 
    ipAddress?: string, 
    userAgent?: string,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<LoginResponse> {
    const db = this.drizzleService.getDb();

    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password first
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash || '');
      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id, email, ipAddress, 'invalid_password_mfa');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if MFA is enabled
      if (!user.mfaEnabled) {
        throw new UnauthorizedException('MFA is not enabled for this account');
      }

      // Verify MFA token (this will be handled by MfaService)
      const isMfaValid = await this.verifyMfaTokenInternal(user, mfaToken);
      if (!isMfaValid) {
        await this.handleFailedLogin(user.id, email, ipAddress, 'invalid_mfa_token');
        throw new UnauthorizedException('Invalid MFA token');
      }

      // Perform risk assessment
      const riskAssessment = await this.riskAssessmentService.assessLoginRisk({
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        deviceFingerprint,
        loginTime: new Date(),
        mfaUsed: true,
        userHistory: {
          lastLoginAt: user.lastLoginAt,
          lastLoginIp: user.lastLoginIp,
          failedAttempts: user.failedLoginAttempts || 0,
        },
      });

      // Reset failed login attempts
      await this.resetFailedLoginAttempts(user.id);

      // Update last login information
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Log successful MFA login
      await this.securityService.logSecurityEvent({
        type: 'successful_mfa_login',
        severity: 'low',
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        metadata: { 
          riskScore: riskAssessment.score,
          mfaUsed: true,
          deviceTrusted: deviceFingerprint?.trustScore >= this.authConfig.deviceTrustThreshold,
        },
      });

      // Emit login event
      this.eventEmitter.emit('user.login', {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        ipAddress,
        userAgent,
        mfaUsed: true,
        riskScore: riskAssessment.score,
        timestamp: new Date(),
      });

      // Create session and return login response
      const loginResponse = await this.createUserSession(
        user, 
        ipAddress, 
        userAgent, 
        true,
        deviceFingerprint
      );

      return {
        ...loginResponse,
        riskAssessment,
      };
    } catch (error) {
      this.logger.error(`MFA login failed for ${email} from ${ipAddress}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if user requires MFA
   */
  async requiresMfa(email: string): Promise<{ requiresMfa: boolean; userId?: string }> {
    const db = this.drizzleService.getDb();

    const [user] = await db
      .select({
        id: users.id,
        mfaEnabled: users.mfaEnabled,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.isActive) {
      // Don't reveal if user exists for security
      return { requiresMfa: false };
    }

    return { 
      requiresMfa: user.mfaEnabled || false,
      ...(user.mfaEnabled ? { userId: user.id } : {}),
    };
  }

  /**
   * Enhanced refresh token with security validation
   */
  async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<RefreshTokenResponse> {
    const db = this.drizzleService.getDb();

    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.authConfig.jwtRefreshSecret) as JwtPayload;

      // Find session
      const [session] = await db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.refreshToken, refreshToken),
          eq(userSessions.isRevoked, false),
          gt(userSessions.expiresAt, new Date())
        ))
        .limit(1);

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Validate session security
      await this.sessionService.validateSessionSecurity(session.id, ipAddress, userAgent);

      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Perform risk assessment for token refresh
      const riskAssessment = await this.riskAssessmentService.assessTokenRefreshRisk({
        userId: user.id,
        tenantId: user.tenantId,
        sessionId: session.id,
        ipAddress,
        userAgent,
        lastActivity: session.lastAccessedAt || new Date(),
      });

      // Block high-risk token refresh
      if (riskAssessment.level === 'critical') {
        await this.sessionService.revokeSession(session.id, 'high_risk_detected');
        throw new ForbiddenException('Token refresh blocked due to security risk');
      }

      // Generate new tokens
      const newAccessToken = await this.generateAccessToken(user, session.id);
      const newRefreshToken = await this.generateRefreshToken(user, session.id);

      // Update session with new refresh token
      await db
        .update(userSessions)
        .set({
          refreshToken: newRefreshToken,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userSessions.id, session.id));

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime(this.authConfig.jwtExpiresIn),
        tokenType: 'Bearer',
        riskAssessment,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed from ${ipAddress}: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Enhanced logout with security logging
   */
  async logout(sessionId: string, reason: string = 'user_logout'): Promise<void> {
    await this.sessionService.revokeSession(sessionId, reason);

    // Emit logout event
    this.eventEmitter.emit('user.logout', {
      sessionId,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Logout all sessions with security validation
   */
  async logoutAllSessions(userId: string, reason: string = 'logout_all_sessions'): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId, reason);

    // Emit logout all event
    this.eventEmitter.emit('user.logout_all', {
      userId,
      reason,
      timestamp: new Date(),
    });
  }

  /**
   * Enhanced password change with security validation
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordInput): Promise<void> {
    const db = this.drizzleService.getDb();

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(
      changePasswordDto.currentPassword,
      user.passwordHash || ''
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password strength
    await this.validatePasswordStrength(changePasswordDto.newPassword);

    // Check password reuse
    await this.validatePasswordReuse(userId, changePasswordDto.newPassword);

    // Hash new password
    const newPasswordHash = await this.hashPassword(changePasswordDto.newPassword);

    // Update password
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(users.id, userId));

    // Log security event
    await this.securityService.logSecurityEvent({
      type: 'password_changed',
      severity: 'low',
      userId,
      tenantId: user.tenantId,
      metadata: { changedBy: 'user' },
    });

    // Revoke all sessions except current one (force re-login)
    await this.logoutAllSessions(userId, 'password_changed');

    // Emit password changed event
    this.eventEmitter.emit('user.password_changed', {
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Enhanced forgot password with security validation
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordInput, ipAddress?: string): Promise<void> {
    const db = this.drizzleService.getDb();

    // Security validation
    await this.securityService.validatePasswordResetAttempt(forgotPasswordDto.email, ipAddress);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, forgotPasswordDto.email))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + this.authConfig.passwordResetExpiration);

    // Update user with reset token
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Log security event
    await this.securityService.logSecurityEvent({
      type: 'password_reset_requested',
      severity: 'low',
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress,
      metadata: { email: user.email },
    });

    // Emit password reset requested event
    this.eventEmitter.emit('user.password_reset_requested', {
      userId: user.id,
      email: user.email,
      resetToken,
      expiresAt: resetExpires,
      timestamp: new Date(),
    });
  }

  /**
   * Enhanced password reset with security validation
   */
  async resetPassword(resetPasswordDto: ResetPasswordInput, ipAddress?: string): Promise<void> {
    const db = this.drizzleService.getDb();

    // Find user by reset token
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.passwordResetToken, resetPasswordDto.token),
        gt(users.passwordResetExpires, new Date())
      ))
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate new password strength
    await this.validatePasswordStrength(resetPasswordDto.newPassword);

    // Check password reuse
    await this.validatePasswordReuse(user.id, resetPasswordDto.newPassword);

    // Hash new password
    const newPasswordHash = await this.hashPassword(resetPasswordDto.newPassword);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Log security event
    await this.securityService.logSecurityEvent({
      type: 'password_reset_completed',
      severity: 'low',
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress,
      metadata: { email: user.email },
    });

    // Revoke all sessions (force re-login)
    await this.logoutAllSessions(user.id, 'password_reset');

    // Emit password reset event
    this.eventEmitter.emit('user.password_reset', {
      userId: user.id,
      timestamp: new Date(),
    });
  }

  /**
   * Validate user credentials for local authentication strategy
   * Used by Passport LocalStrategy for username/password authentication
   */
  async validateCredentials(email: string, password: string): Promise<AuthenticatedUser | null> {
    const db = this.drizzleService.getDb();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return null;
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash || '');
    if (!isPasswordValid) {
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      return null;
    }

    return this.mapUserToAuthenticatedUser(user);
  }

  /**
   * Validate user with enhanced security context
   */
  async validateUser(userId: string): Promise<AuthenticatedUser | null> {
    const db = this.drizzleService.getDb();

    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.isActive, true)
      ))
      .limit(1);

    if (!user) {
      return null;
    }

    return this.mapUserToAuthenticatedUser(user);
  }

  /**
   * Validate session with enhanced security checks
   */
  async validateSession(sessionId: string): Promise<SessionInfo | null> {
    return this.sessionService.getSessionInfo(sessionId);
  }

  // Private helper methods

  private async validatePasswordStrength(password: string): Promise<void> {
    const minLength = this.configService.get<number>('PASSWORD_MIN_LENGTH', 8);
    const requireUppercase = this.configService.get<boolean>('PASSWORD_REQUIRE_UPPERCASE', true);
    const requireLowercase = this.configService.get<boolean>('PASSWORD_REQUIRE_LOWERCASE', true);
    const requireNumbers = this.configService.get<boolean>('PASSWORD_REQUIRE_NUMBERS', true);
    const requireSpecialChars = this.configService.get<boolean>('PASSWORD_REQUIRE_SPECIAL_CHARS', true);

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/\d/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  private async validatePasswordReuse(userId: string, newPassword: string): Promise<void> {
    // Implementation would check against password history
    // For now, just validate against current password
    const db = this.drizzleService.getDb();
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user?.passwordHash && await this.verifyPassword(newPassword, user.passwordHash)) {
      throw new BadRequestException('New password cannot be the same as current password');
    }
  }

  private async generateTemporaryMfaToken(userId: string): Promise<string> {
    // Generate a temporary token for MFA flow
    const payload = { userId, type: 'mfa_temp', exp: Math.floor(Date.now() / 1000) + 300 }; // 5 minutes
    return jwt.sign(payload, this.authConfig.jwtSecret);
  }

  private async verifyMfaTokenInternal(user: any, token: string): Promise<boolean> {
    // Placeholder implementation - would integrate with MfaService
    if (!user.mfaSecret) {
      return false;
    }

    // Check if it's a backup code
    const backupCodes = Array.isArray(user.mfaBackupCodes) ? user.mfaBackupCodes : [];
    if (backupCodes.includes(token)) {
      return true;
    }

    // For TOTP verification, would use speakeasy here
    return token.length === 6 && /^\d+$/.test(token);
  }

  private async createUserSession(
    user: any,
    ipAddress?: string,
    userAgent?: string,
    rememberMe: boolean = false,
    deviceFingerprint?: DeviceFingerprint
  ): Promise<LoginResponse> {
    // Get tenant information for enhanced user object
    const tenantInfo = await this.getTenantInfo(user.tenantId);
    
    // Enhance user object with tenant information
    const enhancedUser = {
      ...user,
      businessTier: tenantInfo.businessTier,
      featureFlags: tenantInfo.featureFlags,
      trialExpiresAt: tenantInfo.trialExpiresAt,
    };

    // Create session through SessionService
    const sessionInfo = await this.sessionService.createSession({
      userId: user.id,
      tenantId: user.tenantId,
      ipAddress,
      userAgent,
      deviceFingerprint,
      rememberMe,
    });

    // Generate tokens
    const accessToken = await this.generateAccessToken(enhancedUser, sessionInfo.id);
    const refreshToken = sessionInfo.refreshToken;

    const authenticatedUser = this.mapUserToAuthenticatedUser(enhancedUser, sessionInfo.id);

    return {
      user: authenticatedUser,
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(this.authConfig.jwtExpiresIn),
      tokenType: 'Bearer',
    };
  }

  private async generateAccessToken(user: any, sessionId: string): Promise<string> {
    // Get tenant information for business tier and feature flags
    const tenantInfo = await this.getTenantInfo(user.tenantId);
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions || [],
      sessionId,
      // Enhanced tier-based fields
      businessTier: tenantInfo.businessTier,
      featureFlags: tenantInfo.featureFlags,
      ...(tenantInfo.trialExpiresAt && { trialExpiresAt: Math.floor(tenantInfo.trialExpiresAt.getTime() / 1000) }),
      // Standard JWT fields
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.getTokenExpirationTime(this.authConfig.jwtExpiresIn),
      iss: this.configService.get<string>('JWT_ISSUER', 'business-management-platform'),
      aud: this.configService.get<string>('JWT_AUDIENCE', 'business-management-platform'),
    };

    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(user: any, sessionId: string, rememberMe: boolean = false): Promise<string> {
    // Get tenant information for business tier and feature flags
    const tenantInfo = await this.getTenantInfo(user.tenantId);
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions || [],
      sessionId,
      // Enhanced tier-based fields
      businessTier: tenantInfo.businessTier,
      featureFlags: tenantInfo.featureFlags,
      ...(tenantInfo.trialExpiresAt && { trialExpiresAt: Math.floor(tenantInfo.trialExpiresAt.getTime() / 1000) }),
      // Standard JWT fields
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.getTokenExpirationTime(rememberMe ? '30d' : '7d'),
      iss: this.configService.get<string>('JWT_ISSUER', 'business-management-platform'),
      aud: this.configService.get<string>('JWT_AUDIENCE', 'business-management-platform'),
    };

    return jwt.sign(payload, this.authConfig.jwtRefreshSecret);
  }

  /**
   * Generate both access and refresh tokens for a user
   */
  async generateTokens(user: any, sessionId: string, rememberMe: boolean = false): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(user, sessionId);
    const refreshToken = await this.generateRefreshToken(user, sessionId, rememberMe);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(this.authConfig.jwtExpiresIn),
      tokenType: 'Bearer',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.authConfig.bcryptRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async handleFailedLogin(
    userId: string | null, 
    email: string, 
    ipAddress?: string, 
    reason: string = 'invalid_credentials'
  ): Promise<void> {
    if (!userId) {
      // Log failed attempt for non-existent user
      await this.securityService.logSecurityEvent({
        type: 'failed_login_unknown_user',
        severity: 'medium',
        ipAddress,
        metadata: { email, reason },
      });
      return;
    }

    const db = this.drizzleService.getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return;

    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData: any = {
      failedLoginAttempts: failedAttempts,
      updatedAt: new Date(),
    };

    // Progressive lockout
    if (failedAttempts >= this.authConfig.maxFailedAttempts) {
      const lockoutDuration = this.configService.get<boolean>('PROGRESSIVE_LOCKOUT', true)
        ? this.authConfig.lockoutDuration * Math.pow(2, Math.min(failedAttempts - this.authConfig.maxFailedAttempts, 5))
        : this.authConfig.lockoutDuration;
      
      updateData.lockedUntil = new Date(Date.now() + lockoutDuration);

      // Log account lockout
      await this.securityService.logSecurityEvent({
        type: 'account_locked',
        severity: 'high',
        userId,
        tenantId: user.tenantId,
        ipAddress,
        metadata: { 
          failedAttempts, 
          lockoutDuration: lockoutDuration / 1000 / 60, // minutes
          reason 
        },
      });
    } else {
      // Log failed attempt
      await this.securityService.logSecurityEvent({
        type: 'failed_login',
        severity: 'low',
        userId,
        tenantId: user.tenantId,
        ipAddress,
        metadata: { failedAttempts, reason },
      });
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }

  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    const db = this.drizzleService.getDb();

    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  private mapUserToAuthenticatedUser(user: any, sessionId?: string): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions || [],
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      avatar: user.avatar,
      sessionId: sessionId || '',
      lastLoginAt: user.lastLoginAt,
      // Enhanced tier-based fields
      businessTier: user.businessTier || 'micro',
      featureFlags: user.featureFlags || [],
      trialExpiresAt: user.trialExpiresAt,
      // Additional required fields
      isActive: user.isActive ?? true,
      emailVerified: user.emailVerified ?? false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }

  private getTokenExpirationTime(expiresIn: string): number {
    // Convert string like '15m', '7d', '1h' to seconds
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900; // 15 minutes default
    }
  }

  private async getTenantInfo(tenantId: string): Promise<{
    businessTier: typeof businessTierEnum.enumValues[number];
    featureFlags: string[];
    trialExpiresAt?: Date;
  }> {
    const db = this.drizzleService.getDb();

    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenant) {
        return {
          businessTier: 'micro',
          featureFlags: [],
        };
      }

      const featureFlags = this.extractFeatureFlags(tenant.businessTier, tenant.featureFlags);

      const result: {
        businessTier: typeof businessTierEnum.enumValues[number];
        featureFlags: string[];
        trialExpiresAt?: Date;
      } = {
        businessTier: tenant.businessTier,
        featureFlags,
      };

      if (tenant.trialEndDate) {
        result.trialExpiresAt = tenant.trialEndDate;
      }

      return result;
    } catch (error) {
      return {
        businessTier: 'micro',
        featureFlags: [],
      };
    }
  }

  private extractFeatureFlags(businessTier: string, tenantFeatureFlags: any): string[] {
    const baseFeatures: Record<string, string[]> = {
      micro: ['basic_pos', 'basic_inventory', 'basic_reporting'],
      small: ['basic_pos', 'basic_inventory', 'basic_reporting', 'advanced_inventory', 'employee_management', 'customer_management'],
      medium: ['basic_pos', 'basic_inventory', 'basic_reporting', 'advanced_inventory', 'employee_management', 'customer_management', 'advanced_reporting', 'multi_location', 'integrations'],
      enterprise: ['basic_pos', 'basic_inventory', 'basic_reporting', 'advanced_inventory', 'employee_management', 'customer_management', 'advanced_reporting', 'multi_location', 'integrations', 'api_access', 'custom_fields', 'advanced_analytics'],
    };

    const tierFeatures: string[] = (baseFeatures[businessTier] ?? baseFeatures.micro) as string[];
    
    const customFeatures: string[] = tenantFeatureFlags && typeof tenantFeatureFlags === 'object' 
      ? Object.keys(tenantFeatureFlags).filter(key => tenantFeatureFlags[key] === true)
      : [];

    return [...tierFeatures, ...customFeatures];
  }
}