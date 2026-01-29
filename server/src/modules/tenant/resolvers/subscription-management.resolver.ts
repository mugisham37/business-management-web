import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '../../auth/types/auth.types';
import { SubscriptionManagementService } from '../services/subscription-management.service';
import {
  SubscriptionType,
  TrialSubscriptionType,
  SubscriptionChangeResultType,
  TrialExpirationNotificationType,
  TrialProcessingSummaryType,
  CreateTrialSubscriptionInput,
  UpgradeSubscriptionInput,
  DowngradeSubscriptionInput,
  CancelSubscriptionInput,
  GetSubscriptionInput,
  BillingCycle,
  TrialNotificationType,
} from '../types/subscription.types';
import {
  Subscription,
  SubscriptionChangeResult,
  TrialExpirationNotification,
} from '../services/subscription-management.service';

const mapBillingCycle = (billingCycle: Subscription['billingCycle']): BillingCycle =>
  billingCycle === 'yearly' ? BillingCycle.YEARLY : BillingCycle.MONTHLY;

const mapSubscription = (subscription: Subscription): SubscriptionType => {
  const mapped: SubscriptionType = {
    id: subscription.id,
    tenantId: subscription.tenantId,
    tier: subscription.tier,
    status: subscription.status,
    billingCycle: mapBillingCycle(subscription.billingCycle),
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };

  if (subscription.trialStart !== undefined) {
    mapped.trialStart = subscription.trialStart;
  }

  if (subscription.trialEnd !== undefined) {
    mapped.trialEnd = subscription.trialEnd;
  }

  if (subscription.priceOverrides !== undefined) {
    mapped.priceOverrides = subscription.priceOverrides.map(override => ({
      reason: override.reason,
      originalPrice: override.originalPrice,
      overridePrice: override.overridePrice,
      ...(override.expiresAt ? { expiresAt: override.expiresAt } : {}),
    }));
  }

  return mapped;
};

const mapSubscriptionChangeResult = (result: SubscriptionChangeResult): SubscriptionChangeResultType => ({
  success: result.success,
  subscription: mapSubscription(result.subscription),
  message: result.message,
});

const mapTrialNotificationType = (
  notificationType: TrialExpirationNotification['notificationType']
): TrialNotificationType => {
  switch (notificationType) {
    case 'final':
      return TrialNotificationType.FINAL;
    case 'expired':
      return TrialNotificationType.EXPIRED;
    case 'warning':
    default:
      return TrialNotificationType.WARNING;
  }
};

const mapTrialExpirationNotification = (
  notification: TrialExpirationNotification
): TrialExpirationNotificationType => ({
  tenantId: notification.tenantId,
  tier: notification.tier,
  daysRemaining: notification.daysRemaining,
  trialEnd: notification.trialEnd,
  notificationType: mapTrialNotificationType(notification.notificationType),
});

/**
 * GraphQL resolver for subscription management operations
 */
