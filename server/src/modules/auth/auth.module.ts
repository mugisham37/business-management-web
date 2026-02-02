import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Core Services
import { AuthService } from './services/auth.service';
import { SocialAuthService } from './services/social-auth.service';
import { TierAuthorizationService } from './services/tier-authorization.service';
import { PermissionsService } from './services/permissions.service';
import { MfaService } from './services/mfa.service';
import { AuthEventsService } from './services/auth-events.service';
import { SecurityService } from './services/security.service';
import { SessionService } from './services/session.service';
import { RiskAssessmentService } from './services/risk-assessment.service';

// GraphQL Resolvers
import { AuthResolver } from './resolvers/auth.resolver';
import { SocialAuthResolver } from './resolvers/social-auth.resolver';
import { MfaResolver } from './resolvers/mfa.resolver';
import { PermissionsResolver } from './resolvers/permissions.resolver';
import { AuthSubscriptionsResolver } from './resolvers/auth-subscriptions.resolver';
import { SecurityResolver } from './resolvers/security.resolver';
import { TierDemoResolver } from './resolvers/tier-demo.resolver';

// Controllers
import { SocialAuthController } from './controllers/social-auth.controller';

// Passport Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GitHubStrategy } from './strategies/github.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GraphQLJwtAuthGuard } from './guards/graphql-jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TierAuthGuard } from './guards/tier-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdvancedAuthGuard } from './guards/advanced-auth.guard';
import { RiskBasedAuthGuard } from './guards/risk-based-auth.guard';

// Middleware
import { AuthSecurityMiddleware } from './middleware/auth-security.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';

// Interceptors
import { TierAuthInterceptor } from './interceptors/tier-auth.interceptor';

// External Dependencies
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';

/**
 * Enterprise Authentication & Authorization Module
 * 
 * Provides comprehensive authentication, authorization, and security services
 * with enterprise-grade features, zero-trust principles, and DNV-style rigor.
 * 
 * 🔐 CORE FEATURES:
 * - Multi-factor authentication (TOTP, backup codes, WebAuthn)
 * - Social authentication (Google, Facebook, GitHub)
 * - JWT-based authentication with refresh token rotation
 * - Role-based + Permission-based authorization (RBAC + ABAC)
 * - Tier-based feature access control
 * - Session management with device tracking
 * - Real-time auth event subscriptions
 * - Comprehensive audit logging
 * 
 * 🛡️ SECURITY ENHANCEMENTS:
 * - Risk-based authentication with behavioral analysis
 * - Account lockout and brute force protection
 * - Device fingerprinting and trust scoring
 * - Network-based access controls
 * - Continuous authentication validation
 * - Just-in-time privilege escalation
 * 
 * 🏢 ENTERPRISE CAPABILITIES:
 * - Multi-tenant architecture with proper isolation
 * - SAML 2.0 enterprise SSO support
 * - Advanced permission management with wildcards
 * - Time-based and location-based access restrictions
 * - Delegation mechanisms and approval workflows
 * - Compliance reporting and governance
 * 
 * 📊 INTEGRATION:
 * - GraphQL-first API with comprehensive resolvers
 * - Event-driven architecture with real-time updates
 * - Caching integration for performance optimization
 * - Seamless integration with existing infrastructure
 */
@Module({
  imports: [
    // Passport configuration
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false,
    }),
    
    // JWT configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '15m');
        
        if (!secret) {
          throw new Error('JWT_SECRET is required for authentication module');
        }
        
        return {
          secret,
          signOptions: {
            expiresIn,
            issuer: configService.get<string>('JWT_ISSUER', 'business-management-platform'),
            audience: configService.get<string>('JWT_AUDIENCE', 'business-management-platform'),
          },
        };
      },
      inject: [ConfigService],
    }),
    
    // External module dependencies
    DatabaseModule,
    CacheModule,
    LoggerModule,
  ],
  
  providers: [
    // Core Authentication Services
    AuthService,
    SocialAuthService,
    TierAuthorizationService,
    PermissionsService,
    MfaService,
    AuthEventsService,
    SecurityService,
    SessionService,
    RiskAssessmentService,
    
    // GraphQL Resolvers
    AuthResolver,
    SocialAuthResolver,
    MfaResolver,
    PermissionsResolver,
    AuthSubscriptionsResolver,
    SecurityResolver,
    TierDemoResolver,
    
    // Passport Strategies
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    GitHubStrategy,
    
    // Guards
    JwtAuthGuard,
    GraphQLJwtAuthGuard,
    LocalAuthGuard,
    TierAuthGuard,
    PermissionsGuard,
    RolesGuard,
    AdvancedAuthGuard,
    RiskBasedAuthGuard,
    
    // Middleware
    AuthSecurityMiddleware,
    RateLimitMiddleware,
    
    // Interceptors
    TierAuthInterceptor,
  ],
  
  controllers: [
    SocialAuthController,
  ],
  
  exports: [
    // Core Services
    AuthService,
    SocialAuthService,
    TierAuthorizationService,
    PermissionsService,
    MfaService,
    AuthEventsService,
    SecurityService,
    SessionService,
    RiskAssessmentService,
    
    // Resolvers
    AuthResolver,
    SocialAuthResolver,
    MfaResolver,
    PermissionsResolver,
    AuthSubscriptionsResolver,
    SecurityResolver,
    TierDemoResolver,
    
    // Guards
    JwtAuthGuard,
    GraphQLJwtAuthGuard,
    LocalAuthGuard,
    TierAuthGuard,
    PermissionsGuard,
    RolesGuard,
    AdvancedAuthGuard,
    RiskBasedAuthGuard,
    
    // Interceptors
    TierAuthInterceptor,
    
    // Modules
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}