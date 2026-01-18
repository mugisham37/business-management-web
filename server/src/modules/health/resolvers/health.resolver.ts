import { Resolver, Query, Mutation, Args, Subscription, Context } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { 
  SystemHealth, 
  HealthCheck, 
  HealthStatus,
  HealthCheckType 
} from '../types/health.types';
import { 
  HealthCheckInput, 
  HealthFilterInput,
  ExternalServiceConfigInput 
} from '../inputs/health.input';
import { HealthService } from '../services/health.service';
import { HealthAccessGuard } from '../guards/health-access.guard';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { HealthMetricsInterceptor } from '../interceptors/health-metrics.interceptor';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';

@Resolver(() => HealthCheck)
@UseGuards(HealthAccessGuard)
@UseInterceptors(HealthLoggingInterceptor, HealthMetricsInterceptor)
export class HealthResolver {
  private readonly logger = new Logger(HealthResolver.name);
  private readonly pubSub = new PubSub();

  constructor(private readonly healthService: HealthService) {}

  @Query(() => SystemHealth, { 
    description: 'Get overall system health status including all health checks' 
  })
  @RequirePermission('health:read')
  async systemHealth(): Promise<SystemHealth> {
    this.logger.log('System health requested');
    return this.healthService.getSystemHealth();
  }

  @Query(() => [HealthCheck], { 
    description: 'Get all health checks with optional filtering' 
  })
  @RequirePermission('health:read')
  async healthChecks(
    @Args('filter', { type: () => HealthFilterInput, nullable: true }) 
    filter?: HealthFilterInput
  ): Promise<HealthCheck[]> {
    this.logger.log('Health checks requested', { filter });
    return this.healthService.getHealthChecks(filter);
  }

  @Query(() => HealthCheck, { 
    description: 'Get a specific health check by ID',
    nullable: true 
  })
  @RequirePermission('health:read')
  async healthCheck(
    @Args('checkId') checkId: string
  ): Promise<HealthCheck | null> {
    this.logger.log('Health check requested', { checkId });
    return this.healthService.getHealthCheck(checkId);
  }

  @Query(() => [HealthCheck], { 
    description: 'Get health checks by type' 
  })
  @RequirePermission('health:read')
  async healthChecksByType(
    @Args('type', { type: () => HealthCheckType }) type: HealthCheckType
  ): Promise<HealthCheck[]> {
    const filter: HealthFilterInput = { types: [type] };
    return this.healthService.getHealthChecks(filter);
  }

  @Query(() => [HealthCheck], { 
    description: 'Get health checks by status' 
  })
  @RequirePermission('health:read')
  async healthChecksByStatus(
    @Args('status', { type: () => HealthStatus }) status: HealthStatus
  ): Promise<HealthCheck[]> {
    const filter: HealthFilterInput = { statuses: [status] };
    return this.healthService.getHealthChecks(filter);
  }

  @Mutation(() => HealthCheck, { 
    description: 'Register a new health check' 
  })
  @RequirePermission('health:write')
  async registerHealthCheck(
    @Args('input') input: HealthCheckInput,
    @CurrentUser() user: any
  ): Promise<HealthCheck> {
    this.logger.log('Health check registration requested', { input, userId: user?.id });
    
    const healthCheck = await this.healthService.registerHealthCheck(input);
    
    // Publish to subscription
    this.pubSub.publish('healthCheckRegistered', { 
      healthCheckRegistered: healthCheck,
      userId: user?.id 
    });
    
    return healthCheck;
  }

  @Mutation(() => HealthCheck, { 
    description: 'Perform a health check manually' 
  })
  @RequirePermission('health:execute')
  async performHealthCheck(
    @Args('checkId') checkId: string,
    @CurrentUser() user: any
  ): Promise<HealthCheck> {
    this.logger.log('Manual health check requested', { checkId, userId: user?.id });
    
    const healthCheck = await this.healthService.performHealthCheck(checkId);
    
    // Publish to subscription
    this.pubSub.publish('healthCheckCompleted', { 
      healthCheckCompleted: healthCheck,
      userId: user?.id 
    });
    
    return healthCheck;
  }

  @Mutation(() => SystemHealth, { 
    description: 'Refresh all health checks and return system health' 
  })
  @RequirePermission('health:execute')
  async refreshAllHealthChecks(
    @CurrentUser() user: any
  ): Promise<SystemHealth> {
    this.logger.log('Refresh all health checks requested', { userId: user?.id });
    
    const systemHealth = await this.healthService.refreshAllHealthChecks();
    
    // Publish to subscription
    this.pubSub.publish('systemHealthUpdated', { 
      systemHealthUpdated: systemHealth,
      userId: user?.id 
    });
    
    return systemHealth;
  }

