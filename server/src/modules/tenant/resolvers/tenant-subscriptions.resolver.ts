import { Resolver, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { CurrentTenant } from '../decorators/tenant.decorators';
import { Tenant, BusinessTier } from '../entities/tenant.entity';
import { FeatureFlag } from '../entities/feature-flag.entity';

const pubSub = new PubSub();

/**
 * GraphQL Subscriptions for real-time tenant updates
 */
@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantSubscriptionsResolver {
  constructor() {}

  /**
   * Subscribe to tenant updates
   */
  @Subscription(() => Tenant, {
    name: 'tenantUpdated',
    filter: (payload, variables) => {
      return payload.tenantUpdated.id === variables.tenantId;
    },
  })
  tenantUpdated(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentTenant() currentTenantId: string,
  ) {
    // Ensure user can only subscribe to their own tenant
    if (tenantId !== currentTenantId) {
      throw new Error('Access denied: Cannot subscribe to other tenant updates');
    }
    return pubSub.asyncIterator('tenantUpdated');
  }

  /**
   * Subscribe to business metrics updates
   */
  @Subscription(() => String, {
    name: 'metricsUpdated',
    filter: (payload, variables) => {
      return payload.metricsUpdated.tenantId === variables.tenantId;
    },
  })
  metricsUpdated(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentTenant() currentTenantId: string,
  ) {
    if (tenantId !== currentTenantId) {
      throw new Error('Access denied: Cannot subscribe to other tenant metrics');
    }
    return pubSub.asyncIterator('metricsUpdated');
  }

  /**
   * Subscribe to tier changes
   */
  @Subscription(() => String, {
    name: 'tierChanged',
    filter: (payload, variables) => {
      return payload.tierChanged.tenantId === variables.tenantId;
    },
  })
  tierChanged(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentTenant() currentTenantId: string,
  ) {
    if (tenantId !== currentTenantId) {
      throw new Error('Access denied: Cannot subscribe to other tenant tier changes');
    }
    return pubSub.asyncIterator('tierChanged');
  }

  /**
   * Subscribe to feature flag changes
   */
  @Subscription(() => FeatureFlag, {
    name: 'featureFlagChanged',
    filter: (payload, variables) => {
      return payload.featureFlagChanged.tenantId === variables.tenantId;
    },
  })
  featureFlagChanged(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentTenant() currentTenantId: string,
  ) {
    if (tenantId !== currentTenantId) {
      throw new Error('Access denied: Cannot subscribe to other tenant feature flags');
    }
    return pubSub.asyncIterator('featureFlagChanged');
  }

  /**
   * Subscribe to subscription status changes
   */
  @Subscription(() => String, {
    name: 'subscriptionStatusChanged',
    filter: (payload, variables) => {
      return payload.subscriptionStatusChanged.tenantId === variables.tenantId;
    },
  })
  subscriptionStatusChanged(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentTenant() currentTenantId: string,
  ) {
    if (tenantId !== currentTenantId) {
      throw new Error('Access denied: Cannot subscribe to other tenant subscription changes');
    }
    return pubSub.asyncIterator('subscriptionStatusChanged');
  }

  /**
   * Subscribe to tenant activity events
   */
  @Subscription(() => String, {
    name: 'tenantActivity',
    filter: (payload, variables) => {
      return payload.tenantActivity.tenantId === variables.tenantId;
    },
  })
  tenantActivity(
    @Args('tenantId', { type: () => ID }) tenantId: string,
    @CurrentTenant() currentTenantId: string,
  ) {
    if (tenantId !== currentTenantId) {
      throw new Error('Access denied: Cannot subscribe to other tenant activity');
    }
    return pubSub.asyncIterator('tenantActivity');
  }

  /**
   * Static method to publish tenant updates
   */
  static publishTenantUpdate(tenant: Tenant): void {
    pubSub.publish('tenantUpdated', { tenantUpdated: tenant });
  }

  /**
   * Static method to publish metrics updates
   */
  static publishMetricsUpdate(tenantId: string, metrics: any): void {
    pubSub.publish('metricsUpdated', { 
      metricsUpdated: { tenantId, metrics, timestamp: new Date() } 
    });
  }

  /**
   * Static method to publish tier changes
   */
  static publishTierChange(tenantId: string, previousTier: BusinessTier, newTier: BusinessTier): void {
    pubSub.publish('tierChanged', { 
      tierChanged: { tenantId, previousTier, newTier, timestamp: new Date() } 
    });
  }

  /**
   * Static method to publish feature flag changes
   */
  static publishFeatureFlagChange(featureFlag: FeatureFlag): void {
    pubSub.publish('featureFlagChanged', { featureFlagChanged: featureFlag });
  }

  /**
   * Static method to publish subscription status changes
   */
  static publishSubscriptionStatusChange(tenantId: string, status: string): void {
    pubSub.publish('subscriptionStatusChanged', { 
      subscriptionStatusChanged: { tenantId, status, timestamp: new Date() } 
    });
  }

  /**
   * Static method to publish tenant activity
   */
  static publishTenantActivity(tenantId: string, activity: any): void {
    pubSub.publish('tenantActivity', { 
      tenantActivity: { tenantId, ...activity, timestamp: new Date() } 
    });
  }
}

// Export pubSub for use in services
export { pubSub };
