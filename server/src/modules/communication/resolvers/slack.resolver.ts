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

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SlackResolver {
  private readonly logger = new Logger(SlackResolver.name);
  private readonly pubSub = new PubSub();

  constructor(
    private readonly slackService: SlackIntegrationService,
  ) {}

  // Queries
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
      this.logger.error(`Failed to get Slack configuration: ${error.message}`, error.stack);
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
      this.logger.error(`Failed to check Slack configuration: ${error.message}`, error.stack);
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

      const result = await this.slackService.sendMessage(tenantId, {
        channel: message.channel,
        text: message.text,
        username: message.username,
        icon_emoji: message.iconEmoji,
        icon_url: message.iconUrl,
        attachments: message.attachments?.map(att => ({
          color: att.color,
          pretext: att.pretext,
          title: att.title,
          text: att.text,
          fields: att.fields?.map(field => ({
            title: field.title,
            value: field.value,
            short: field.short,
          })),
          image_url: att.imageUrl,
          thumb_url: att.thumbUrl,
          footer: att.footer,
          ts: att.timestamp,
        })),
        thread_ts: message.threadTs,
      }, {
        retryAttempts: options?.retryAttempts,
        timeout: options?.timeout,
      });

      // Publish Slack event
      const event: CommunicationEvent = {
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

      await this.pubSub.publish(`slack_events_${tenantId}`, { slackEvent: event });

      return {
        channel: 'slack',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1, // Slack channels count as 1 recipient
      };
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error.message}`, error.stack);
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

      const result = await this.slackService.sendNotification(tenantId, {
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        type: notification.type,
        channel: notification.channel,
        metadata: notification.metadata,
        actions: notification.actions,
      });

      // Publish Slack notification event
      const event: CommunicationEvent = {
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

      await this.pubSub.publish(`slack_events_${tenantId}`, { slackEvent: event });

      return {
        channel: 'slack',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${error.message}`, error.stack);
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

      const result = await this.slackService.sendAlert(tenantId, {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        channel: alert.channel,
        mentionUsers: alert.mentionUsers,
        mentionChannel: alert.mentionChannel,
        metadata: alert.metadata,
      });

      // Publish Slack alert event
      const event: CommunicationEvent = {
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

      await this.pubSub.publish(`slack_events_${tenantId}`, { slackEvent: event });

      return {
        channel: 'slack',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Slack alert: ${error.message}`, error.stack);
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

      await this.slackService.configureIntegration(tenantId, {
        webhookUrl: config.webhookUrl,
        botToken: config.botToken,
        defaultChannel: config.defaultChannel,
        username: config.username,
        iconEmoji: config.iconEmoji,
        iconUrl: config.iconUrl,
        enableThreads: config.enableThreads,
        enableMentions: config.enableMentions,
        mentionUsers: config.mentionUsers,
        mentionChannels: config.mentionChannels,
      }, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to configure Slack integration: ${error.message}`, error.stack);
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
        result = await this.slackService.testConfiguration({
          webhookUrl: config.webhookUrl,
          botToken: config.botToken,
          defaultChannel: config.defaultChannel,
          username: config.username,
          iconEmoji: config.iconEmoji,
          iconUrl: config.iconUrl,
          enableThreads: config.enableThreads,
          enableMentions: config.enableMentions,
          mentionUsers: config.mentionUsers,
          mentionChannels: config.mentionChannels,
        });
      } else {
        // Test existing configuration
        const existingConfig = await this.slackService['getSlackConfig'](tenantId);
        if (!existingConfig) {
          return {
            success: false,
            error: 'No Slack configuration found',
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
      this.logger.error(`Failed to test Slack integration: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
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
      this.logger.error(`Failed to disable Slack integration: ${error.message}`, error.stack);
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

      const message: SlackMessageInput = {
        channel,
        text: title ? `*${title}*\n${text}` : text,
        attachments: title ? [{
          color: color || 'good',
          title,
          text,
        }] : undefined,
      };

      return await this.sendSlackMessage(tenantId, userId, message);
    } catch (error) {
      this.logger.error(`Failed to send simple Slack message: ${error.message}`, error.stack);
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
  async slackEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Slack events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`slack_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.slackEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'slack_alert_sent';
    },
  })
  @RequirePermission('communication:slack:read')
  async slackAlertEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Slack alert events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`slack_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.slackEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'slack_notification_sent';
    },
  })
  @RequirePermission('communication:slack:read')
  async slackNotificationEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Slack notification events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`slack_events_${tenantId}`);
  }
}