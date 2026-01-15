import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { Forecast, Anomaly } from '../types/analytics.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class PredictiveAnalyticsResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly predictiveAnalyticsService: PredictiveAnalyticsService,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
  ) {
    super(dataLoaderService);
  }

  @Query(() => Forecast, { name: 'getForecast' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getForecast(
    @Args('metricName') metricName: string,
    @Args('periods') periods: number,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Forecast> {
    try {
      const jobId = `forecast_${Date.now()}`;
      await this.analyticsQueue.add('ml-forecast', {
        tenantId,
        metricName,
        periods,
        userId: user.id,
      }, { jobId });

      return {
        id: jobId,
        metricName,
        predictions: [],
        confidence: 0.85,
        model: 'ARIMA',
      };
    } catch (error) {
      this.handleError(error, 'Failed to get forecast');
      throw error;
    }
  }

  @Query(() => [Anomaly], { name: 'getAnomalies' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getAnomalies(
    @Args('metricName') metricName: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<Anomaly[]> {
    try {
      const anomalies = await this.predictiveAnalyticsService.detectAnomalies(tenantId, metricName);
      return anomalies.map(a => ({
        id: a.id || `anomaly_${Date.now()}`,
        metricName: a.metricName,
        timestamp: a.timestamp,
        actualValue: a.actualValue,
        expectedValue: a.expectedValue,
        deviationScore: a.deviationScore,
        severity: a.severity || 'MEDIUM',
      }));
    } catch (error) {
      this.handleError(error, 'Failed to get anomalies');
      throw error;
    }
  }

  @Query(() => String, { name: 'getRecommendations' })
  @UseGuards(PermissionsGuard)
  @Permissions('analytics:read')
  async getRecommendations(
    @Args('context') context: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<string> {
    try {
      const jobId = `recommendations_${Date.now()}`;
      await this.analyticsQueue.add('ml-recommendations', {
        tenantId,
        context,
        userId: user.id,
      }, { jobId });

      return jobId;
    } catch (error) {
      this.handleError(error, 'Failed to get recommendations');
      throw error;
    }
  }
}
