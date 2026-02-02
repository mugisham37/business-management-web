import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';

import { DrizzleService } from '../../database/drizzle.service';
import { users, userSocialProviders, tenants } from '../../database/schema';
import { AuthService } from './auth.service';
import { AuthEventsService } from './auth-events.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { AuthenticatedUser, OAuthLoginContext, TokenPair } from '../interfaces/auth.interface';

export interface SocialAuthData {
  provider: 'google' | 'facebook' | 'github';
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string | null;
  accessToken: string;
  refreshToken?: string;
  profile: any;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly authService: AuthService,
    private readonly authEventsService: AuthEventsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('SocialAuthService');
  }

  /**
   * Handle OAuth login flow - exchange code for tokens and authenticate user
   */
  async handleOAuthLogin(context: OAuthLoginContext): Promise<LoginResponse> {
    try {
      // Validate state parameter for CSRF protection
      if (context.state) {
        // In production, validate the state parameter against stored value
        // For now, we'll just log it
        this.logger.log(`OAuth state parameter received: ${context.state}`);
      }

      // Exchange authorization code for access token with the provider
      const providerTokens = await this.exchangeCodeForTokens(context);
      
      // Fetch user profile from the provider
      const providerProfile = await this.fetchUserProfile(context.provider, providerTokens.accessToken);
      
      // Create social auth data from provider profile
      const socialAuthData: SocialAuthData = {
        provider: context.provider,
        providerId: providerProfile.id,
        email: providerProfile.email,
        firstName: providerProfile.firstName || '',
        lastName: providerProfile.lastName || '',
        displayName: providerProfile.displayName || `${providerProfile.firstName} ${providerProfile.lastName}`.trim(),
        avatar: providerProfile.avatar,
        accessToken: providerTokens.accessToken,
        refreshToken: providerTokens.refreshToken,
        profile: providerProfile,
      };

      // Handle social authentication (create or login user)
      const authenticatedUser = await this.handleSocialAuth(
        socialAuthData,
        context.tenantId,
        context.ipAddress,
        context.userAgent
      );

      // Generate tokens for the authenticated user
      const tokens = await this.authService.generateTokens(authenticatedUser, authenticatedUser.sessionId);

      return {
        user: authenticatedUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      this.logger.error(`OAuth login failed for provider ${context.provider}: ${error.message}`);
      throw new BadRequestException(`OAuth login failed: ${error.message}`);
    }
  }

  /**
   * Exchange authorization code for access tokens with OAuth provider
   */
  private async exchangeCodeForTokens(context: OAuthLoginContext): Promise<{ accessToken: string; refreshToken?: string }> {
    // This would integrate with actual OAuth providers
    // For now, return mock tokens for development
    this.logger.warn(`Mock token exchange for ${context.provider} - implement actual OAuth flow`);
    
    return {
      accessToken: `mock_access_token_${context.provider}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${context.provider}_${Date.now()}`,
    };
  }

  /**
   * Fetch user profile from OAuth provider
   */
  private async fetchUserProfile(provider: string, accessToken: string): Promise<any> {
    // This would make actual API calls to OAuth providers
    // For now, return mock profile for development
    this.logger.warn(`Mock profile fetch for ${provider} - implement actual provider API calls`);
    
    return {
      id: `mock_${provider}_id_${Date.now()}`,
      email: `user@${provider}.com`,
      firstName: 'Mock',
      lastName: 'User',
      displayName: 'Mock User',
      avatar: null,
    };
  }

  /**
   * Handle social authentication from OAuth strategies
   * Creates new user if doesn't exist, or links to existing user
   */
  async handleSocialAuth(
    socialAuthData: SocialAuthData,
    tenantId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthenticatedUser> {
    const db = this.drizzleService.getDb();

    try {
      // Use default tenant if not provided (for multi-tenant support)
      const effectiveTenantId = tenantId || 'default';

      // Check if tenant exists and is active
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(and(eq(tenants.id, effectiveTenantId), eq(tenants.isActive, true)))
        .limit(1);

      if (!tenant) {
        throw new NotFoundException('Tenant not found or inactive');
      }

      // Check if social provider is already linked to a user in this tenant
      const [existingSocialProvider] = await db
        .select()
        .from(userSocialProviders)
        .innerJoin(users, eq(userSocialProviders.userId, users.id))
        .where(and(
          eq(userSocialProviders.provider, socialAuthData.provider),
          eq(userSocialProviders.providerId, socialAuthData.providerId),
          eq(users.tenantId, effectiveTenantId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (existingSocialProvider) {
        // User exists with this social provider, log them in
        const user = existingSocialProvider.users;
        
        // Update last used timestamp for social provider
        await db
          .update(userSocialProviders)
          .set({
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userSocialProviders.id, existingSocialProvider.user_social_providers.id));

        // Update user's last login info
        await db
          .update(users)
          .set({
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        // Emit login event
        this.eventEmitter.emit('user.social_login', {
          userId: user.id,
          tenantId: user.tenantId,
          email: user.email,
          provider: socialAuthData.provider,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        });

        this.logger.log('User logged in with social provider', {
          userId: user.id,
          provider: socialAuthData.provider,
          tenantId: effectiveTenantId,
        });

        return this.mapUserToAuthenticatedUser(user);
      }

      // Check if user exists with this email in the tenant
      const [existingUser] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, socialAuthData.email),
          eq(users.tenantId, effectiveTenantId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (existingUser) {
        // User exists with this email, link the social provider
        await this.linkSocialProviderToUser(existingUser.id, socialAuthData);

        // Update user's last login info
        await db
          .update(users)
          .set({
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id));

        // Emit social provider linked event
        this.eventEmitter.emit('user.social_provider_linked', {
          userId: existingUser.id,
          tenantId: existingUser.tenantId,
          provider: socialAuthData.provider,
          timestamp: new Date(),
        });

        this.logger.log('Social provider linked to existing user', {
          userId: existingUser.id,
          provider: socialAuthData.provider,
          tenantId: effectiveTenantId,
        });

        return this.mapUserToAuthenticatedUser(existingUser);
      }

      // Create new user with social provider
      const displayName = socialAuthData.displayName || 
        `${socialAuthData.firstName || ''} ${socialAuthData.lastName || ''}`.trim() || 
        socialAuthData.email;
      
      const [newUser] = await db
        .insert(users)
        .values({
          tenantId: effectiveTenantId,
          email: socialAuthData.email,
          firstName: socialAuthData.firstName,
          lastName: socialAuthData.lastName,
          displayName,
          avatar: socialAuthData.avatar,
          emailVerified: true, // Social providers verify email
          role: 'employee', // Default role
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
          createdBy: null, // Self-registration via social
          updatedBy: null,
        })
        .returning();

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Link social provider to new user
      await this.linkSocialProviderToUser(newUser.id, socialAuthData);

      // Emit user registered event
      this.eventEmitter.emit('user.registered', {
        userId: newUser.id,
        tenantId: newUser.tenantId,
        email: newUser.email,
        provider: socialAuthData.provider,
        timestamp: new Date(),
      });

      // Publish auth events
      await this.authEventsService.publishUserRegistered(
        newUser.id,
        newUser.tenantId,
        newUser.email,
        newUser.role,
      );

      this.logger.log('New user created with social provider', {
        userId: newUser.id,
        provider: socialAuthData.provider,
        tenantId: effectiveTenantId,
      });

      return this.mapUserToAuthenticatedUser(newUser);
    } catch (error) {
      this.logger.error(`Social authentication failed for ${socialAuthData.provider} with email ${socialAuthData.email}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Link a social provider to an existing user
   */
  private async linkSocialProviderToUser(
    userId: string,
    socialAuthData: SocialAuthData,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    // Get user info for tenant ID
    const [user] = await db
      .select({ tenantId: users.tenantId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if provider is already linked to this user
    const [existingLink] = await db
      .select()
      .from(userSocialProviders)
      .where(and(
        eq(userSocialProviders.userId, userId),
        eq(userSocialProviders.provider, socialAuthData.provider)
      ))
      .limit(1);

    if (existingLink) {
      // Update existing link instead of creating new one
      await db
        .update(userSocialProviders)
        .set({
          providerId: socialAuthData.providerId,
          email: socialAuthData.email,
          providerData: {
            firstName: socialAuthData.firstName,
            lastName: socialAuthData.lastName,
            displayName: socialAuthData.displayName,
            avatar: socialAuthData.avatar,
            profile: socialAuthData.profile,
          },
          lastUsedAt: new Date(),
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(userSocialProviders.id, existingLink.id));
      return;
    }

    // Create new social provider link
    await db
      .insert(userSocialProviders)
      .values({
        tenantId: user.tenantId,
        userId,
        provider: socialAuthData.provider,
        providerId: socialAuthData.providerId,
        email: socialAuthData.email,
        providerData: {
          firstName: socialAuthData.firstName,
          lastName: socialAuthData.lastName,
          displayName: socialAuthData.displayName,
          avatar: socialAuthData.avatar,
          profile: socialAuthData.profile,
        },
        connectedAt: new Date(),
        lastUsedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      });
  }

  /**
   * Unlink a social provider from a user
   */
  async unlinkSocialProvider(
    userId: string,
    tenantId: string,
    provider: string,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    try {
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, userId),
          eq(users.tenantId, tenantId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if provider is linked
      const [existingLink] = await db
        .select()
        .from(userSocialProviders)
        .where(and(
          eq(userSocialProviders.userId, userId),
          eq(userSocialProviders.provider, provider as any)
        ))
        .limit(1);

      if (!existingLink) {
        throw new NotFoundException(`${provider} is not linked to this account`);
      }

      // Check if user has a password or other social providers (prevent account lockout)
      const socialProviders = await db
        .select()
        .from(userSocialProviders)
        .where(and(
          eq(userSocialProviders.userId, userId),
          eq(userSocialProviders.isActive, true)
        ));

      const hasPassword = !!user.passwordHash;
      const totalProviders = socialProviders.length;

      if (!hasPassword && totalProviders <= 1) {
        throw new BadRequestException(
          'Cannot unlink the only authentication method. Please set a password first.'
        );
      }

      // Unlink the provider (soft delete)
      await db
        .update(userSocialProviders)
        .set({
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(userSocialProviders.id, existingLink.id));

      // Emit social provider unlinked event
      this.eventEmitter.emit('user.social_provider_unlinked', {
        userId,
        tenantId: user.tenantId,
        provider,
        timestamp: new Date(),
      });

      this.logger.log('Social provider unlinked', { userId, provider, tenantId });
    } catch (error) {
      this.logger.error(`Failed to unlink social provider ${provider} for user ${userId} in tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's connected social providers
   */
  async getUserSocialProviders(userId: string, tenantId: string): Promise<any[]> {
    const db = this.drizzleService.getDb();

    try {
      const providers = await db
        .select({
          provider: userSocialProviders.provider,
          email: userSocialProviders.email,
          connectedAt: userSocialProviders.connectedAt,
          lastUsedAt: userSocialProviders.lastUsedAt,
        })
        .from(userSocialProviders)
        .where(and(
          eq(userSocialProviders.userId, userId),
          eq(userSocialProviders.tenantId, tenantId),
          eq(userSocialProviders.isActive, true)
        ));

      return providers.map(provider => ({
        provider: provider.provider,
        email: provider.email,
        connectedAt: provider.connectedAt,
        lastUsedAt: provider.lastUsedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to get user social providers for user ${userId} in tenant ${tenantId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Map database user to AuthenticatedUser interface
   */
  private mapUserToAuthenticatedUser(user: any): AuthenticatedUser {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      permissions: user.permissions || [],
      sessionId: '', // Will be set by calling code
      businessTier: 'micro', // Default, will be updated by calling code
      featureFlags: [],
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}