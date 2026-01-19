import { Resolver, Query, Mutation, Args, Subscription, Context, ID } from '@nestjs/graphql';
import { UseGuards, Logger, Inject } from '@nestjs/common';
import { PubSubService } from '../../../common/graphql/pubsub.service';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { CommunicationIntegrationService } from '../services/communication-integration.service';
import { EmailNotificationService } from '../services/email-notification.service';
import { SMSNotificationService } from '../services/sms-notification.service';
import { SlackIntegrationService } from '../services/slack-integration.service';
import { TeamsIntegrationService } from '../services/teams-integration.service';
import {
  BulkCommunicationResult,
  CommunicationResult,
  CommunicationChannel,
  ChannelTestResult,
  CommunicationEvent,
  CommunicationStats,
  ChannelUsageStats,
} from '../types/communication.types';
import {
  MultiChannelNotificationInput,
  AlertInput,
  BusinessNotificationInput,
  CommunicationChannelConfigInput,
  CommunicationStatsFilterInput,
  CommunicationEventFilterInput,
} from '../inputs/communication.input';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class CommunicationResolver {
  private readonly logger = new Logger(CommunicationResolver.name);

  constructor(
    private readonly communicationService: CommunicationIntegrationService,
    private readonly emailService: EmailNotificationService,
    private readonly smsService: SMSNotificationService,
    private readonly slackService: SlackIntegrationService,
    private readonly teamsService: TeamsIntegrationService,
    private readonly pubSub: PubSubService,
  ) {}

  private mapNotificationPriorityToBusinessPriority(
    priority?: string,
  ): 'low' | 'medium' | 'high' {
    if (!priority) return 'medium';
    
    const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'urgent': 'high', // Map URGENT to high
    };
    
    return priorityMap[priority.toLowerCase()] || 'medium';
  }

  // Queries
  @Query(() => [CommunicationChannel])
  @RequirePermission('communication:read')
  async getCommunicationChannels(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<CommunicationChannel[]> {
    try {
      this.logger.log(`Getting communication channels for tenant ${tenantId}`);
      
      // This would typically fetch from the database
      // For now, we'll return enabled channels from the service
      const enabledChannels = await this.communicationService['getEnabledChannels'](tenantId);
      
      return enabledChannels.map(channel => {
        const channelObj: CommunicationChannel = {
          type: channel.type as any,
          enabled: channel.enabled,
          configuration: channel.configuration,
        };
        if (channel.priority !== undefined) {
          channelObj.priority = channel.priority;
        }
        if (channel.fallbackChannels !== undefined) {
          channelObj.fallbackChannels = channel.fallbackChannels;
        }
        return channelObj;
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get communication channels: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Query(() => [ChannelTestResult])
  @RequirePermission('communication:test')
  async testCommunicationChannels(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<ChannelTestResult[]> {
    try {
      this.logger.log(`Testing communication channels for tenant ${tenantId}`);
      
      const startTime = Date.now();
      const results = await this.communicationService.testAllChannels(tenantId);
      
      return results.map(result => ({
        ...result,
        responseTime: Date.now() - startTime,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to test communication channels: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Query(() => CommunicationStats)
  @RequirePermission('communication:analytics')
  async getCommunicationStats(
    @CurrentUser('tenantId') tenantId: string,
    @Args('filter', { nullable: true }) filter?: CommunicationStatsFilterInput,
  ): Promise<CommunicationStats> {
    try {
      this.logger.log(`Getting communication stats for tenant ${tenantId}`);
      
      // This would typically aggregate from database logs
      // For now, return mock data
      return {
        totalSent: 1250,
        totalFailed: 45,
        successRate: 96.4,
        channelBreakdown: {
          email: 800,
          sms: 300,
          slack: 100,
          teams: 50,
        },
        priorityBreakdown: {
          urgent: 50,
          high: 200,
          medium: 700,
          low: 300,
        },
        period: filter?.startDate && filter?.endDate 
          ? `${filter.startDate.toISOString().split('T')[0]} to ${filter.endDate.toISOString().split('T')[0]}`
          : 'Last 30 days',
        generatedAt: new Date(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get communication stats: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Query(() => [ChannelUsageStats])
  @RequirePermission('communication:analytics')
  async getChannelUsageStats(
    @CurrentUser('tenantId') tenantId: string,
    @Args('filter', { nullable: true }) filter?: CommunicationStatsFilterInput,
  ): Promise<ChannelUsageStats[]> {
    try {
      this.logger.log(`Getting channel usage stats for tenant ${tenantId}`);
      
      // This would typically aggregate from database logs
      // For now, return mock data
      return [
        {
          channel: 'email' as any,
          totalMessages: 800,
          successfulMessages: 785,
          failedMessages: 15,
          successRate: 98.1,
          averageResponseTime: 2500,
          lastUsed: new Date(Date.now() - 3600000), // 1 hour ago
        },
        {
          channel: 'sms' as any,
          totalMessages: 300,
          successfulMessages: 295,
          failedMessages: 5,
          successRate: 98.3,
          averageResponseTime: 1200,
          lastUsed: new Date(Date.now() - 1800000), // 30 minutes ago
        },
        {
          channel: 'slack' as any,
          totalMessages: 100,
          successfulMessages: 95,
          failedMessages: 5,
          successRate: 95.0,
          averageResponseTime: 800,
          lastUsed: new Date(Date.now() - 900000), // 15 minutes ago
        },
        {
          channel: 'teams' as any,
          totalMessages: 50,
          successfulMessages: 48,
          failedMessages: 2,
          successRate: 96.0,
          averageResponseTime: 1000,
          lastUsed: new Date(Date.now() - 7200000), // 2 hours ago
        },
      ];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get channel usage stats: ${err.message}`, err.stack);
      throw error;
    }
  }

  // Mutations
  @Mutation(() => BulkCommunicationResult)
  @RequirePermission('communication:send')
  async sendMultiChannelNotification(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('notification') notification: MultiChannelNotificationInput,
  ): Promise<BulkCommunicationResult> {
    try {
      this.logger.log(`Sending multi-channel notification for tenant ${tenantId}`, {
        type: notification.type,
        channels: notification.channels,
        priority: notification.priority,
      });

      const result = await this.communicationService.sendMultiChannelNotification(
        tenantId,
        {
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          type: notification.type,
          channels: notification.channels,
          ...(notification.recipients && { recipients: notification.recipients }),
          ...(notification.metadata && { metadata: notification.metadata }),
          ...(notification.actions && { actions: notification.actions }),
          ...(notification.templateName && { templateName: notification.templateName }),
          ...(notification.templateVariables && { templateVariables: notification.templateVariables }),
          ...(notification.scheduledAt && { scheduledAt: notification.scheduledAt }),
          ...(notification.options && { options: notification.options }),
        },
      );

      // Publish event for real-time updates
      const event: CommunicationEvent = {
        id: `comm_${Date.now()}`,
        type: notification.type,
        channel: (notification.channels?.[0] || 'email') as any, // Primary channel
        success: result.overallSuccess,
        ...(result.overallSuccess === false && { error: 'Some channels failed' }),
        metadata: {
          totalChannels: result.totalChannels,
          successfulChannels: result.successfulChannels,
          failedChannels: result.failedChannels,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`communication_events_${tenantId}`, { 
        communicationEvent: event,
        tenantId,
      });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send multi-channel notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Mutation(() => BulkCommunicationResult)
  @RequirePermission('communication:send')
  async sendAlert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('alert') alert: AlertInput,
  ): Promise<BulkCommunicationResult> {
    try {
      this.logger.log(`Sending alert for tenant ${tenantId}`, {
        severity: alert.severity,
        title: alert.title,
      });

      const result = await this.communicationService.sendAlert(tenantId, {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        ...(alert.metadata && { metadata: alert.metadata }),
        ...(alert.actionUrl && { actionUrl: alert.actionUrl }),
        ...(alert.actionLabel && { actionLabel: alert.actionLabel }),
        ...(alert.recipients && { recipients: alert.recipients }),
      });

      // Publish alert event
      const event: CommunicationEvent = {
        id: `alert_${Date.now()}`,
        type: 'system_alert',
        channel: 'slack' as any, // Alerts typically go to Slack first
        success: result.overallSuccess,
        ...(result.overallSuccess === false && { error: 'Alert delivery failed' }),
        metadata: {
          severity: alert.severity,
          totalChannels: result.totalChannels,
          successfulChannels: result.successfulChannels,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`communication_events_${tenantId}`, { 
        communicationEvent: event,
        tenantId,
      });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send alert: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Mutation(() => BulkCommunicationResult)
  @RequirePermission('communication:send')
  async sendBusinessNotification(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('notification') notification: BusinessNotificationInput,
  ): Promise<BulkCommunicationResult> {
    try {
      this.logger.log(`Sending business notification for tenant ${tenantId}`, {
        type: notification.type,
        priority: notification.priority,
      });

      const result = await this.communicationService.sendBusinessNotification(tenantId, {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        ...(notification.priority && { priority: this.mapNotificationPriorityToBusinessPriority(notification.priority) }),
        ...(notification.recipients && { recipients: notification.recipients }),
        ...(notification.metadata && { metadata: notification.metadata }),
        ...(notification.templateName && { templateName: notification.templateName }),
        ...(notification.templateVariables && { templateVariables: notification.templateVariables }),
      });

      // Publish business notification event
      const event: CommunicationEvent = {
        id: `business_${Date.now()}`,
        type: notification.type,
        channel: 'email' as any, // Business notifications typically go to email
        success: result.overallSuccess,
        ...(result.overallSuccess === false && { error: 'Business notification failed' }),
        metadata: {
          priority: notification.priority,
          totalChannels: result.totalChannels,
          successfulChannels: result.successfulChannels,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`communication_events_${tenantId}`, { 
        communicationEvent: event,
        tenantId,
      });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send business notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:configure')
  async configureCommunicationChannels(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('channels', { type: () => [CommunicationChannelConfigInput] }) 
    channels: CommunicationChannelConfigInput[],
  ): Promise<boolean> {
    try {
      this.logger.log(`Configuring communication channels for tenant ${tenantId}`, {
        channelCount: channels.length,
      });

      await this.communicationService.configureChannels(
        tenantId,
        channels.map(channel => {
          const config: any = {
            type: channel.type,
            enabled: channel.enabled,
            configuration: channel.configuration,
          };
          if (channel.priority !== undefined) {
            config.priority = channel.priority;
          }
          if (channel.fallbackChannels !== undefined) {
            config.fallbackChannels = channel.fallbackChannels;
          }
          return config;
        }),
        userId,
      );

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to configure communication channels: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:configure')
  async enableCommunicationChannel(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('channelType') channelType: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Enabling communication channel ${channelType} for tenant ${tenantId}`);

      // This would update the specific channel configuration
      await this.communicationService.configureChannels(
        tenantId,
        [{
          type: channelType,
          enabled: true,
          configuration: {},
          priority: 0,
          fallbackChannels: [],
        }],
        userId,
      );

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to enable communication channel: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:configure')
  async disableCommunicationChannel(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('channelType') channelType: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Disabling communication channel ${channelType} for tenant ${tenantId}`);

      // This would update the specific channel configuration
      await this.communicationService.configureChannels(
        tenantId,
        [{
          type: channelType,
          enabled: false,
          configuration: {},
          priority: 0,
          fallbackChannels: [],
        }],
        userId,
      );

      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to disable communication channel: ${err.message}`, err.stack);
      throw error;
    }
  }

  // Subscriptions
  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      return payload.communicationEvent.tenantId === context.req.user.tenantId;
    },
  })
  @RequirePermission('communication:read')
  async communicationEvents(
    @CurrentUser('tenantId') tenantId: string,
    @Args('filter', { nullable: true }) filter?: CommunicationEventFilterInput,
  ) {
    this.logger.log(`Subscribing to communication events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`communication_events_${tenantId}`, tenantId);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.alertEvent;
      return event.tenantId === context.req.user.tenantId && event.type === 'system_alert';
    },
  })
  @RequirePermission('communication:read')
  async alertEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to alert events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`communication_events_${tenantId}`, tenantId);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.businessNotificationEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type.startsWith('business_');
    },
  })
  @RequirePermission('communication:read')
  async businessNotificationEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to business notification events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`communication_events_${tenantId}`, tenantId);
  }
}