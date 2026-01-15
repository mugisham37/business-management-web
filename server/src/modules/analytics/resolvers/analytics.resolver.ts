import { Resolver, Query, Subscription, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { AnalyticsAPIService } from '../services/analytics-api.service';
import { MetricsCalculationService } from '../services/metrics-calculation.service';
import { Metric, KPI, Trend } from '../types/analytics.types';
import { MetricsFilterInput, KPIFilterInput, TrendFilterInput } from '../inputs/analytics.input';

/**
 * GraphQL resolver for core analytics operations
 * Provides queries for metrics, KPIs, and trends with real-time updates
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AnalyticsResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly analyticsAPIService: AnalyticsAPIService,
    private readonly metricsCalculationService: MetricsCalculationService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    super(dataLoaderService);
  }

  /**
   * Get metrics with optional filtering
   */
  @Query(() => [Metric], { name: 'getMetrics' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getMetrics(
    @Args('filter', { type: () => MetricsFilterInput, nullable: true }) filter: MetricsFilterInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Metric[]> {
    try {
      // Build date range
      const startDate = filter?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = filter?.endDate || new Date();

      // Get metrics from calculation service
      const metrics = await this.metricsCalculationService.calculateMetrics(
        tenantId,
        {
          categories: filter?.categories,
          metricNames: filter?.metricNames,
          dimensions: filter?.dimensions,
          startDate,
          endDate,
        }
      );

      return metrics.map(metric => ({
        id: metric.id || `${metric.name}_${metric.timestamp.getTime()}`,
        name: metric.name,
        description: metric.description,
        value: metric.value,
        unit: metric.unit || 'count',
        category: metric.category || 'OPERATIONAL',
        timestamp: metric.timestamp,
        dimensions: metric.dimensions?.map(d => ({
          name: d.name,
          value: d.value,
        })),
      }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch metrics');
      throw error;
    }
  }

  /**
   * Get KPIs (Key Performance Indicators)
   */
  @Query(() => [KPI], { name: 'getKPIs' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getKPIs(
    @Args('filter', { type: () => KPIFilterInput, nullable: true }) filter: KPIFilterInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<KPI[]> {
    try {
      // Get KPIs from calculation service
      const kpis = await this.metricsCalculationService.calculateKPIs(
        tenantId,
        {
          kpiNames: filter?.kpiNames,
          status: filter?.status,
          period: filter?.period || 'MONTH',
        }
      );

      return kpis.map(kpi => ({
        id: kpi.id || `kpi_${kpi.name}`,
        name: kpi.name,
        description: kpi.description,
        currentValue: kpi.currentValue,
        targetValue: kpi.targetValue,
        previousValue: kpi.previousValue,
        changePercentage: kpi.previousValue 
          ? ((kpi.currentValue - kpi.previousValue) / kpi.previousValue) * 100
          : undefined,
        status: kpi.status || 'NORMAL',
        period: kpi.period || 'MONTH',
        updatedAt: kpi.updatedAt || new Date(),
      }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch KPIs');
      throw error;
    }
  }

  /**
   * Get trends for metrics over time
   */
  @Query(() => [Trend], { name: 'getTrends' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getTrends(
    @Args('filter', { type: () => TrendFilterInput, nullable: true }) filter: TrendFilterInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Trend[]> {
    try {
      // Build date range
      const startDate = filter?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const endDate = filter?.endDate || new Date();

      // Get trends from calculation service
      const trends = await this.metricsCalculationService.calculateTrends(
        tenantId,
        {
          metricNames: filter?.metricNames,
          startDate,
          endDate,
          granularity: filter?.granularity || 'DAY',
          limit: filter?.limit,
        }
      );

      return trends.map(trend => ({
        id: trend.id || `trend_${trend.metricName}`,
        metricName: trend.metricName,
        dataPoints: trend.dataPoints.map(dp => ({
          timestamp: dp.timestamp,
          value: dp.value,
          label: dp.label,
        })),
        direction: trend.direction || 'STABLE',
        slope: trend.slope || 0,
        startDate: trend.startDate || startDate,
        endDate: trend.endDate || endDate,
      }));
    } catch (error) {
      this.handleError(error, 'Failed to fetch trends');
      throw error;
    }
  }

  /**
   * Real-time subscription for metrics updates
   */
  @Subscription(() => Metric, {
    name: 'metricsUpdated',
    filter: (payload, variables, context) => {
      // Filter by tenant
      return payload.metricsUpdated.tenantId === context.req.user.tenantId;
    },
  })
  metricsUpdated(@CurrentTenant() tenantId: string) {
    return this.pubSub.asyncIterator('METRICS_UPDATED');
  }
}
