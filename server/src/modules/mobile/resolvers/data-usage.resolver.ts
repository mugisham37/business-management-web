import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { DataUsageOptimizationService } from '../services/data-usage-optimization.service';
import { OptimizeDataUsageInput, SetDataLimitInput } from '../inputs/mobile.input';
import {
  OptimizeDataUsageResponse,
  DataUsageStats,
  DataUsageLimit,
  IntelligentSyncStrategy,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class DataUsageResolver {
  private readonly logger = new Logger(DataUsageResolver.name);

  constructor(private readonly dataUsageService: DataUsageOptimizationService) {}

  @Mutation(() => OptimizeDataUsageResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:data:optimize')
  async optimizeDataUsage(
    @Args('input') input: OptimizeDataUsageInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<OptimizeDataUsageResponse> {
    try {
      const currentSettings = JSON.parse(input.currentSettings);
      const dataLimit = await this.dataUsageService['getDataUsageLimit'](user.id, tenantId);
      
      const result = await this.dataUsageService.optimizeDataUsage(
        input.connectionType,
        dataLimit,
        currentSettings,
        user.id,
        tenantId,
      );

      return {
        success: true,
        message: 'Data usage optimization completed',
        result,
      };
    } catch (error) {
      this.logger.error(`Data usage optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Data usage optimization failed',
      };
    }
  }

  @Query(() => DataUsageStats)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:data:read')
  async getDataUsageStats(
    @Args('period') period: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<DataUsageStats> {
    try {
      return await this.dataUsageService.getDataUsageStats(
        user.id,
        tenantId,
        period as any,
      );
    } catch (error) {
      this.logger.error(`Failed to get data usage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Mutation(() => DataUsageLimit)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:data:manage')
  async setDataUsageLimit(
    @Args('input') input: SetDataLimitInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<DataUsageLimit> {
    try {
      return await this.dataUsageService.setDataUsageLimit(
        user.id,
        tenantId,
        input.dailyLimit,
        input.monthlyLimit,
        input.warningThreshold,
      );
    } catch (error) {
      this.logger.error(`Failed to set data usage limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Query(() => IntelligentSyncStrategy)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:data:read')
  async getIntelligentSyncStrategy(
    @Args('connectionType') connectionType: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<IntelligentSyncStrategy> {
    try {
      return await this.dataUsageService.getIntelligentSyncStrategy(
        user.id,
        tenantId,
        connectionType as any,
      );
    } catch (error) {
      this.logger.error(`Failed to get intelligent sync strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
