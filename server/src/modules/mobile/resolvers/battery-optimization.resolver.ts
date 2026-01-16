import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { BatteryOptimizationService } from '../services/battery-optimization.service';
import { OptimizeBatteryInput } from '../inputs/mobile.input';
import {
  OptimizeBatteryResponse,
  BatteryOptimizationResult,
  BatteryRecommendationsResponse,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class BatteryOptimizationResolver {
  private readonly logger = new Logger(BatteryOptimizationResolver.name);

  constructor(private readonly batteryService: BatteryOptimizationService) {}

  @Mutation(() => OptimizeBatteryResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:battery:optimize')
  async optimizeBattery(
    @Args('input') input: OptimizeBatteryInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<OptimizeBatteryResponse> {
    try {
      const currentSettings = JSON.parse(input.currentSettings);
      
      const result = await this.batteryService.optimizeForBattery(
        {
          level: input.batteryStatus.level,
          charging: input.batteryStatus.charging,
          chargingTime: input.batteryStatus.chargingTime ?? 0,
          dischargingTime: input.batteryStatus.dischargingTime ?? 0,
          lowBattery: input.batteryStatus.level < 20,
          criticalBattery: input.batteryStatus.level < 10,
        },
        currentSettings,
        user.id,
        tenantId,
      );

      return {
        success: true,
        message: 'Battery optimization completed',
        result: {
          originalSettings: JSON.stringify(result.originalSettings),
          optimizedSettings: JSON.stringify(result.optimizedSettings),
          batteryLifeIncrease: result.estimatedSavings.batteryLife,
          dataUsageDecrease: result.estimatedSavings.dataUsage,
          appliedOptimizations: result.appliedOptimizations,
        },
      };
    } catch (error) {
      this.logger.error(`Battery optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Battery optimization failed',
      };
    }
  }

  @Query(() => BatteryRecommendationsResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:battery:read')
  async getBatteryRecommendations(
    @Args('input') input: OptimizeBatteryInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<BatteryRecommendationsResponse> {
    try {
      const result = await this.batteryService.getBatteryOptimizationRecommendations(
        user.id,
        tenantId,
        {
          level: input.batteryStatus.level,
          charging: input.batteryStatus.charging,
          chargingTime: input.batteryStatus.chargingTime ?? 0,
          dischargingTime: input.batteryStatus.dischargingTime ?? 0,
          lowBattery: input.batteryStatus.level < 20,
          criticalBattery: input.batteryStatus.level < 10,
        },
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to get battery recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        recommendations: [],
        currentOptimizationLevel: 0,
      };
    }
  }
}
