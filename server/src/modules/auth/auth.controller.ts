import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LocalAuthGuard, LocalTeamMemberAuthGuard } from './guards';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RegisterDto,
  VerifyEmailDto,
  ResendVerificationDto,
  LoginMfaDto,
  RefreshTokenDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
  ChangePasswordDto,
} from './dto';
import { User } from '@prisma/client';

/**
 * Auth Controller
 * 
 * Provides REST API endpoints for authentication operations:
 * - Registration (primary owner)
 * - Email verification
 * - Login (primary owner and team member)
 * - MFA login
 * - Token refresh
 * - Logout
 * - Password reset
 * - Password change
 * 
 * Requirements: 1.1, 2.2, 2.5, 3.1, 3.6, 6.1, 11.3, 11.4, 11.6, 14.1, 14.2, 14.3
 */
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Register a new primary owner with organization
   * 
   * POST /auth/register
   * 
   * Requirement 1.1: WHEN a user submits registration with email, password, and 
   * organization name, THE Auth_System SHALL create both an organization and a user account
   * 
   * @param dto - Registration data (email, password, organizationName)
   * @returns Registration result with user and organization data
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`Registration request for email: ${dto.email}`);
    
    const result = await this.authService.registerPrimaryOwner(dto);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Verify user email with token
   * 
   * POST /auth/verify-email
   * 
   * Requirement 2.2: WHEN a user clicks the verification link, THE Auth_System 
   * SHALL validate the token and mark the email as verified
   * 
   * @param dto - Verification token
   * @param req - Request object for session metadata
   * @returns Success message, tokens, user data, and onboarding flag
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: any) {
    this.logger.log('Email verification request');
    
    // Extract session metadata from request
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceFingerprint: req.headers['x-device-fingerprint'],
      location: req.headers['x-geo-location'],
    };
    
    const result = await this.authService.verifyEmail(dto.token, metadata);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Resend email verification
   * 
   * POST /auth/resend-verification
   * 
   * Requirement 2.5: WHEN a user requests a new verification email, THE Auth_System 
   * SHALL invalidate previous tokens and send a new one
   * 
   * @param dto - User email
   * @returns Success message
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    this.logger.log(`Resend verification request for email: ${dto.email}`);
    
    // Find user by email (across all organizations)
    const user = await this.usersService.findByEmailGlobal(dto.email);
    
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return {
        success: true,
        message: 'If an account with that email exists, a verification email has been sent.',
      };
    }
    
    // Send verification email
    await this.authService.sendVerificationEmail(user.id, user.organizationId);
    
    return {
      success: true,
      message: 'Verification email has been sent.',
    };
  }

  /**
   * Login for primary owner (email + password)
   * 
   * POST /auth/login
   * 
   * Requirement 3.1: WHEN a user submits valid email and password credentials, 
   * THE Auth_System SHALL authenticate the user and return access and refresh tokens
   * 
   * @param req - Request object with user from LocalStrategy
   * @returns Login result with tokens or MFA required response
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: any) {
    const user = req.user as User;
    
    this.logger.log(`Login request for user: ${user.id}`);
    
    // Extract session metadata from request
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceFingerprint: req.headers['x-device-fingerprint'],
      location: req.headers['x-geo-location'],
    };
    
    const result = await this.authService.login(user, metadata);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Login for team member (company code + username + password)
   * 
   * POST /auth/login/team-member
   * 
   * Requirement 6.1: WHEN a Team_Member submits company code, username, and password, 
   * THE Auth_System SHALL authenticate against the correct organization
   * 
   * @param req - Request object with user from LocalTeamMemberStrategy
   * @returns Login result with tokens or MFA required response
   */
  @Post('login/team-member')
  @UseGuards(LocalTeamMemberAuthGuard)
  @HttpCode(HttpStatus.OK)
  async loginTeamMember(@Req() req: any) {
    const user = req.user as User;
    
    this.logger.log(`Team member login request for user: ${user.id}`);
    
    // Extract session metadata from request
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceFingerprint: req.headers['x-device-fingerprint'],
      location: req.headers['x-geo-location'],
    };
    
    const result = await this.authService.login(user, metadata);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Complete login with MFA validation
   * 
   * POST /auth/login/mfa
   * 
   * Requirement 3.6: WHEN a user has MFA enabled, THE Auth_System SHALL require 
   * MFA validation before issuing tokens
   * 
   * @param dto - Temporary token and MFA code
   * @param req - Request object for session metadata
   * @returns Login result with tokens
   */
  @Post('login/mfa')
  @HttpCode(HttpStatus.OK)
  async loginWithMFA(@Body() dto: LoginMfaDto, @Req() req: any) {
    this.logger.log('MFA login request');
    
    // Extract session metadata from request
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceFingerprint: req.headers['x-device-fingerprint'],
      location: req.headers['x-geo-location'],
    };
    
    const result = await this.authService.loginWithMFA(
      dto.tempToken,
      dto.mfaCode,
      metadata,
    );
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Refresh access and refresh tokens
   * 
   * POST /auth/refresh
   * 
   * Requirement 11.6: WHEN a refresh token is used, THE Session_Manager SHALL 
   * rotate the refresh token and invalidate the old one
   * 
   * @param dto - Current refresh token
   * @returns New token pair
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    this.logger.log('Token refresh request');
    
    const result = await this.authService.refreshTokens(dto.refreshToken);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Logout current session
   * 
   * POST /auth/logout
   * 
   * Requirement 11.3: WHEN a user requests session revocation, THE Session_Manager 
   * SHALL invalidate the specified session within 1 second
   * 
   * @param user - Current user from JWT
   * @param req - Request object to extract session info
   * @returns Success message
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: User, @Req() req: any) {
    this.logger.log(`Logout request for user: ${user.id}`);
    
    // Extract refresh token from request body or headers
    const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    
    if (refreshToken) {
      // Find session by refresh token
      const session = await this.sessionsService.findByRefreshToken(refreshToken);
      
      if (session && session.userId === user.id) {
        // Revoke the session
        await this.sessionsService.revoke(session.id);
      }
    }
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Logout all sessions except current
   * 
   * POST /auth/logout-all
   * 
   * Requirement 11.4: WHEN a user requests "logout all devices", THE Session_Manager 
   * SHALL invalidate all sessions except the current one
   * 
   * @param user - Current user from JWT
   * @param req - Request object to extract current session info
   * @returns Success message
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: User, @Req() req: any) {
    this.logger.log(`Logout all request for user: ${user.id}`);
    
    // Extract refresh token from request body or headers
    const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    
    let currentSessionId: string | undefined;
    
    if (refreshToken) {
      // Find current session by refresh token
      const session = await this.sessionsService.findByRefreshToken(refreshToken);
      
      if (session && session.userId === user.id) {
        currentSessionId = session.id;
      }
    }
    
    // Revoke all sessions except current
    if (currentSessionId) {
      await this.sessionsService.revokeAllExcept(user.id, currentSessionId);
    } else {
      // If current session not found, revoke all sessions
      await this.sessionsService.revokeAll(user.id);
    }
    
    return {
      success: true,
      message: 'All other sessions have been logged out',
    };
  }

  /**
   * Request password reset
   * 
   * POST /auth/password-reset/request
   * 
   * Requirement 14.1: WHEN a user requests password reset, THE Auth_System SHALL 
   * send a reset email with a time-limited token (1 hour)
   * 
   * @param dto - User email
   * @param req - Request object for IP address
   * @returns Success message
   */
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto, @Req() req: any) {
    this.logger.log(`Password reset request for email: ${dto.email}`);
    
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    const result = await this.authService.requestPasswordReset(dto.email, ipAddress);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Confirm password reset with token
   * 
   * POST /auth/password-reset/confirm
   * 
   * Requirement 14.2: WHEN a reset token is submitted with a new password, 
   * THE Auth_System SHALL validate the token and update the password
   * 
   * @param dto - Reset token and new password
   * @param req - Request object for IP address and user agent
   * @returns Success message
   */
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto, @Req() req: any) {
    this.logger.log('Password reset confirmation request');
    
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await this.authService.resetPassword(
      dto.token,
      dto.newPassword,
      ipAddress,
      userAgent,
    );
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Change password for authenticated user
   * 
   * POST /auth/password/change
   * 
   * Requirement 14.3: WHEN a password is changed, THE Auth_System SHALL 
   * invalidate all existing sessions except the current one
   * 
   * @param user - Current user from JWT
   * @param dto - Old password and new password
   * @param req - Request object for session info and audit data
   * @returns Success message
   */
  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ) {
    this.logger.log(`Password change request for user: ${user.id}`);
    
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Extract refresh token to identify current session
    const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    
    let currentSessionId: string | undefined;
    
    if (refreshToken) {
      const session = await this.sessionsService.findByRefreshToken(refreshToken);
      
      if (session && session.userId === user.id) {
        currentSessionId = session.id;
      }
    }
    
    const result = await this.authService.changePassword(
      user.id,
      user.organizationId,
      dto.oldPassword,
      dto.newPassword,
      currentSessionId,
      ipAddress,
      userAgent,
    );
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get current authenticated user
   * 
   * GET /auth/me
   * 
   * Returns the current user's profile information based on JWT token.
   * Used by the frontend to verify authentication and load user data.
   * 
   * @param user - Current user from JWT
   * @returns User profile data
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: User) {
    this.logger.log(`Get current user request: ${user.id}`);
    
    // Get full user details with organization
    const fullUser = await this.usersService.findById(user.id, user.organizationId);
    
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    
    return {
      success: true,
      data: {
        id: fullUser.id,
        email: fullUser.email,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        username: fullUser.username,
        organizationId: fullUser.organizationId,
        status: fullUser.status,
        emailVerified: fullUser.emailVerified,
        mfaEnabled: fullUser.mfaEnabled,
        lastLoginAt: fullUser.lastLoginAt,
        createdAt: fullUser.createdAt,
      },
    };
  }
}
