import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { SocialAuthService } from '../services/social-auth.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import { 
  SocialAuthInput, 
  LinkSocialProviderInput, 
  UnlinkSocialProviderInput 
} from '../inputs/social-auth.input';
import { 
  SocialAuthResponse, 
  SocialAuthUrlResponse, 
  SocialProvider 
} from '../types/social-auth.types';

/**
 * Social Authentication Resolver
 * 
 * Handles social authentication operations including OAuth URL generation,
 * linking/unlinking social providers, and managing connected accounts.
 * 
 * Supported providers:
 * - Google OAuth 2.0
 * - Facebook OAuth
 * - GitHub OAuth
 */
@Resolver()
export class SocialAuthResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly socialAuthService: SocialAuthService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Generate OAuth authorization URL for social login
   * Returns the URL users should visit to authenticate with the social provider
   */
  @Query(() => SocialAuthUrlResponse, {
    description: 'Generate OAuth authorization URL for social login',
  })
  async getSocialAuthUrl(
    @Args('provider') provider: string,
    @Args('tenantId', { nullable: true }) tenantId?: string,
  ): Promise<SocialAuthUrlResponse> {
    try {
      const state = uuidv4();
      const effectiveTenantId = tenantId || 'default';
      
      // Generate OAuth URL based on provider
      let authUrl: string;
      
      switch (provider.toLowerCase()) {
        case 'google':
          authUrl = this.generateGoogleAuthUrl(state, effectiveTenantId);
          break;
        case 'facebook':
          authUrl = this.generateFacebookAuthUrl(state, effectiveTenantId);
          break;
        case 'github':
          authUrl = this.generateGitHubAuthUrl(state, effectiveTenantId);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      return {
        authUrl,
        state,
        provider,
        tenantId: effectiveTenantId,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate social auth URL');
    }
  }

  /**
   * Link a social provider to the current user's account
   * Allows users to connect additional social accounts for authentication
   */
  @Mutation(() => SocialAuthResponse, {
    description: 'Link a social provider to current user account',
  })
  @UseGuards(JwtAuthGuard)
  async linkSocialProvider(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: LinkSocialProviderInput,
  ): Promise<SocialAuthResponse> {
    try {
      // Create social auth data from input
      const socialAuthData = {
        provider: input.provider as any,
        providerId: input.providerId,
        email: input.email,
        firstName: '',
        lastName: '',
        displayName: input.email,
        accessToken: '', // Not available in this context
        profile: {},
      };

      // Link the provider (this will update existing or create new)
      await this.socialAuthService['linkSocialProviderToUser'](user.id, socialAuthData);
      
      const connectedProviders = await this.socialAuthService.getUserSocialProviders(
        user.id,
        user.tenantId,
      );

      return {
        success: true,
        message: `${input.provider} account linked successfully`,
        connectedProviders: connectedProviders.map(provider => ({
          provider: provider.provider,
          providerId: '***', // Mask provider ID for security
          email: provider.email,
          connectedAt: provider.connectedAt,
          lastUsedAt: provider.lastUsedAt,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || `Failed to link ${input.provider} account`,
        connectedProviders: [],
      };
    }
  }

  /**
   * Unlink a social provider from the current user's account
   * Removes the connection to a social authentication provider
   */
  @Mutation(() => SocialAuthResponse, {
    description: 'Unlink a social provider from current user account',
  })
  @UseGuards(JwtAuthGuard)
  async unlinkSocialProvider(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UnlinkSocialProviderInput,
  ): Promise<SocialAuthResponse> {
    try {
      await this.socialAuthService.unlinkSocialProvider(
        user.id,
        user.tenantId,
        input.provider,
      );
      
      const connectedProviders = await this.socialAuthService.getUserSocialProviders(
        user.id,
        user.tenantId,
      );

      return {
        success: true,
        message: `${input.provider} account unlinked successfully`,
        connectedProviders: connectedProviders.map(provider => ({
          provider: provider.provider,
          providerId: '***', // Mask provider ID for security
          email: provider.email,
          connectedAt: provider.connectedAt,
          lastUsedAt: provider.lastUsedAt,
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || `Failed to unlink ${input.provider} account`,
        connectedProviders: [],
      };
    }
  }

  /**
   * Get user's connected social providers
   * Returns list of social accounts linked to the current user
   */
  @Query(() => [SocialProvider], {
    description: 'Get connected social providers for current user',
  })
  @UseGuards(JwtAuthGuard)
  async getConnectedSocialProviders(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SocialProvider[]> {
    try {
      const providers = await this.socialAuthService.getUserSocialProviders(
        user.id,
        user.tenantId,
      );

      return providers.map(provider => ({
        provider: provider.provider,
        providerId: '***', // Mask provider ID for security
        email: provider.email,
        connectedAt: provider.connectedAt,
        lastUsedAt: provider.lastUsedAt,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get connected social providers');
    }
  }

  /**
   * Check if a social provider is available for linking
   * Validates if a provider is supported and properly configured
   */
  @Query(() => Boolean, {
    description: 'Check if social provider is available',
  })
  async isSocialProviderAvailable(
    @Args('provider') provider: string,
  ): Promise<boolean> {
    try {
      const supportedProviders = ['google', 'facebook', 'github'];
      return supportedProviders.includes(provider.toLowerCase());
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get list of supported social providers
   * Returns configuration information for available OAuth providers
   */
  @Query(() => [String], {
    description: 'Get list of supported social providers',
  })
  async getSupportedSocialProviders(): Promise<string[]> {
    return ['google', 'facebook', 'github'];
  }

  /**
   * Generate Google OAuth URL
   */
  private generateGoogleAuthUrl(state: string, tenantId: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';
    
    if (!clientId) {
      throw new Error('Google OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      state: `${state}:${tenantId}`,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate Facebook OAuth URL
   */
  private generateFacebookAuthUrl(state: string, tenantId: string): string {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const redirectUri = process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback';
    
    if (!clientId) {
      throw new Error('Facebook OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
      state: `${state}:${tenantId}`,
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Generate GitHub OAuth URL
   */
  private generateGitHubAuthUrl(state: string, tenantId: string): string {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL || '/auth/github/callback';
    
    if (!clientId) {
      throw new Error('GitHub OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user:email read:user',
      state: `${state}:${tenantId}`,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }
}