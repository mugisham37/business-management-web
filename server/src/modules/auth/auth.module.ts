import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './services/auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { TierAuthorizationService } from './services/tier-authorization.service';
import { PermissionsService } from './services/permissions.service';
import { MfaService } from './services/mfa.service';
import { AuthEventsService } from './services/auth-events.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { SocialAuthResolver } from './resolvers/social-auth.resolver';
import { MfaResolver } from './resolvers/mfa.resolver';
import { PermissionsResolver } from './resolvers/permissions.resolver';
import { AuthSubscriptionsResolver } from './resolvers/auth-subscriptions.resolver';
import { SocialAuthController } from './controllers/social-auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TierAuthGuard } from './guards/tier-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdvancedAuthGuard } from './guards/advanced-auth.guard';
import { DrizzleService } from '../database/drizzle.service';
import { DataLoaderService } from '../../common/graphql/dataloader.service';
import { CacheModule } from '../cache/cache.module';
import { PubSubModule } from '../../common/graphql/pubsub.module';
import { TenantModule } from '../tenant/tenant.module';

/**
 * Auth Module
 * Provides comprehensive authentication, authorization, and MFA services
 * GraphQL-only implementation with real-time subscriptions and advanced auth patterns
 * Enhanced with social authentication (Google, Facebook) and tier-based access control
 * 
 * Features:
 * - JWT-based authentication with refresh tokens
 * - Social authentication (Google, Facebook OAuth)
 * - Role-based access control (RBAC)
 * - Tier-based feature access control
 * - Granular permission management with wildcards
 * - Multi-factor authentication (TOTP + backup codes)
 * - Real-time auth event subscriptions
 * - Advanced authorization patterns (resource-based, time-based, IP-restricted, etc.)
 * - Session management with device tracking
 * - Audit logging and security monitoring
 * - Permission caching with automatic invalidation
 * - Bulk permission operations
 * - Account lockout and security features
 */
@Module({
  imports: [
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m');
        
        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }
        
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
    CacheModule,
    PubSubModule,
    TenantModule, // Import TenantModule for FeatureFlagService
  ],
  providers: [
    // Core Services
    DrizzleService,
    DataLoaderService,
    AuthService,
    SocialAuthService,
    TierAuthorizationService,
    PermissionsService,
    MfaService,
    AuthEventsService,
    
    // GraphQL Resolvers
    AuthResolver,
    SocialAuthResolver,
    MfaResolver,
    PermissionsResolver,
    AuthSubscriptionsResolver,
    
    // Passport Strategies
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    
    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    TierAuthGuard,
    PermissionsGuard,
    RolesGuard,
    AdvancedAuthGuard,
  ],
  controllers: [
    SocialAuthController,
  ],
  exports: [
    // Services
    AuthService,
    SocialAuthService,
    TierAuthorizationService,
    PermissionsService,
    MfaService,
    AuthEventsService,
    
    // Resolvers
    AuthResolver,
    SocialAuthResolver,
    MfaResolver,
    PermissionsResolver,
    AuthSubscriptionsResolver,
    
    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    TierAuthGuard,
    PermissionsGuard,
    RolesGuard,
    AdvancedAuthGuard,
    
    // Modules
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}