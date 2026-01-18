import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { HealthDashboard } from '../types/health.types';
import { HealthDashboardConfigInput } from '../inputs/health.input';
import { HealthService } from '../services/health.service';
import { HealthMonitoringService } from '../services/health-monitoring.service';
import { HealthAlertService } from '../services/health-alert.service';
import { HealthAccessGuard } from '../guards/health-access.guard';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver(() => HealthDashboard)
@UseGuards(HealthAccessGuard)
@UseInterceptors(HealthLoggingInterceptor)
export class HealthDashboardResolver {
  private readonly logger = new Logger(HealthDashboardResolver.name);

  constructor(
    private readonly healthService: HealthService,
    private readonly monitoringService: HealthMonitoringService,
    private readonly alertService: HealthAlertService,
  ) {}

  @Query(() => HealthDashboard, { 
    description: 'Get complete health dashboard data' 
  })
  @RequirePermission('health:read')
  async healthDashboard(
    @Args('config', { type: () => HealthDashboardConfigInput, nullable: true }) 
    config?: HealthDashboardConfigInput
  ): Promise<HealthDashboard> {
    this.logger.log('Health dashboard requested', { config });

    // Get system health
    const systemHealth = await this.healthService.getSystemHealth();
    
    // Get trends if enabled
    const trends = config?.showTrends !== false 
      ? await this.monitoringService.getHealthTrends()
      : [];
    
    // Get active alerts if enabled
    const activeAlerts = config?.showAlerts !== false 
      ? await this.alertService.getAlerts({ isActive: true })
      : [];
    
    // Get total alerts count
    const totalAlerts = await this.alertService.getAlerts();
    
    // Calculate system availability
    const systemAvailability = systemHealth.totalChecks > 0 
      ? (systemHealth.healthyChecks / systemHealth.totalChecks) * 100
      : 100;

    return {
      systemHealth,
      trends,
      activeAlerts,
      totalAlerts: totalAlerts.length,
      systemAvailability,
    };
  }

  @Query(() => Number, { 
    description: 'Get system availability percentage' 
  })
  @RequirePermission('health:read')
  async systemAvailabilityPercentage(): Promise<number> {
    const systemHealth = await this.healthService.getSystemHealth();
    return systemHealth.totalChecks > 0 
      ? (systemHealth.healthyChecks / systemHealth.totalChecks) * 100
      : 100;
  }

  @Query(() => Number, { 
    description: 'Get total active alerts count' 
  })
  @RequirePermission('health:read')
  async activeAlertsCount(): Promise<number> {
    const activeAlerts = await this.alertService.getAlerts({ isActive: true });
    return activeAlerts.length;
  }

  @Query(() => Number, { 
    description: 'Get total health checks count' 
  })
  @RequirePermission('health:read')
  async totalHealthChecksCount(): Promise<number> {
    const systemHealth = await this.healthService.getSystemHealth();
    return systemHealth.totalChecks;
  }

  @Query(() => Number, { 
    description: 'Get healthy checks count' 
  })
  @RequirePermission('health:read')
  async healthyChecksCount(): Promise<number> {
    const systemHealth = await this.healthService.getSystemHealth();
    return systemHealth.healthyChecks;
  }

  @Query(() => Number, { 
    description: 'Get unhealthy checks count' 
  })
  @RequirePermission('health:read')
  async unhealthyChecksCount(): Promise<number> {
    const systemHealth = await this.healthService.getSystemHealth();
    return systemHealth.unhealthyChecks;
  }

  @Query(() => Number, { 
    description: 'Get degraded checks count' 
  })
  @RequirePermission('health:read')
  async degradedChecksCount(): Promise<number> {
    const systemHealth = await this.healthService.getSystemHealth();
    return systemHealth.degradedChecks;
  }
}