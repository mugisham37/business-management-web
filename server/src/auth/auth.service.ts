import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { MetricsService } from '../health/metrics.service';
import { PermissionsService } from '../permissions/permissions.service';
import { UserRole } from '../tenant/tenant-context.interface';
import { RegisterOrganizationDto, AuthResponseDto } from './dto';
import { hashPassword, validatePasswordComplexity, verifyPassword, checkPasswordHistory } from '../common/utils/password.util';
import { generateAccessToken, generateRefreshToken, TokenPayload, RefreshTokenPayload, verifyToken } from '../common/utils/token.util';
import { v4 as uuidv4 } from 'uuid';

/**
 * Authentication Service
 * Handles user registration, login, token management, and password operations
 * Implements requirements 1.1-1.10, 3.1-3.8, 4.1-4.7
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Register a new organization with an Owner user
   * Uses Prisma transaction for atomicity
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10
   * 
   * @param dto - Registration data including business and owner information
   * @returns AuthResponseDto with tokens and user data
   * @throws BadRequestException if validation fails
   * @throws ConflictException if email already exists in organization
   */
  async registerOrganization(dto: RegisterOrganizationDto): Promise<AuthResponseDto> {
    // Validate acceptedTerms is true (Requirement 1.10)
    if (!dto.acceptedTerms) {
      throw new BadRequestException('You must accept the terms and conditions to register');
    }

    // Validate required fields (Requirement 1.8)
    if (!dto.businessName || dto.businessName.trim() === '') {
      throw new BadRequestException('businessName is required and cannot be empty');
    }
    if (!dto.email || dto.email.trim() === '') {
      throw new BadRequestException('email is required and cannot be empty');
    }
    if (!dto.firstName || dto.firstName.trim() === '') {
      throw new BadRequestException('firstName is required and cannot be empty');
    }
    if (!dto.lastName || dto.lastName.trim() === '') {
      throw new BadRequestException('lastName is required and cannot be empty');
    }

    // Validate password complexity (Requirement 1.3, 14.1)
    const passwordValidation = validatePasswordComplexity(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        errors: passwordValidation.errors,
      });
    }

    // Hash password with bcrypt (12 rounds) (Requirement 1.3)
    const passwordHash = await hashPassword(dto.password);

    try {
      // Use Prisma transaction for atomicity (Requirement 1.1, 1.6)
      const result = await this.prisma.$transaction(async (tx) => {
        // Generate UUID for organization_id (Requirement 1.2)
        const organizationId = uuidv4();

        // Create Organization
        const organization = await tx.organization.create({
          data: {
            id: organizationId,
            businessName: dto.businessName,
            businessType: dto.businessType,
            employeeCount: dto.employeeCount,
            industry: dto.industry,
            country: dto.country,
            selectedModules: dto.selectedModules || [],
            primaryGoal: dto.primaryGoal,
            cloudProvider: dto.cloudProvider,
            region: dto.region,
            storageVolume: dto.storageVolume,
            compression: dto.compression ?? false,
            activeHours: dto.activeHours,
            integrations: dto.integrations || [],
            selectedPlan: dto.selectedPlan,
            billingCycle: dto.billingCycle,
          },
        });

        // Create Owner User (Requirement 1.7)
        const user = await tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            role: 'OWNER',
            organizationId: organization.id,
            emailVerified: false, // Will be verified via email link (Requirement 1.4)
            createdById: null, // Owner has no creator
          },
        });

        return { organization, user };
      });

      // Generate JWT tokens (Requirement 3.2, 4.1, 4.2)
      const tokenPayload: TokenPayload = {
        user_id: result.user.id,
        organization_id: result.organization.id,
        role: result.user.role as 'OWNER' | 'MANAGER' | 'WORKER',
      };

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!jwtSecret || !jwtRefreshSecret) {
        throw new InternalServerErrorException('JWT secrets not configured');
      }

      const accessToken = generateAccessToken(tokenPayload, jwtSecret);
      const familyId = uuidv4();
      const refreshToken = generateRefreshToken(tokenPayload, familyId, jwtRefreshSecret);

      // Store refresh token in database (Requirement 4.2, 4.8)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: result.user.id,
          familyId,
          expiresAt,
        },
      });

      // Log registration in audit log (Requirement 1.10, 11.2)
      await this.auditService.logUserCreation(
        result.user.id, // Creator is self for Owner
        result.user.id,
        UserRole.OWNER,
        result.organization.id,
      );

      // Assign module permissions to Owner based on selectedModules (Requirement 17.10)
      if (dto.selectedModules && dto.selectedModules.length > 0) {
        try {
          await this.permissionsService.assignModulePermissionsToOwner(
            result.user.id,
            result.organization.id,
            dto.selectedModules,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to assign module permissions during onboarding: ${error.message}`,
          );
          // Don't fail registration if permission assignment fails
        }
      }

      // TODO: Send email verification link (Requirement 1.4)
      // This will be implemented when email service is available
      // await this.emailService.sendVerificationEmail(result.user.email, verificationToken);

      // Return auth response with sanitized user data
      const { passwordHash: _, passwordHistory, mfaSecret, backupCodes, ...sanitizedUser } = result.user;

      return {
        accessToken,
        refreshToken,
        user: sanitizedUser,
        requiresMFA: false, // MFA not enabled on registration
      };
    } catch (error) {
      // Handle unique constraint violations (email already exists)
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A user with this email already exists in this organization',
        );
      }

      // Rollback is automatic with Prisma transactions (Requirement 1.6)
      throw new InternalServerErrorException(
        'Failed to register organization. Please try again.',
      );
    }
  }

  /**
   * Login with email and password
   * Implements rate limiting, account lock checks, and MFA support
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
   * 
   * @param email - User email address
   * @param password - User password
   * @param organizationId - Organization ID
   * @param ipAddress - Client IP address for audit logging
   * @param userAgent - Client user agent for audit logging
   * @returns AuthResponseDto with tokens and user data, or requiresMFA flag
   * @throws UnauthorizedException for invalid credentials or account issues
   */
  async login(
    email: string,
    password: string,
    organizationId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
    const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
    const RATE_LIMIT_MAX_ATTEMPTS = 5;
    const ACCOUNT_LOCK_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

    try {
      // Find user by email and organization (Requirement 3.1)
      const user = await this.usersService.getUserByEmail(email, organizationId);

      // Generic error message to not reveal email existence (Requirement 3.3)
      const genericError = 'Invalid credentials';

      if (!user) {
        // Log auth failure without revealing email doesn't exist
        await this.auditService.logAuthFailure(
          email,
          'User not found',
          {
            ipAddress,
            userAgent,
            timestamp: new Date(),
          },
          organizationId,
        );
        this.metricsService.incrementAuthFailureCount();
        throw new UnauthorizedException(genericError);
      }

      // Check if account is locked (Requirement 3.5)
      if (user.accountLocked && user.lockUntil && user.lockUntil > new Date()) {
        const lockRemainingMinutes = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / 60000,
        );
        await this.auditService.logAuthFailure(
          email,
          'Account locked',
          {
            ipAddress,
            userAgent,
            timestamp: new Date(),
          },
          organizationId,
        );
        this.metricsService.incrementAuthFailureCount();
        throw new UnauthorizedException(
          `Account is temporarily locked. Please try again in ${lockRemainingMinutes} minutes.`,
        );
      }

      // Check if email is verified (Requirement 3.4)
      if (!user.emailVerified) {
        await this.auditService.logAuthFailure(
          email,
          'Email not verified',
          {
            ipAddress,
            userAgent,
            timestamp: new Date(),
          },
          organizationId,
        );
        this.metricsService.incrementAuthFailureCount();
        throw new UnauthorizedException(
          'Please verify your email address before logging in. Check your inbox for the verification link.',
        );
      }

      // Verify password (Requirement 3.1)
      const isPasswordValid = await verifyPassword(password, user.passwordHash || '');

      if (!isPasswordValid) {
        // Implement rate limiting (Requirement 3.6)
        const failureKey = `login_failures:${user.id}`;
        const failures = await this.cacheService.get<{ count: number; firstAttempt: number }>(
          failureKey,
        );

        const now = Date.now();
        let failureCount = 1;

        if (failures) {
          // Check if we're still within the rate limit window
          if (now - failures.firstAttempt < RATE_LIMIT_WINDOW) {
            failureCount = failures.count + 1;
          } else {
            // Reset counter if window has passed
            failureCount = 1;
          }
        }

        // Store updated failure count
        await this.cacheService.set(
          failureKey,
          {
            count: failureCount,
            firstAttempt: failures?.firstAttempt || now,
          },
          Math.ceil(RATE_LIMIT_WINDOW / 1000), // TTL in seconds
        );

        // Lock account if threshold exceeded (Requirement 3.6)
        if (failureCount >= RATE_LIMIT_MAX_ATTEMPTS) {
          const lockUntil = new Date(now + ACCOUNT_LOCK_DURATION);
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              accountLocked: true,
              lockUntil,
            },
          });

          await this.auditService.logAuthFailure(
            email,
            'Account locked due to rate limiting',
            {
              ipAddress,
              userAgent,
              timestamp: new Date(),
            },
            organizationId,
          );
          this.metricsService.incrementAuthFailureCount();

          throw new UnauthorizedException(
            'Too many failed login attempts. Your account has been locked for 30 minutes.',
          );
        }

        // Log auth failure
        await this.auditService.logAuthFailure(
          email,
          'Invalid password',
          {
            ipAddress,
            userAgent,
            timestamp: new Date(),
          },
          organizationId,
        );
        this.metricsService.incrementAuthFailureCount();

        throw new UnauthorizedException(genericError);
      }

      // Clear failure counter on successful password verification
      await this.cacheService.delete(`login_failures:${user.id}`);

      // Unlock account if it was locked but lock period has expired
      if (user.accountLocked) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            accountLocked: false,
            lockUntil: null,
          },
        });
      }

      // Check if MFA is enabled (Requirement 5.3)
      if (user.mfaEnabled) {
        // Return response indicating MFA is required
        // Actual token generation happens after MFA verification
        return {
          accessToken: '',
          refreshToken: '',
          user: {
            id: user.id,
            organizationId: user.organizationId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            emailVerified: user.emailVerified,
            mfaEnabled: user.mfaEnabled,
            accountLocked: user.accountLocked,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt,
          },
          requiresMFA: true,
        };
      }

      // Generate JWT tokens (Requirement 3.2, 3.8, 4.1, 4.2)
      const tokenPayload: TokenPayload = {
        user_id: user.id,
        organization_id: user.organizationId,
        role: user.role as 'OWNER' | 'MANAGER' | 'WORKER',
      };

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!jwtSecret || !jwtRefreshSecret) {
        throw new InternalServerErrorException('JWT secrets not configured');
      }

      const accessToken = generateAccessToken(tokenPayload, jwtSecret);
      const familyId = uuidv4();
      const refreshToken = generateRefreshToken(tokenPayload, familyId, jwtRefreshSecret);

      // Store refresh token in database with family_id (Requirement 4.2, 4.8)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          familyId,
          expiresAt,
        },
      });

      // Create session in Redis (Requirement 13.1, 13.2)
      const sessionId = uuidv4();
      await this.cacheService.createSession(user.id, sessionId, {
        sessionId,
        userId: user.id,
        organizationId: user.organizationId,
        deviceInfo: userAgent,
        ipAddress,
        lastActive: new Date(),
        createdAt: new Date(),
      });

      // Detect suspicious login and send notification (Requirement 13.8)
      await this.detectSuspiciousLogin(user.id, user.organizationId, ipAddress, userAgent);

      // Update last login timestamp
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Log successful login in audit log (Requirement 3.7, 11.1)
      await this.auditService.logLogin(user.id, user.organizationId, {
        ipAddress,
        userAgent,
        success: true,
      });

      // Return auth response with sanitized user data
      const { passwordHash: _, passwordHistory, mfaSecret, backupCodes, ...sanitizedUser } = user;

      return {
        accessToken,
        refreshToken,
        user: sanitizedUser,
        requiresMFA: false,
      };
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error('Login error:', error);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }
  /**
   * Login or register user via Google OAuth2
   * Handles new user registration, existing user login, and multi-organization email scenarios
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8
   *
   * @param googleProfile - Google profile data from OAuth2 strategy
   * @param ipAddress - Client IP address
   * @param userAgent - Client user agent
   * @param organizationId - Optional organization ID for multi-org email selection
   * @returns AuthResponseDto with tokens and user data, or multi-org selection prompt
   * @throws BadRequestException if multi-org selection is required
   */
  async loginWithGoogle(
    googleProfile: {
      email: string;
      firstName: string;
      lastName: string;
      googleId: string;
      emailVerified: boolean;
    },
    ipAddress: string,
    userAgent: string,
    organizationId?: string,
  ): Promise<AuthResponseDto | { requiresOrgSelection: true; organizations: Array<{ id: string; businessName: string }> }> {
    try {
      // First, try to find user by Google ID (Requirement 2.4)
      const existingUserByGoogleId = await this.prisma.user.findUnique({
        where: { googleId: googleProfile.googleId },
        include: { organization: true },
      });

      if (existingUserByGoogleId) {
        // User exists with this Google ID, proceed with login
        return await this.generateAuthResponseForUser(
          existingUserByGoogleId,
          ipAddress,
          userAgent,
        );
      }

      // If not found by Google ID, search by email (Requirement 2.4, 2.8)
      const existingUsersByEmail = await this.prisma.user.findMany({
        where: { email: googleProfile.email },
        include: { organization: true },
      });

      // Handle multi-organization email scenario (Requirement 2.8)
      if (existingUsersByEmail.length > 1) {
        if (!organizationId) {
          // Prompt for organization selection
          return {
            requiresOrgSelection: true,
            organizations: existingUsersByEmail.map(u => ({
              id: u.organizationId,
              businessName: u.organization.businessName,
            })),
          };
        }

        // Find the user in the selected organization
        const selectedUser = existingUsersByEmail.find(
          u => u.organizationId === organizationId,
        );

        if (!selectedUser) {
          throw new BadRequestException('Invalid organization selection');
        }

        // Update user with Google ID if not already set (Requirement 2.7)
        if (!selectedUser.googleId) {
          await this.prisma.user.update({
            where: { id: selectedUser.id },
            data: {
              googleId: googleProfile.googleId,
              emailVerified: true, // Mark email as verified for Google users (Requirement 2.6)
            },
          });
          selectedUser.googleId = googleProfile.googleId;
          selectedUser.emailVerified = true;
        }

        return await this.generateAuthResponseForUser(
          selectedUser,
          ipAddress,
          userAgent,
        );
      }

      // Single existing user with this email
      if (existingUsersByEmail.length === 1) {
        const existingUser = existingUsersByEmail[0];

        // Update user with Google ID if not already set (Requirement 2.7)
        if (!existingUser.googleId) {
          await this.prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: googleProfile.googleId,
              emailVerified: true, // Mark email as verified for Google users (Requirement 2.6)
            },
          });
          existingUser.googleId = googleProfile.googleId;
          existingUser.emailVerified = true;
        }

        return await this.generateAuthResponseForUser(
          existingUser,
          ipAddress,
          userAgent,
        );
      }

      // No existing user found - create new organization and owner user (Requirement 2.3)
      const result = await this.prisma.$transaction(async (tx) => {
        // Generate UUID for organization_id
        const newOrganizationId = uuidv4();

        // Create Organization with minimal data from Google profile
        const organization = await tx.organization.create({
          data: {
            id: newOrganizationId,
            businessName: `${googleProfile.firstName} ${googleProfile.lastName}'s Organization`,
            selectedModules: [],
          },
        });

        // Create Owner User with Google profile data (Requirement 2.3, 2.6, 2.7)
        const user = await tx.user.create({
          data: {
            organizationId: organization.id,
            email: googleProfile.email,
            firstName: googleProfile.firstName,
            lastName: googleProfile.lastName,
            role: UserRole.OWNER,
            googleId: googleProfile.googleId,
            emailVerified: true, // Mark email as verified for Google users (Requirement 2.6)
            passwordHash: null, // No password for OAuth users
            passwordHistory: [],
          },
        });

        return { organization, user };
      });

      // Log user creation in audit log
      await this.auditService.logUserCreation(
        result.user.id, // Creator is self for OAuth registration
        result.user.id,
        UserRole.OWNER,
        result.organization.id,
      );

      // Generate auth response
      return await this.generateAuthResponseForUser(
        result.user,
        ipAddress,
        userAgent,
      );
    } catch (error) {
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error('Google OAuth login error:', error);
      throw new InternalServerErrorException('An error occurred during Google authentication');
    }
  }

  /**
   * Helper method to generate auth response for a user
   * Generates tokens, creates session, and logs login
   *
   * @param user - User entity
   * @param ipAddress - Client IP address
   * @param userAgent - Client user agent
   * @returns AuthResponseDto with tokens and user data
   */
  private async generateAuthResponseForUser(
    user: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
    // Check if account is locked
    if (user.accountLocked && user.lockUntil && user.lockUntil > new Date()) {
      const lockRemainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is temporarily locked. Please try again in ${lockRemainingMinutes} minutes.`,
      );
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      return {
        accessToken: '',
        refreshToken: '',
        user: {
          id: user.id,
          organizationId: user.organizationId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
          accountLocked: user.accountLocked,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
        },
        requiresMFA: true,
      };
    }

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      user_id: user.id,
      organization_id: user.organizationId,
      role: user.role as 'OWNER' | 'MANAGER' | 'WORKER',
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new InternalServerErrorException('JWT secrets not configured');
    }

    const accessToken = generateAccessToken(tokenPayload, jwtSecret);
    const familyId = uuidv4();
    const refreshToken = generateRefreshToken(tokenPayload, familyId, jwtRefreshSecret);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        familyId,
        expiresAt,
      },
    });

    // Create session in Redis
    const sessionId = uuidv4();
    await this.cacheService.createSession(user.id, sessionId, {
      sessionId,
      userId: user.id,
      organizationId: user.organizationId,
      deviceInfo: userAgent,
      ipAddress,
      lastActive: new Date(),
      createdAt: new Date(),
    });

    // Detect suspicious login and send notification (Requirement 13.8)
    await this.detectSuspiciousLogin(user.id, user.organizationId, ipAddress, userAgent);

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login in audit log
    await this.auditService.logLogin(user.id, user.organizationId, {
      ipAddress,
      userAgent,
      success: true,
    });

    // Return auth response with sanitized user data
    const { passwordHash: _, passwordHistory, mfaSecret, backupCodes, ...sanitizedUser } = user;

    return {
      accessToken,
      refreshToken,
      user: sanitizedUser,
      requiresMFA: false,
    };
  }


  /**
   * Refresh access and refresh tokens
   * Implements token rotation with family tracking and reuse detection
   * Requirements: 4.3, 4.4, 4.5, 4.7
   * 
   * @param refreshToken - Current refresh token
   * @returns AuthResponseDto with new tokens
   * @throws UnauthorizedException if token is invalid, expired, or reused
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!jwtRefreshSecret || !jwtSecret) {
      throw new InternalServerErrorException('JWT secrets not configured');
    }

    try {
      // Verify the refresh token JWT signature and expiration (Requirement 4.3)
      const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, jwtRefreshSecret);

      // Find the refresh token in database (Requirement 4.3)
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      // Token not found or expired (Requirement 4.7)
      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token has expired (Requirement 4.7)
      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Detect token reuse - if revokedAt is set, token was already used (Requirement 4.5)
      if (storedToken.revokedAt) {
        this.logger.warn(
          `Token reuse detected for user ${storedToken.userId}, family ${storedToken.familyId}`,
        );

        // Invalidate entire token family (Requirement 4.5)
        await this.prisma.refreshToken.updateMany({
          where: {
            familyId: storedToken.familyId,
          },
          data: {
            revokedAt: new Date(),
          },
        });

        // Blacklist all tokens in the family
        const familyTokens = await this.prisma.refreshToken.findMany({
          where: { familyId: storedToken.familyId },
        });

        for (const token of familyTokens) {
          const ttl = Math.max(
            0,
            Math.floor((token.expiresAt.getTime() - Date.now()) / 1000),
          );
          if (ttl > 0) {
            await this.cacheService.blacklistToken(token.token, ttl);
          }
        }

        // Log security event
        await this.auditService.logAuthFailure(
          storedToken.user.email,
          'Token reuse detected - family invalidated',
          {
            ipAddress: '',
            userAgent: '',
            timestamp: new Date(),
          },
          storedToken.user.organizationId,
        );

        throw new UnauthorizedException(
          'Token reuse detected. All tokens in this family have been invalidated. Please log in again.',
        );
      }

      // Mark old refresh token as revoked (Requirement 4.4)
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens with same family_id (Requirement 4.4, 4.7)
      const tokenPayload: TokenPayload = {
        user_id: storedToken.userId,
        organization_id: storedToken.user.organizationId,
        role: storedToken.user.role as 'OWNER' | 'MANAGER' | 'WORKER',
      };

      const newAccessToken = generateAccessToken(tokenPayload, jwtSecret);
      const newRefreshToken = generateRefreshToken(
        tokenPayload,
        storedToken.familyId, // Maintain family lineage
        jwtRefreshSecret,
      );

      // Store new refresh token in database (Requirement 4.4)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          familyId: storedToken.familyId, // Same family
          expiresAt,
        },
      });

      // Log token rotation in audit log (Requirement 11.6)
      await this.auditService.logTokenRotation(
        storedToken.userId,
        storedToken.id,
        newRefreshToken,
        storedToken.user.organizationId,
      );

      // Return new tokens with sanitized user data
      const {
        passwordHash: _,
        passwordHistory,
        mfaSecret,
        backupCodes,
        ...sanitizedUser
      } = storedToken.user;

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: sanitizedUser,
        requiresMFA: false,
      };
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle JWT verification errors
      if (error instanceof Error && error.message.includes('Token verification failed')) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Log unexpected errors
      this.logger.error('Token refresh error:', error);
      throw new InternalServerErrorException('An error occurred during token refresh');
    }
  }

  /**
   * Logout user by blacklisting their access token
   * Requirements: 4.6, 13.4
   * 
   * @param userId - User ID
   * @param accessToken - Access token to blacklist
   * @param sessionId - Optional session ID to delete
   * @returns void
   */
  async logout(userId: string, accessToken: string, sessionId?: string): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT secret not configured');
    }

    try {
      // Verify token and get expiration (Requirement 4.6)
      const { exp } = verifyToken(accessToken, jwtSecret);
      const now = Math.floor(Date.now() / 1000);
      const ttl = Math.max(0, exp - now);

      // Blacklist access token in Redis with TTL until expiration (Requirement 4.6)
      if (ttl > 0) {
        await this.cacheService.blacklistToken(accessToken, ttl);
      }

      // Delete specific session from Redis if sessionId provided (Requirement 13.4)
      if (sessionId) {
        await this.cacheService.deleteSession(userId, sessionId);
      }

      this.logger.log(`User ${userId} logged out successfully`);
    } catch (error) {
      // If token verification fails, still try to delete session
      if (sessionId) {
        await this.cacheService.deleteSession(userId, sessionId);
      }

      // Log error but don't throw - logout should be idempotent
      this.logger.warn(`Logout warning for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Logout user from all devices
   * Invalidates all refresh tokens and sessions
   * Requirements: 4.6, 13.5
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns void
   */
  async logoutAllDevices(userId: string, organizationId: string): Promise<void> {
    try {
      // Get all refresh tokens for the user
      const refreshTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId,
          revokedAt: null, // Only active tokens
        },
      });

      // Revoke all refresh tokens in database (Requirement 4.6)
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Blacklist all refresh tokens in Redis (Requirement 4.6)
      for (const token of refreshTokens) {
        const ttl = Math.max(
          0,
          Math.floor((token.expiresAt.getTime() - Date.now()) / 1000),
        );
        if (ttl > 0) {
          await this.cacheService.blacklistToken(token.token, ttl);
        }
      }

      // Delete all sessions from Redis (Requirement 13.5)
      await this.cacheService.deleteAllSessions(userId);

      // Log the logout event
      await this.auditService.logLogin(userId, organizationId, {
        ipAddress: '',
        userAgent: '',
        success: false, // Using false to indicate logout
      });

      this.logger.log(`User ${userId} logged out from all devices`);
    } catch (error) {
      this.logger.error(`Error during logout all devices for user ${userId}:`, error);
      throw new InternalServerErrorException('An error occurred during logout');
    }
  }


    /**
     * Enable MFA for a user
     * Generates TOTP secret, QR code, and backup codes
     * Requirements: 5.1, 5.2, 5.7
     *
     * @param userId - User ID
     * @param organizationId - Organization ID
     * @returns MFA setup response with secret, QR code URL, and backup codes
     * @throws BadRequestException if MFA is already enabled
     */
    async enableMFA(userId: string, organizationId: string): Promise<{
      secret: string;
      qrCodeUrl: string;
      backupCodes: string[];
    }> {
      const speakeasy = require('speakeasy');
      const QRCode = require('qrcode');

      try {
        // Get user
        const user = await this.usersService.getUserById(userId, organizationId);

        if (!user) {
          throw new BadRequestException('User not found');
        }

        // Check if MFA is already enabled
        if (user.mfaEnabled) {
          throw new BadRequestException('MFA is already enabled for this user');
        }

        // Generate TOTP secret using speakeasy (Requirement 5.1)
        const secret = speakeasy.generateSecret({
          name: `${user.email} (${user.organizationId})`,
          issuer: 'Multi-Tenant Auth System',
          length: 32,
        });

        // Generate QR code for authenticator app (Requirement 5.2)
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Generate 10 backup codes (Requirement 5.7)
        const backupCodes: string[] = [];
        for (let i = 0; i < 10; i++) {
          // Generate 8-character alphanumeric codes
          const code = Math.random().toString(36).substring(2, 10).toUpperCase();
          backupCodes.push(code);
        }

        // Hash backup codes before storing
        const hashedBackupCodes = await Promise.all(
          backupCodes.map(code => hashPassword(code))
        );

        // Store mfaSecret and backupCodes in user record (Requirement 5.1, 5.7)
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            mfaSecret: secret.base32,
            backupCodes: hashedBackupCodes,
            mfaEnabled: true,
          },
        });

        // Log MFA enablement in audit log (Requirement 11.7)
        await this.auditService.logMFAChange(userId, 'ENABLE');

        this.logger.log(`MFA enabled for user ${userId}`);

        return {
          secret: secret.base32,
          qrCodeUrl,
          backupCodes, // Return unhashed codes to user (they need to save these)
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }

        this.logger.error(`Error enabling MFA for user ${userId}:`, error);
        throw new InternalServerErrorException('An error occurred while enabling MFA');
      }
    }


    /**
     * Verify MFA code and complete login
     * Validates TOTP code or backup code, handles failure counter and account locking
     * Requirements: 5.3, 5.4, 5.5, 5.8
     *
     * @param userId - User ID
     * @param token - TOTP code or backup code
     * @param organizationId - Organization ID
     * @param ipAddress - Client IP address for audit logging
     * @param userAgent - Client user agent for audit logging
     * @returns AuthResponseDto with tokens and user data
     * @throws UnauthorizedException if code is invalid or account is locked
     */
    async verifyMFA(
      userId: string,
      token: string,
      organizationId: string,
      ipAddress: string,
      userAgent: string,
    ): Promise<AuthResponseDto> {
      const speakeasy = require('speakeasy');
      const MFA_LOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
      const MFA_MAX_FAILURES = 3;

      try {
        // Get user
        const user = await this.usersService.getUserById(userId, organizationId);

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Check if MFA is enabled
        if (!user.mfaEnabled || !user.mfaSecret) {
          throw new UnauthorizedException('MFA is not enabled for this user');
        }

        // Check if account is locked due to MFA failures (Requirement 5.5)
        if (user.accountLocked && user.lockUntil && user.lockUntil > new Date()) {
          const lockRemainingMinutes = Math.ceil(
            (user.lockUntil.getTime() - Date.now()) / 60000,
          );
          await this.auditService.logAuthFailure(
            user.email,
            'MFA verification - account locked',
            {
              ipAddress,
              userAgent,
              timestamp: new Date(),
            },
            organizationId,
          );
          throw new UnauthorizedException(
            `Account is temporarily locked due to too many MFA failures. Please try again in ${lockRemainingMinutes} minutes.`,
          );
        }

        let isValidCode = false;
        let usedBackupCode = false;
        let backupCodeIndex = -1;

        // First, try to verify as TOTP code (Requirement 5.3)
        isValidCode = speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: 'base32',
          token: token,
          window: 1, // Allow 1 step before/after for clock skew
        });

        // If TOTP fails, try backup codes (Requirement 5.8)
        if (!isValidCode && user.backupCodes && user.backupCodes.length > 0) {
          for (let i = 0; i < user.backupCodes.length; i++) {
            const isMatch = await verifyPassword(token, user.backupCodes[i]);
            if (isMatch) {
              isValidCode = true;
              usedBackupCode = true;
              backupCodeIndex = i;
              break;
            }
          }
        }

        // Handle invalid code (Requirement 5.4)
        if (!isValidCode) {
          // Increment failure counter
          const failureKey = `mfa_failures:${userId}`;
          const failures = await this.cacheService.get<{ count: number; firstAttempt: number }>(
            failureKey,
          );

          const now = Date.now();
          let failureCount = 1;

          if (failures) {
            // Check if we're still within the failure window (15 minutes)
            if (now - failures.firstAttempt < MFA_LOCK_DURATION) {
              failureCount = failures.count + 1;
            } else {
              // Reset counter if window has passed
              failureCount = 1;
            }
          }

          // Store updated failure count
          await this.cacheService.set(
            failureKey,
            {
              count: failureCount,
              firstAttempt: failures?.firstAttempt || now,
            },
            Math.ceil(MFA_LOCK_DURATION / 1000), // TTL in seconds
          );

          // Lock account after 3 failures (Requirement 5.5)
          if (failureCount >= MFA_MAX_FAILURES) {
            const lockUntil = new Date(now + MFA_LOCK_DURATION);
            await this.prisma.user.update({
              where: { id: userId },
              data: {
                accountLocked: true,
                lockUntil,
              },
            });

            await this.auditService.logAuthFailure(
              user.email,
              'Account locked due to MFA failures',
              {
                ipAddress,
                userAgent,
                timestamp: new Date(),
              },
              organizationId,
            );

            throw new UnauthorizedException(
              'Too many failed MFA attempts. Your account has been locked for 15 minutes.',
            );
          }

          // Log MFA failure
          await this.auditService.logAuthFailure(
            user.email,
            'Invalid MFA code',
            {
              ipAddress,
              userAgent,
              timestamp: new Date(),
            },
            organizationId,
          );

          throw new UnauthorizedException('Invalid MFA code');
        }

        // Clear MFA failure counter on success
        await this.cacheService.delete(`mfa_failures:${userId}`);

        // If backup code was used, mark it as consumed (Requirement 5.8)
        if (usedBackupCode && backupCodeIndex >= 0) {
          const updatedBackupCodes = [...user.backupCodes];
          // Remove the used backup code
          updatedBackupCodes.splice(backupCodeIndex, 1);

          await this.prisma.user.update({
            where: { id: userId },
            data: {
              backupCodes: updatedBackupCodes,
            },
          });

          this.logger.log(`Backup code used for user ${userId}, ${updatedBackupCodes.length} codes remaining`);
        }

        // Unlock account if it was locked but lock period has expired
        if (user.accountLocked) {
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              accountLocked: false,
              lockUntil: null,
            },
          });
        }

        // Generate JWT tokens (Requirement 5.3)
        const tokenPayload: TokenPayload = {
          user_id: user.id,
          organization_id: user.organizationId,
          role: user.role as 'OWNER' | 'MANAGER' | 'WORKER',
        };

        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

        if (!jwtSecret || !jwtRefreshSecret) {
          throw new InternalServerErrorException('JWT secrets not configured');
        }

        const accessToken = generateAccessToken(tokenPayload, jwtSecret);
        const familyId = uuidv4();
        const refreshToken = generateRefreshToken(tokenPayload, familyId, jwtRefreshSecret);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await this.prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            familyId,
            expiresAt,
          },
        });

        // Create session in Redis
        const sessionId = uuidv4();
        await this.cacheService.createSession(user.id, sessionId, {
          sessionId,
          userId: user.id,
          organizationId: user.organizationId,
          deviceInfo: userAgent,
          ipAddress,
          lastActive: new Date(),
          createdAt: new Date(),
        });

        // Detect suspicious login and send notification (Requirement 13.8)
        await this.detectSuspiciousLogin(user.id, user.organizationId, ipAddress, userAgent);

        // Update last login timestamp
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Log successful login with MFA
        await this.auditService.logLogin(user.id, user.organizationId, {
          ipAddress,
          userAgent,
          success: true,
        });

        // Return auth response with sanitized user data
        const { passwordHash: _, passwordHistory, mfaSecret, backupCodes, ...sanitizedUser } = user;

        return {
          accessToken,
          refreshToken,
          user: sanitizedUser,
          requiresMFA: false,
        };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }

        this.logger.error(`Error verifying MFA for user ${userId}:`, error);
        throw new InternalServerErrorException('An error occurred during MFA verification');
      }
    }


    /**
     * Disable MFA for a user
     * Requires current password and TOTP verification for security
     * Requirements: 5.6
     *
     * @param userId - User ID
     * @param currentPassword - User's current password
     * @param totpToken - Current TOTP code for verification
     * @param organizationId - Organization ID
     * @returns void
     * @throws UnauthorizedException if password or TOTP is invalid
     * @throws BadRequestException if MFA is not enabled
     */
    async disableMFA(
      userId: string,
      currentPassword: string,
      totpToken: string,
      organizationId: string,
    ): Promise<void> {
      const speakeasy = require('speakeasy');

      try {
        // Get user
        const user = await this.usersService.getUserById(userId, organizationId);

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Check if MFA is enabled
        if (!user.mfaEnabled || !user.mfaSecret) {
          throw new BadRequestException('MFA is not enabled for this user');
        }

        // Verify current password (Requirement 5.6)
        const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash || '');
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid password');
        }

        // Verify TOTP code (Requirement 5.6)
        const isValidTotp = speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: 'base32',
          token: totpToken,
          window: 1, // Allow 1 step before/after for clock skew
        });

        if (!isValidTotp) {
          throw new UnauthorizedException('Invalid TOTP code');
        }

        // Clear mfaSecret and backupCodes (Requirement 5.6)
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            mfaEnabled: false,
            mfaSecret: null,
            backupCodes: [],
          },
        });

        // Log MFA disablement in audit log (Requirement 11.7)
        await this.auditService.logMFAChange(userId, 'DISABLE');

        this.logger.log(`MFA disabled for user ${userId}`);
      } catch (error) {
        if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
          throw error;
        }

        this.logger.error(`Error disabling MFA for user ${userId}:`, error);
        throw new InternalServerErrorException('An error occurred while disabling MFA');
      }
    }

  /**
   * Request password reset
   * Sends a time-limited reset link (1-hour expiration)
   * Does not reveal whether email exists
   * Requirements: 14.3, 14.4, 14.7
   * 
   * @param email - User email address
   * @param organizationId - Organization ID
   * @returns void (always succeeds to not reveal email existence)
   */
  async requestPasswordReset(email: string, organizationId: string): Promise<void> {
    try {
      // Find user by email and organization
      const user = await this.usersService.getUserByEmail(email, organizationId);

      // Don't reveal whether email exists (Requirement 14.7)
      if (!user) {
        this.logger.log(`Password reset requested for non-existent email: ${email}`);
        // Return success to not reveal email doesn't exist
        return;
      }

      // Generate unique reset token
      const resetToken = uuidv4();
      
      // Set expiration to 1 hour from now (Requirement 14.3)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Store reset token in database
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
        },
      });

      // TODO: Send password reset email with time-limited link (Requirement 14.3)
      // This will be implemented when email service is available
      // const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      // await this.emailService.sendPasswordResetEmail(user.email, resetLink, expiresAt);

      this.logger.log(`Password reset token generated for user ${user.id}`);
    } catch (error) {
      // Log error but don't throw - always return success to not reveal email existence
      this.logger.error('Error in requestPasswordReset:', error);
    }
  }

  /**
   * Reset password using reset token
   * Validates token, ensures single use, and updates password
   * Requirements: 14.3, 14.4, 14.7
   * 
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns void
   * @throws UnauthorizedException if token is invalid, expired, or already used
   * @throws BadRequestException if password doesn't meet complexity requirements
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find reset token in database
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      // Token not found
      if (!resetToken) {
        throw new UnauthorizedException('Invalid or expired password reset token');
      }

      // Check if token has expired (Requirement 14.3)
      if (resetToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Password reset token has expired');
      }

      // Check if token has already been used (Requirement 14.4)
      if (resetToken.usedAt) {
        throw new UnauthorizedException('Password reset token has already been used');
      }

      // Validate new password complexity (Requirement 14.1)
      const passwordValidation = validatePasswordComplexity(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException({
          message: 'Password does not meet complexity requirements',
          errors: passwordValidation.errors,
        });
      }

      // Check password history (Requirement 14.8)
      const passwordHistory = resetToken.user.passwordHistory || [];
      const isInHistory = await checkPasswordHistory(newPassword, passwordHistory);
      if (isInHistory) {
        throw new BadRequestException(
          'New password cannot match any of your last 5 passwords',
        );
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password history
      const updatedHistory = [...passwordHistory];
      if (resetToken.user.passwordHash) {
        updatedHistory.push(resetToken.user.passwordHash);
      }
      // Keep only last 5 passwords
      const limitedHistory = updatedHistory.slice(-5);

      // Update user password and password history
      await this.prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash: newPasswordHash,
          passwordHistory: limitedHistory,
        },
      });

      // Mark token as used (Requirement 14.4)
      await this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      // TODO: Send confirmation email (Requirement 14.10)
      // This will be implemented when email service is available
      // await this.emailService.sendPasswordChangedEmail(resetToken.user.email);

      this.logger.log(`Password reset successfully for user ${resetToken.userId}`);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error in resetPassword:', error);
      throw new InternalServerErrorException('An error occurred while resetting password');
    }
  }

  /**
   * Change password for authenticated user
   * Requires current password verification, validates complexity, checks history
   * Invalidates all refresh tokens and sends confirmation email
   * Requirements: 14.5, 14.6, 14.8, 14.10
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password
   * @returns void
   * @throws UnauthorizedException if current password is invalid
   * @throws BadRequestException if new password doesn't meet requirements
   */
  async changePassword(
    userId: string,
    organizationId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // Get user
      const user = await this.usersService.getUserById(userId, organizationId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify current password (Requirement 14.5)
      const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash || '');
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Validate new password complexity (Requirement 14.1)
      const passwordValidation = validatePasswordComplexity(newPassword);
      if (!passwordValidation.isValid) {
        throw new BadRequestException({
          message: 'Password does not meet complexity requirements',
          errors: passwordValidation.errors,
        });
      }

      // Check password history (Requirement 14.8)
      const passwordHistory = user.passwordHistory || [];
      const isInHistory = await checkPasswordHistory(newPassword, passwordHistory);
      if (isInHistory) {
        throw new BadRequestException(
          'New password cannot match any of your last 5 passwords',
        );
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password history
      const updatedHistory = [...passwordHistory];
      if (user.passwordHash) {
        updatedHistory.push(user.passwordHash);
      }
      // Keep only last 5 passwords
      const limitedHistory = updatedHistory.slice(-5);

      // Update user password and password history
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          passwordHistory: limitedHistory,
        },
      });

      // Invalidate all refresh tokens (Requirement 14.6)
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      // Delete all sessions (force re-login on all devices)
      await this.cacheService.deleteAllSessions(userId);

      // TODO: Send confirmation email (Requirement 14.10)
      // This will be implemented when email service is available
      // await this.emailService.sendPasswordChangedEmail(user.email);

      this.logger.log(`Password changed successfully for user ${userId}`);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Error changing password for user ${userId}:`, error);
      throw new InternalServerErrorException('An error occurred while changing password');
    }
  }


    /**
     * List active sessions for a user
     * Requirements: 13.7
     *
     * @param userId - User ID
     * @param organizationId - Organization ID
     * @returns Array of active sessions with device info
     */
    async listActiveSessions(
      userId: string,
      organizationId: string,
    ): Promise<Array<{
      sessionId: string;
      deviceInfo: string;
      ipAddress: string;
      lastActive: Date;
      createdAt: Date;
    }>> {
      try {
        // Verify user exists
        const user = await this.usersService.getUserById(userId, organizationId);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Get all active sessions
        const sessions = await this.cacheService.getUserSessions(userId);

        return sessions.map(session => ({
          sessionId: session.sessionId,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          lastActive: session.lastActive,
          createdAt: session.createdAt,
        }));
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }

        this.logger.error(`Error listing active sessions for user ${userId}:`, error);
        throw new InternalServerErrorException('An error occurred while listing sessions');
      }
    }

    /**
     * Revoke a specific session
     * Requirements: 13.4, 13.9
     *
     * @param userId - User ID
     * @param sessionId - Session ID to revoke
     * @param organizationId - Organization ID
     * @returns void
     */
    async revokeSession(
      userId: string,
      sessionId: string,
      organizationId: string,
    ): Promise<void> {
      try {
        // Verify user exists
        const user = await this.usersService.getUserById(userId, organizationId);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        // Get session to find associated tokens
        const session = await this.cacheService.getSession(userId, sessionId);

        // Delete the session
        await this.cacheService.deleteSession(userId, sessionId);

        // Blacklist any tokens associated with this session (Requirement 13.9)
        // Note: In a production system, you'd need to track which tokens belong to which session
        // For now, we'll just delete the session and rely on token validation

        this.logger.log(`Session ${sessionId} revoked for user ${userId}`);
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }

        this.logger.error(`Error revoking session ${sessionId} for user ${userId}:`, error);
        throw new InternalServerErrorException('An error occurred while revoking session');
      }
    }

    /**
     * Detect suspicious login and send notification
     * Requirements: 13.8
     *
     * @param userId - User ID
     * @param organizationId - Organization ID
     * @param ipAddress - Current IP address
     * @param deviceInfo - Current device info
     * @returns boolean indicating if login is suspicious
     */
    private async detectSuspiciousLogin(
      userId: string,
      organizationId: string,
      ipAddress: string,
      deviceInfo: string,
    ): Promise<boolean> {
      try {
        // Get user's previous sessions
        const previousSessions = await this.cacheService.getUserSessions(userId);

        // If this is the first login, it's not suspicious
        if (previousSessions.length === 0) {
          return false;
        }

        // Check if this device has been used before
        const knownDevice = previousSessions.some(
          session => session.deviceInfo === deviceInfo,
        );

        // Check if this IP has been used before
        const knownIP = previousSessions.some(
          session => session.ipAddress === ipAddress,
        );

        // Login is suspicious if both device and IP are new
        const isSuspicious = !knownDevice && !knownIP;

        if (isSuspicious) {
          // TODO: Send email notification (Requirement 13.8)
          // This will be implemented when email service is available
          // await this.emailService.sendSuspiciousLoginAlert(user.email, {
          //   ipAddress,
          //   deviceInfo,
          //   timestamp: new Date(),
          // });

          this.logger.warn(
            `Suspicious login detected for user ${userId} from IP ${ipAddress} with device ${deviceInfo}`,
          );
        }

        return isSuspicious;
      } catch (error) {
        this.logger.error(`Error detecting suspicious login for user ${userId}:`, error);
        return false; // Don't block login on detection error
      }
    }

    /**
     * Update session activity timestamp
     * Requirements: 13.6
     *
     * @param userId - User ID
     * @param sessionId - Session ID
     * @returns void
     */
    async updateSessionActivity(
      userId: string,
      sessionId: string,
    ): Promise<void> {
      try {
        await this.cacheService.updateSessionActivity(userId, sessionId);
      } catch (error) {
        this.logger.error(`Error updating session activity:`, error);
        // Don't throw error - this is a background operation
      }
    }

}
