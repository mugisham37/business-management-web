import { SetMetadata } from '@nestjs/common';

/**
 * Tier Authorization decorator
 * 
 * Sets required subscription tiers for accessing a route or resolver.
 * Used in conjunction with TierAuthGuard to enforce tier-based access control.
 * 
 * @param tiers - Array of tier strings required to access the resource
 * 
 * Usage:
 * @TierAuth('premium', 'enterprise')
 * @UseGuards(JwtAuthGuard, TierAuthGuard)
 * async getPremiumFeature() { ... }
 * 
 * Available Tiers (in hierarchy order):
 * - enterprise: Full feature access with advanced capabilities
 * - premium: Enhanced features with higher limits
 * - standard: Standard features with basic limits
 * - basic: Basic features with minimal limits
 * - trial: Trial access with time limitations
 * - free: Free tier with limited features
 * 
 * The guard will check if the tenant has ANY of the specified tiers (OR logic).
 * Higher-tier subscriptions automatically have access to lower-tier features.
 */
export const TierAuth = (...tiers: string[]) => SetMetadata('tierAuth', tiers);

/**
 * Single tier decorator (alias for convenience)
 */
export const RequireTier = (tier: string) => SetMetadata('tierAuth', [tier]);

/**
 * Premium and above decorator (convenience for common use case)
 */
export const PremiumAndAbove = () => SetMetadata('tierAuth', ['premium', 'enterprise']);

/**
 * Enterprise only decorator (convenience for common use case)
 */
export const EnterpriseOnly = () => SetMetadata('tierAuth', ['enterprise']);

/**
 * Paid tiers only decorator (excludes free tier)
 */
export const PaidTiersOnly = () => SetMetadata('tierAuth', ['basic', 'standard', 'premium', 'enterprise']);

/**
 * Advanced auth decorator for complex authentication requirements
 * 
 * @param config - Configuration object for advanced authentication
 * 
 * Usage:
 * @AdvancedAuth({
 *   requireMfa: true,
 *   maxRiskScore: 50,
 *   requireTrustedDevice: true,
 *   timeRestrictions: {
 *     allowedHours: [9, 10, 11, 12, 13, 14, 15, 16, 17], // 9 AM to 5 PM
 *     allowedDays: [1, 2, 3, 4, 5] // Monday to Friday
 *   },
 *   locationRestrictions: {
 *     allowedCountries: ['US', 'CA'],
 *     blockedCountries: ['CN', 'RU']
 *   }
 * })
 * @UseGuards(JwtAuthGuard, AdvancedAuthGuard)
 * async sensitiveOperation() { ... }
 */
export const AdvancedAuth = (config: {
  requireMfa?: boolean;
  maxRiskScore?: number;
  requireTrustedDevice?: boolean;
  mfaGracePeriod?: number; // milliseconds
  validateSession?: boolean;
  timeRestrictions?: {
    allowedHours?: number[];
    allowedDays?: number[];
  };
  locationRestrictions?: {
    allowedCountries?: string[];
    blockedCountries?: string[];
    allowedRegions?: string[];
    blockedRegions?: string[];
  };
}) => SetMetadata('advancedAuth', config);