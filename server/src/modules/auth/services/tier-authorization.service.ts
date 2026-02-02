import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { CacheService } from '../../cache/cache.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { PermissionsService } from './permissions.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { tenants, tenantFeatureFlags } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthorizationContext {
  user: AuthenticatedUser;
  resource?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredTier?: string;
  missingFeatures?: string[];
  missingPermissions?: string[];
  upgradeRequired?: boolean;
}

export interface TierInfo {
  tier: string;
  features: string[];
  limits: Record<string, any>;
  expiresAt?: Date;
  isActive: boolean;
}

/**
 * Tier Authorization Service
 * 
 * Provides comprehensive tier-based access control integrated with the existing
 * RBAC system. Manages subscription tiers, feature flags, and access control
 * for business features based on subscription levels.
 * 
 * Features:
 * - Tier-based access control
 * - Feature flag management
 * - Subscription validation
 * - Upgrade recommendations
 * - Usage limit enforcement
 */
@Injectable()
export class TierAuthorizationService {
  private readonly tierHierarchy = {
    free: 0,
    basic: 1,
    standard: 2,
    premium: 3,
    enterprise: 4,
  };

  private readonly tierFeatures = {
    free: ['basic_reporting', 'email_support', 'basic_pos'],
    basic: ['advanced_reporting', 'phone_support', 'inventory_basic', 'api_access'],
    standard: ['custom_dashboards', 'integrations', 'multi_location', 'advanced_pos'],
    premium: ['advanced_analytics', 'custom_integrations', 'white_label', 'priority_support'],
    enterprise: ['enterprise_sso', 'advanced_security', 'dedicated_support', 'custom_development'],
  };

