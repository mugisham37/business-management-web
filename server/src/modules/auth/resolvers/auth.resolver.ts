import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { SocialAuthService } from '../services/social-auth.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
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
 * Auth resolver for authentication operations
 * Handles login, logout, register, password reset, and token refresh
 */
@Resolver()
export class AuthResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly authService: AuthService,
    private readonly socialAuthService: SocialAuthService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Login mutation
   * Authenticates user and returns JWT tokens
   * Rate limited to prevent brute force attacks
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with email and password',
  })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    try {
      const ipAddress = context.req.ip;
      const userAgent = context.req.headers['user-agent'];

      const result = await this.authService.login(
        {
          email: input.email,
          password: input.password,
          rememberMe: input.rememberMe ?? false,
        },
        ipAddress,
        userAgent,
      );

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Login with MFA mutation
   * Authenticates user with MFA token
   * Rate limited to prevent brute force attacks
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with email, password, and MFA token',
  })
  async loginWithMfa(
    @Args('input') input: LoginWithMfaInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    try {
      const ipAddress = context.req.ip;
      const userAgent = context.req.headers['user-agent'];

      const result = await this.authService.loginWithMfa(
        input.email,
        input.password,
        input.mfaToken,
        ipAddress,
        userAgent,
      );

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Login with MFA failed');
    }
  }

  /**
   * Check if user requires MFA
   * Public query to check MFA requirement before login
   */
  @Public()
  @Query(() => MfaRequirementResponse, {
    description: 'Check if user requires MFA for login',
  })
  async requiresMfa(
    @Args('email') email: string,
  ): Promise<MfaRequirementResponse> {
    try {
      const result = await this.authService.requiresMfa(email);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check MFA requirement');
    }
  }

  /**
   * OAuth login mutation
   * Authenticates user with OAuth provider code
   * Public endpoint, rate limited
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Login with OAuth provider authorization code',
  })
  async oauthLogin(
    @Args('input') input: OAuthLoginInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    try {
      const ipAddress = context.req.ip;
      const userAgent = context.req.headers['user-agent'];

      const result = await this.socialAuthService.handleOAuthLogin(
        input.provider,
        input.code,
        input.state,
        input.tenantId,
        ipAddress,
        userAgent,
      );

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'OAuth login failed');
    }
  }

  /**
   * Register mutation
   * Creates a new user account
   * Rate limited to prevent spam
   */
  @Public()
  @Mutation(() => LoginResponse, {
    description: 'Register a new user account',
  })
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: any,
  ): Promise<LoginResponse> {
    try {
      const ipAddress = context.req.ip;
      const userAgent = context.req.headers['user-agent'];

      const result = await this.authService.register(
        {
          email: input.email,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
          tenantId: input.tenantId,
          ...(input.phone && { phone: input.phone }),
        },
        ipAddress,
        userAgent,
      );

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout mutation
   * Invalidates the current session
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => MutationResponse, {
    description: 'Logout and invalidate current session',
  })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.authService.logout(user.sessionId);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Logout failed',
        errors: [
          {
            message: error.message || 'Logout failed',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Logout all sessions mutation
   * Invalidates all sessions for the current user
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => MutationResponse, {
    description: 'Logout from all sessions',
  })
  async logoutAllSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.authService.logoutAllSessions(user.id);

      return {
        success: true,
        message: 'Logged out from all sessions successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Logout all sessions failed',
        errors: [
          {
            message: error.message || 'Logout all sessions failed',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Refresh token mutation
   * Generates new access and refresh tokens
   * Public endpoint but requires valid refresh token
   */
  @Public()
  @Mutation(() => RefreshTokenResponse, {
    description: 'Refresh access token using refresh token',
  })
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
  ): Promise<RefreshTokenResponse> {
    try {
      const result = await this.authService.refreshToken(input.refreshToken);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Change password mutation
   * Changes the password for the current user
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Mutation(() => MutationResponse, {
    description: 'Change password for current user',
  })
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.authService.changePassword(user.id, {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password change failed',
        errors: [
          {
            message: error.message || 'Password change failed',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Forgot password mutation
   * Initiates password reset flow
   * Public endpoint, rate limited
   */
  @Public()
  @Mutation(() => MutationResponse, {
    description: 'Request password reset email',
  })
  async forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<MutationResponse> {
    try {
      await this.authService.forgotPassword({
        email: input.email,
      });

      // Always return success to prevent email enumeration
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    } catch (error: any) {
      // Don't reveal if email exists or not
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }
  }

  /**
   * Reset password mutation
   * Completes password reset flow with token
   * Public endpoint, rate limited at infrastructure level
   */
  @Public()
  @Mutation(() => MutationResponse, {
    description: 'Reset password using reset token',
  })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<MutationResponse> {
    try {
      await this.authService.resetPassword({
        token: input.token,
        newPassword: input.newPassword,
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password reset failed',
        errors: [
          {
            message: error.message || 'Password reset failed',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Get current user query
   * Returns the currently authenticated user
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Query(() => AuthUser, {
    description: 'Get current authenticated user',
    nullable: true,
  })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
