import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { FeatureFlagService } from './feature-flag.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessTier } from '../entities/tenant.entity';

export interface PermissionChangeEvent {
  tenantId: string;
  userId?: string;
  featureName?: string;
  oldTier?: BusinessTier;
  newTier?: BusinessTier;
  action: 'tier_changed' | 'feature_toggled' | 'subscription_updated';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PermissionEvaluationResult {
  tenantId: string;
  userId?: string;
  permissions: Record<string, boolean>;
  tier: BusinessTier;
  evaluatedAt: Date;
  cacheKey: string;
}

@Injectable()
export class RealTimePermissionService implements OnModuleInit, OnModuleDestroy {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'permissions';
  private evaluationQueue: Map<string, Promise<PermissionEvaluationResult>> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: IntelligentCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly logger: CustomLoggerService,
  ) {}

  async onModuleInit() {
    this.logger.log('RealTimePermissionService initialized');
  }

  async onModuleDestroy() {
    this.evaluationQueue.clear();
    this.logger.log('RealTimePermissionService destroyed');
  }

  /**
   * Get real-time permissions for a tenant/user
   */
  async getPermissions(
    tenantId: string,
    userId?: string,
    featureNames?: string[],
  ): Promise<PermissionEvaluationResult> {
    const cacheKey = this.buildCacheKey(tenantId, userId, featureNames);
    
    // Check if evaluation is already in progress
    const existingEvaluation = this.evaluationQueue.get(cacheKey);
    if (existingEvaluation) {
      return existingEvaluation;
    }

    // Check cache first
    const cached = await this.cacheService.get<PermissionEvaluationResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Start new evaluation
    const evaluationPromise = this.evaluatePermissions(tenantId, userId, featureNames, cacheKey);
    this.evaluationQueue.set(cacheKey, evaluationPromise);

    try {
      const result = await evaluationPromise;
      
      // Cache the result
      await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL });
      
