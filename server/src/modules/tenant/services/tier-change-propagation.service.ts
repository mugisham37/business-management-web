import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IntelligentCacheService } from '../../cache/intelligent-cache.service';
import { RealTimePermissionService } from './real-time-permission.service';
import { DashboardControllerService } from './dashboard-controller.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessTier } from '../entities/tenant.entity';

export interface TierChangeEvent {
  tenantId: string;
  userId?: string;
  oldTier: BusinessTier;
  newTier: BusinessTier;
  reason: string;
  effectiveAt: Date;
  metadata?: Record<string, any>;
  source: 'manual' | 'automatic' | 'trial_expiry' | 'subscription_change';
}

export interface PermissionChangeNotification {
  tenantId: string;
  userId?: string;
  changedFeatures: {
    featureName: string;
    oldAccess: boolean;
    newAccess: boolean;
    reason: string;
  }[];
  newTier: BusinessTier;
  timestamp: Date;
}

export interface DashboardUpdateNotification {
  tenantId: string;
  userId?: string;
  newModules: string[];
  removedModules: string[];
  newUpgradePrompts: string[];
  removedUpgradePrompts: string[];
  timestamp: Date;
}

export interface SystemStateUpdate {
  tenantId: string;
  userId?: string;
  permissions: PermissionChangeNotification;
  dashboard: DashboardUpdateNotification;
  tier: BusinessTier;
  timestamp: Date;
}

@Injectable()
export class TierChangePropagationService implements OnModuleInit, OnModuleDestroy {
  private readonly PROPAGATION_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly BATCH_SIZE = 10;

