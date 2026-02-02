import { Controller, Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SocialAuthService } from '../services/social-auth.service';
import { AuthService } from '../services/auth.service';
import { CustomLoggerService } from '../../logger/logger.service';

/**
 * Social Authentication Controller
 * 
 * Handles OAuth callback endpoints for social authentication providers.
 * These endpoints are called by OAuth providers after user authorization.
 * 
 * Supported providers:
 * - Google OAuth 2.0
 * - Facebook OAuth
 * - GitHub OAuth
 */
@ApiTags('Social Authentication')
@Controller('auth')
export class SocialAuthController {
  constructor(
    private readonly socialAuthService: SocialAuthService,
    private readonly authService: AuthService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('SocialAuthController');
  }

  /**
   * Google OAuth callback endpoint
   * Handles the callback from Google OAuth after user authorization
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth result' })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('state') state?: string,
  ): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        return this.handleAuthError(res, 'Google authentication failed');
      }

      // Extract tenant ID from state parameter
      const tenantId = this.extractTenantFromState(state);
      
      // Generate JWT tokens for the authenticated user
      const tokens = await this.authService.generateTokens(user);
      
      this.logger.log('Google OAuth login successful', {
        userId: user.id,
        email: user.email,
        tenantId,
      });

      // Redirect to frontend with tokens
      return this.handleAuthSuccess(res, tokens, user);
    } catch (error) {
      this.logger.error(`Google OAuth callback error: ${error.message}`);
      return this.handleAuthError(res, 'Google authentication failed');
    }
  }

  /**
   * Facebook OAuth callback endpoint
   * Handles the callback from Facebook OAuth after user authorization
   */
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth result' })
  async facebookCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('state') state?: string,
  ): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        return this.handleAuthError(res, 'Facebook authentication failed');
      }

      // Extract tenant ID from state parameter
      const tenantId = this.extractTenantFromState(state);
      
      // Generate JWT tokens for the authenticated user
      const tokens = await this.authService.generateTokens(user);
      
      this.logger.log('Facebook OAuth login successful', {
        userId: user.id,
        email: user.email,
        tenantId,
      });

      // Redirect to frontend with tokens
      return this.handleAuthSuccess(res, tokens, user);
    } catch (error) {
      this.logger.error(`Facebook OAuth callback error: ${error.message}`);
      return this.handleAuthError(res, 'Facebook authentication failed');
    }
  }

  /**
   * GitHub OAuth callback endpoint
   * Handles the callback from GitHub OAuth after user authorization
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with auth result' })
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('state') state?: string,
  ): Promise<void> {
    try {
      const user = req.user as any;
      if (!user) {
        return this.handleAuthError(res, 'GitHub authentication failed');
      }

      // Extract tenant ID from state parameter
      const tenantId = this.extractTenantFromState(state);
      
      // Generate JWT tokens for the authenticated user
      const tokens = await this.authService.generateTokens(user);
      
      this.logger.log('GitHub OAuth login successful', {
        userId: user.id,
        email: user.email,
        tenantId,
      });

      // Redirect to frontend with tokens
      return this.handleAuthSuccess(res, tokens, user);
    } catch (error) {
      this.logger.error(`GitHub OAuth callback error: ${error.message}`);
      return this.handleAuthError(res, 'GitHub authentication failed');
    }
  }

  /**
   * Handle successful authentication
   * Redirects to frontend with authentication tokens
   */
  private handleAuthSuccess(res: Response, tokens: any, user: any): void {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = new URL('/auth/callback', frontendUrl);
    
    // Add tokens and user info as URL parameters (in production, consider using secure cookies)
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('access_token', tokens.accessToken);
    redirectUrl.searchParams.set('refresh_token', tokens.refreshToken);
    redirectUrl.searchParams.set('expires_in', tokens.expiresIn.toString());
    redirectUrl.searchParams.set('user_id', user.id);
    redirectUrl.searchParams.set('email', user.email);

    res.redirect(redirectUrl.toString());
  }

  /**
   * Handle authentication error
   * Redirects to frontend with error information
   */
  private handleAuthError(res: Response, error: string): void {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = new URL('/auth/callback', frontendUrl);
    
    redirectUrl.searchParams.set('success', 'false');
    redirectUrl.searchParams.set('error', error);

    res.redirect(redirectUrl.toString());
  }

  /**
   * Extract tenant ID from OAuth state parameter
   * State format: "uuid:tenantId"
   */
  private extractTenantFromState(state?: string): string {
    if (!state) {
      return 'default';
    }

    const parts = state.split(':');
    return parts.length > 1 ? parts[1] : 'default';
  }
}