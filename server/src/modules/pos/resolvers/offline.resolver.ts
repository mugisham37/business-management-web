import { Resolver, Query, Mutation, Args, Subscription, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { OfflineSyncService } from '../services/offline-sync.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import { 
  OfflineQueueItem, 
  OfflineStatus, 
  SyncResult, 
  SyncConflict 
} from '../types/offline.types';
import { 
  SyncOfflineTransactionsInput, 
  ResolveConflictInput 
} from '../inputs/offline.input';

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
export class OfflineResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly offlineSyncService: OfflineSyncService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  @Query(() => [OfflineQueueItem], { description: 'Get offline queue items pending sync' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:read')
  async offlineQueue(
    @Args('deviceId', { type: () => ID, nullable: true }) deviceId: string | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<OfflineQueueItem[]> {
    // Mock implementation - in real app, this would query the offline queue repository
    return [];
  }

  @Query(() => OfflineStatus, { description: 'Get offline sync status for a device' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:read')
  async offlineStatus(
    @Args('deviceId', { type: () => ID }) deviceId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<OfflineStatus> {
    const stats = await this.offlineSyncService.getOfflineStats(tenantId);
    
    return {
      deviceId,
      isOnline: true,
      pendingOperations: 0,
      failedOperations: 0,
      lastSync: new Date(),
    };
  }

  @Query(() => [SyncConflict], { description: 'Get unresolved sync conflicts' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:read')
  async syncConflicts(
    @Args('deviceId', { type: () => ID, nullable: true }) deviceId: string | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncConflict[]> {
    // Mock implementation - in real app, this would query conflicts from the database
    return [];
  }

  @Mutation(() => SyncResult, { description: 'Sync offline transactions to server' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:sync')
  async syncOfflineTransactions(
    @Args('input') input: SyncOfflineTransactionsInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncResult> {
    const result = await this.offlineSyncService.syncPendingOperations(
      tenantId,
      input.deviceId,
      user.id
    );

    // Emit sync completed event
    await this.pubSub.publish('OFFLINE_STATUS_CHANGED', {
      offlineStatusChanged: {
        tenantId,
        deviceId: input.deviceId,
        status: result.success ? 'synced' : 'failed',
        timestamp: new Date(),
      },
    });

    return result;
  }

  @Mutation(() => MutationResponse, { description: 'Resolve a sync conflict' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:sync')
  async resolveConflict(
    @Args('input') input: ResolveConflictInput,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      // Mock implementation - in real app, this would resolve the conflict
      // using the OfflineSyncService.resolveConflicts method
      
      return {
        success: true,
        message: 'Conflict resolved successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to resolve conflict',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  @Mutation(() => MutationResponse, { description: 'Clear offline cache for a device' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:admin')
  async clearOfflineCache(
    @Args('deviceId', { type: () => ID, nullable: true }) deviceId: string | undefined,
    @Args('categories', { type: () => [String], nullable: true }) categories: string[] | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      const clearedCount = await this.offlineSyncService.clearOfflineCache(
        tenantId,
        categories
      );

      return {
        success: true,
        message: `Cleared ${clearedCount} cached items`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to clear cache',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  @Mutation(() => MutationResponse, { description: 'Cache essential data for offline use' })
  @UseGuards(PermissionsGuard)
  @Permissions('pos:sync')
  async cacheEssentialData(
    @Args('dataTypes', { type: () => [String] }) dataTypes: string[],
    @Args('locationId', { type: () => ID, nullable: true }) locationId: string | undefined,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      const result = await this.offlineSyncService.cacheEssentialData(
        tenantId,
        dataTypes as any,
        locationId
      );

      return {
        success: true,
        message: `Cached ${result.totalItems} items for offline use`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to cache data',
        errors: [{ message: error.message, timestamp: new Date() }],
      };
    }
  }

  @Subscription(() => OfflineStatus, {
    description: 'Subscribe to offline status changes',
    filter: (payload, variables, context) => {
      return payload.offlineStatusChanged.tenantId === context.req.user.tenantId;
    },
  })
  offlineStatusChanged(
    @Args('deviceId', { type: () => ID, nullable: true }) deviceId: string | undefined,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pubSub.asyncIterator('OFFLINE_STATUS_CHANGED');
  }
}