  private propagationQueue: Map<string, TierChangeEvent[]> = new Map();
  private processingQueue: Set<string> = new Set();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: IntelligentCacheService,
    private readonly realTimePermissionService: RealTimePermissionService,
    private readonly dashboardControllerService: DashboardControllerService,
    private readonly logger: CustomLoggerService,
  ) {}

  async onModuleInit() {
    this.logger.log('TierChangePropagationService initialized');
  }

  async onModuleDestroy() {
    this.propagationQueue.clear();
    this.processingQueue.clear();
    this.logger.log('TierChangePropagationService destroyed');
  }

  /**
   * Handle tier change events and propagate updates
   */
  @OnEvent('tenant.tier.changed')
  async handleTierChange(event: TierChangeEvent): Promise<void> {
    this.logger.log(`Processing tier change for tenant ${event.tenantId}`, {
      tenantId: event.tenantId,
      oldTier: event.oldTier,
      newTier: event.newTier,
      source: event.source,
    });

    try {
      // Add to propagation queue
      await this.queueTierChange(event);

      // Process immediately for real-time updates
      await this.processTierChange(event);

      this.logger.log(`Successfully processed tier change for tenant ${event.tenantId}`, {
        tenantId: event.tenantId,
        newTier: event.newTier,
      });
    } catch (error) {
      this.logger.error(
        `Failed to process tier change for tenant ${event.tenantId}`,
        (error as Error).stack,
        { event }
      );

      // Emit error event for monitoring
      this.eventEmitter.emit('tier-change.propagation.failed', {
        tenantId: event.tenantId,
        error: (error as Error).message,
        event,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle subscription change events
   */
  @OnEvent('subscription.changed')
  async handleSubscriptionChange(event: any): Promise<void> {
    this.logger.log(`Processing subscription change for tenant ${event.tenantId}`, {
      tenantId: event.tenantId,
      action: event.action,
    });

    // Convert subscription change to tier change event
    const tierChangeEvent: TierChangeEvent = {
      tenantId: event.tenantId,
      userId: event.userId,
      oldTier: event.oldTier || BusinessTier.MICRO,
      newTier: event.newTier || BusinessTier.MICRO,
      reason: `Subscription ${event.action}`,
      effectiveAt: new Date(),
      metadata: event.metadata,
      source: 'subscription_change',
    };

    await this.handleTierChange(tierChangeEvent);
  }

  /**
   * Handle trial expiry events
   */
  @OnEvent('trial.expired')
  async handleTrialExpiry(event: any): Promise<void> {
    this.logger.log(`Processing trial expiry for tenant ${event.tenantId}`, {
      tenantId: event.tenantId,
    });

    const tierChangeEvent: TierChangeEvent = {
      tenantId: event.tenantId,
      userId: event.userId,
      oldTier: event.trialTier || BusinessTier.SMALL,
      newTier: BusinessTier.MICRO, // Downgrade to free tier
      reason: 'Trial period expired',
      effectiveAt: new Date(),
      source: 'trial_expiry',
    };

    await this.handleTierChange(tierChangeEvent);
  }

  /**
   * Get propagation status for a tenant
   */
  async getPropagationStatus(tenantId: string): Promise<{
    isProcessing: boolean;
    queuedEvents: number;
    lastProcessedAt?: Date;
    errors: string[];
  }> {
    const isProcessing = this.processingQueue.has(tenantId);
    const queuedEvents = this.propagationQueue.get(tenantId)?.length || 0;
    
    // Get last processed timestamp from cache
    const lastProcessedAt = (await this.cacheService.get<Date>(`tier-change:last-processed:${tenantId}`)) ?? undefined;
    
    // Get recent errors from cache
    const errors = await this.cacheService.get<string[]>(`tier-change:errors:${tenantId}`) || [];

    const status = {
      isProcessing,
      queuedEvents,
      errors,
    } as {
      isProcessing: boolean;
      queuedEvents: number;
      lastProcessedAt?: Date;
      errors: string[];
    };

    if (lastProcessedAt !== undefined) {
      status.lastProcessedAt = lastProcessedAt;
    }

    return status;
  }

  /**
   * Force propagation for a tenant (manual trigger)
   */
  async forcePropagation(tenantId: string, reason: string = 'Manual trigger'): Promise<void> {
    this.logger.log(`Force propagating tier changes for tenant ${tenantId}`, {
      tenantId,
      reason,
    });

    // Create a synthetic tier change event to trigger propagation
    const event: TierChangeEvent = {
      tenantId,
      oldTier: BusinessTier.MICRO, // Will be determined during processing
      newTier: BusinessTier.MICRO, // Will be determined during processing
      reason,
      effectiveAt: new Date(),
      source: 'manual',
    };

    await this.processTierChange(event);
  }

  /**
   * Queue tier change for processing
   */
  private async queueTierChange(event: TierChangeEvent): Promise<void> {
    const existing = this.propagationQueue.get(event.tenantId) || [];
    existing.push(event);
    this.propagationQueue.set(event.tenantId, existing);

    // Limit queue size to prevent memory issues
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
  }

  /**
   * Process tier change and propagate updates
   */
  private async processTierChange(event: TierChangeEvent): Promise<void> {
    const { tenantId } = event;

    // Prevent concurrent processing for the same tenant
    if (this.processingQueue.has(tenantId)) {
      this.logger.debug(`Tier change processing already in progress for tenant ${tenantId}`);
      return;
    }

    this.processingQueue.add(tenantId);

    try {
      // Step 1: Invalidate all caches
      await this.invalidateAllCaches(tenantId);

      // Step 2: Get permission changes
      const permissionChanges = await this.calculatePermissionChanges(event);

      // Step 3: Get dashboard changes
      const dashboardChanges = await this.calculateDashboardChanges(event);

      // Step 4: Create system state update
      const systemUpdate: SystemStateUpdate = {
        tenantId,
        ...(event.userId ? { userId: event.userId } : {}),
        permissions: permissionChanges,
        dashboard: dashboardChanges,
        tier: event.newTier,
        timestamp: new Date(),
      };

      // Step 5: Emit real-time updates
      await this.emitRealTimeUpdates(systemUpdate);

      // Step 6: Preload new state
      await this.preloadNewState(event);

      // Step 7: Update processing timestamp
      await this.cacheService.set(
        `tier-change:last-processed:${tenantId}`,
        new Date(),
        { ttl: 86400 } // 24 hours
      );

      this.logger.log(`Successfully propagated tier change for tenant ${tenantId}`, {
        tenantId,
        newTier: event.newTier,
        changedFeatures: permissionChanges.changedFeatures.length,
        newModules: dashboardChanges.newModules.length,
      });

    } catch (error) {
      this.logger.error(
        `Failed to propagate tier change for tenant ${tenantId}`,
        (error as Error).stack,
        { event }
      );

      // Store error for monitoring
      const errors = await this.cacheService.get<string[]>(`tier-change:errors:${tenantId}`) || [];
      errors.push(`${new Date().toISOString()}: ${(error as Error).message}`);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      await this.cacheService.set(
        `tier-change:errors:${tenantId}`,
        errors,
        { ttl: 86400 } // 24 hours
      );

      throw error;
    } finally {
      this.processingQueue.delete(tenantId);
    }
  }

  /**
   * Invalidate all relevant caches
   */
  private async invalidateAllCaches(tenantId: string): Promise<void> {
    await Promise.all([
      this.realTimePermissionService.invalidatePermissions(tenantId),
      this.dashboardControllerService.invalidateDashboardCache(tenantId),
      this.cacheService.invalidatePattern(`feature:${tenantId}:*`),
      this.cacheService.invalidatePattern(`tenant:${tenantId}:*`),
    ]);

    this.logger.debug(`Invalidated all caches for tenant ${tenantId}`);
  }

  /**
   * Calculate permission changes between old and new tier
   */
  private async calculatePermissionChanges(event: TierChangeEvent): Promise<PermissionChangeNotification> {
    const { tenantId, oldTier, newTier } = event;

    // Get old permissions (from cache or calculate)
    const oldPermissions = await this.realTimePermissionService.getPermissions(tenantId);
    
    // Invalidate cache to force recalculation with new tier
    await this.realTimePermissionService.invalidatePermissions(tenantId);
    
    // Get new permissions
    const newPermissions = await this.realTimePermissionService.getPermissions(tenantId);

    // Calculate changes
    const changedFeatures = [];
    const allFeatures = new Set([
      ...Object.keys(oldPermissions.permissions),
      ...Object.keys(newPermissions.permissions),
    ]);

    for (const featureName of allFeatures) {
      const oldAccess = oldPermissions.permissions[featureName] || false;
      const newAccess = newPermissions.permissions[featureName] || false;

      if (oldAccess !== newAccess) {
        changedFeatures.push({
          featureName,
          oldAccess,
          newAccess,
          reason: newAccess ? `Unlocked by ${newTier} tier` : `Locked due to ${newTier} tier`,
        });
      }
    }

    return {
      tenantId,
      ...(event.userId ? { userId: event.userId } : {}),
      changedFeatures,
      newTier,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate dashboard changes between old and new tier
   */
  private async calculateDashboardChanges(event: TierChangeEvent): Promise<DashboardUpdateNotification> {
    const { tenantId } = event;

    // Get old dashboard configuration (from cache if available)
    const oldConfig = await this.dashboardControllerService.getDashboardConfiguration(tenantId);
    const oldModuleIds = new Set(oldConfig.availableModules.map(m => m.id));
    const oldPromptIds = new Set(oldConfig.upgradePrompts.map(p => p.id));

    // Invalidate cache to force recalculation with new tier
    await this.dashboardControllerService.invalidateDashboardCache(tenantId);

    // Get new dashboard configuration
    const newConfig = await this.dashboardControllerService.getDashboardConfiguration(tenantId);
    const newModuleIds = new Set(newConfig.availableModules.map(m => m.id));
    const newPromptIds = new Set(newConfig.upgradePrompts.map(p => p.id));

    // Calculate changes
    const newModules = [...newModuleIds].filter(id => !oldModuleIds.has(id));
    const removedModules = [...oldModuleIds].filter(id => !newModuleIds.has(id));
    const newUpgradePrompts = [...newPromptIds].filter(id => !oldPromptIds.has(id));
    const removedUpgradePrompts = [...oldPromptIds].filter(id => !newPromptIds.has(id));

    return {
      tenantId,
      ...(event.userId ? { userId: event.userId } : {}),
      newModules,
      removedModules,
      newUpgradePrompts,
      removedUpgradePrompts,
      timestamp: new Date(),
    };
  }

  /**
   * Emit real-time updates via WebSocket subscriptions
   */
  private async emitRealTimeUpdates(systemUpdate: SystemStateUpdate): Promise<void> {
    // Emit different types of updates for different subscription channels
    
    // Permission updates
    this.eventEmitter.emit('permissions.realtime.update', {
      tenantId: systemUpdate.tenantId,
      userId: systemUpdate.userId,
      permissions: systemUpdate.permissions,
      timestamp: systemUpdate.timestamp,
    });

    // Dashboard updates
    this.eventEmitter.emit('dashboard.realtime.update', {
      tenantId: systemUpdate.tenantId,
      userId: systemUpdate.userId,
      dashboard: systemUpdate.dashboard,
      timestamp: systemUpdate.timestamp,
    });

    // Tier updates
    this.eventEmitter.emit('tier.realtime.update', {
      tenantId: systemUpdate.tenantId,
      userId: systemUpdate.userId,
      newTier: systemUpdate.tier,
      timestamp: systemUpdate.timestamp,
    });

    // Complete system update
    this.eventEmitter.emit('system.realtime.update', systemUpdate);

    this.logger.debug(`Emitted real-time updates for tenant ${systemUpdate.tenantId}`, {
      tenantId: systemUpdate.tenantId,
      changedFeatures: systemUpdate.permissions.changedFeatures.length,
      newModules: systemUpdate.dashboard.newModules.length,
    });
  }

  /**
   * Preload new state for performance
   */
  private async preloadNewState(event: TierChangeEvent): Promise<void> {
    const { tenantId, userId } = event;

    try {
      await Promise.all([
        this.realTimePermissionService.preloadPermissions(tenantId, userId),
        this.dashboardControllerService.preloadDashboardConfiguration(tenantId, userId),
      ]);

      this.logger.debug(`Preloaded new state for tenant ${tenantId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to preload new state for tenant ${tenantId}: ${errorMessage}`,
        { tenantId, userId }
      );
    }
  }

  /**
   * Get propagation metrics for monitoring
   */
  async getPropagationMetrics(): Promise<{
    activeProcessing: number;
    queuedEvents: number;
    totalProcessedToday: number;
    averageProcessingTime: number;
    errorRate: number;
  }> {
    const activeProcessing = this.processingQueue.size;
    const queuedEvents = Array.from(this.propagationQueue.values())
      .reduce((total, events) => total + events.length, 0);

    // Get metrics from cache (simplified - in production, use proper metrics store)
    const totalProcessedToday = await this.cacheService.get<number>('tier-change:metrics:processed-today') || 0;
    const averageProcessingTime = await this.cacheService.get<number>('tier-change:metrics:avg-processing-time') || 0;
    const errorRate = await this.cacheService.get<number>('tier-change:metrics:error-rate') || 0;

    return {
      activeProcessing,
      queuedEvents,
      totalProcessedToday,
      averageProcessingTime,
      errorRate,
    };
  }
}