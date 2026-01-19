import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermission } from '../../auth/decorators/require-permission.decorator';
import { SMSNotificationService } from '../services/sms-notification.service';
import {
  SMSMessage,
  SMSTemplate,
  SMSProvider,
  BulkSMSResult,
  CommunicationResult,
  CommunicationEvent,
} from '../types/communication.types';
import {
  SMSMessageInput,
  SMSNotificationInput,
  SMSTemplateInput,
  SMSProviderConfigInput,
  OTPInput,
  NotificationOptionsInput,
} from '../inputs/communication.input';

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class SMSResolver {
  private readonly logger = new Logger(SMSResolver.name);
  private readonly pubSub = new PubSub();

  constructor(
    private readonly smsService: SMSNotificationService,
  ) {}

  // Queries
  @Query(() => [SMSTemplate])
  @RequirePermission('communication:sms:read')
  async getSMSTemplates(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<SMSTemplate[]> {
    try {
      this.logger.log(`Getting SMS templates for tenant ${tenantId}`);
      
      // This would typically fetch from database
      // For now, return mock data
      return [
        {
          name: 'welcome_sms',
          message: 'Welcome to {{brandName}}, {{firstName}}! Your account is now active.',
          variables: ['firstName', 'brandName'],
          category: 'onboarding',
          maxLength: 160,
        },
        {
          name: 'otp_verification',
          message: 'Your {{brandName}} verification code is: {{otp}}. Valid for {{validityMinutes}} minutes.',
          variables: ['brandName', 'otp', 'validityMinutes'],
          category: 'security',
          maxLength: 160,
        },
        {
          name: 'order_confirmation',
          message: 'Order #{{orderNumber}} confirmed! Total: {{total}}. Estimated delivery: {{deliveryDate}}.',
          variables: ['orderNumber', 'total', 'deliveryDate'],
          category: 'orders',
          maxLength: 160,
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get SMS templates: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Query(() => [SMSProvider])
  @RequirePermission('communication:sms:read')
  async getSMSProviders(
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<SMSProvider[]> {
    try {
      this.logger.log(`Getting SMS providers for tenant ${tenantId}`);
      
      // This would typically fetch from database
      // For now, return mock data
      return [
        {
          type: 'twilio' as any,
          configuration: {
            accountSid: '***masked***',
            authToken: '***masked***',
            fromNumber: '+1234567890',
          },
          isEnabled: true,
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to get SMS providers: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Query(() => SMSTemplate, { nullable: true })
  @RequirePermission('communication:sms:read')
  async getSMSTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @Args('name') name: string,
  ): Promise<SMSTemplate | null> {
    try {
      this.logger.log(`Getting SMS template ${name} for tenant ${tenantId}`);
      
      // This would fetch specific template from database
      const template = await this.smsService['getSMSTemplate'](tenantId, name);
      return template;
    } catch (error) {
      this.logger.error(`Failed to get SMS template: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  // Mutations
  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:sms:send')
  async sendSMS(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('message') message: SMSMessageInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending SMS for tenant ${tenantId}`, {
        recipients: message.to.length,
        messageLength: message.message.length,
      });

      const smsData: any = {
        to: message.to,
        message: message.message,
      };
      if (message.from !== undefined) smsData.from = message.from;
      if (message.mediaUrls !== undefined) smsData.mediaUrls = message.mediaUrls;
      if (message.scheduledAt !== undefined) smsData.scheduledAt = message.scheduledAt;
      if (message.validityPeriod !== undefined) smsData.validityPeriod = message.validityPeriod;
      if (message.priority !== undefined) smsData.priority = message.priority;

      const smsOptions: any = {};
      if (options?.retryAttempts !== undefined) smsOptions.retryAttempts = options.retryAttempts;
      if (options?.timeout !== undefined) smsOptions.timeout = options.timeout;

      const result = await this.smsService.sendSMS(tenantId, smsData, smsOptions);

      // Publish SMS event
      const event: CommunicationEvent = {
        id: `sms_${Date.now()}`,
        type: 'sms_sent',
        channel: 'sms' as any,
        success: result.success,
        error: result.error,
        metadata: {
          recipients: message.to.length,
          messageLength: message.message.length,
          messageId: result.messageId,
          scheduled: !!message.scheduledAt,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`sms_events_${tenantId}`, { smsEvent: event });

      return {
        channel: 'sms',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: message.to.length,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => BulkSMSResult)
  @RequirePermission('communication:sms:send')
  async sendSMSToUsers(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('notification') notification: SMSNotificationInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<BulkSMSResult> {
    try {
      this.logger.log(`Sending bulk SMS to users for tenant ${tenantId}`, {
        userCount: userIds.length,
        messageLength: notification.message.length,
      });

      const result = await this.smsService.sendNotificationToUsers(
        tenantId,
        userIds,
        {
          message: notification.message,
          ...(notification.priority !== undefined && { priority: notification.priority as any }),
          ...(notification.templateName !== undefined && { templateName: notification.templateName }),
          ...(notification.templateVariables !== undefined && { templateVariables: notification.templateVariables }),
          ...(notification.scheduledAt !== undefined && { scheduledAt: notification.scheduledAt }),
        },
        {
          ...(options?.batchSize !== undefined && { batchSize: options.batchSize }),
          ...(options?.delayBetweenBatches !== undefined && { delayBetweenBatches: options.delayBetweenBatches }),
        },
      );

      // Publish bulk SMS event
      const event: CommunicationEvent = {
        id: `bulk_sms_${Date.now()}`,
        type: 'bulk_sms_sent',
        channel: 'sms' as any,
        success: result.totalSent > 0,
        error: result.totalSent === 0 ? 'No SMS messages sent successfully' : undefined,
        metadata: {
          totalUsers: userIds.length,
          totalSent: result.totalSent,
          totalFailed: result.totalFailed,
          messageLength: notification.message.length,
          scheduled: !!notification.scheduledAt,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`sms_events_${tenantId}`, { smsEvent: event });

      return result;
    } catch (error) {
      this.logger.error(`Failed to send bulk SMS: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:sms:send')
  async sendOTP(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('otp') otp: OTPInput,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending OTP SMS for tenant ${tenantId}`, {
        phoneNumber: this.maskPhoneNumber(otp.phoneNumber),
        validityMinutes: otp.validityMinutes,
      });

      const otpOptions: any = {};
      if (otp.validityMinutes !== undefined) otpOptions.validityMinutes = otp.validityMinutes;
      if (otp.brandName !== undefined) otpOptions.brandName = otp.brandName;

      const result = await this.smsService.sendOTP(
        tenantId,
        otp.phoneNumber,
        otp.otp,
        otpOptions,
      );

      // Publish OTP event
      const event: CommunicationEvent = {
        id: `otp_${Date.now()}`,
        type: 'otp_sent',
        channel: 'sms' as any,
        success: result.success,
        error: result.error,
        metadata: {
          phoneNumber: this.maskPhoneNumber(otp.phoneNumber),
          validityMinutes: otp.validityMinutes || 10,
          messageId: result.messageId,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`sms_events_${tenantId}`, { smsEvent: event });

      return {
        channel: 'sms',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:sms:send')
  async sendSMSAlert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('phoneNumbers', { type: () => [String] }) phoneNumbers: string[],
    @Args('title') title: string,
    @Args('message') message: string,
    @Args('severity') severity: string,
    @Args('options', { nullable: true }) options?: NotificationOptionsInput,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Sending SMS alert for tenant ${tenantId}`, {
        recipients: phoneNumbers.length,
        severity,
      });

      const result = await this.smsService.sendAlert(
        tenantId,
        phoneNumbers,
        {
          title,
          message,
          severity: severity as any,
        },
      );

      // Publish SMS alert event
      const event: CommunicationEvent = {
        id: `sms_alert_${Date.now()}`,
        type: 'sms_alert_sent',
        channel: 'sms' as any,
        success: result.success,
        error: result.error,
        metadata: {
          recipients: phoneNumbers.length,
          severity,
          title,
          messageId: result.messageId,
        },
        timestamp: new Date(),
        tenantId,
      };

      await this.pubSub.publish(`sms_events_${tenantId}`, { smsEvent: event });

      return {
        channel: 'sms',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: phoneNumbers.length,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS alert: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:sms:configure')
  async createSMSTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('template') template: SMSTemplateInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Creating SMS template ${template.name} for tenant ${tenantId}`);

      const templateData: any = {
        name: template.name,
        message: template.message,
        variables: template.variables,
      };
      if (template.category !== undefined) templateData.category = template.category;
      if (template.maxLength !== undefined) templateData.maxLength = template.maxLength;

      await this.smsService.createTemplate(tenantId, templateData, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to create SMS template: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:sms:configure')
  async updateSMSTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('name') name: string,
    @Args('template') template: SMSTemplateInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Updating SMS template ${name} for tenant ${tenantId}`);

      const updateData: any = {
        name: template.name,
        message: template.message,
        variables: template.variables,
      };
      if (template.category !== undefined) updateData.category = template.category;
      if (template.maxLength !== undefined) updateData.maxLength = template.maxLength;

      // This would update the template in database
      await this.smsService.createTemplate(tenantId, updateData, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to update SMS template: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:sms:configure')
  async deleteSMSTemplate(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('name') name: string,
  ): Promise<boolean> {
    try {
      this.logger.log(`Deleting SMS template ${name} for tenant ${tenantId}`);

      // This would delete the template from database
      // For now, just return true
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete SMS template: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @RequirePermission('communication:sms:configure')
  async configureSMSProvider(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('provider') provider: SMSProviderConfigInput,
  ): Promise<boolean> {
    try {
      this.logger.log(`Configuring SMS provider ${provider.type} for tenant ${tenantId}`);

      await this.smsService.configureProvider(tenantId, {
        type: provider.type,
        configuration: provider.configuration,
      }, userId);

      return true;
    } catch (error) {
      this.logger.error(`Failed to configure SMS provider: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  @Mutation(() => CommunicationResult)
  @RequirePermission('communication:sms:test')
  async testSMSProvider(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Args('phoneNumber') phoneNumber: string,
    @Args('providerType', { nullable: true }) providerType?: string,
  ): Promise<CommunicationResult> {
    try {
      this.logger.log(`Testing SMS provider for tenant ${tenantId}`, {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
      });

      const testOptions: any = {};
      if (providerType !== undefined) testOptions.provider = providerType;

      const result = await this.smsService.sendSMS(tenantId, {
        to: [phoneNumber],
        message: 'This is a test SMS from Business Platform to verify your SMS configuration.',
      }, testOptions);

      return {
        channel: 'sms',
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientCount: 1,
      };
    } catch (error) {
      this.logger.error(`Failed to test SMS provider: ${getErrorMessage(error)}`);
      throw error;
    }
  }

  // Subscriptions
  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      return payload.smsEvent.tenantId === context.req.user.tenantId;
    },
  })
  @RequirePermission('communication:sms:read')
  async smsEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to SMS events for tenant ${tenantId}`);
    
    return (this.pubSub as any).asyncIterator(`sms_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.smsEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'bulk_sms_sent';
    },
  })
  @RequirePermission('communication:sms:read')
  async bulkSMSEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to bulk SMS events for tenant ${tenantId}`);
    
    return (this.pubSub as any).asyncIterator(`sms_events_${tenantId}`);
  }

  @Subscription(() => CommunicationEvent, {
    filter: (payload, variables, context) => {
      const event = payload.smsEvent;
      return event.tenantId === context.req.user.tenantId && 
             event.type === 'otp_sent';
    },
  })
  @RequirePermission('communication:sms:read')
  async otpEvents(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    this.logger.log(`Subscribing to OTP events for tenant ${tenantId}`);
    
    return (this.pubSub as any).asyncIterator(`sms_events_${tenantId}`);
  }

  // Helper methods
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) {
      return phoneNumber;
    }
    
    const visiblePart = phoneNumber.slice(-4);
    const maskedPart = '*'.repeat(phoneNumber.length - 4);
    return maskedPart + visiblePart;
  }
}