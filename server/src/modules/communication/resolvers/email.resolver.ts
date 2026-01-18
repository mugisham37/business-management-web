import { Resolver, Query, Mutation, Args, Subscription, Context } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { EmailNotificationService } from '../services/email-notification.service';
import {
  EmailMessage,
  EmailTemplate,
  EmailProvider,
  BulkEmailResult,
  CommunicationResult,
  CommunicationEvent,
} from '../types/communication.types';
import {
  EmailMessageInput,
  EmailNotificationInput,
  EmailTemplateInput,
  EmailProviderConfigInput,
  NotificationOptionsInput,
} from '../inputs/communication.input';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class EmailResolver {
  private readonly logger = new Logger(EmailResolver.name);
  private readonly pubSub = new PubSub();

  constructor(
    private readonly emailService: EmailNotificationService,
  ) {}

  // Queries
  @Query(() => [EmailTemplate])
  @RequirePermission('communication:email:read')
  async getEmailTemplates(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<EmailTemplate[]> {
    try {
      this.logger.log(`Getting email templates for tenant ${tenantId}`);
      
      // This would typically fetch from database
      // For now, return mock data
      return [
        {
          name: 'welcome_email',
          subject: 'Welcome to {{brandName}}!',
          htmlTemplate: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining {{brandName}}.</p>',
          textTemplate: 'Welcome {{firstName}}! Thank you for joining {{brandName}}.',
          variables: ['firstName', 'brandName'],
          category: 'onboarding',
        },
        {
          name: 'password_reset',
          subject: 'Reset Your Password',
          htmlTemplate: '<h1>Password Reset</h1><p>Click <a href="{{resetUrl}}">here</a> to reset your password.</p>',
          textTemplate: 'Password Reset: {{resetUrl}}',
          variables: ['resetUrl'],
          category: 'security',
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get email templates: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => [EmailProvider])
  @RequirePermission('communication:email:read')
  async getEmailProviders(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<EmailProvider[]> {
    try {
      this.logger.log(`Getting email providers for tenant ${tenantId}`);
      
      // This would typically fetch from database
      // For now, return mock data
      return [
        {
          type: 'sendgrid' as any,
          configuration: {
            apiKey: '***masked***',
            fromEmail: 'noreply@example.com',
            fromName: 'Business Platform',
          },
          isEnabled: true,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get email providers: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Query(() => EmailTemplate, { nullable: true })
  @RequirePermission('communication:email:read')
  async getEmailTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @Args('name') name: string,
  ): Promise<EmailTemplate | null> {
    try {
      this.logger.log(`Getting email template ${name} for tenant ${tenantId}`);
      
      // This would fetch specific template from database
      const template = await this.emailService['getEmailTemplate'](tenantId, name);
      return template;
    } catch (error) {
      this.logger.error(`Failed to get email template: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Mutations
  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:email:send')
  async sendEmail(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('message') message: EmailMessageInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending email for tenant ${tenantId}`, {
        recipients: message.to.length,
        subject: message.subject,
      });

      const result = await this.emailService.sendEmail(tenantId, {
        to: message.to,
        cc: message.cc,
        bcc: message.bcc,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
        replyTo: message.replyTo,
        priority: message.priority,
        headers: message.headers,
      }, {
        retryAttempts: options?.retryAttempts,
        timeout: options?.timeout,
      });

      // Publish email event
      const event: CommunicationEvent = {
        id: `email_${Date.now()}`,
        type: 'email_sent',
        channel: 'email' as any,
        success: result.success,
        error: result.error,
        metadata: {
          recipients: message.to.length,
          subject: message.subject,
          messageId: result.messageId,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`email_events_${tenantId}`, { emailEvent: event });

      return {
        channel: 'email',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: message.to.length,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => BulkEmailResult)
  @RequirePermission('communication:email:send')
  async sendEmailToUsers(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('notification') notification: EmailNotificationInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<BulkEmailResult> {
    try {
      this.logger.log(`Sending bulk email to users for tenant ${tenantId}`, {
        userCount: userIds.length,
        subject: notification.subject,
      });

      const result = await this.emailService.sendNotificationToUsers(
        tenantId,
        userIds,
        {
          subject: notification.subject,
          message: notification.message,
          htmlContent: notification.htmlContent,
          priority: notification.priority,
          templateName: notification.templateName,
          templateVariables: notification.templateVariables,
          attachments: notification.attachments,
        },
        {
          batchSize: options?.batchSize,
          delayBetweenBatches: options?.delayBetweenBatches,
        },
      );

      // Publish bulk email event
      const event: CommunicationEvent = {
        id: `bulk_email_${Date.now()}`,
        type: 'bulk_email_sent',
        channel: 'email' as any,
        success: result.totalSent > 0,
        error: result.totalSent === 0 ? 'No emails sent successfully' : undefined,
        metadata: {
          totalUsers: userIds.length,
          totalSent: result.totalSent,
          totalFailed: result.totalFailed,
          subject: notification.subject,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`email_events_${tenantId}`, { emailEvent: event });

      return result;
    } catch (error) {
      this.logger.error(`Failed to send bulk email: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:email:configure')
  async createEmailTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('template') template: EmailTemplateInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Creating email template ${template.name} for tenant ${tenantId}`);

      await this.emailService.createTemplate(tenantId, {
        name: template.name,
        subject: template.subject,
        htmlTemplate: template.htmlTemplate,
        textTemplate: template.textTemplate,
        variables: template.variables,
        category: template.category,
      }, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to create email template: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:email:configure')
  async updateEmailTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('name') name: string,
    @Args('template') template: EmailTemplateInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Updating email template ${name} for tenant ${tenantId}`);

      // This would update the template in database
      await this.emailService.createTemplate(tenantId, {
        name: template.name,
        subject: template.subject,
        htmlTemplate: template.htmlTemplate,
        textTemplate: template.textTemplate,
        variables: template.variables,
        category: template.category,
      }, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to update email template: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:email:configure')
  async deleteEmailTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('name') name: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Deleting email template ${name} for tenant ${tenantId}`);

      // This would delete the template from database
      // For now, just return true
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete email template: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:email:configure')
  async configureEmailProvider(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('provider') provider: EmailProviderConfigInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Configuring email provider ${provider.type} for tenant ${tenantId}`);

      await this.emailService.configureProvider(tenantId, {
        type: provider.type,
        configuration: provider.configuration,
      }, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to configure email provider: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:email:test')
  async testEmailProvider(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('providerType', { nullable: true }) providerType?: string,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Testing email provider for tenant ${tenantId}`);

      // Get current user's email for test
      const testEmail = 'test@example.com'; // This would come from user context

      const result = await this.emailService.sendEmail(tenantId, {
        to: [testEmail],
        subject: 'Test Email from Business Platform',
        text: 'This is a test email to verify your email configuration.',
        html: '<p>This is a test email to verify your email configuration.</p>',
      }, {
        provider: providerType,
      });

      return {
        channel: 'email',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to test email provider: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Subscriptions
  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      return payload.emailEvent.tenantId === context.req.user.tenantId;
    },
  })
  @RequirePermission('communication:email:read')
  async emailEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to email events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`email_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.emailEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'bulk_email_sent';
    },
  })
  @RequirePermission('communication:email:read')
  async bulkEmailEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to bulk email events for tenant ${tenantId}`);
    
    return this.pubSub.asyncIterator(`email_events_${tenantId}`);
  }
}