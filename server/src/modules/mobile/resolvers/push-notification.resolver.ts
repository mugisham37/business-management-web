import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { PushNotificationService } from '../services/push-notification.service';
import {
  SendPushNotificationInput,
  RegisterDeviceTokenInput,
} from '../inputs/mobile.input';
import {
  SendPushNotificationResponse,
  PushNotificationResult,
  DeviceTokenInfo,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class PushNotificationResolver {
  private readonly logger = new Logger(PushNotificationResolver.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly pubSubService: PubSubService,
  ) {}

  @Mutation(() => SendPushNotificationResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:push:send')
  async sendPushNotification(
    @Args('input') input: SendPushNotificationInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SendPushNotificationResponse> {
    try {
      this.logger.log(`Sending push notification to ${input.userIds.length} users`);

      const payload: any = {
        title: input.title,
        body: input.body,
        priority: input.priority as any,
      };
      
      if (input.data) payload.data = JSON.parse(input.data);
      if (input.badge !== undefined && input.badge !== null) payload.badge = input.badge;
      if (input.sound !== undefined && input.sound !== null) payload.sound = input.sound;

      const result = await this.pushNotificationService.sendToUsers(
        tenantId,
        input.userIds,
        payload,
      );

      // Publish notification event
      await this.pubSubService.publish('pushNotificationSent', {
        tenantId,
        userIds: input.userIds,
        result,
      });

      return {
        success: result.success,
        message: result.success
          ? `Notification sent to ${result.deliveredTokens} devices`
          : 'Failed to send notification',
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to send push notification',
      };
    }
  }

  @Mutation(() => SendPushNotificationResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:push:send')
  async sendTenantWidePushNotification(
    @Args('input') input: SendPushNotificationInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<SendPushNotificationResponse> {
    try {
      this.logger.log(`Sending tenant-wide push notification`);

      const payload: any = {
        title: input.title,
        body: input.body,
        priority: input.priority as any,
      };
      
      if (input.data) payload.data = JSON.parse(input.data);
      if (input.badge !== undefined && input.badge !== null) payload.badge = input.badge;
      if (input.sound !== undefined && input.sound !== null) payload.sound = input.sound;

      const result = await this.pushNotificationService.sendToTenant(
        tenantId,
        payload,
        input.userIds, // Exclude these users
      );

      return {
        success: result.success,
        message: result.success
          ? `Notification sent to ${result.deliveredTokens} devices`
          : 'Failed to send notification',
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to send tenant-wide push notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to send push notification',
      };
    }
  }

  @Mutation(() => DeviceTokenInfo)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:push:register')
  async registerDeviceToken(
    @Args('input') input: RegisterDeviceTokenInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<DeviceTokenInfo> {
    try {
      const deviceToken = await this.pushNotificationService.registerDeviceToken(
        tenantId,
        user.id,
        input.token,
        input.platform as any,
        input.deviceId,
        input.appVersion,
      );

      return {
        id: deviceToken.id,
        platform: deviceToken.platform,
        deviceId: deviceToken.deviceId,
        isActive: deviceToken.isActive,
        lastUsed: deviceToken.lastUsed,
      };
    } catch (error) {
      this.logger.error(`Failed to register device token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:push:register')
  async unregisterDeviceToken(
    @Args('token') token: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      await this.pushNotificationService.unregisterDeviceToken(token);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unregister device token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  @Subscription(() => PushNotificationResult, {
    filter: (payload, variables, context) => {
      return payload.tenantId === context.req.tenantId;
    },
  })
  pushNotificationSent(@CurrentTenant() tenantId: string) {
    return this.pubSubService.asyncIterator('pushNotificationSent', tenantId);
  }
}
