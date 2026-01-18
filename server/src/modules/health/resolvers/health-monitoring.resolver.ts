import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { HealthTrend } from '../types/health.types';
import { HealthMonitoringService } from '../services/health-monitoring.service';
import { HealthAccessGuard } from '../guards/health-access.guard';
import { HealthAdminGuard } from '../guards/health-admin.guard';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver(() => HealthTrend)
@UseGuards(HealthAccessGuard)
@UseInterceptors(HealthLoggingInterceptor)
export class HealthMonitoringResolver {
  private readonly logger = new Logger(HealthMonitoringResolver.name);
  private readonly pubSub = new PubSub();

  constructor(private readonly monitoringService: HealthMonitoringService) {}

  @Query(() => [HealthTrend], { 
    description: 'Get health trends for all or specific health checks' 
  })
  @RequirePermission('health:read')
  async healthTrends(
    @Args('checkIds', { type: () => [String], nullable: true }) 
    checkIds?: string[]
  ): Promise<HealthTrend[]> {
    this.logger.log('Health trends requested', { checkIds });
    return this.monitoringService.getHealthTrends(checkIds);
  }

  @Query(() => HealthTrend, { 
    description: 'Get health trend for a specific health check',
    nullable: true 
  })
  @RequirePermission('health:read')
  async healthTrend(
    @Args('checkId') checkId: string
  ): Promise<HealthTrend | null> {
    this.logger.log('Health trend requested', { checkId });
    return this.monitoringService.getHealthTrend(checkId);
  }

  @Query(() => String, { 
    description: 'Get monitoring configuration as JSON' 
  })
  @RequirePermission('health:admin')
  async monitoringConfig(): Promise<string> {
    const config = this.monitoringService.getMonitoringConfig();
    return JSON.stringify(config, null, 2);
  }

