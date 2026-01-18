import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { HealthAlert } from '../types/health.types';
import { HealthAlertInput, HealthAlertFilterInput, HealthNotificationConfigInput } from '../inputs/health.input';
import { HealthAlertService } from '../services/health-alert.service';
import { HealthAccessGuard } from '../guards/health-access.guard';
import { HealthAdminGuard } from '../guards/health-admin.guard';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver(() => HealthAlert)
@UseGuards(HealthAccessGuard)
@UseInterceptors(HealthLoggingInterceptor)
export class HealthAlertResolver {
  private readonly logger = new Logger(HealthAlertResolver.name);
  private readonly pubSub = new PubSub();

  constructor(private readonly alertService: HealthAlertService) {}

  @Query(() => [HealthAlert], { description: 'Get health alerts with optional filtering' })
  @RequirePermission('health:read')
  async healthAlerts(
    @Args('filter', { type: () => HealthAlertFilterInput, nullable: true }) 
    filter?: HealthAlertFilterInput
  ): Promise<HealthAlert[]> {
    return this.alertService.getAlerts(filter);
  }

  @Query(() => HealthAlert, { description: 'Get a specific health alert by ID', nullable: true })
  @RequirePermission('health:read')
  async healthAlert(@Args('alertId') alertId: string): Promise<HealthAlert | null> {
    return this.alertService.getAlert(alertId);
  }

  @Query(() => [HealthAlert], { description: 'Get active health alerts' })
  @RequirePermission('health:read')
  async activeHealthAlerts(): Promise<HealthAlert[]> {
    return this.alertService.getAlerts({ isActive: true });
  }

  @Query(() => Number, { description: 'Get active alerts count' })
  @RequirePermission('health:read')
  async activeAlertsCount(): Promise<number> {
    return this.alertService.getActiveAlertsCount();
  }

  @Mutation(() => HealthAlert, { description: 'Create a new health alert' })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:write')
  async createHealthAlert(
    @Args('input') input: HealthAlertInput,
    @CurrentUser() user: any
  ): Promise<HealthAlert> {
    const alert = await this.alertService.createAlert(input);
    
    this.pubSub.publish('healthAlertCreated', { 
      healthAlertCreated: alert,
      userId: user?.id 
    });
    
    return alert;
  }

  @Mutation(() => HealthAlert, { description: 'Resolve a health alert', nullable: true })
  @RequirePermission('health:write')
  async resolveHealthAlert(
    @Args('alertId') alertId: string,
    @CurrentUser() user: any
  ): Promise<HealthAlert | null> {
    const alert = await this.alertService.resolveAlert(alertId);
    
    if (alert) {
      this.pubSub.publish('healthAlertResolved', { 
        healthAlertResolved: alert,
        userId: user?.id 
      });
    }
    
    return alert;
  }

  @Mutation(() => Number, { description: 'Bulk resolve alerts for a health check' })
  @RequirePermission('health:write')
  async bulkResolveAlerts(
    @Args('checkId') checkId: string,
    @CurrentUser() user: any
  ): Promise<number> {
    const resolvedCount = await this.alertService.bulkResolveAlerts(checkId);
    
    this.pubSub.publish('healthAlertsBulkResolved', { 
      checkId,
      resolvedCount,
      userId: user?.id 
    });
    
    return resolvedCount;
  }

  @Mutation(() => Boolean, { description: 'Configure notification settings' })
  @UseGuards(HealthAdminGuard)
  @RequirePermission('health:admin:notifications')
  async configureNotifications(
    @Args('config') config: HealthNotificationConfigInput,
    @CurrentUser() user: any
  ): Promise<boolean> {
    await this.alertService.configureNotifications(config);
    
    this.pubSub.publish('notificationConfigUpdated', { 
      config,
      userId: user?.id 
    });
    
    return true;
  }

  @Subscription(() => HealthAlert, { description: 'Subscribe to new health alerts' })
  @RequirePermission('health:read')
  healthAlertCreated() {
    return this.pubSub.asyncIterator('healthAlertCreated');
  }

  @Subscription(() => HealthAlert, { description: 'Subscribe to resolved health alerts' })
  @RequirePermission('health:read')
  healthAlertResolved() {
    return this.pubSub.asyncIterator('healthAlertResolved');
  }
}