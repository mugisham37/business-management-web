import { Resolver, Subscription, Args, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { TenantInterceptor } from '../interceptors/tenant.interceptor';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../decorators/tenant.decorators';
import { AuthenticatedUser } from '../guards/tenant.guard';
import { TierChangePropagationService } from '../services/tier-change-propagation.service';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { CustomLoggerService } from '../../logger/logger.service';

@ObjectType()
class PermissionChangeType {
  @Field()
  featureName!: string;

  @Field()
  oldAccess!: boolean;

  @Field()
  newAccess!: boolean;

  @Field()
  reason!: string;
}

@ObjectType()
class PermissionUpdateType {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => [PermissionChangeType])
  changedFeatures!: PermissionChangeType[];

  @Field()
  newTier!: string;

  @Field()
  timestamp!: Date;
}

@ObjectType()
class DashboardUpdateType {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => [String])
  newModules!: string[];

  @Field(() => [String])
  removedModules!: string[];

  @Field(() => [String])
  newUpgradePrompts!: string[];

  @Field(() => [String])
  removedUpgradePrompts!: string[];

  @Field()
  timestamp!: Date;
}

@ObjectType()
class TierUpdateType {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  newTier!: string;

  @Field()
  timestamp!: Date;
}

@ObjectType()
class SystemUpdateType {
  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => PermissionUpdateType)
  permissions!: PermissionUpdateType;

  @Field(() => DashboardUpdateType)
  dashboard!: DashboardUpdateType;

  @Field()
  tier!: string;

  @Field()
  timestamp!: Date;
}

@Resolver()
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export class TierSubscriptionsResolver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly tierChangePropagationService: TierChangePropagationService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Subscription(() => PermissionUpdateType, {
    name: 'permissionUpdates',
  })
  async subscribeToPermissionUpdates(
    @Args('userId', { nullable: true }) userId?: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    this.logger.debug(`New permission updates subscription`, {
      tenantId,
      userId: userId || user?.id,
    });

    return this.pubSubService.asyncIterator('PERMISSION_UPDATES', tenantId!);
  }

  @Subscription(() => DashboardUpdateType, {
    name: 'dashboardUpdates',
  })
  async subscribeToDashboardUpdates(
    @Args('userId', { nullable: true }) userId?: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    this.logger.debug(`New dashboard updates subscription`, {
      tenantId,
      userId: userId || user?.id,
    });

    return this.pubSubService.asyncIterator('DASHBOARD_UPDATES', tenantId!);
  }

  @Subscription(() => TierUpdateType, {
    name: 'tierUpdates',
  })
  async subscribeToTierUpdates(
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    this.logger.debug(`New tier updates subscription`, {
      tenantId,
      userId: user?.id,
    });

    return this.pubSubService.asyncIterator('TIER_UPDATES', tenantId!);
  }

  @Subscription(() => SystemUpdateType, {
    name: 'systemUpdates',
  })
  async subscribeToSystemUpdates(
    @Args('userId', { nullable: true }) userId?: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    this.logger.debug(`New system updates subscription`, {
      tenantId,
      userId: userId || user?.id,
    });

    return this.pubSubService.asyncIterator('SYSTEM_UPDATES', tenantId!);
  }

  /**
   * Event handlers to publish updates to subscribers
   */

  @OnEvent('permissions.realtime.update')
  async handlePermissionUpdate(payload: any): Promise<void> {
    this.logger.debug(`Publishing permission update`, {
      tenantId: payload.tenantId,
      changedFeatures: payload.permissions.changedFeatures.length,
    });

    const update: PermissionUpdateType = {
      tenantId: payload.tenantId,
      userId: payload.userId,
      changedFeatures: payload.permissions.changedFeatures,
      newTier: payload.permissions.newTier,
      timestamp: payload.timestamp,
    };

    await this.pubSubService.publish('PERMISSION_UPDATES', { permissionUpdates: update, tenantId: payload.tenantId });
  }

  @OnEvent('dashboard.realtime.update')
  async handleDashboardUpdate(payload: any): Promise<void> {
    this.logger.debug(`Publishing dashboard update`, {
      tenantId: payload.tenantId,
      newModules: payload.dashboard.newModules.length,
      removedModules: payload.dashboard.removedModules.length,
    });

    const update: DashboardUpdateType = {
      tenantId: payload.tenantId,
      userId: payload.userId,
      newModules: payload.dashboard.newModules,
      removedModules: payload.dashboard.removedModules,
      newUpgradePrompts: payload.dashboard.newUpgradePrompts,
      removedUpgradePrompts: payload.dashboard.removedUpgradePrompts,
      timestamp: payload.timestamp,
    };

    await this.pubSubService.publish('DASHBOARD_UPDATES', { dashboardUpdates: update, tenantId: payload.tenantId });
  }

  @OnEvent('tier.realtime.update')
  async handleTierUpdate(payload: any): Promise<void> {
    this.logger.debug(`Publishing tier update`, {
      tenantId: payload.tenantId,
      newTier: payload.newTier,
    });

    const update: TierUpdateType = {
      tenantId: payload.tenantId,
      userId: payload.userId,
      newTier: payload.newTier,
      timestamp: payload.timestamp,
    };

    await this.pubSubService.publish('TIER_UPDATES', { tierUpdates: update, tenantId: payload.tenantId });
  }

  @OnEvent('system.realtime.update')
  async handleSystemUpdate(payload: any): Promise<void> {
    this.logger.debug(`Publishing system update`, {
      tenantId: payload.tenantId,
      tier: payload.tier,
    });

    const update: SystemUpdateType = {
      tenantId: payload.tenantId,
      userId: payload.userId,
      permissions: {
        tenantId: payload.tenantId,
        userId: payload.userId,
        changedFeatures: payload.permissions.changedFeatures,
        newTier: payload.permissions.newTier,
        timestamp: payload.permissions.timestamp,
      },
      dashboard: {
        tenantId: payload.tenantId,
        userId: payload.userId,
        newModules: payload.dashboard.newModules,
        removedModules: payload.dashboard.removedModules,
        newUpgradePrompts: payload.dashboard.newUpgradePrompts,
        removedUpgradePrompts: payload.dashboard.removedUpgradePrompts,
        timestamp: payload.dashboard.timestamp,
      },
      tier: payload.tier,
      timestamp: payload.timestamp,
    };

    await this.pubSubService.publish('SYSTEM_UPDATES', { systemUpdates: update, tenantId: payload.tenantId });
  }
}