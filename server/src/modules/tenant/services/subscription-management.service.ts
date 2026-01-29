import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, and, lte, gte } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { tenants } from '../../database/schema';
import { CustomLoggerService } from '../../logger/logger.service';
import { PricingEngineService, PriceCalculation } from './pricing-engine.service';
import { TierCalculatorService } from './tier-calculator.service';
import { BusinessTier, SubscriptionStatus } from '../entities/tenant.entity';

/**
 * Subscription data model
 */
export interface Subscription {
  id: string;
  tenantId: string;
  tier: BusinessTier;
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  priceOverrides?: PriceOverride[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Price override for custom pricing
 */
export interface PriceOverride {
  reason: string;
  originalPrice: number;
  overridePrice: number;
  expiresAt?: Date;
}

/**
 * Trial subscription details
 */
export interface TrialSubscription {
  tenantId: string;
  tier: BusinessTier;
  trialStart: Date;
  trialEnd: Date;
  daysRemaining: number;
  isActive: boolean;
  hasExpired: boolean;
}

/**
 * Subscription change result
 */
export interface SubscriptionChangeResult {
  success: boolean;
  subscription: Subscription;
  priceCalculation?: PriceCalculation;
  message: string;
}

/**
 * Trial expiration notification
 */
export interface TrialExpirationNotification {
  tenantId: string;
  tier: BusinessTier;
  daysRemaining: number;
  trialEnd: Date;
  notificationType: 'warning' | 'final' | 'expired';
}

/**
 * Subscription management service with comprehensive trial support
 */
@Injectable()
export class SubscriptionManagementService {
  private readonly subscriptions: Map<string, Subscription> = new Map();

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly pricingEngineService: PricingEngineService,
    private readonly tierCalculatorService: TierCalculatorService,
    private readonly logger: CustomLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext('SubscriptionManagementService');
  }

  /**
   * Create a new trial subscription
   */
  async createTrialSubscription(
    tenantId: string,
    tier: BusinessTier,
    userId?: string,
  ): Promise<SubscriptionChangeResult> {
    this.logger.log(`Creating trial subscription for tenant ${tenantId} on tier ${tier}`);

    // Check trial eligibility
    const eligibility = await this.pricingEngineService.calculateTrialEligibility(tier, false);
    
    if (!eligibility.isEligible) {
      throw new BadRequestException(`Trial not available: ${eligibility.reason}`);
    }

    // Get current tenant
    const [tenant] = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Calculate trial dates
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + eligibility.trialDays);

    // Create subscription
    const subscription: Subscription = {
      id: `sub_${tenantId}_${Date.now()}`,
      tenantId,
      tier,
      status: SubscriptionStatus.TRIAL,
      billingCycle: 'monthly',
      currentPeriodStart: trialStart,
      currentPeriodEnd: trialEnd,
      trialStart,
      trialEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store subscription
    await this.storeSubscription(subscription);

    // Update tenant tier and trial information
    await this.drizzle.getDb()
      .update(tenants)
      .set({
        businessTier: tier,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndDate: trialEnd,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Log tier change
    await this.tierCalculatorService.changeTier(
      tenantId,
      tier,
      'system',
      `Trial subscription created for ${eligibility.trialDays} days`,
      userId,
    );

    // Emit events
    this.eventEmitter.emit('subscription.trial.created', {
      tenantId,
      tier,
      trialStart,
      trialEnd,
      daysRemaining: eligibility.trialDays,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Trial subscription created for tenant ${tenantId}: ${eligibility.trialDays} days`);

    return {
      success: true,
      subscription,
      message: `${eligibility.trialDays}-day trial started successfully`,
    };
  }

  /**
   * Upgrade subscription with prorated pricing
   */
  async upgradeSubscription(
    tenantId: string,
    targetTier: BusinessTier,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    userId?: string,
  ): Promise<SubscriptionChangeResult> {
    this.logger.log(`Upgrading subscription for tenant ${tenantId} to ${targetTier}`);

    // Get current subscription
    const currentSubscription = await this.getSubscription(tenantId);
    if (!currentSubscription) {
      throw new NotFoundException(`No subscription found for tenant ${tenantId}`);
    }

    // Calculate upgrade price
    const priceCalculation = await this.pricingEngineService.calculateUpgradePrice(
      currentSubscription.tier,
      targetTier,
      billingCycle,
      currentSubscription.currentPeriodEnd,
    );

    // Create new subscription
    const newSubscription: Subscription = {
      ...currentSubscription,
      id: `sub_${tenantId}_${Date.now()}`,
      tier: targetTier,
      status: SubscriptionStatus.ACTIVE,
      billingCycle,
      currentPeriodStart: priceCalculation.effectiveDate,
      currentPeriodEnd: priceCalculation.nextBillingDate,
      trialStart: undefined,
      trialEnd: undefined,
      updatedAt: new Date(),
    };

    // Store new subscription
    await this.storeSubscription(newSubscription);

    // Update tenant
    await this.drizzle.getDb()
      .update(tenants)
      .set({
        businessTier: targetTier,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        trialEndDate: null,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Log tier change
    await this.tierCalculatorService.changeTier(
      tenantId,
      targetTier,
      'manual',
      `Subscription upgraded from ${currentSubscription.tier} to ${targetTier}`,
      userId,
    );

    // Emit events
    this.eventEmitter.emit('subscription.upgraded', {
      tenantId,
      previousTier: currentSubscription.tier,
      newTier: targetTier,
      billingCycle,
      priceCalculation,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Subscription upgraded for tenant ${tenantId}: ${currentSubscription.tier} -> ${targetTier}`);

    return {
      success: true,
      subscription: newSubscription,
      priceCalculation,
      message: `Successfully upgraded to ${targetTier} tier`,
    };
  }

  /**
   * Downgrade subscription with access maintained until next billing cycle
   */
  async downgradeSubscription(
    tenantId: string,
    targetTier: BusinessTier,
    effectiveDate?: Date,
    userId?: string,
  ): Promise<SubscriptionChangeResult> {
    this.logger.log(`Downgrading subscription for tenant ${tenantId} to ${targetTier}`);

    // Get current subscription
    const currentSubscription = await this.getSubscription(tenantId);
    if (!currentSubscription) {
      throw new NotFoundException(`No subscription found for tenant ${tenantId}`);
    }

    const effectiveDowngradeDate = effectiveDate || currentSubscription.currentPeriodEnd;
    const isImmediateDowngrade = effectiveDowngradeDate <= new Date();

    // Create new subscription
    const newSubscription: Subscription = {
      ...currentSubscription,
      id: `sub_${tenantId}_${Date.now()}`,
      tier: isImmediateDowngrade ? targetTier : currentSubscription.tier,
      cancelAtPeriodEnd: !isImmediateDowngrade,
      metadata: {
        ...currentSubscription.metadata,
        scheduledDowngrade: !isImmediateDowngrade ? {
          targetTier,
          effectiveDate: effectiveDowngradeDate,
        } : undefined,
      },
      updatedAt: new Date(),
    };

    // Store new subscription
    await this.storeSubscription(newSubscription);

    // Update tenant if immediate downgrade
    if (isImmediateDowngrade) {
      await this.drizzle.getDb()
        .update(tenants)
        .set({
          businessTier: targetTier,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId));

      // Log tier change
      await this.tierCalculatorService.changeTier(
        tenantId,
        targetTier,
        'manual',
        `Subscription downgraded from ${currentSubscription.tier} to ${targetTier}`,
        userId,
      );
    }

    // Emit events
    this.eventEmitter.emit('subscription.downgraded', {
      tenantId,
      previousTier: currentSubscription.tier,
      newTier: targetTier,
      effectiveDate: effectiveDowngradeDate,
      isImmediate: isImmediateDowngrade,
      userId,
      timestamp: new Date(),
    });

    const message = isImmediateDowngrade
      ? `Successfully downgraded to ${targetTier} tier`
      : `Downgrade to ${targetTier} tier scheduled for ${effectiveDowngradeDate.toDateString()}`;

    this.logger.log(`Subscription downgrade processed for tenant ${tenantId}: ${message}`);

    return {
      success: true,
      subscription: newSubscription,
      message,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    tenantId: string,
    cancelAtPeriodEnd: boolean = true,
    reason?: string,
    userId?: string,
  ): Promise<SubscriptionChangeResult> {
    this.logger.log(`Canceling subscription for tenant ${tenantId}`);

    // Get current subscription
    const currentSubscription = await this.getSubscription(tenantId);
    if (!currentSubscription) {
      throw new NotFoundException(`No subscription found for tenant ${tenantId}`);
    }

    const effectiveDate = cancelAtPeriodEnd ? currentSubscription.currentPeriodEnd : new Date();
    const isImmediateCancel = !cancelAtPeriodEnd;

    // Create new subscription
    const newSubscription: Subscription = {
      ...currentSubscription,
      id: `sub_${tenantId}_${Date.now()}`,
      status: isImmediateCancel ? SubscriptionStatus.CANCELED : currentSubscription.status,
      cancelAtPeriodEnd,
      metadata: {
        ...currentSubscription.metadata,
        cancellationReason: reason,
        canceledAt: new Date(),
        effectiveCancelDate: effectiveDate,
      },
      updatedAt: new Date(),
    };

    // Store new subscription
    await this.storeSubscription(newSubscription);

    // Update tenant if immediate cancellation
    if (isImmediateCancel) {
      await this.drizzle.getDb()
        .update(tenants)
        .set({
          businessTier: BusinessTier.MICRO, // Downgrade to free tier
          subscriptionStatus: SubscriptionStatus.CANCELED,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId));

      // Log tier change
      await this.tierCalculatorService.changeTier(
        tenantId,
        BusinessTier.MICRO,
        'manual',
        `Subscription canceled: ${reason || 'No reason provided'}`,
        userId,
      );
    }

    // Emit events
    this.eventEmitter.emit('subscription.canceled', {
      tenantId,
      tier: currentSubscription.tier,
      effectiveDate,
      isImmediate: isImmediateCancel,
      reason,
      userId,
      timestamp: new Date(),
    });

    const message = isImmediateCancel
      ? 'Subscription canceled immediately'
      : `Subscription will be canceled at the end of the current period (${effectiveDate.toDateString()})`;

    this.logger.log(`Subscription canceled for tenant ${tenantId}: ${message}`);

    return {
      success: true,
      subscription: newSubscription,
      message,
    };
  }

  /**
   * Get subscription details for a tenant
   */
  async getSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptions.get(tenantId) || null;
  }

  /**
   * Get trial subscription details
   */
  async getTrialSubscription(tenantId: string): Promise<TrialSubscription | null> {
    const subscription = await this.getSubscription(tenantId);
    
    if (!subscription || !subscription.trialStart || !subscription.trialEnd) {
      return null;
    }

    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isActive = subscription.status === SubscriptionStatus.TRIAL && now < subscription.trialEnd;
    const hasExpired = now >= subscription.trialEnd;

    return {
      tenantId,
      tier: subscription.tier,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      daysRemaining,
      isActive,
      hasExpired,
    };
  }

  /**
   * Get expiring trials for notification
   */
  async getExpiringTrials(daysAhead: number = 7): Promise<TrialExpirationNotification[]> {
    const notifications: TrialExpirationNotification[] = [];
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    for (const [tenantId, subscription] of this.subscriptions) {
      if (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEnd) {
        const daysRemaining = Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let notificationType: 'warning' | 'final' | 'expired';
        if (daysRemaining < 0) {
          notificationType = 'expired';
        } else if (daysRemaining <= 1) {
          notificationType = 'final';
        } else {
          notificationType = 'warning';
        }

        if (daysRemaining <= daysAhead) {
          notifications.push({
            tenantId,
            tier: subscription.tier,
            daysRemaining: Math.max(0, daysRemaining),
            trialEnd: subscription.trialEnd,
            notificationType,
          });
        }
      }
    }

    return notifications;
  }

  /**
   * Process trial expirations
   */
  async processTrialExpirations(): Promise<{
    processed: number;
    downgraded: number;
    errors: number;
  }> {
    this.logger.log('Processing trial expirations');

    const expiredTrials = await this.getExpiringTrials(0); // Get already expired trials
    const expired = expiredTrials.filter(trial => trial.notificationType === 'expired');

    let processed = 0;
    let downgraded = 0;
    let errors = 0;

    for (const trial of expired) {
      try {
        // Downgrade to free tier
        await this.downgradeSubscription(
          trial.tenantId,
          BusinessTier.MICRO,
          new Date(),
          'system',
        );

        downgraded++;
        processed++;

        this.logger.log(`Trial expired and downgraded for tenant ${trial.tenantId}`);
      } catch (error) {
        this.logger.error(`Failed to process trial expiration for tenant ${trial.tenantId}: ${error.message}`);
        errors++;
      }
    }

    // Emit summary event
    this.eventEmitter.emit('subscription.trial.expiration.summary', {
      processed,
      downgraded,
      errors,
      timestamp: new Date(),
    });

    return { processed, downgraded, errors };
  }

  /**
   * Send trial expiration reminders
   */
  async sendTrialExpirationReminders(): Promise<{
    sent: number;
    errors: number;
  }> {
    this.logger.log('Sending trial expiration reminders');

    const expiringTrials = await this.getExpiringTrials(7);
    const reminders = expiringTrials.filter(trial => 
      trial.notificationType === 'warning' || trial.notificationType === 'final'
    );

    let sent = 0;
    let errors = 0;

    for (const reminder of reminders) {
      try {
        // Emit notification event (to be handled by notification service)
        this.eventEmitter.emit('subscription.trial.reminder', reminder);
        sent++;
      } catch (error) {
        this.logger.error(`Failed to send trial reminder for tenant ${reminder.tenantId}: ${error.message}`);
        errors++;
      }
    }

    return { sent, errors };
  }

  /**
   * Scheduled job to process trial expirations and send reminders
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async scheduledTrialProcessing(): Promise<void> {
    this.logger.log('Starting scheduled trial processing');

    try {
      // Send reminders first
      const reminderResults = await this.sendTrialExpirationReminders();
      this.logger.log(`Trial reminders sent: ${reminderResults.sent}, errors: ${reminderResults.errors}`);

      // Process expirations
      const expirationResults = await this.processTrialExpirations();
      this.logger.log(`Trial expirations processed: ${expirationResults.processed}, downgraded: ${expirationResults.downgraded}, errors: ${expirationResults.errors}`);

    } catch (error) {
      this.logger.error(`Scheduled trial processing failed: ${error.message}`);
    }
  }

  /**
   * Store subscription (in production, this would go to a database)
   */
  private async storeSubscription(subscription: Subscription): Promise<void> {
    this.subscriptions.set(subscription.tenantId, subscription);
    this.logger.log(`Subscription stored: ${subscription.id}`);
  }
}