  @Mutation(() => String, { 
    description: 'Update monitoring configuration' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async updateMonitoringConfig(
    @Args('configJson') configJson: string,
    @CurrentUser() user: any
  ): Promise<string> {
    this.logger.log('Monitoring config update requested', { userId: user?.id });
    
    try {
      const config = JSON.parse(configJson);
      const updatedConfig = await this.monitoringService.updateMonitoringConfig(config);
      
      // Publish to subscription
      this.pubSub.publish('monitoringConfigUpdated', { 
        monitoringConfigUpdated: updatedConfig,
        userId: user?.id 
      });
      
      return JSON.stringify(updatedConfig, null, 2);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to update monitoring config:', error);
      throw new Error(`Invalid configuration JSON: ${errorMessage}`);
    }
  }

  @Query(() => Boolean, { 
    description: 'Check if trend analysis is enabled' 
  })
  @RequirePermission('health:read')
  async isTrendAnalysisEnabled(): Promise<boolean> {
    const config = this.monitoringService.getMonitoringConfig();
    return config.trendAnalysisEnabled;
  }

  @Query(() => Boolean, { 
    description: 'Check if anomaly detection is enabled' 
  })
  @RequirePermission('health:read')
  async isAnomalyDetectionEnabled(): Promise<boolean> {
    const config = this.monitoringService.getMonitoringConfig();
    return config.anomalyDetectionEnabled;
  }

  @Query(() => Boolean, { 
    description: 'Check if predictive analysis is enabled' 
  })
  @RequirePermission('health:read')
  async isPredictiveAnalysisEnabled(): Promise<boolean> {
    const config = this.monitoringService.getMonitoringConfig();
    return config.predictiveAnalysisEnabled;
  }

  @Mutation(() => Boolean, { 
    description: 'Enable or disable trend analysis' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async setTrendAnalysis(
    @Args('enabled') enabled: boolean,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Trend analysis setting update', { enabled, userId: user?.id });
    
    await this.monitoringService.updateMonitoringConfig({
      trendAnalysisEnabled: enabled,
    });
    
    return enabled;
  }

  @Mutation(() => Boolean, { 
    description: 'Enable or disable anomaly detection' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async setAnomalyDetection(
    @Args('enabled') enabled: boolean,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Anomaly detection setting update', { enabled, userId: user?.id });
    
    await this.monitoringService.updateMonitoringConfig({
      anomalyDetectionEnabled: enabled,
    });
    
    return enabled;
  }

  @Mutation(() => Boolean, { 
    description: 'Enable or disable predictive analysis' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async setPredictiveAnalysis(
    @Args('enabled') enabled: boolean,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Predictive analysis setting update', { enabled, userId: user?.id });
    
    await this.monitoringService.updateMonitoringConfig({
      predictiveAnalysisEnabled: enabled,
    });
    
    return enabled;
  }

  @Query(() => Number, { 
    description: 'Get consecutive failures threshold' 
  })
  @RequirePermission('health:read')
  async consecutiveFailuresThreshold(): Promise<number> {
    const config = this.monitoringService.getMonitoringConfig();
    return config.alertThresholds.consecutiveFailures;
  }

  @Query(() => Number, { 
    description: 'Get response time threshold in milliseconds' 
  })
  @RequirePermission('health:read')
  async responseTimeThreshold(): Promise<number> {
    const config = this.monitoringService.getMonitoringConfig();
    return config.alertThresholds.responseTimeThreshold;
  }

  @Query(() => Number, { 
    description: 'Get availability threshold as percentage (0-1)' 
  })
  @RequirePermission('health:read')
  async availabilityThreshold(): Promise<number> {
    const config = this.monitoringService.getMonitoringConfig();
    return config.alertThresholds.availabilityThreshold;
  }

  @Mutation(() => Boolean, { 
    description: 'Update consecutive failures threshold' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async setConsecutiveFailuresThreshold(
    @Args('threshold') threshold: number,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Consecutive failures threshold update', { threshold, userId: user?.id });
    
    if (threshold < 1 || threshold > 10) {
      throw new Error('Consecutive failures threshold must be between 1 and 10');
    }
    
    await this.monitoringService.updateMonitoringConfig({
      alertThresholds: {
        consecutiveFailures: threshold,
        responseTimeThreshold: 5000,
        availabilityThreshold: 0.95,
      },
    });
    
    return true;
  }

  @Mutation(() => Boolean, { 
    description: 'Update response time threshold in milliseconds' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async setResponseTimeThreshold(
    @Args('threshold') threshold: number,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Response time threshold update', { threshold, userId: user?.id });
    
    if (threshold < 100 || threshold > 60000) {
      throw new Error('Response time threshold must be between 100ms and 60000ms');
    }
    
    await this.monitoringService.updateMonitoringConfig({
      alertThresholds: {
        consecutiveFailures: 3,
        responseTimeThreshold: threshold,
        availabilityThreshold: 0.95,
      },
    });
    
    return true;
  }

  @Mutation(() => Boolean, { 
    description: 'Update availability threshold as percentage (0-1)' 
  })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:config')
  async setAvailabilityThreshold(
    @Args('threshold') threshold: number,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Availability threshold update', { threshold, userId: user?.id });
    
    if (threshold < 0 || threshold > 1) {
      throw new Error('Availability threshold must be between 0 and 1');
    }
    
    await this.monitoringService.updateMonitoringConfig({
      alertThresholds: {
        consecutiveFailures: 3,
        responseTimeThreshold: 5000,
        availabilityThreshold: threshold,
      },
    });
    
    return true;
  }

  // Subscriptions for real-time monitoring updates
  @Subscription(() => HealthTrend, {
    description: 'Subscribe to health trend updates',
  })
  @RequirePermission('health:read')
  healthTrendUpdated() {
    return (this.pubSub as any).asyncIterator('healthTrendUpdated');
  }

  @Subscription(() => String, {
    description: 'Subscribe to monitoring configuration updates',
  })
  @RequirePermission('health:admin')
  monitoringConfigUpdated() {
    return (this.pubSub as any).asyncIterator('monitoringConfigUpdated');
  }

  @Subscription(() => String, {
    description: 'Subscribe to anomaly detection alerts',
  })
  @RequirePermission('health:read')
  anomalyDetected() {
    return (this.pubSub as any).asyncIterator('anomalyDetected');
  }

  @Subscription(() => String, {
    description: 'Subscribe to health status change events',
  })
  @RequirePermission('health:read')
  healthStatusChanged() {
    return (this.pubSub as any).asyncIterator('healthStatusChanged');
  }

  // Computed fields and analytics
  @Query(() => Number, { 
    description: 'Get average availability across all health checks' 
  })
  @RequirePermission('health:read')
  async averageSystemAvailability(): Promise<number> {
    const trends = await this.monitoringService.getHealthTrends();
    if (trends.length === 0) return 1;
    
    const totalAvailability = trends.reduce((sum, trend) => sum + trend.availabilityPercentage, 0);
    return totalAvailability / trends.length;
  }

  @Query(() => Number, { 
    description: 'Get average response time across all health checks' 
  })
  @RequirePermission('health:read')
  async averageSystemResponseTime(): Promise<number> {
    const trends = await this.monitoringService.getHealthTrends();
    if (trends.length === 0) return 0;
    
    const totalResponseTime = trends.reduce((sum, trend) => sum + trend.averageResponseTime, 0);
    return totalResponseTime / trends.length;
  }

  @Query(() => [HealthTrend], { 
    description: 'Get health checks with degrading performance' 
  })
  @RequirePermission('health:read')
  async degradingHealthChecks(): Promise<HealthTrend[]> {
    const trends = await this.monitoringService.getHealthTrends();
    
    // Filter for checks with availability < 95% or high failure count
    return trends.filter(trend => 
      trend.availabilityPercentage < 0.95 || 
      trend.failureCount > trend.totalChecks * 0.1
    );
  }

  @Query(() => [HealthTrend], { 
    description: 'Get top performing health checks' 
  })
  @RequirePermission('health:read')
  async topPerformingHealthChecks(): Promise<HealthTrend[]> {
    const trends = await this.monitoringService.getHealthTrends();
    
    // Sort by availability and response time
    return trends
      .filter(trend => trend.availabilityPercentage >= 0.99)
      .sort((a, b) => {
        const aScore = a.availabilityPercentage - (a.averageResponseTime / 10000);
        const bScore = b.availabilityPercentage - (b.averageResponseTime / 10000);
        return bScore - aScore;
      })
      .slice(0, 10);
  }
}