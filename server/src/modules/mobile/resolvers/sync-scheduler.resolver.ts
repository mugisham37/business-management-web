import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { IntelligentSyncSchedulerService } from '../services/intelligent-sync-scheduler.service';
import { ScheduleSyncInput } from '../inputs/mobile.input';
import {
  ScheduleSyncResponse,
  SyncSchedule,
  SyncRecommendation,
  SyncExecutionResult,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class SyncSchedulerResolver {
  private readonly logger = new Logger(SyncSchedulerResolver.name);

  constructor(
    private readonly syncSchedulerService: IntelligentSyncSchedulerService,
    private readonly pubSubService: PubSubService,
  ) {}

  @Mutation(() => ScheduleSyncResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:sync:schedule')
  async scheduleSync(
    @Args('input') input: ScheduleSyncInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<ScheduleSyncResponse> {
    try {
      const schedule = await this.syncSchedulerService.scheduleIntelligentSync(
        user.id,
        tenantId,
        input.deviceId,
        input.dataType,
        input.priority as any,
        [],
        input.estimatedDataUsage,
      );

      return {
        success: true,
        message: 'Sync scheduled successfully',
        schedule,
      };
    } catch (error) {
      this.logger.error(`Sync scheduling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Sync scheduling failed',
      };
    }
  }

  @Query(() => SyncRecommendation)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:sync:read')
  async getSyncRecommendation(
    @Args('deviceId') deviceId: string,
    @Args('dataType') dataType: string,
    @Args('priority') priority: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncRecommendation> {
    try {
      return await this.syncSchedulerService.getSyncRecommendation(
        user.id,
        tenantId,
        deviceId,
        dataType,
        priority as any,
      );
    } catch (error) {
      this.logger.error(`Failed to get sync recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Query(() => [SyncSchedule])
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:sync:read')
  async getActiveSyncSchedules(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncSchedule[]> {
    try {
      return await this.syncSchedulerService.getActiveSyncSchedules(user.id, tenantId);
    } catch (error) {
      this.logger.error(`Failed to get active sync schedules: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:sync:manage')
  async cancelSyncSchedule(
    @Args('scheduleId') scheduleId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.syncSchedulerService.cancelSyncSchedule(scheduleId);
    } catch (error) {
      this.logger.error(`Failed to cancel sync schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  @Mutation(() => SyncExecutionResult)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:sync:execute')
  async executeSyncSchedule(
    @Args('scheduleId') scheduleId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SyncExecutionResult> {
    try {
      const result = await this.syncSchedulerService.executeSyncSchedule(scheduleId);
      
      // Publish sync completion event
      await this.pubSubService.publish('syncCompleted', {
        tenantId,
        userId: user.id,
        result,
      });

      return result;
    } catch (error) {
      this.logger.error(`Sync execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Subscription(() => SyncExecutionResult, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.tenantId && payload.userId === context.req.user.id;
    },
  })
  syncCompleted(@CurrentTenant() tenantId: string) {
    return this.pubSubService.asyncIterator('syncCompleted', tenantId);
  }
}
