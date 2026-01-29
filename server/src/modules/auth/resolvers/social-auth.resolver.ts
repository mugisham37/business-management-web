import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { SocialAuthService } from '../services/social-auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
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
import { LoginResponse } from '../types/auth.types';

@Resolver()
export class SocialAuthResolver {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  /**
   * Generate OAuth authorization URL for social login
   */
  @Query(() => SocialAuthUrlResponse)
  async getSocialAuthUrl(
    @Args('provider') provider: string,
    @Args('tenantId') tenantId: string,
  ): Promise<SocialAuthUrlResponse> {
    const state = uuidv4();
    const authUrl = this.socialAuthService.generateAuthUrl(provider, state, tenantId);

    return {
      authUrl,
      state,
    };
  }

  /**
   * Link a social provider to the current user's account
   */
  @Mutation(() => SocialAuthResponse)
  @UseGuards(JwtAuthGuard)
  async linkSocialProvider(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: LinkSocialProviderInput,
  ): Promise<SocialAuthResponse> {
    await this.socialAuthService.linkSocialProvider(user.id, input);
    
    const connectedProviders = await this.socialAuthService.getUserSocialProviders(user.id);

    return {
      success: true,
      message: `${input.provider} account linked successfully`,
      connectedProviders: connectedProviders.map(provider => ({
        provider: provider.provider,
        providerId: '', // Don't expose provider ID for security
        email: provider.email,
        connectedAt: provider.connectedAt,
      })),
    };
  }

  /**
   * Unlink a social provider from the current user's account
   */
  @Mutation(() => SocialAuthResponse)
  @UseGuards(JwtAuthGuard)
  async unlinkSocialProvider(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UnlinkSocialProviderInput,
  ): Promise<SocialAuthResponse> {
    await this.socialAuthService.unlinkSocialProvider(user.id, input);
    
    const connectedProviders = await this.socialAuthService.getUserSocialProviders(user.id);

    return {
      success: true,
      message: `${input.provider} account unlinked successfully`,
      connectedProviders: connectedProviders.map(provider => ({
        provider: provider.provider,
        providerId: '', // Don't expose provider ID for security
        email: provider.email,
        connectedAt: provider.connectedAt,
      })),
    };
  }

  /**
   * Get user's connected social providers
   */
  @Query(() => [SocialProvider])
  @UseGuards(JwtAuthGuard)
  async getConnectedSocialProviders(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SocialProvider[]> {
    const providers = await this.socialAuthService.getUserSocialProviders(user.id);

    return providers.map(provider => ({
      provider: provider.provider,
      providerId: '', // Don't expose provider ID for security
      email: provider.email,
      connectedAt: provider.connectedAt,
    }));
  }
}