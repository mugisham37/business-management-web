import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { DrizzleService } from '../../database/drizzle.service';
import { users, userSocialProviders, tenants } from '../../database/schema';
import { AuthService } from './auth.service';
import { AuthEventsService } from './auth-events.service';
import { 
  SocialAuthInput, 
  LinkSocialProviderInput, 
  UnlinkSocialProviderInput 
} from '../inputs/social-auth.input';
import { 
  LoginResponse, 
  AuthenticatedUser 
} from '../interfaces/auth.interface';
import { GoogleProfile } from '../strategies/google.strategy';
import { FacebookProfile } from '../strategies/facebook.strategy';

export type SocialProfile = GoogleProfile | FacebookProfile;

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly authService: AuthService,
    private readonly authEventsService: AuthEventsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Authenticate user with social provider
   * Creates new user if doesn't exist, or links to existing user
   */
  async authenticateWithSocial(
    profile: SocialProfile,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const db = this.drizzleService.getDb();

    // Check if tenant exists and is active
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.id, tenantId), eq(tenants.isActive, true)))
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
        eq(userSocialProviders.provider, profile.provider),
        eq(userSocialProviders.providerId, profile.id),
        eq(users.tenantId, tenantId),
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
        provider: profile.provider,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      // Create session and return login response
      return this.authService.createUserSession(user, ipAddress, userAgent);
    }

    // Check if user exists with this email in the tenant
    const [existingUser] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, profile.email),
        eq(users.tenantId, tenantId),
        eq(users.isActive, true)
      ))
      .limit(1);

    if (existingUser) {
      // User exists with this email, link the social provider
      await this.linkSocialProvider(existingUser.id, {
        provider: profile.provider,
        providerId: profile.id,
        email: profile.email,
      });

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
        provider: profile.provider,
        timestamp: new Date(),
      });

      // Create session and return login response
      return this.authService.createUserSession(existingUser, ipAddress, userAgent);
    }

    // Create new user with social provider
    const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email;
    
    const [newUser] = await db
      .insert(users)
      .values({
        tenantId,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName,
        avatar: profile.picture,
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
    await db
      .insert(userSocialProviders)
      .values({
        tenantId: newUser.tenantId,
        userId: newUser.id,
        provider: profile.provider,
        providerId: profile.id,
        email: profile.email,
        providerData: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          picture: profile.picture,
        },
        connectedAt: new Date(),
        lastUsedAt: new Date(),
        createdBy: newUser.id,
        updatedBy: newUser.id,
      });

    // Emit user registered event
    this.eventEmitter.emit('user.registered', {
      userId: newUser.id,
      tenantId: newUser.tenantId,
      email: newUser.email,
      provider: profile.provider,
      timestamp: new Date(),
    });

    // Publish auth events
    await this.authEventsService.publishUserRegistered(
      newUser.id,
      newUser.tenantId,
      newUser.email,
      newUser.role,
    );

    // Create session and return login response
    return this.authService.createUserSession(newUser, ipAddress, userAgent);
  }

  /**
   * Link a social provider to an existing user
   */
  async linkSocialProvider(
    userId: string,
    linkInput: LinkSocialProviderInput,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
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
        eq(userSocialProviders.provider, linkInput.provider)
      ))
      .limit(1);

    if (existingLink) {
      throw new ConflictException(`${linkInput.provider} is already linked to this account`);
    }

    // Check if provider ID is already linked to another user in the same tenant
    const [existingProviderLink] = await db
      .select()
      .from(userSocialProviders)
      .innerJoin(users, eq(userSocialProviders.userId, users.id))
      .where(and(
        eq(userSocialProviders.provider, linkInput.provider),
        eq(userSocialProviders.providerId, linkInput.providerId),
        eq(users.tenantId, user.tenantId)
      ))
      .limit(1);

    if (existingProviderLink) {
      throw new ConflictException(`This ${linkInput.provider} account is already linked to another user`);
    }

    // Link the provider
    await db
      .insert(userSocialProviders)
      .values({
        tenantId: user.tenantId,
        userId,
        provider: linkInput.provider,
        providerId: linkInput.providerId,
        email: linkInput.email,
        connectedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      });

    // Emit social provider linked event
    this.eventEmitter.emit('user.social_provider_linked', {
      userId,
      tenantId: user.tenantId,
      provider: linkInput.provider,
      timestamp: new Date(),
    });
  }

  /**
   * Unlink a social provider from a user
   */
  async unlinkSocialProvider(
    userId: string,
    unlinkInput: UnlinkSocialProviderInput,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
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
        eq(userSocialProviders.provider, unlinkInput.provider)
      ))
      .limit(1);

    if (!existingLink) {
      throw new NotFoundException(`${unlinkInput.provider} is not linked to this account`);
    }

    // Check if user has a password or other social providers (prevent account lockout)
    const [userWithAuth] = await db
      .select({
        passwordHash: users.passwordHash,
        socialProviderCount: users.id, // We'll count this separately
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const [socialProviderCount] = await db
      .select({ count: users.id })
      .from(userSocialProviders)
      .where(eq(userSocialProviders.userId, userId));

    const totalProviders = socialProviderCount?.count || 0;
    const hasPassword = !!userWithAuth?.passwordHash;

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
      provider: unlinkInput.provider,
      timestamp: new Date(),
    });
  }

  /**
   * Get user's connected social providers
   */
  async getUserSocialProviders(userId: string): Promise<any[]> {
    const db = this.drizzleService.getDb();

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
        eq(userSocialProviders.isActive, true)
      ));

    return providers.map(provider => ({
      provider: provider.provider,
      email: provider.email,
      connectedAt: provider.connectedAt,
      lastUsedAt: provider.lastUsedAt,
    }));
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(provider: string, state: string, tenantId: string): string {
    // This would typically integrate with the OAuth provider's SDK
    // For now, return a placeholder URL structure
    const baseUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    };

    const baseUrl = baseUrls[provider as keyof typeof baseUrls];
    if (!baseUrl) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    // In a real implementation, you would construct the full OAuth URL
    // with client_id, redirect_uri, scope, state, etc.
    return `${baseUrl}?state=${state}&tenant_id=${tenantId}`;
  }
}