@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SubscriptionManagementResolver {
  constructor(
    private readonly subscriptionManagementService: SubscriptionManagementService,
  ) {}

  /**
   * Get subscription details for a tenant
   */
  @Query(() => SubscriptionType, {
    description: 'Get subscription details for a tenant',
    nullable: true,
  })
  async getSubscription(
    @Args('input') input: GetSubscriptionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<SubscriptionType | null> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    const subscription = await this.subscriptionManagementService.getSubscription(input.tenantId);
    return subscription ? mapSubscription(subscription) : null;
  }

  /**
   * Get trial subscription details
   */
  @Query(() => TrialSubscriptionType, {
    description: 'Get trial subscription details for a tenant',
    nullable: true,
  })
  async getTrialSubscription(
    @Args('input') input: GetSubscriptionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TrialSubscriptionType | null> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    return await this.subscriptionManagementService.getTrialSubscription(input.tenantId);
  }

  /**
   * Create a new trial subscription
   */
  @Mutation(() => SubscriptionChangeResultType, {
    description: 'Create a new trial subscription',
  })
  async createTrialSubscription(
    @Args('input') input: CreateTrialSubscriptionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<SubscriptionChangeResultType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    const result = await this.subscriptionManagementService.createTrialSubscription(
      input.tenantId,
      input.tier,
      user.id,
    );

    return mapSubscriptionChangeResult(result);
  }

  /**
   * Upgrade subscription
   */
  @Mutation(() => SubscriptionChangeResultType, {
    description: 'Upgrade subscription to a higher tier',
  })
  async upgradeSubscription(
    @Args('input') input: UpgradeSubscriptionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<SubscriptionChangeResultType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    const result = await this.subscriptionManagementService.upgradeSubscription(
      input.tenantId,
      input.targetTier,
      input.billingCycle,
      user.id,
    );

    return mapSubscriptionChangeResult(result);
  }

  /**
   * Downgrade subscription
   */
  @Mutation(() => SubscriptionChangeResultType, {
    description: 'Downgrade subscription to a lower tier',
  })
  async downgradeSubscription(
    @Args('input') input: DowngradeSubscriptionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<SubscriptionChangeResultType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    const result = await this.subscriptionManagementService.downgradeSubscription(
      input.tenantId,
      input.targetTier,
      input.effectiveDate,
      user.id,
    );

    return mapSubscriptionChangeResult(result);
  }

  /**
   * Cancel subscription
   */
  @Mutation(() => SubscriptionChangeResultType, {
    description: 'Cancel subscription',
  })
  async cancelSubscription(
    @Args('input') input: CancelSubscriptionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<SubscriptionChangeResultType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    const result = await this.subscriptionManagementService.cancelSubscription(
      input.tenantId,
      input.cancelAtPeriodEnd,
      input.reason,
      user.id,
    );

    return mapSubscriptionChangeResult(result);
  }

  /**
   * Get expiring trials (admin only)
   */
  @Query(() => [TrialExpirationNotificationType], {
    description: 'Get trials that are expiring soon',
  })
  async getExpiringTrials(
    @Args('daysAhead', { defaultValue: 7 }) daysAhead: number,
    @CurrentUser() user: AuthUser,
  ): Promise<TrialExpirationNotificationType[]> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('VIEW_ANALYTICS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to view expiring trials');
    }

    const notifications = await this.subscriptionManagementService.getExpiringTrials(daysAhead);
    return notifications.map(mapTrialExpirationNotification);
  }

  /**
   * Process trial expirations manually (admin only)
   */
  @Mutation(() => TrialProcessingSummaryType, {
    description: 'Manually process trial expirations',
  })
  async processTrialExpirations(
    @CurrentUser() user: AuthUser,
  ): Promise<TrialProcessingSummaryType> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('MANAGE_SUBSCRIPTIONS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to process trial expirations');
    }

    return await this.subscriptionManagementService.processTrialExpirations();
  }

  /**
   * Send trial expiration reminders manually (admin only)
   */
  @Mutation(() => TrialProcessingSummaryType, {
    description: 'Manually send trial expiration reminders',
  })
  async sendTrialExpirationReminders(
    @CurrentUser() user: AuthUser,
  ): Promise<{ sent: number; errors: number }> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('MANAGE_SUBSCRIPTIONS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to send trial reminders');
    }

    return await this.subscriptionManagementService.sendTrialExpirationReminders();
  }

  /**
   * Trigger scheduled trial processing manually (admin only)
   */
  @Mutation(() => String, {
    description: 'Manually trigger scheduled trial processing',
  })
  async triggerTrialProcessing(
    @CurrentUser() user: AuthUser,
  ): Promise<string> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('MANAGE_SUBSCRIPTIONS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to trigger trial processing');
    }

    await this.subscriptionManagementService.scheduledTrialProcessing();
    return 'Trial processing completed successfully';
  }
}