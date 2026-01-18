import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { HealthMetric } from '../types/health.types';
import { HealthMetricThresholdInput } from '../inputs/health.input';
import { HealthMetricsService } from '../services/health-metrics.service';
import { HealthAccessGuard } from '../guards/health-access.guard';
import { HealthAdminGuard } from '../guards/health-admin.guard';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver(() => HealthMetric)
@UseGuards(HealthAccessGuard)
@UseInterceptors(HealthLoggingInterceptor)
export class HealthMetricsResolver {
  private readonly logger = new Logger(HealthMetricsResolver.name);

  constructor(private readonly metricsService: HealthMetricsService) {}

  @Query(() => [HealthMetric], { description: 'Get health metrics for all or specific health check' })
  @RequirePermission('health:read')
  async healthMetrics(
    @Args('checkId', { nullable: true }) checkId?: string
  ): Promise<HealthMetric[]> {
    return this.metricsService.getMetrics(checkId);
  }

  @Query(() => [HealthMetric], { description: 'Get metrics by name across all health checks' })
  @RequirePermission('health:read')
  async metricsByName(@Args('metricName') metricName: string): Promise<HealthMetric[]> {
    return this.metricsService.getMetricsByName(metricName);
  }

  @Mutation(() => Boolean, { description: 'Set metric threshold' })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:metrics')
  async setMetricThreshold(
    @Args('input') input: HealthMetricThresholdInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    await this.metricsService.setMetricThreshold(input);
    return true;
  }

  @Mutation(() => Boolean, { description: 'Clear all metrics' })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:metrics')
  async clearMetrics(
    @Args('checkId', { nullable: true }) checkId?: string,
    @CurrentUser() user: any
  ): Promise<boolean> {
    await this.metricsService.clearMetrics(checkId);
    return true;
  }

  @Query(() => String, { description: 'Export metrics as JSON or CSV' })
  @RequirePermission('health:export')
  async exportMetrics(
    @Args('format', { defaultValue: 'json' }) format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    return this.metricsService.exportMetrics(format);
  }
}