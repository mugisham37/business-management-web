import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { TeamsIntegrationService } from '../services/teams-integration.service';
import {
  TeamsMessage,
  TeamsIntegrationConfig,
  CommunicationResult,
  IntegrationTestResult,
  CommunicationEvent,
} from '../types/communication.types';
import {
  TeamsMessageInput,
  TeamsNotificationInput,
  TeamsAlertInput,
  TeamsRichCardInput,
  TeamsIntegrationConfigInput,
  NotificationOptionsInput,
} from '../inputs/communication.input';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class TeamsResolver {
  private readonly logger = new Logger(TeamsResolver.name);
  private readonly pubSub = new PubSub();

  constructor(
    private readonly teamsService: TeamsIntegrationService,
  ) {}

  // Queries
  @Query(() => TeamsIntegrationConfig, { nullable: true })
  @RequirePermission('communication:teams:read')
  async getTeamsConfiguration(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<TeamsIntegrationConfig | null> {
    try {
      this.logger.log(`Getting Teams configuration for tenant ${tenantId}`);
      
      // This would fetch from database
      const config = await this.teamsService['getTeamsConfig'](tenantId);
      return config;
    } catch (error) {
      this.logger.error(`Failed to get Teams configuration: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => Boolean)
  @RequirePermission('communication:teams:read')
  async isTeamsConfigured(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Checking if Teams is configured for tenant ${tenantId}`);
      
      const config = await this.teamsService['getTeamsConfig'](tenantId);
      return !!config && !!config.webhookUrl;
    } catch (error) {
      this.logger.error(`Failed to check Teams configuration: ${error.message}`, error.stack);
      return false;
    }
  }

  // Mutations
  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:teams:send')
  async sendTeamsMessage(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('message') message: TeamsMessageInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Teams message for tenant ${tenantId}`, {
        hasSections: !!message.sections?.length,
        themeColor: message.themeColor,
      });

      const result = await this.teamsService.sendMessage(tenantId, {
        text: message.text,
        summary: message.summary,
        themeColor: message.themeColor,
        sections: message.sections?.map(section => ({
          activityTitle: section.activityTitle,
          activitySubtitle: section.activitySubtitle,
          activityImage: section.activityImage,
          facts: section.facts?.map(fact => ({
            name: fact.name,
            value: fact.value,
          })),
          markdown: section.markdown,
          text: section.text,
        })),
      }, {
        retryAttempts: options?.retryAttempts,
        timeout: options?.timeout,
      });

      // Publish Teams event
      const event: CommunicationEvent = {
        id: `teams_${Date.now()}`,
        type: 'teams_message_sent',
        channel: 'teams' as any,
        success: result.success,
        error: result.error,
        metadata: {
          messageId: result.messageId,
          hasSections: !!message.sections?.length,
          themeColor: message.themeColor,
          summary: message.summary,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`teams_events_${tenantId}`, { teamsEvent: event });

      return {
        channel: 'teams',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1, // Teams channels count as 1 recipient
      };
    } catch (error) {
      this.logger.error(`Failed to send Teams message: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:teams:send')
  async sendTeamsNotification(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('notification') notification: TeamsNotificationInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Teams notification for tenant ${tenantId}`, {
        type: notification.type,
        priority: notification.priority,
      });

      const result = await this.teamsService.sendNotification(tenantId, {
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        type: notification.type,
        metadata: notification.metadata,
        actions: notification.actions,
      });

      // Publish Teams notification event
      const event: CommunicationEvent = {
        id: `teams_notification_${Date.now()}`,
        type: 'teams_notification_sent',
        channel: 'teams' as any,
        success: result.success,
        error: result.error,
        metadata: {
          notificationType: notification.type,
          priority: notification.priority,
          messageId: result.messageId,
          hasActions: !!notification.actions?.length,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`teams_events_${tenantId}`, { teamsEvent: event });

      return {
        channel: 'teams',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Teams notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:teams:send')
  async sendTeamsAlert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('alert') alert: TeamsAlertInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Teams alert for tenant ${tenantId}`, {
        severity: alert.severity,
        hasAction: !!(alert.actionUrl && alert.actionLabel),
      });

      const result = await this.teamsService.sendAlert(tenantId, {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        metadata: alert.metadata,
        actionUrl: alert.actionUrl,
        actionLabel: alert.actionLabel,
      });

      // Publish Teams alert event
      const event: CommunicationEvent = {
        id: `teams_alert_${Date.now()}`,
        type: 'teams_alert_sent',
        channel: 'teams' as any,
        success: result.success,
        error: result.error,
        metadata: {
          severity: alert.severity,
          messageId: result.messageId,
          hasAction: !!(alert.actionUrl && alert.actionLabel),
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`teams_events_${tenantId}`, { teamsEvent: event });

      return {
        channel: 'teams',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Teams alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:teams:send')
  async sendTeamsRichCard(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('card') card: TeamsRichCardInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending Teams rich card for tenant ${tenantId}`, {
        title: card.title,
        sectionsCount: card.sections.length,
        actionsCount: card.actions?.length || 0,
      });

      const result = await this.teamsService.sendRichCard(tenantId, {
        title: card.title,
        subtitle: card.subtitle,
        summary: card.summary,
        themeColor: card.themeColor,
        sections: card.sections.map(section => ({
          title: section.activityTitle,
          subtitle: section.activitySubtitle,
          text: section.text,
          facts: section.facts?.map(fact => ({
            name: fact.name,
            value: fact.value,
          })),
          image: section.activityImage,
        })),
        actions: card.actions?.map(action => ({
          type: 'OpenUri' as const,
          name: action.label,
          url: action.url,
        })),
      });

      // Publish Teams rich card event
      const event: CommunicationEvent = {
        id: `teams_rich_card_${Date.now()}`,
        type: 'teams_rich_card_sent',
        channel: 'teams' as any,
        success: result.success,
        error: result.error,
        metadata: {
          title: card.title,
          messageId: result.messageId,
          sectionsCount: card.sections.length,
          actionsCount: card.actions?.length || 0,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`teams_events_${tenantId}`, { teamsEvent: event });

      return {
        channel: 'teams',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send Teams rich card: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:teams:configure')
  async configureTeamsIntegration(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('config') config: TeamsIntegrationConfigInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Configuring Teams integration for tenant ${tenantId}`);

      await this.teamsService.configureIntegration(tenantId, {
        webhookUrl: config.webhookUrl,
        defaultTitle: config.defaultTitle,
        defaultThemeColor: config.defaultThemeColor,
        enableMentions: config.enableMentions,
        mentionUsers: config.mentionUsers,
        enableActivityImages: config.enableActivityImages,
        activityImageUrl: config.activityImageUrl,
      }, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to configure Teams integration: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => IntegrationTestResult)
  @RequirePermission('communication:teams:test')
  async testTeamsIntegration(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('config', { nullable: true }) config?: TeamsIntegrationConfigInput,
  ): Promise<IntegrationTestResult> {
    try {
      this.logger.log(`Testing Teams integration for tenant ${tenantId}`);

      const startTime = Date.now();
      let result: { success: boolean; error?: string };

      if (config) {
        // Test provided configuration
        result = await this.teamsService.testConfiguration({
          webhookUrl: config.webhookUrl,
          defaultTitle: config.defaultTitle,
          defaultThemeColor: config.defaultThemeColor,
          enableMentions: config.enableMentions,
          mentionUsers: config.mentionUsers,
          enableActivityImages: config.enableActivityImages,
          activityImageUrl: config.activityImageUrl,
        });
      } else {
        // Test existing configuration
        const existingConfig = await this.teamsService['getTeamsConfig'](tenantId);
        if (!existingConfig) {
          return {
            success: false,
            error: 'No Teams configuration found',
            responseTime: Date.now() - startTime,
          };
        }
        result = await this.teamsService.testConfiguration(existingConfig);
      }

      const responseTime = Date.now() - startTime;

      return {
        success: result.success,
        error: result.error,
        messageId: result.success ? `test_${Date.now()}` : undefined,
        responseTime,
      };
    } catch (error) {
      this.logger.error(`Failed to test Teams integration: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        responseTime: 0,
      };
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:teams:configure')
  async disableTeamsIntegration(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Disabling Teams integration for tenant ${tenantId}`);

      // This would disable the integration in database
      // For now, just return true
      return true;
    } catch (error) {
      this.logger.error(`Failed to disable Teams integration: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:teams:send')
  async sendTeamsSimpleMessage(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('title') title: string,
    @Args('text') text: string,
    @Args('themeColor', { nullable: true }) themeColor?: string,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending simple Teams message for tenant ${tenantId}`);

      const message: TeamsMessageInput = {
        summary: title,
        themeColor: themeColor || '0078D4',
        sections: [{
          activityTitle: title,
          text,
          markdown: true,
        }],
      };

      return await this.sendTeamsMessage(tenantId, userId, message);
    } catch (error) {
      this.logger.error(`Failed to send simple Teams message: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Subscriptions
  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      return payload.teamsEvent.tenantId === context.req.user.tenantId;
    },
  })
  @RequirePermission('communication:teams:read')
  async teamsEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Teams events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`teams_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.teamsEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'teams_alert_sent';
    },
  })
  @RequirePermission('communication:teams:read')
  async teamsAlertEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Teams alert events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`teams_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.teamsEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'teams_notification_sent';
    },
  })
  @RequirePermission('communication:teams:read')
  async teamsNotificationEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Teams notification events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`teams_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.teamsEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'teams_rich_card_sent';
    },
  })
  @RequirePermission('communication:teams:read')
  async teamsRichCardEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to Teams rich card events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`teams_events_${tenantId}`);
  }
}