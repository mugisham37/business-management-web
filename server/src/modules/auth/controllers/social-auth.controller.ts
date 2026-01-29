import { Controller, Get, Post, UseGuards, Req, Res, Query, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { SocialAuthService, SocialProfile } from '../services/social-auth.service';
import { GoogleProfile } from '../strategies/google.strategy';
import { FacebookProfile } from '../strategies/facebook.strategy';

@ApiTags('Social Authentication')
@Controller('auth')
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  /**
   * Initiate Google OAuth flow
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  async googleAuth(@Req() req: Request) {
    // This endpoint initiates the OAuth flow
    // The actual redirect is handled by Passport
  }

  /**
   * Handle Google OAuth callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('state') state: string,
  ) {
    try {
      const profile = req.user as GoogleProfile;
      const tenantId = this.extractTenantIdFromState(state);
      
      if (!tenantId) {
        return res.redirect('/auth/error?message=Invalid_state_parameter');
      }

      const loginResponse = await this.socialAuthService.authenticateWithSocial(
        profile,
        tenantId,
        req.ip,
        req.get('User-Agent'),
      );

      // In a real application, you would redirect to your frontend with the tokens
      // For now, we'll return JSON (in production, use secure cookies or redirect)
      return res.json({
        success: true,
        user: loginResponse.user,
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return res.redirect(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
    }
  }

  /**
   * Initiate Facebook OAuth flow
   */
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth authentication' })
  async facebookAuth(@Req() req: Request) {
    // This endpoint initiates the OAuth flow
    // The actual redirect is handled by Passport
  }

  /**
   * Handle Facebook OAuth callback
   */
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Handle Facebook OAuth callback' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async facebookCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('state') state: string,
  ) {
    try {
      const profile = req.user as FacebookProfile;
      const tenantId = this.extractTenantIdFromState(state);
      
      if (!tenantId) {
        return res.redirect('/auth/error?message=Invalid_state_parameter');
      }

      const loginResponse = await this.socialAuthService.authenticateWithSocial(
        profile,
        tenantId,
        req.ip,
        req.get('User-Agent'),
      );

      // In a real application, you would redirect to your frontend with the tokens
      // For now, we'll return JSON (in production, use secure cookies or redirect)
      return res.json({
        success: true,
        user: loginResponse.user,
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      return res.redirect(`/auth/error?message=${encodeURIComponent(errorMessage)}`);
    }
  }

  /**
   * Handle authentication errors
   */
  @Get('error')
  @ApiOperation({ summary: 'Display authentication error' })
  async authError(@Query('message') message: string, @Res() res: Response) {
    return res.json({
      success: false,
      error: message || 'Authentication failed',
    });
  }

  /**
   * Extract tenant ID from OAuth state parameter
   */
  private extractTenantIdFromState(state: string): string | null {
    try {
      // In a real implementation, you would decode/decrypt the state parameter
      // For now, we'll assume it contains the tenant ID directly
      // In production, use JWT or encrypted state with tenant ID and other metadata
      const decoded = Buffer.from(state, 'base64').toString('utf-8');
      const stateData = JSON.parse(decoded);
      return stateData.tenantId || null;
    } catch (error) {
      return null;
    }
  }
}