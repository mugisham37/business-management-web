import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { SlackIntegrationService } from '../services/slack-integration.service';
import {
  SlackMessage,
  SlackIntegrationConfig,
  CommunicationResult,
  IntegrationTestResult,
  CommunicationEvent,
} from '../types/communication.types';
import {
  SlackMessageInput,
  SlackNotificationInput,
  SlackAlertInput,
  SlackIntegrationConfigInput,
  NotificationOptionsInput,
} from '../inputs/communication.input';

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SlackResolver {
  private readonly logger = new Logger(SlackResolver.name);
  private readonly pubSub = new PubSub();

  constructor(
    private readonly slackService: SlackIntegrationService,
  ) {}

  @Query(() => SlackIntegrationConfig, { nullable: true })
  @RequirePermission('communication:slack:read')
  async getSlackConfiguration(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<SlackIntegrationConfig | null> {
    try {
      this.logger.log(`Getting Slack configuration for tenant ${tenantId}`);
      
      // This would fetch from database
      const config = await this.slackService['getSlackConfig'](tenantId);
      return config;
    } catch (error) {
      this.logger.error(`Failed to get Slack configuration: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Query(() => Boolean)
  @RequirePermission('communication:slack:read')
  async isSlackConfigured(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Checking if Slack is configured for tenant ${tenantId}`);
      
      const config = await this.slackService['getSlackConfig'](tenantId);
      return !!config && !!(config.webhookUrl || config.botToken);
    } catch (error) {
      this.logger.error(`Failed to check Slack configuration: ${getErrorMessage(error)}`);
      return false;
    }
  }

  // Mutations
  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:slack:send')
  async sendSlackMessage(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('message') message: SlackMessageInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Slack message for tenant ${tenantId}`, {
        channel: message.channel,
        hasAttachments: !!message.attachments?.length,
      });

      const messageData: any = {
        channel: message.channel,
        text: message.text,
      };

      // Add optional message properties if defined
      if (message.username !== undefined) messageData.username = message.username;
      if (message.iconEmoji !== undefined) messageData.icon_emoji = message.iconEmoji;
      if (message.iconUrl !== undefined) messageData.icon_url = message.iconUrl;
      if (message.threadTs !== undefined) messageData.thread_ts = message.threadTs;

      // Build attachments if present
      if (message.attachments && message.attachments.length > 0) {
        messageData.attachments = message.attachments.map(att => {
          const attachment: any = {};
          if (att.color !== undefined) attachment.color = att.color;
          if (att.pretext !== undefined) attachment.pretext = att.pretext;
          if (att.title !== undefined) attachment.title = att.title;
          if (att.text !== undefined) attachment.text = att.text;
          if (att.imageUrl !== undefined) attachment.image_url = att.imageUrl;
          if (att.thumbUrl !== undefined) attachment.thumb_url = att.thumbUrl;
          if (att.footer !== undefined) attachment.footer = att.footer;
          if (att.timestamp !== undefined) attachment.ts = att.timestamp;

          // Build fields if present
          if (att.fields && att.fields.length > 0) {
            attachment.fields = att.fields.map(field => ({
              title: field.title,
              value: field.value,
              short: field.short,
            }));
          }

          return attachment;
        });
      }

      const optionsData: any = {};
      if (options?.retryAttempts !== undefined) optionsData.retryAttempts = options.retryAttempts;
      if (options?.timeout !== undefined) optionsData.timeout = options.timeout;

      const result = await this.slackService.sendMessage(tenantId, messageData, optionsData);

      // Publish Slack event
      const eventPayload: CommunicationEvent = {
        id: `slack_${Date.now()}`,
        type: 'slack_message_sent',
        channel: 'slack' as any,
        success: result.success,
        error: result.error,
        metadata: {
          channel: message.channel,
          messageId: result.messageId,
          hasAttachments: !!message.attachments?.length,
          isThreadReply: !!message.threadTs,
        },
        timestamp: new Date(),
        tenantId,
      };

      await (this.pubSub.publish as any)(`slack_events_${tenantId}`, { slackEvent: eventPayload });

      return {
        channel: 'slack',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1, // Slack channels count as 1 recipient
      };
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:slack:send')
  async sendSlackNotification(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('notification') notification: SlackNotificationInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Slack notification for tenant ${tenantId}`, {
        type: notification.type,
        priority: notification.priority,
        channel: notification.channel,
      });

      const notificationData: any = {
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        type: notification.type,
      };

      // Only add optional properties if they're defined
      if (notification.channel !== undefined) notificationData.channel = notification.channel;
      if (notification.metadata !== undefined) notificationData.metadata = notification.metadata;
      if (notification.actions !== undefined) notificationData.actions = notification.actions;

      const result = await this.slackService.sendNotification(tenantId, notificationData);

      // Publish Slack notification event
      const notificationEventPayload: CommunicationEvent = {
        id: `slack_notification_${Date.now()}`,
        type: 'slack_notification_sent',
        channel: 'slack' as any,
        success: result.success,
        error: result.error,
        metadata: {
          notificationType: notification.type,
          priority: notification.priority,
          channel: notification.channel,
          messageId: result.messageId,
          hasActions: !!notification.actions?.length,
        },
        timestamp: new Date(),
        tenantId,
      };

      await (this.pubSub.publish as any)(`slack_events_${tenantId}`, { slackEvent: notificationEventPayload });

      return {
        channel: 'slack',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:slack:send')
  async sendSlackAlert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('alert') alert: SlackAlertInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Slack alert for tenant ${tenantId}`, {
        severity: alert.severity,
        channel: alert.channel,
        mentionChannel: alert.mentionChannel,
        mentionUsers: alert.mentionUsers?.length || 0,
      });

      const alertData: any = {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
      };

      // Only add optional properties if they're defined
      if (alert.channel !== undefined) alertData.channel = alert.channel;
      if (alert.mentionUsers !== undefined) alertData.mentionUsers = alert.mentionUsers;
      if (alert.mentionChannel !== undefined) alertData.mentionChannel = alert.mentionChannel;
      if (alert.metadata !== undefined) alertData.metadata = alert.metadata;

      const result = await this.slackService.sendAlert(tenantId, alertData);

      // Publish Slack alert event
      const alertEventPayload: CommunicationEvent = {
        id: `slack_alert_${Date.now()}`,
        type: 'slack_alert_sent',
        channel: 'slack' as any,
        success: result.success,
        error: result.error,
        metadata: {
          severity: alert.severity,
          channel: alert.channel,
          messageId: result.messageId,
          mentionChannel: alert.mentionChannel,
          mentionUsersCount: alert.mentionUsers?.length || 0,
        },
        timestamp: new Date(),
        tenantId,
      };

      await (this.pubSub.publish as any)(`slack_events_${tenantId}`, { slackEvent: alertEventPayload });

      return {
        channel: 'slack',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:slack:configure')
  async configureSlackIntegration(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('config') config: SlackIntegrationConfigInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Configuring Slack integration for tenant ${tenantId}`);

      const configData: any = {
        webhookUrl: config.webhookUrl,
      };

      // Only add optional properties if they're defined
      if (config.botToken !== undefined) configData.botToken = config.botToken;
      if (config.defaultChannel !== undefined) configData.defaultChannel = config.defaultChannel;
      if (config.username !== undefined) configData.username = config.username;
      if (config.iconEmoji !== undefined) configData.iconEmoji = config.iconEmoji;
      if (config.iconUrl !== undefined) configData.iconUrl = config.iconUrl;
      if (config.enableThreads !== undefined) configData.enableThreads = config.enableThreads;
      if (config.enableMentions !== undefined) configData.enableMentions = config.enableMentions;
      if (config.mentionUsers !== undefined) configData.mentionUsers = config.mentionUsers;
      if (config.mentionChannels !== undefined) configData.mentionChannels = config.mentionChannels;

      await this.slackService.configureIntegration(tenantId, configData, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to configure Slack integration: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => IntegrationTestResult)
  @RequirePermission('communication:slack:test')
  async testSlackIntegration(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('config', { nullable: true }) config?: SlackIntegrationConfigInput,
  ): Promise<IntegrationTestResult> {
    try {
      this.logger.log(`Testing Slack integration for tenant ${tenantId}`);

      const startTime = Date.now();
      let result: { success: boolean; error?: string };

      if (config) {
        // Test provided configuration
        const testConfig: any = {
          webhookUrl: config.webhookUrl,
        };

        // Only add optional properties if they're defined
        if (config.botToken !== undefined) testConfig.botToken = config.botToken;
        if (config.defaultChannel !== undefined) testConfig.defaultChannel = config.defaultChannel;
        if (config.username !== undefined) testConfig.username = config.username;
        if (config.iconEmoji !== undefined) testConfig.iconEmoji = config.iconEmoji;
        if (config.iconUrl !== undefined) testConfig.iconUrl = config.iconUrl;
        if (config.enableThreads !== undefined) testConfig.enableThreads = config.enableThreads;
        if (config.enableMentions !== undefined) testConfig.enableMentions = config.enableMentions;
        if (config.mentionUsers !== undefined) testConfig.mentionUsers = config.mentionUsers;
        if (config.mentionChannels !== undefined) testConfig.mentionChannels = config.mentionChannels;

        result = await this.slackService.testConfiguration(testConfig);
      } else {
        // Test existing configuration
        const existingConfig = await this.slackService['getSlackConfig'](tenantId);
        if (!existingConfig) {
          return {
            success: false,
            error: 'No Slack configuration found',
            messageId: undefined,
            responseTime: Date.now() - startTime,
          };
        }
        result = await this.slackService.testConfiguration(existingConfig);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: result.success,
        error: result.error,
        messageId: result.success ? `test_${Date.now()}` : undefined,
        responseTime,
      };
    } catch (error) {
      this.logger.error(`Failed to test Slack integration: ${getErrorMessage(error)}`);
      return {
        success: false,
        error: getErrorMessage(error),
        messageId: undefined,
        responseTime: 0,
      };
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:slack:configure')
  async disableSlackIntegration(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Disabling Slack integration for tenant ${tenantId}`);

      // This would disable the integration in database
      // For now, just return true
      return true;
    } catch (error) {
      this.logger.error(`Failed to disable Slack integration: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:slack:send')
  async sendSlackMessageToChannel(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('channel') channel: string,
    @Args('text') text: string,
    @Args('title', { nullable: true }) title?: string,
    @Args('color', { nullable: true }) color?: string,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending simple Slack message to ${channel} for tenant ${tenantId}`);

      const messageData: any = {
        channel,
        text: title ? `*${title}*\n${text}` : text,
      };

      // Only add attachments if title is provided
      if (title) {
        messageData.attachments = [{
          color: color || 'good',
          title,
          text,
        }];
      }

      const message: SlackMessageInput = messageData;
      return await this.sendSlackMessage(tenantId, userId, message);
    } catch (error) {
      this.logger.error(`Failed to send simple Slack message: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  // Subscriptions
  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      return payload.slackEvent.tenantId === context.req.user.tenantId;
    },
  })
  @RequirePermission('communication:slack:read')
  slackEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Slack events for tenant ${tenantId}`);
    
    return (this.pubSub as any).asyncIterator(`slack_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.slackEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'slack_alert_sent';
    },
  })
  @RequirePermission('communication:slack:read')
  slackAlertEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Slack alert events for tenant ${tenantId}`);
    
    return (this.pubSub as any).asyncIterator(`slack_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.slackEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'slack_notification_sent';
    },
  })
  @RequirePermission('communication:slack:read')
  slackNotificationEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Slack notification events for tenant ${tenantId}`);
    
    return (this.pubSub as any).asyncIterator(`slack_events_${tenantId}`);
  }
}