  @Mutation(() => Boolean, { 
    description: 'Remove a health check' 
  })
  @RequirePermission('health:delete')
  async removeHealthCheck(
    @Args('checkId') checkId: string,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('Health check removal requested', { checkId, userId: user?.id });
    
    const removed = await this.healthService.removeHealthCheck(checkId);
    
    if (removed) {
      // Publish to subscription
      this.pubSub.publish('healthCheckRemoved', { 
        healthCheckRemoved: { checkId },
        userId: user?.id 
      });
    }
    
    return removed;
  }

  @Mutation(() => Boolean, { 
    description: 'Add external service for health monitoring' 
  })
  @RequirePermission('health:write')
  async addExternalService(
    @Args('config') config: ExternalServiceConfigInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    this.logger.log('External service addition requested', { config, userId: user?.id });
    
    // Register as a health check
    const healthCheckInput: HealthCheckInput = {
      name: config.name,
      type: HealthCheckType.EXTERNAL_SERVICE,
      severity: config.expectedStatusCode && config.expectedStatusCode >= 500 
        ? 'CRITICAL' as any 
        : 'HIGH' as any,
      isRequired: true,
      intervalSeconds: 60,
      timeoutSeconds: config.timeoutSeconds || 10,
      description: `External service: ${config.url}`,
    };
    
    await this.healthService.registerHealthCheck(healthCheckInput);
    
    return true;
  }

  @Query(() => String, { 
    description: 'Get system uptime in seconds' 
  })
  @RequirePermission('health:read')
  async systemUptime(): Promise<number> {
    return this.healthService.getSystemUptime();
  }

  @Query(() => String, { 
    description: 'Get last system health check timestamp' 
  })
  @RequirePermission('health:read')
  async lastSystemCheck(): Promise<Date> {
    return this.healthService.getLastSystemCheck();
  }

  // Subscriptions for real-time health monitoring
  @Subscription(() => HealthCheck, {
    description: 'Subscribe to health check completions',
    filter: (payload, variables, context) => {
      // Optional filtering by user permissions or specific checks
      return true;
    },
  })
  @RequirePermission('health:read')
  healthCheckCompleted() {
    return (this.pubSub as any).asyncIterator('healthCheckCompleted');
  }

  @Subscription(() => SystemHealth, {
    description: 'Subscribe to system health updates',
  })
  @RequirePermission('health:read')
  systemHealthUpdated() {
    return (this.pubSub as any).asyncIterator('systemHealthUpdated');
  }

  @Subscription(() => HealthCheck, {
    description: 'Subscribe to new health check registrations',
  })
  @RequirePermission('health:read')
  healthCheckRegistered() {
    return (this.pubSub as any).asyncIterator('healthCheckRegistered');
  }

  @Subscription(() => String, {
    description: 'Subscribe to health check removals',
  })
  @RequirePermission('health:read')
  healthCheckRemoved() {
    return (this.pubSub as any).asyncIterator('healthCheckRemoved');
  }

  @Subscription(() => HealthCheck, {
    description: 'Subscribe to health status changes',
    filter: (payload, variables) => {
      // Filter by status change if specified
      if (variables.statusFilter) {
        return variables.statusFilter.includes(payload.healthStatusChanged.status);
      }
      return true;
    },
  })
  @RequirePermission('health:read')
  healthStatusChanged(
    @Args('statusFilter', { type: () => [HealthStatus], nullable: true }) 
    statusFilter?: HealthStatus[]
  ) {
    return (this.pubSub as any).asyncIterator('healthStatusChanged');
  }

  // Field resolvers for computed fields
  @Query(() => Boolean, { 
    description: 'Check if system is healthy (all critical checks passing)' 
  })
  @RequirePermission('health:read')
  async isSystemHealthy(): Promise<boolean> {
    const systemHealth = await this.healthService.getSystemHealth();
    return systemHealth.overallStatus === HealthStatus.HEALTHY;
  }

  @Query(() => Number, { 
    description: 'Get system availability percentage' 
  })
  @RequirePermission('health:read')
  async systemAvailability(): Promise<number> {
    const systemHealth = await this.healthService.getSystemHealth();
    if (systemHealth.totalChecks === 0) return 100;
    
    return (systemHealth.healthyChecks / systemHealth.totalChecks) * 100;
  }

  @Query(() => [HealthCheck], { 
    description: 'Get failing health checks' 
  })
  @RequirePermission('health:read')
  async failingHealthChecks(): Promise<HealthCheck[]> {
    const filter: HealthFilterInput = { 
      statuses: [HealthStatus.UNHEALTHY, HealthStatus.DEGRADED] 
    };
    return this.healthService.getHealthChecks(filter);
  }

  @Query(() => [HealthCheck], { 
    description: 'Get critical health checks' 
  })
  @RequirePermission('health:read')
  async criticalHealthChecks(): Promise<HealthCheck[]> {
    const allChecks = await this.healthService.getHealthChecks();
    return allChecks.filter(check => 
      check.severity === 'CRITICAL' && check.isRequired
    );
  }
}