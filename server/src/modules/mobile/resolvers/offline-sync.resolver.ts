import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { OfflineDataSyncService } from '../services/offline-data-sync.service';
import { QueueOfflineDataInput } from '../inputs/mobile.input';
import { SyncStatusInfo } from '../types/mobile.types';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class OfflineSyncResolver {
  private readonly logger = new Logger(OfflineSyncResolver.name);

  constructor(
    private readonly offlineSyncService: OfflineDataSyncService,
    private readonly pubSubService: PubSubService,
  ) {}

  @Mutation(() => MutationResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:offline:write')
  async queueOfflineData(
    @Args('input') input: QueueOfflineDataInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.offlineSyncService.queueForSync(
        tenantId,
        user.id,
        input.entityType,
        input.entityId,
        input.operation as any,
        JSON.parse(input.data),
        input.priority as any,
      );

      return {
        success: true,
        message: 'Data queued for offline sync',
      };
    } catch (error) {
      this.logger.error(`Failed to queue offline data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to queue offline data',
      };
    }
  }

  @Query(() => SyncStatusInfo)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:offline:read')
  async getOfflineSyncStatus(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncStatusInfo> {
    try {
      const status = await this.offlineSyncService.getSyncStatus(tenantId, user.id);
      
      const response: any = {
        queuedItems: status.queuedItems,
        syncInProgress: status.syncInProgress,
        estimatedSyncTime: status.estimatedSyncTime,
        status: 'idle', // Default status
      };
      
      if (status.lastSyncTime) {
        response.lastSyncTime = status.lastSyncTime;
      }
      
      return response;
    } catch (error) {
      this.logger.error(`Failed to get offline sync status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Mutation(() => MutationResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:offline:manage')
  async clearOfflineQueue(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<MutationResponse> {
    try {
      await this.offlineSyncService.clearOfflineQueue(tenantId, user.id);

      return {
        success: true,
        message: 'Offline queue cleared',
      };
    } catch (error) {
      this.logger.error(`Failed to clear offline queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to clear offline queue',
      };
    }
  }

  @Subscription(() => SyncStatusInfo, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.tenantId && payload.userId === context.req.user.id;
    },
  })
  offlineSyncStatusChanged(@CurrentTenant() tenantId: string) {
    return this.pubSubService.asyncIterator('offlineSyncStatusChanged', tenantId);
  }
}