  private readonly tierLimits = {
    free: { users: 5, locations: 1, storage: '1GB', transactions: 100 },
    basic: { users: 25, locations: 3, storage: '10GB', transactions: 1000 },
    standard: { users: 100, locations: 10, storage: '50GB', transactions: 10000 },
    premium: { users: -1, locations: -1, storage: '500GB', transactions: -1 }, // -1 = unlimited
    enterprise: { users: -1, locations: -1, storage: '1TB', transactions: -1 },
  };

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly cacheService: CacheService,
    private readonly logger: CustomLoggerService,
    private readonly permissionsService: PermissionsService,
  ) {
    this.logger.setContext('TierAuthorizationService');
  }

  /**
   * Check comprehensive authorization including tier, features, and permissions
   */
  async checkAuthorization(
    context: AuthorizationContext,
    requirements: {
      tier?: string;
      features?: string[];
      permissions?: string[];
    },
  ): Promise<AuthorizationResult> {
    const { user } = context;
    const { tier, features = [], permissions = [] } = requirements;

    try {
      // Get tenant tier information
      const tenantTier = await this.getTenantTier(user.tenantId);

      // Check tier requirement
      if (tier && !this.checkTierAccessLevel(tenantTier, tier)) {
        return {
          allowed: false,
          reason: `Insufficient tier access. Required: ${tier}, Current: ${tenantTier}`,
          requiredTier: tier,
          upgradeRequired: true,
        };
      }

      // Check feature requirements
      const missingFeatures: string[] = [];
      for (const feature of features) {
        const hasFeature = await this.checkFeatureAccess(user.tenantId, feature);
        if (!hasFeature) {
          missingFeatures.push(feature);
        }
      }

      if (missingFeatures.length > 0) {
        return {
          allowed: false,
          reason: `Missing required features: ${missingFeatures.join(', ')}`,
          missingFeatures,
          upgradeRequired: true,
        };
      }

      // Check permission requirements
      if (permissions.length > 0) {
        const userPermissions = await this.permissionsService.getUserPermissions(
          user.id,
          user.tenantId,
        );

        const missingPermissions = permissions.filter(
          permission => !this.permissionsService.hasPermission(userPermissions, permission)
        );

        if (missingPermissions.length > 0) {
          return {
            allowed: false,
            reason: `Missing required permissions: ${missingPermissions.join(', ')}`,
            missingPermissions,
            upgradeRequired: false, // Permissions are role-based, not tier-based
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      this.logger.error(`Authorization check failed for user ${user.id} in tenant ${user.tenantId}: ${error.message}`);

      return {
        allowed: false,
        reason: 'Authorization check failed',
      };
    }
  }

  /**
   * Check if tenant has access to a specific tier
   */
  async checkTierAccess(tenantId: string, requiredTier: string): Promise<boolean> {
    try {
      const currentTier = await this.getTenantTier(tenantId);
      return this.checkTierAccessLevel(currentTier, requiredTier);
    } catch (error) {
      this.logger.error(`Tier access check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if tenant has access to a specific feature
   */
  async checkFeatureAccess(tenantId: string, featureName: string): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `feature_access:${tenantId}:${featureName}`;
      const cached = await this.cacheService.get<boolean>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const db = this.drizzleService.getDb();

      // Check if feature is explicitly enabled/disabled
      const [featureFlag] = await db
        .select()
        .from(tenantFeatureFlags)
        .where(and(
          eq(tenantFeatureFlags.tenantId, tenantId),
          eq(tenantFeatureFlags.featureName, featureName),
          eq(tenantFeatureFlags.isActive, true)
        ))
        .limit(1);

      let hasAccess = false;

      if (featureFlag) {
        // Explicit feature flag setting
        hasAccess = featureFlag.isEnabled;
      } else {
        // Check tier-based access
        const tenantTier = await this.getTenantTier(tenantId);
        const tierFeatures = this.tierFeatures[tenantTier as keyof typeof this.tierFeatures] || [];
        hasAccess = tierFeatures.includes(featureName);
      }

      // Cache the result for 15 minutes
      await this.cacheService.set(cacheKey, hasAccess, { ttl: 15 * 60 });

      return hasAccess;
    } catch (error) {
      this.logger.error(`Feature access check failed for tenant ${tenantId}, feature ${featureName}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get tenant's current tier
   */
  async getTenantTier(tenantId: string): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `tenant_tier:${tenantId}`;
      const cached = await this.cacheService.get<string>(cacheKey);
      if (cached) {
        return cached;
      }

      const db = this.drizzleService.getDb();
      const [tenant] = await db
        .select({ businessTier: tenants.businessTier })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      const tier = tenant?.businessTier || 'free';

      // Cache for 1 hour
      await this.cacheService.set(cacheKey, tier, { ttl: 60 * 60 });

      return tier;
    } catch (error) {
      this.logger.error(`Failed to get tenant tier for ${tenantId}: ${error.message}`);
      return 'free';
    }
  }

  /**
   * Get comprehensive tier information for tenant
   */
  async getTenantTierInfo(tenantId: string): Promise<TierInfo> {
    try {
      const tier = await this.getTenantTier(tenantId);
      const features = this.tierFeatures[tier as keyof typeof this.tierFeatures] || [];
      const limits = this.tierLimits[tier as keyof typeof this.tierLimits] || {};

      return {
        tier,
        features,
        limits,
        isActive: true, // Would check subscription status in real implementation
      };
    } catch (error) {
      this.logger.error(`Failed to get tenant tier info for ${tenantId}: ${error.message}`);
      return {
        tier: 'free',
        features: this.tierFeatures.free,
        limits: this.tierLimits.free,
        isActive: true,
      };
    }
  }

  /**
   * Get upgrade recommendations for tenant
   */
  async getUpgradeRecommendations(tenantId: string): Promise<{
    currentTier: string;
    recommendedTier: string;
    additionalFeatures: string[];
    estimatedBenefit: string;
  }> {
    try {
      const currentTier = await this.getTenantTier(tenantId);
      const recommendedTier = this.getNextTier(currentTier);
      
      const currentFeatures = this.tierFeatures[currentTier as keyof typeof this.tierFeatures] || [];
      const recommendedFeatures = this.tierFeatures[recommendedTier as keyof typeof this.tierFeatures] || [];
      
      const additionalFeatures = recommendedFeatures.filter(
        feature => !currentFeatures.includes(feature)
      );

      return {
        currentTier,
        recommendedTier,
        additionalFeatures,
        estimatedBenefit: this.calculateEstimatedBenefit(additionalFeatures),
      };
    } catch (error) {
      this.logger.error(`Failed to get upgrade recommendations for ${tenantId}: ${error.message}`);
      return {
        currentTier: 'free',
        recommendedTier: 'basic',
        additionalFeatures: [],
        estimatedBenefit: 'Enhanced business capabilities',
      };
    }
  }

  /**
   * Check if current tier meets required tier (private method)
   */
  private checkTierAccessLevel(currentTier: string, requiredTier: string): boolean {
    const currentLevel = this.tierHierarchy[currentTier as keyof typeof this.tierHierarchy] || 0;
    const requiredLevel = this.tierHierarchy[requiredTier as keyof typeof this.tierHierarchy] || 0;
    
    return currentLevel >= requiredLevel;
  }

  /**
   * Get the next tier in progression
   */
  private getNextTier(currentTier: string): string {
    const tierProgression = {
      free: 'basic',
      basic: 'standard',
      standard: 'premium',
      premium: 'enterprise',
      enterprise: 'enterprise',
    };
    
    return tierProgression[currentTier as keyof typeof tierProgression] || 'basic';
  }

  /**
   * Calculate estimated benefit of additional features
   */
  private calculateEstimatedBenefit(features: string[]): string {
    if (features.length === 0) {
      return 'No additional features available';
    }

    const benefitMap: Record<string, string> = {
      advanced_reporting: 'Better business insights',
      multi_location: 'Manage multiple locations',
      api_access: 'Custom integrations',
      advanced_analytics: 'Detailed performance metrics',
      custom_dashboards: 'Personalized dashboards',
      white_label: 'Brand customization',
      enterprise_sso: 'Single sign-on',
      advanced_security: 'Enhanced security features',
    };

    const benefits = features
      .map(feature => benefitMap[feature])
      .filter(Boolean)
      .slice(0, 3); // Top 3 benefits

    return benefits.length > 0 
      ? benefits.join(', ') 
      : `${features.length} additional features`;
  }

  /**
   * Check usage limits for tenant
   */
  async checkUsageLimit(tenantId: string, limitType: string, currentUsage: number): Promise<{
    withinLimit: boolean;
    limit: number;
    usage: number;
    percentage: number;
  }> {
    try {
      const tier = await this.getTenantTier(tenantId);
      const limits = this.tierLimits[tier as keyof typeof this.tierLimits] || {};
      const limit = limits[limitType] || 0;

      // -1 means unlimited
      if (limit === -1) {
        return {
          withinLimit: true,
          limit: -1,
          usage: currentUsage,
          percentage: 0,
        };
      }

      const withinLimit = currentUsage <= limit;
      const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0;

      return {
        withinLimit,
        limit,
        usage: currentUsage,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      this.logger.error(`Usage limit check failed for tenant ${tenantId}, limit type ${limitType}: ${error.message}`);
      return {
        withinLimit: false,
        limit: 0,
        usage: currentUsage,
        percentage: 100,
      };
    }
  }
}