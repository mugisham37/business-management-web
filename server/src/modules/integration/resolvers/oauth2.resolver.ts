import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantInterceptor } from '../../tenant/interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';

import { OAuth2Service } from '../services/oauth2.service';

import {
  OAuth2TokenType,
  OAuth2AuthorizationUrlType,
  OAuth2CallbackResultType,
} from '../types/oauth2.graphql.types';
import {
  OAuth2AuthorizeInput,
  OAuth2CallbackInput,
  OAuth2RefreshInput,
} from '../inputs/oauth2.input';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class OAuth2Resolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly oauth2Service: OAuth2Service,
  ) {
    super(dataLoaderService);
  }

  @Query(() => OAuth2TokenType, { name: 'oauth2Token', nullable: true })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:read')
  async getOAuth2Token(
    @Args('integrationId') integrationId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<OAuth2TokenType | null> {
    try {
      const token = await this.oauth2Service.getValidToken(integrationId);
      if (!token) return null;

      // Get token details from repository
      const tokenDetails = await this.oauth2Service['oauth2Repository'].getToken(integrationId);
      if (!tokenDetails) return null;

      return {
        integrationId,
        tokenType: token.tokenType,
        expiresAt: tokenDetails.expiresAt,
        scopes: tokenDetails.scopes,
        providerId: tokenDetails.providerId,
        isValid: true,
        createdAt: tokenDetails.createdAt,
        updatedAt: tokenDetails.updatedAt,
      };
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => OAuth2AuthorizationUrlType, { name: 'getOAuth2AuthorizationUrl' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async getOAuth2AuthorizationUrl(
    @Args('integrationId') integrationId: string,
    @Args('input') input: OAuth2AuthorizeInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<OAuth2AuthorizationUrlType> {
    const result = await this.oauth2Service.getAuthorizationUrl(integrationId, {
      tenantId: input.tenantId,
      shop: input.shop,
    });

    return {
      authUrl: result.authUrl,
      state: result.state,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
  }

  @Mutation(() => OAuth2CallbackResultType, { name: 'handleOAuth2Callback' })
  async handleOAuth2Callback(
    @Args('input') input: OAuth2CallbackInput,
  ): Promise<OAuth2CallbackResultType> {
    try {
      const token = await this.oauth2Service.handleCallback({
        code: input.code,
        state: input.state,
        error: input.error,
        shop: input.shop,
      });

      return {
        success: true,
        integrationId: token.integrationId,
        token: {
          integrationId: token.integrationId,
          tokenType: token.tokenType,
          expiresAt: token.expiresAt,
          scopes: token.scopes,
          providerId: token.providerId,
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Mutation(() => OAuth2TokenType, { name: 'refreshOAuth2Token' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async refreshOAuth2Token(
    @Args('input') input: OAuth2RefreshInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<OAuth2TokenType> {
    const token = await this.oauth2Service.refreshToken(input.integrationId);

    return {
      integrationId: token.integrationId,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      scopes: token.scopes,
      providerId: token.providerId,
      isValid: true,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    };
  }

  @Mutation(() => Boolean, { name: 'revokeOAuth2Token' })
  @UseGuards(PermissionsGuard)
  @Permissions('integration:update')
  async revokeOAuth2Token(
    @Args('integrationId') integrationId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.oauth2Service.revokeTokens(integrationId);
    return true;
  }
}