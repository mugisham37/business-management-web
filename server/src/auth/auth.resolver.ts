import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

/**
 * AuthResolver
 * Implements requirements 16.1, 16.2
 * 
 * Provides GraphQL mutations for authentication operations:
 * - Organization registration
 * - Login (email/password and Google OAuth)
 * - MFA verification
 * - Token refresh
 * - Logout operations
 * - Password management
 * - MFA management
 */
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new organization with an owner user
   * Requirement 1.1: Organization Registration and Owner Creation
   */
  @Mutation(() => AuthResponseDto)
  async registerOrganization(
    @Args('input') input: RegisterOrganizationDto,
  ): Promise<AuthResponseDto> {
    return this.authService.registerOrganization(input);
  }

  /**
   * Login with email and password
   * Requirement 3: Email/Password Authentication
   */
  @Mutation(() => AuthResponseDto)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('organizationId') organizationId: string,
    @Context() context: any,
  ): Promise<AuthResponseDto> {
    const ipAddress = this.extractIpAddress(context.req);
    const userAgent = context.req.headers['user-agent'] || 'unknown';
    return this.authService.login(email, password, organizationId, ipAddress, userAgent);
  }

  /**
   * Login with Google OAuth2
   * Requirement 2: OAuth2 Authentication (Google)
   * Note: This mutation expects the Google OAuth code to be exchanged for a profile
   * In a real implementation, this would integrate with the GoogleOAuthStrategy
   * For now, we'll throw an error indicating this needs to be implemented via the OAuth flow
   */
  @Mutation(() => AuthResponseDto)
  async loginWithGoogle(
    @Args('code') code: string,
    @Args('organizationId', { nullable: true }) organizationId: string | undefined,
    @Context() context: any,
  ): Promise<any> {
    // TODO: Implement Google OAuth code exchange
    // This requires integrating with Google's OAuth2 API to exchange the code for a profile
    // For now, we'll throw an error
    throw new Error(
      'Google OAuth login via GraphQL is not yet implemented. ' +
      'Please use the REST endpoint /auth/google for OAuth flow.'
    );
  }

  /**
   * Verify MFA token after initial login
   * Requirement 5: Multi-Factor Authentication (MFA)
   */
  @Mutation(() => AuthResponseDto)
  async verifyMFA(
    @Args('userId') userId: string,
    @Args('token') token: string,
    @Args('organizationId') organizationId: string,
    @Context() context: any,
  ): Promise<AuthResponseDto> {
    const ipAddress = this.extractIpAddress(context.req);
    const userAgent = context.req.headers['user-agent'] || 'unknown';
    return this.authService.verifyMFA(userId, token, organizationId, ipAddress, userAgent);
  }

  /**
   * Refresh access token using refresh token
   * Requirement 4: Token Management and Rotation
   */
  @Mutation(() => AuthResponseDto)
  async refreshTokens(
    @Args('refreshToken') refreshToken: string,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshToken);
  }

  /**
   * Logout from current session
   * Requirement 4.6: Token blacklisting on logout
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: any,
    @Context() context: any,
  ): Promise<boolean> {
    const token = this.extractToken(context.req);
    if (!token) {
      throw new Error('No token provided');
    }
    await this.authService.logout(user.userId, token);
    return true;
  }

  /**
   * Logout from all devices
   * Requirement 13.5: Delete all sessions on logout-all-devices
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logoutAllDevices(@CurrentUser() user: any): Promise<boolean> {
    await this.authService.logoutAllDevices(user.userId, user.organizationId);
    return true;
  }

  /**
   * Request password reset email
   * Requirement 14.3: Password reset with time-limited link
   */
  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('email') email: string,
    @Args('organizationId', { nullable: true }) organizationId?: string,
  ): Promise<boolean> {
    await this.authService.requestPasswordReset(email, organizationId || '');
    return true;
  }

  /**
   * Reset password using reset token
   * Requirement 14.4: Password reset link single use
   */
  @Mutation(() => Boolean)
  async resetPassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    await this.authService.resetPassword(token, newPassword);
    return true;
  }

  /**
   * Change password for authenticated user
   * Requirement 14.5: Password change with current password verification
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: any,
    @Args('currentPassword') currentPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    await this.authService.changePassword(
      user.userId,
      user.organizationId,
      currentPassword,
      newPassword,
    );
    return true;
  }

  /**
   * Enable MFA for authenticated user
   * Requirement 5.1: MFA enrollment with TOTP
   */
  @Mutation(() => MFASetupResponse)
  @UseGuards(JwtAuthGuard)
  async enableMFA(@CurrentUser() user: any): Promise<MFASetupResponse> {
    return this.authService.enableMFA(user.userId, user.organizationId);
  }

  /**
   * Disable MFA for authenticated user
   * Requirement 5.6: MFA disable with password and TOTP verification
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async disableMFA(
    @CurrentUser() user: any,
    @Args('totpToken') totpToken: string,
    @Args('currentPassword') currentPassword: string,
  ): Promise<boolean> {
    await this.authService.disableMFA(
      user.userId,
      user.organizationId,
      totpToken,
      currentPassword,
    );
    return true;
  }

  /**
   * List active sessions for authenticated user
   * Requirement 13.7: List active sessions with device info
   */
  @Mutation(() => [SessionInfo])
  @UseGuards(JwtAuthGuard)
  async listActiveSessions(@CurrentUser() user: any): Promise<SessionInfo[]> {
    return this.authService.listActiveSessions(user.userId, user.organizationId);
  }

  /**
   * Revoke a specific session
   * Requirement 13.4, 13.9: Session revocation with token blacklisting
   */
  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @CurrentUser() user: any,
    @Args('sessionId') sessionId: string,
  ): Promise<boolean> {
    await this.authService.revokeSession(user.userId, sessionId, user.organizationId);
    return true;
  }


  /**
   * Extract JWT token from request
   */
  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Extract IP address from request
   */
  private extractIpAddress(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
}

/**
 * MFASetupResponse type for GraphQL
 */
class MFASetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/**
 * SessionInfo type for GraphQL
 */
class SessionInfo {
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  createdAt: Date;
}
