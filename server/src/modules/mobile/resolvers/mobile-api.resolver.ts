import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { MobileOptimizationService } from '../services/mobile-optimization.service';
import { OfflineDataSyncService } from '../services/offline-data-sync.service';
import { ProgressiveLoadingService } from '../services/progressive-loading.service';
import {
  MobileConfig,
  MobileDashboard,
  GetMobileConfigInput,
  GetMobileDashboardInput,
  SyncMobileDataInput,
  SyncMobileDataResponse,
  ReportMobileErrorInput,
  ErrorReportResponse,
  DeviceType,
  ConnectionType,
  SyncStatus,
} from '../types/mobile.types';

/**
 * Mobile API GraphQL Resolver
 * 
 * Provides mobile-optimized GraphQL operations for mobile clients.
 * Implements minimal payload patterns, offline-first support, and
 * progressive loading strategies optimized for low-bandwidth scenarios.
 * 
 * @requirements 25.1-25.6
 */
@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class MobileApiResolver extends BaseResolver {
  private readonly logger = new Logger(MobileApiResolver.name);

  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly mobileOptimizationService: MobileOptimizationService,
    private readonly offlineSyncService: OfflineDataSyncService,
    private readonly progressiveLoadingService: ProgressiveLoadingService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Get mobile application configuration
   * 
   * Returns optimized configuration for mobile clients including
   * feature flags, sync settings, and optimization parameters.
   * 
   * @requirements 25.1, 25.2, 25.6
   */
  @Query(() => MobileConfig, {
    description: 'Get mobile application configuration optimized for device type',
  })
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:read')
  async getMobileConfig(
    @Args('input') input: GetMobileConfigInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<MobileConfig> {
    this.logger.debug(
      `Getting mobile config for app ${input.appId}, device: ${input.deviceType || 'unknown'}`,
    );

    try {
      // Get tenant-specific mobile configuration
      const config: MobileConfig = {
        appId: input.appId,
        version: input.version || '1.0.0',
        compressionEnabled: true,
        progressiveLoadingEnabled: true,
        offlineModeEnabled: true,
        maxCacheSize: this.getMaxCacheSizeForDevice(input.deviceType),
        syncInterval: this.getSyncIntervalForDevice(input.deviceType),
        enabledFeatures: await this.getEnabledFeatures(tenantId),
        apiEndpoint: process.env.API_ENDPOINT || 'https://api.example.com',
      };

      // Optimize config based on device type
      if (input.deviceType === DeviceType.PHONE) {
        config.maxCacheSize = Math.min(config.maxCacheSize, 50); // 50MB max for phones
        config.syncInterval = Math.max(config.syncInterval, 300); // Sync every 5 minutes minimum
      }

      this.logger.debug(`Mobile config retrieved successfully for ${input.appId}`);
      return config;
    } catch (error) {
      this.logger.error(`Failed to get mobile config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw this.handleError(error, 'Failed to retrieve mobile configuration');
    }
  }

  /**
   * Get mobile dashboard data
   * 
   * Returns optimized dashboard data for mobile clients with
   * minimal payload and progressive loading support.
   * 
   * @requirements 25.1, 25.2, 25.4, 25.6
   */
  @Query(() => MobileDashboard, {
    description: 'Get mobile dashboard with optimized payload for device and connection type',
  })
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:read')
  async getMobileDashboard(
    @Args('input') input: GetMobileDashboardInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<MobileDashboard> {
    this.logger.debug(
      `Getting mobile dashboard for user ${input.userId}, ` +
      `device: ${input.deviceType || 'unknown'}, ` +
      `connection: ${input.connectionType || 'unknown'}`,
    );

    try {
      // Get sync status
      const syncStatus = await this.offlineSyncService.getSyncStatus(tenantId, input.userId);

      // Build dashboard data
      const dashboard: MobileDashboard = {
        userId: input.userId,
        unreadNotifications: await this.getUnreadNotificationsCount(tenantId, input.userId),
        pendingTasks: await this.getPendingTasksCount(tenantId, input.userId),
        queuedSyncItems: syncStatus.queuedItems,
        widgets: await this.getDashboardWidgets(
          tenantId,
          input.userId,
          input.deviceType,
          input.minimalPayload,
        ),
        lastSync: syncStatus.lastSyncTime || new Date(),
        syncStatus: this.mapSyncStatus(syncStatus.syncInProgress),
      };

      // Optimize payload for mobile if requested
      if (input.minimalPayload) {
        dashboard.widgets = dashboard.widgets.slice(0, 3); // Only top 3 widgets for minimal payload
      }

      // Further optimize for cellular connections
      if (input.connectionType === ConnectionType.CELLULAR) {
        dashboard.widgets = dashboard.widgets.map(widget => ({
          ...widget,
          data: JSON.stringify({ summary: 'Data optimized for cellular' }), // Minimal data
        }));
      }

      this.logger.debug(`Mobile dashboard retrieved successfully for user ${input.userId}`);
      return dashboard;
    } catch (error) {
      this.logger.error(`Failed to get mobile dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw this.handleError(error, 'Failed to retrieve mobile dashboard');
    }
  }

  /**
   * Synchronize mobile offline data
   * 
   * Syncs offline data with conflict resolution support.
   * Implements offline-first patterns with intelligent sync strategies.
   * 
   * @requirements 25.1, 25.3, 25.6
   */
  @Mutation(() => SyncMobileDataResponse, {
    description: 'Synchronize offline mobile data with conflict resolution',
  })
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:write')
  async syncMobileData(
    @Args('input') input: SyncMobileDataInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncMobileDataResponse> {
    this.logger.log(
      `Starting mobile data sync for user ${input.userId}, ` +
      `conflict resolution: ${input.conflictResolution || 'merge'}`,
    );

    try {
      // Perform offline data synchronization
      const syncResult = await this.offlineSyncService.synchronizeOfflineData(
        tenantId,
        input.userId,
        {
          batchSize: input.batchSize || 10,
          maxRetries: input.maxRetries || 3,
          conflictResolution: input.conflictResolution || 'merge',
          prioritizeByType: input.prioritizeByType !== false,
          intelligentScheduling: true,
        },
      );

      this.logger.log(
        `Mobile data sync completed for user ${input.userId}: ` +
        `${syncResult.syncedItems} synced, ${syncResult.failedItems} failed, ` +
        `${syncResult.conflicts} conflicts`,
      );

      return {
        success: syncResult.success,
        message: syncResult.success
          ? 'Data synchronized successfully'
          : 'Data synchronization completed with errors',
        syncResult: {
          ...syncResult,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to sync mobile data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        message: 'Data synchronization failed',
        syncResult: {
          success: false,
          syncedItems: 0,
          failedItems: 0,
          conflicts: 0,
          totalTime: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Report mobile application error
   * 
   * Allows mobile clients to report errors for monitoring and debugging.
   * Captures device context and error details for analysis.
   * 
   * @requirements 25.1, 25.6
   */
  @Mutation(() => ErrorReportResponse, {
    description: 'Report mobile application error with device context',
  })
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:write')
  async reportMobileError(
    @Args('input') input: ReportMobileErrorInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ErrorReportResponse> {
    this.logger.warn(
      `Mobile error reported: ${input.message} ` +
      `(device: ${input.deviceType}, app: ${input.appVersion || 'unknown'})`,
    );

    try {
      // Generate unique error report ID
      const reportId = `mobile_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Log error details for monitoring
      this.logger.error(
        `Mobile Error Report [${reportId}]:\n` +
        `Message: ${input.message}\n` +
        `Code: ${input.code || 'N/A'}\n` +
        `Device: ${input.deviceType}\n` +
        `App Version: ${input.appVersion || 'N/A'}\n` +
        `OS Version: ${input.osVersion || 'N/A'}\n` +
        `Stack: ${input.stack || 'N/A'}\n` +
        `Context: ${input.context || 'N/A'}\n` +
        `User: ${user.id}\n` +
        `Tenant: ${tenantId}`,
      );

      // In production, this would store the error in a monitoring system
      // For now, we just acknowledge receipt

      return {
        success: true,
        reportId,
        message: 'Error report received and logged successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to report mobile error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        reportId: 'error',
        message: 'Failed to process error report',
        timestamp: new Date(),
      };
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Get maximum cache size based on device type
   */
  private getMaxCacheSizeForDevice(deviceType?: DeviceType): number {
    switch (deviceType) {
      case DeviceType.PHONE:
        return 50; // 50MB for phones
      case DeviceType.TABLET:
        return 100; // 100MB for tablets
      case DeviceType.DESKTOP:
        return 200; // 200MB for desktop
      default:
        return 75; // Default 75MB
    }
  }

  /**
   * Get sync interval based on device type
   */
  private getSyncIntervalForDevice(deviceType?: DeviceType): number {
    switch (deviceType) {
      case DeviceType.PHONE:
        return 300; // 5 minutes for phones (battery conservation)
      case DeviceType.TABLET:
        return 180; // 3 minutes for tablets
      case DeviceType.DESKTOP:
        return 60; // 1 minute for desktop
      default:
        return 240; // Default 4 minutes
    }
  }

  /**
   * Get enabled features for tenant
   */
  private async getEnabledFeatures(tenantId: string): Promise<string[]> {
    // In production, this would query tenant feature flags
    // For now, return default mobile features
    return [
      'offline-mode',
      'push-notifications',
      'biometric-auth',
      'progressive-loading',
      'data-compression',
      'intelligent-sync',
    ];
  }

  /**
   * Get unread notifications count
   */
  private async getUnreadNotificationsCount(tenantId: string, userId: string): Promise<number> {
    // Mock implementation - in production, query notification service
    return Math.floor(Math.random() * 10);
  }

  /**
   * Get pending tasks count
   */
  private async getPendingTasksCount(tenantId: string, userId: string): Promise<number> {
    // Mock implementation - in production, query task service
    return Math.floor(Math.random() * 5);
  }

  /**
   * Get dashboard widgets optimized for mobile
   */
  private async getDashboardWidgets(
    tenantId: string,
    userId: string,
    deviceType?: DeviceType,
    minimalPayload?: boolean,
  ): Promise<Array<{ id: string; type: string; title: string; data: string; priority: number }>> {
    // Mock implementation - in production, query widget service
    const widgets = [
      {
        id: 'widget_1',
        type: 'sales_summary',
        title: 'Sales Summary',
        data: JSON.stringify({ total: 12500, trend: 'up' }),
        priority: 1,
      },
      {
        id: 'widget_2',
        type: 'inventory_alerts',
        title: 'Inventory Alerts',
        data: JSON.stringify({ lowStock: 5, outOfStock: 2 }),
        priority: 2,
      },
      {
        id: 'widget_3',
        type: 'recent_orders',
        title: 'Recent Orders',
        data: JSON.stringify({ count: 15, pending: 3 }),
        priority: 3,
      },
      {
        id: 'widget_4',
        type: 'customer_activity',
        title: 'Customer Activity',
        data: JSON.stringify({ active: 45, new: 8 }),
        priority: 4,
      },
    ];

    // Limit widgets for minimal payload or phone devices
    if (minimalPayload || deviceType === DeviceType.PHONE) {
      return widgets.slice(0, 3);
    }

    return widgets;
  }

  /**
   * Map sync status to string
   */
  private mapSyncStatus(syncInProgress: boolean): string {
    return syncInProgress ? SyncStatus.SYNCING : SyncStatus.IDLE;
  }
}