      return result;
    } finally {
      // Remove from queue
      this.evaluationQueue.delete(cacheKey);
    }
  }

  /**
   * Evaluate permissions for a tenant/user
   */
  private async evaluatePermissions(
    tenantId: string,
    userId?: string,
    featureNames?: string[],
    cacheKey?: string,
  ): Promise<PermissionEvaluationResult> {
    try {
      // Get all feature names if not specified
      const features = featureNames || Object.keys(this.featureFlagService.getFeatureDefinitions());
      
      // Evaluate multiple features at once
      const permissions = await this.featureFlagService.evaluateMultipleFeatures(
        tenantId,
        features,
        { userId }
      );

      // Get tenant tier information
      const { available } = await this.featureFlagService.getAvailableFeatures(tenantId);
      const tier = available.length > 0 ? BusinessTier.MICRO : BusinessTier.MICRO; // Default fallback

      const result: PermissionEvaluationResult = {
        tenantId,
        userId,
        permissions,
        tier,
        evaluatedAt: new Date(),
        cacheKey: cacheKey || this.buildCacheKey(tenantId, userId, featureNames),
      };

      this.logger.debug(`Evaluated permissions for tenant ${tenantId}`, {
        tenantId,
        userId,
        featureCount: Object.keys(permissions).length,
        availableFeatures: Object.values(permissions).filter(Boolean).length,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to evaluate permissions for tenant ${tenantId}`,
        (error as Error).stack,
        { tenantId, userId, featureNames }
      );
      
      // Return empty permissions on error
      return {
        tenantId,
        userId,
        permissions: {},
        tier: BusinessTier.MICRO,
        evaluatedAt: new Date(),
        cacheKey: cacheKey || this.buildCacheKey(tenantId, userId, featureNames),
      };
    }
  }

  /**
   * Invalidate permissions cache for a tenant
   */
  async invalidatePermissions(tenantId: string, userId?: string): Promise<void> {
    const pattern = userId 
      ? `${this.CACHE_PREFIX}:${tenantId}:${userId}:*`
      : `${this.CACHE_PREFIX}:${tenantId}:*`;
    
    await this.cacheService.invalidatePattern(pattern);
    
    this.logger.debug(`Invalidated permissions cache`, { tenantId, userId, pattern });
  }

  /**
   * Preload permissions for a tenant (performance optimization)
   */
  async preloadPermissions(tenantId: string, userId?: string): Promise<void> {
    try {
      // Preload common feature sets
      const commonFeatures = [
        'point-of-sale',
        'inventory-management',
        'customer-management',
        'basic-reporting',
        'social-authentication',
        'progressive-onboarding',
        'tier-based-dashboard',
      ];

      await this.getPermissions(tenantId, userId, commonFeatures);
      
      this.logger.debug(`Preloaded permissions for tenant ${tenantId}`, { tenantId, userId });
    } catch (error) {
      this.logger.warn(
        `Failed to preload permissions for tenant ${tenantId}`,
        (error as Error).message,
        { tenantId, userId }
      );
    }
  }

  /**
   * Handle tier change events
   */
  @OnEvent('tenant.tier.changed')
  async handleTierChange(event: PermissionChangeEvent): Promise<void> {
    this.logger.log(`Handling tier change for tenant ${event.tenantId}`, {
      tenantId: event.tenantId,
      oldTier: event.oldTier,
      newTier: event.newTier,
    });

    // Invalidate all permissions for this tenant
    await this.invalidatePermissions(event.tenantId);

    // Emit permission change event for real-time updates
    this.eventEmitter.emit('permissions.changed', {
      tenantId: event.tenantId,
      action: 'tier_changed',
      oldTier: event.oldTier,
      newTier: event.newTier,
      timestamp: new Date(),
    });

    // Preload new permissions
    await this.preloadPermissions(event.tenantId);
  }

  /**
   * Handle feature flag change events
   */
  @OnEvent('feature-flag.changed')
  async handleFeatureFlagChange(event: any): Promise<void> {
    this.logger.log(`Handling feature flag change for tenant ${event.tenantId}`, {
      tenantId: event.tenantId,
      featureName: event.featureName,
      action: event.action,
    });

    // Invalidate permissions for this tenant
    await this.invalidatePermissions(event.tenantId);

    // Emit permission change event
    this.eventEmitter.emit('permissions.changed', {
      tenantId: event.tenantId,
      featureName: event.featureName,
      action: 'feature_toggled',
      timestamp: new Date(),
    });
  }

  /**
   * Handle subscription change events
   */
  @OnEvent('subscription.changed')
  async handleSubscriptionChange(event: PermissionChangeEvent): Promise<void> {
    this.logger.log(`Handling subscription change for tenant ${event.tenantId}`, {
      tenantId: event.tenantId,
      action: event.action,
    });

    // Invalidate permissions for this tenant
    await this.invalidatePermissions(event.tenantId);

    // Emit permission change event
    this.eventEmitter.emit('permissions.changed', {
      tenantId: event.tenantId,
      action: 'subscription_updated',
      timestamp: new Date(),
      metadata: event.metadata,
    });

    // Preload new permissions
    await this.preloadPermissions(event.tenantId);
  }

  /**
   * Get permission statistics for monitoring
   */
  async getPermissionStats(tenantId: string): Promise<{
    totalFeatures: number;
    availableFeatures: number;
    unavailableFeatures: number;
    upgradeRequiredFeatures: number;
    cacheHitRate: number;
    lastEvaluated: Date | null;
  }> {
    try {
      const { available, unavailable, upgradeRequired } = await this.featureFlagService.getAvailableFeatures(tenantId);
      
      // Get cache statistics (simplified)
      const cacheKey = this.buildCacheKey(tenantId);
      const cached = await this.cacheService.get<PermissionEvaluationResult>(cacheKey);
      
      return {
        totalFeatures: available.length + unavailable.length + upgradeRequired.length,
        availableFeatures: available.length,
        unavailableFeatures: unavailable.length,
        upgradeRequiredFeatures: upgradeRequired.length,
        cacheHitRate: cached ? 1.0 : 0.0, // Simplified - in production, track over time
        lastEvaluated: cached?.evaluatedAt || null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get permission stats for tenant ${tenantId}`,
        (error as Error).stack,
        { tenantId }
      );
      
      return {
        totalFeatures: 0,
        availableFeatures: 0,
        unavailableFeatures: 0,
        upgradeRequiredFeatures: 0,
        cacheHitRate: 0.0,
        lastEvaluated: null,
      };
    }
  }

  /**
   * Build cache key for permissions
   */
  private buildCacheKey(tenantId: string, userId?: string, featureNames?: string[]): string {
    const parts = [this.CACHE_PREFIX, tenantId];
    
    if (userId) {
      parts.push(userId);
    } else {
      parts.push('tenant');
    }
    
    if (featureNames && featureNames.length > 0) {
      // Sort feature names for consistent cache keys
      const sortedFeatures = [...featureNames].sort().join(',');
      parts.push(sortedFeatures);
    } else {
      parts.push('all');
    }
    
    return parts.join(':');
  }

  /**
   * Batch permission evaluation for multiple tenants
   */
  async batchEvaluatePermissions(
    requests: Array<{ tenantId: string; userId?: string; featureNames?: string[] }>
  ): Promise<PermissionEvaluationResult[]> {
    const results = await Promise.allSettled(
      requests.map(req => this.getPermissions(req.tenantId, req.userId, req.featureNames))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<PermissionEvaluationResult> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }
}