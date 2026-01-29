import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { TenantService } from './services/tenant.service';
import { BusinessMetricsService } from './services/business-metrics.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { RealTimePermissionService } from './services/real-time-permission.service';
import { DashboardControllerService } from './services/dashboard-controller.service';
import { TierChangePropagationService } from './services/tier-change-propagation.service';
import { TenantMetricsTrackingService } from './services/tenant-metrics-tracking.service';
import { OnboardingService } from './services/onboarding.service';
import { BusinessProfileService } from './services/business-profile.service';
import { PricingEngineService } from './services/pricing-engine.service';
import { TierCalculatorService } from './services/tier-calculator.service';
import { SubscriptionManagementService } from './services/subscription-management.service';

// Resolvers
import { TenantResolver } from './resolvers/tenant.resolver';
import { FeatureFlagResolver } from './resolvers/feature-flag.resolver';
import { DashboardControllerResolver } from './resolvers/dashboard-controller.resolver';
import { TierSubscriptionsResolver } from './resolvers/tier-subscriptions.resolver';
import { TenantMetricsResolver } from './resolvers/tenant-metrics.resolver';
import { TenantSubscriptionsResolver } from './resolvers/tenant-subscriptions.resolver';
import { OnboardingResolver } from './resolvers/onboarding.resolver';
import { TierAccessResolver } from './resolvers/tier-access.resolver';
import { PricingEngineResolver } from './resolvers/pricing-engine.resolver';
import { TierCalculatorResolver } from './resolvers/tier-calculator.resolver';
import { SubscriptionManagementResolver } from './resolvers/subscription-management.resolver';

// Guards
import { TenantGuard } from './guards/tenant.guard';
import { FeatureGuard } from './guards/feature.guard';

// Interceptors
import { TenantInterceptor } from './interceptors/tenant.interceptor';

// External modules
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';

/**
 * Tenant Module - Comprehensive multi-tenancy management
 * 
 * Features:
 * - Multi-tenant data isolation
 * - Progressive feature disclosure based on business tier
 * - Real-time metrics tracking and tier calculation
 * - Feature flag management with rollout capabilities
 * - GraphQL subscriptions for real-time updates
 * - Comprehensive audit logging
 * - Automated tier progression tracking
 */
@Global()
@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    LoggerModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    // Services
    TenantService,
    BusinessMetricsService,
    FeatureFlagService,
    RealTimePermissionService,
    DashboardControllerService,
    TierChangePropagationService,
    TenantMetricsTrackingService,
    OnboardingService,
    BusinessProfileService,
    PricingEngineService,
    TierCalculatorService,
    SubscriptionManagementService,

    // Resolvers
    TenantResolver,
    FeatureFlagResolver,
    DashboardControllerResolver,
    TierSubscriptionsResolver,
    TenantMetricsResolver,
    TenantSubscriptionsResolver,
    OnboardingResolver,
    TierAccessResolver,
    PricingEngineResolver,
    TierCalculatorResolver,
    SubscriptionManagementResolver,

    // Guards - Global application
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FeatureGuard,
    },

    // Interceptors - Global application
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },

    // Also provide guards for manual injection
    TenantGuard,
    FeatureGuard,
    TenantInterceptor,
  ],
  exports: [
    // Export all services for use in other modules
    TenantService,
    BusinessMetricsService,
    FeatureFlagService,
    RealTimePermissionService,
    DashboardControllerService,
    TierChangePropagationService,
    TenantMetricsTrackingService,
    OnboardingService,
    BusinessProfileService,
    PricingEngineService,
    TierCalculatorService,
    SubscriptionManagementService,

    // Export guards and interceptors for manual use
    TenantGuard,
    FeatureGuard,
    TenantInterceptor,
  ],
})
export class TenantModule { }