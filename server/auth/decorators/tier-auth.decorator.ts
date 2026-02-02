import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { TierAuthGuard } from '../guards/tier-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Require specific business tier for access
 * Automatically includes JWT authentication
 */
export const RequireTier = (tier: 'micro' | 'small' | 'medium' | 'enterprise') =>
  applyDecorators(
    SetMetadata('requiredTier', tier),
    UseGuards(JwtAuthGuard, TierAuthGuard),
  );

/**
 * Require specific features for access
 * Automatically includes JWT authentication
 */
export const RequireFeature = (...features: string[]) =>
  applyDecorators(
    SetMetadata('requiredFeatures', features),
    UseGuards(JwtAuthGuard, TierAuthGuard),
  );

/**
 * Require both tier and features for access
 * Automatically includes JWT authentication
 */
export const RequireTierAndFeatures = (
  tier: 'micro' | 'small' | 'medium' | 'enterprise',
  ...features: string[]
) =>
  applyDecorators(
    SetMetadata('requiredTier', tier),
    SetMetadata('requiredFeatures', features),
    UseGuards(JwtAuthGuard, TierAuthGuard),
  );

/**
 * Require small tier or higher (small, medium, enterprise)
 */
export const RequireSmallTier = () => RequireTier('small');

/**
 * Require medium tier or higher (medium, enterprise)
 */
export const RequireMediumTier = () => RequireTier('medium');

/**
 * Require enterprise tier
 */
export const RequireEnterpriseTier = () => RequireTier('enterprise');

/**
 * Common feature requirements
 */
export const RequireAdvancedReporting = () => RequireFeature('advanced_reporting');
export const RequireMultiLocation = () => RequireFeature('multi_location');
export const RequireAPIAccess = () => RequireFeature('api_access');
export const RequireCustomFields = () => RequireFeature('custom_fields');
export const RequireAdvancedAnalytics = () => RequireFeature('advanced_analytics');
export const RequireIntegrations = () => RequireFeature('integrations');