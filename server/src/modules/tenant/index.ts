/**
 * Tenant Module - Comprehensive Multi-Tenancy Management
 * 
 * This module provides complete multi-tenant functionality including:
 * - Tenant isolation and data segregation
 * - Progressive feature disclosure based on business tier
 * - Real-time metrics tracking and tier calculation
 * - Feature flag management with gradual rollout
 * - GraphQL subscriptions for real-time updates
 * - Comprehensive audit logging
 */

// Module
export { TenantModule } from './tenant.module';

// Services
export { TenantService } from './services/tenant.service';
export { BusinessMetricsService } from './services/business-metrics.service';
export { FeatureFlagService } from './services/feature-flag.service';
export { RealTimePermissionService } from './services/real-time-permission.service';
export { DashboardControllerService } from './services/dashboard-controller.service';
export { TierChangePropagationService } from './services/tier-change-propagation.service';
export { TenantMetricsTrackingService } from './services/tenant-metrics-tracking.service';

// Resolvers
export { TenantResolver } from './resolvers/tenant.resolver';
export { FeatureFlagResolver } from './resolvers/feature-flag.resolver';
export { DashboardControllerResolver } from './resolvers/dashboard-controller.resolver';
export { TierSubscriptionsResolver } from './resolvers/tier-subscriptions.resolver';
export { TenantMetricsResolver } from './resolvers/tenant-metrics.resolver';
export { TenantSubscriptionsResolver } from './resolvers/tenant-subscriptions.resolver';

// Guards
export { TenantGuard, AuthenticatedUser } from './guards/tenant.guard';
export { FeatureGuard } from './guards/feature.guard';

// Interceptors
export { TenantInterceptor } from './interceptors/tenant.interceptor';

// Decorators
export {
  CurrentTenant,
  TenantContext,
  SkipTenantCheck,
  RequireFeature,
  SkipFeatureCheck,
  TenantScoped,
  CrossTenant,
} from './decorators/tenant.decorators';

// Entities
export {
  Tenant,
  BusinessTier,
  SubscriptionStatus,
  BusinessMetrics,
  TenantSettings,
} from './entities/tenant.entity';

export {
  FeatureFlag,
  FeatureFlagStatus,
  FeatureRule,
  FeatureDefinition,
  FEATURE_DEFINITIONS,
} from './entities/feature-flag.entity';

// DTOs
export {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateBusinessMetricsDto,
  TenantQueryDto,
  BusinessMetricsDto,
  TenantSettingsDto,
} from './dto/tenant.dto';

export {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  FeatureFlagQueryDto,
  FeatureAccessDto,
  BulkFeatureAccessDto,
  FeatureEvaluationResultDto,
  FeatureRuleDto,
} from './dto/feature-flag.dto';

// Types
export * from './types';

// Inputs
export * from './inputs';
