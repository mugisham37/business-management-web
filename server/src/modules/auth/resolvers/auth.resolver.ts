import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SocialAuthService } from '../services/social-auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import {
  LoginInput,
  LoginWithMfaInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  OAuthLoginInput,
} from '../inputs/auth.input';
import {
  LoginResponse,
  RefreshTokenResponse,
  MfaRequirementResponse,
  AuthUser,
} from '../types/auth.types';

/**
 * Enhanced Authentication Resolver
 * 
 * Provides comprehensive GraphQL authentication operations with enterprise-grade security:
 * - Multi-factor authentication support
 * - Risk-based authentication
 * - Social authentication (OAuth)
 * - Session management
 * - Security monitoring and audit logging
 * - Rate limiting and abuse prevention
 */
@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly socialAuthService: SocialAuthService,
  ) {}

  /**
   * Standard login with email and password
   * Includes risk assessment and security validation
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with email and password. Includes risk assessment and security validation.',
  })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    const ipAddress = context.req.ip;
    const userAgent = context.req.headers['user-agent'];
    const deviceFingerprint = context.req.headers['x-device-fingerprint'] 
      ? JSON.parse(context.req.headers['x-device-fingerprint'])
      : undefined;

    return this.authService.login(input, ipAddress, userAgent, deviceFingerprint);
  }

  /**
   * Login with multi-factor authentication
   * For users with MFA enabled or high-risk login attempts
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with email, password, and MFA token for enhanced security.',
  })
  async loginWithMfa(
    @Args('input') input: LoginWithMfaInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    const ipAddress = context.req.ip;
    const userAgent = context.req.headers['user-agent'];
    const deviceFingerprint = context.req.headers['x-device-fingerprint'] 
      ? JSON.parse(context.req.headers['x-device-fingerprint'])
      : undefined;

    return this.authService.loginWithMfa(
      input.email,
      input.password,
      input.mfaToken,
      ipAddress,
      userAgent,
      deviceFingerprint
    );
  }

  /**
   * Check if user requires MFA before login
   * Public endpoint for login flow optimization
   */
  @Public()
  @Query(() => MfaRequirementResponse, {
    description: 'Check if user requires MFA for login. Used to optimize login flow.',
  })
  async requiresMfa(
    @Args('email') email: string,
  ): Promise<MfaRequirementResponse> {
    return this.authService.requiresMfa(email);
  }

  /**
   * OAuth social login
   * Supports Google, Facebook, GitHub, and other OAuth providers
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with OAuth provider (Google, Facebook, GitHub). Handles account linking and creation.',
  })
  async oauthLogin(
    @Args('input') input: OAuthLoginInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    const ipAddress = context.req.ip;
    const userAgent = context.req.headers['user-agent'];

    return this.socialAuthService.handleOAuthLogin(
      input.provider,
      input.code,
      input.state,
      input.tenantId,
      ipAddress,
      userAgent,
    );
  }

  /**
   * User registration with security validation
   * Includes email verification and account setup
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Register a new user account with comprehensive security validation.',
  })
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    const ipAddress = context.req.ip;
    const userAgent = context.req.headers['user-agent'];
    const deviceFingerprint = context.req.headers['x-device-fingerprint'] 
      ? JSON.parse(context.req.headers['x-device-fingerprint'])
      : undefined;

    return this.authService.register(input, ipAddress, userAgent, deviceFingerprint);
  }

  /**
   * Logout from current session
   * Revokes session and clears authentication state
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => MutationResponse, {
    description: 'Logout from current session. Revokes session and clears authentication state.',
  })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    await this.authService.logout(user.sessionId);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Logout from all sessions
   * Security feature to revoke all active sessions
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => MutationResponse, {
    description: 'Logout from all active sessions. Security feature for account compromise.',
  })
  async logoutAllSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    await this.authService.logoutAllSessions(user.id);

    return {
      success: true,
      message: 'Logged out from all sessions successfully',
    };
  }

  /**
   * Refresh access token using refresh token
   * Includes security validation and risk assessment
   */
  @Public()
  @Mutation(() => RefreshTokenResponse, {
    description: 'Refresh access token using refresh token. Includes security validation.',
  })
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
    @Context() context: any,
  ): Promise<RefreshTokenResponse> {
    const ipAddress = context.req.ip;
    const userAgent = context.req.headers['user-agent'];

    return this.authService.refreshToken(input.refreshToken, ipAddress, userAgent);
  }

  /**
   * Change password for authenticated user
   * Requires current password verification
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => MutationResponse, {
    description: 'Change password for current user. Requires current password verification.',
  })
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    await this.authService.changePassword(user.id, input);

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }

  /**
   * Request password reset email
   * Initiates secure password reset flow
   */
  @Public()
  @Mutation(() => MutationResponse, {
    description: 'Request password reset email. Initiates secure password reset flow.',
  })
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
    @Context() context: any,
  ): Promise<MutationResponse> {
    const ipAddress = context.req.ip;
    
    await this.authService.forgotPassword(input, ipAddress);

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password using reset token
   * Completes password reset flow with security validation
   */
  @Public()
  @Mutation(() => MutationResponse, {
    description: 'Reset password using reset token from email. Completes password reset flow.',
  })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
    @Context() context: any,
  ): Promise<MutationResponse> {
    const ipAddress = context.req.ip;
    
    await this.authService.resetPassword(input, ipAddress);

    return {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Get current authenticated user
   * Returns user profile and security context
   */
  @UseGuards(JwtAuthGuard)
  @Query(() => AuthUser, {
    description: 'Get current authenticated user profile and security context.',
    nullable: true,
  })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser | null> {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      businessTier: user.businessTier,
      featureFlags: user.featureFlags,
      trialExpiresAt: user.trialExpiresAt,
    };
  }

  /**
   * Validate current session
   * Returns session validity and security status
   */
  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean, {
    description: 'Validate current session and return security status.',
  })
  async validateSession(@CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    if (!user || !user.sessionId) {
      return false;
    }

    const sessionInfo = await this.authService.validateSession(user.sessionId);
    return sessionInfo !== null;
  }

  /**
   * Get user's security status
   * Returns comprehensive security information
   */
  @UseGuards(JwtAuthGuard)
  @Query(() => String, {
    description: 'Get comprehensive security status for current user.',
  })
  async getSecurityStatus(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    // This would return detailed security status in a real implementation
    return JSON.stringify({
      userId: user.id,
      sessionId: user.sessionId,
      lastLoginAt: user.lastLoginAt,
      securityLevel: user.securityContext?.riskScore ? 
        (user.securityContext.riskScore < 30 ? 'high' : 
         user.securityContext.riskScore < 60 ? 'medium' : 'low') : 'unknown',
      mfaEnabled: user.securityContext?.mfaVerified || false,
      deviceTrusted: user.securityContext?.deviceTrustScore > 70,
      networkTrusted: user.securityContext?.networkTrust > 70,
    });
  }
}