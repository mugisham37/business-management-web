// Module
export { CommunicationModule } from './communication.module';

// Services
export { CommunicationIntegrationService } from './services/communication-integration.service';
export { EmailNotificationService } from './services/email-notification.service';
export { SMSNotificationService } from './services/sms-notification.service';
export { SlackIntegrationService } from './services/slack-integration.service';
export { TeamsIntegrationService } from './services/teams-integration.service';

// Integration Services
export { AuthCommunicationIntegrationService } from './integrations/auth-integration.service';
export { BusinessCommunicationIntegrationService } from './integrations/business-integration.service';
export { SystemCommunicationIntegrationService } from './integrations/system-integration.service';

// Resolvers
export { CommunicationResolver } from './resolvers/communication.resolver';
export { EmailResolver } from './resolvers/email.resolver';
export { SMSResolver } from './resolvers/sms.resolver';
export { SlackResolver } from './resolvers/slack.resolver';
export { TeamsResolver } from './resolvers/teams.resolver';

// Types
export * from './types/communication.types';

// Inputs
export * from './inputs/communication.input';

// Decorators
export * from './decorators/communication.decorators';

// Guards
export * from './guards/communication.guards';

// Interceptors
export * from './interceptors/communication.interceptors';

// Integrations
export * from './integrations';

// Interfaces and Types for external use
export interface CommunicationModuleConfig {
  enableRealTimeUpdates?: boolean;
  defaultRetryAttempts?: number;
  defaultTimeout?: number;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  quotaLimits?: {
    email?: { daily: number; monthly: number };
    sms?: { daily: number; monthly: number };
    slack?: { daily: number; monthly: number };
    teams?: { daily: number; monthly: number };
  };
  rateLimits?: {
    maxRequestsPerMinute?: number;
    maxRequestsPerHour?: number;
  };
}

export interface CommunicationServiceInterface {
  sendMultiChannelNotification(tenantId: string, notification: any): Promise<any>;
  sendAlert(tenantId: string, alert: any): Promise<any>;
  sendBusinessNotification(tenantId: string, notification: any): Promise<any>;
  configureChannels(tenantId: string, channels: any[], updatedBy: string): Promise<void>;
  testAllChannels(tenantId: string): Promise<any[]>;
}

export interface EmailServiceInterface {
  sendEmail(tenantId: string, message: any, options?: any): Promise<any>;
  sendNotificationToUsers(tenantId: string, userIds: string[], notification: any, options?: any): Promise<any>;
  configureProvider(tenantId: string, provider: any, updatedBy: string): Promise<void>;
  createTemplate(tenantId: string, template: any, createdBy: string): Promise<void>;
}

export interface SMSServiceInterface {
  sendSMS(tenantId: string, message: any, options?: any): Promise<any>;
  sendNotificationToUsers(tenantId: string, userIds: string[], notification: any, options?: any): Promise<any>;
  sendOTP(tenantId: string, phoneNumber: string, otp: string, options?: any): Promise<any>;
  sendAlert(tenantId: string, phoneNumbers: string[], alert: any, options?: any): Promise<any>;
  configureProvider(tenantId: string, provider: any, updatedBy: string): Promise<void>;
  createTemplate(tenantId: string, template: any, createdBy: string): Promise<void>;
}

export interface SlackServiceInterface {
  sendMessage(tenantId: string, message: any, options?: any): Promise<any>;
  sendNotification(tenantId: string, notification: any): Promise<any>;
  sendAlert(tenantId: string, alert: any): Promise<any>;
  configureIntegration(tenantId: string, config: any, updatedBy: string): Promise<void>;
  testConfiguration(config: any): Promise<any>;
}

export interface TeamsServiceInterface {
  sendMessage(tenantId: string, message: any, options?: any): Promise<any>;
  sendNotification(tenantId: string, notification: any): Promise<any>;
  sendAlert(tenantId: string, alert: any): Promise<any>;
  sendRichCard(tenantId: string, card: any): Promise<any>;
  configureIntegration(tenantId: string, config: any, updatedBy: string): Promise<void>;
  testConfiguration(config: any): Promise<any>;
}

// Constants
export const COMMUNICATION_EVENTS = {
  MESSAGE_SENT: 'communication.message.sent',
  MESSAGE_FAILED: 'communication.message.failed',
  ALERT_SENT: 'communication.alert.sent',
  NOTIFICATION_SENT: 'communication.notification.sent',
  CHANNEL_CONFIGURED: 'communication.channel.configured',
  TEMPLATE_CREATED: 'communication.template.created',
  PROVIDER_CONFIGURED: 'communication.provider.configured',
} as const;

export const COMMUNICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  SLACK: 'slack',
  TEAMS: 'teams',
  WEBHOOK: 'webhook',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const ALERT_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

// Utility functions
export const createCommunicationMetadata = (
  tenantId: string,
  userId: string,
  additionalData?: Record<string, any>
) => ({
  tenantId,
  userId,
  timestamp: new Date(),
  requestId: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  ...additionalData,
});

export const validateCommunicationChannel = (channel: string): boolean => {
  return Object.values(COMMUNICATION_CHANNELS).includes(channel as any);
};

export const validateNotificationPriority = (priority: string): boolean => {
  return Object.values(NOTIFICATION_PRIORITIES).includes(priority as any);
};

export const validateAlertSeverity = (severity: string): boolean => {
  return Object.values(ALERT_SEVERITIES).includes(severity as any);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except +
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume it's a US number and add +1
  if (!formatted.startsWith('+')) {
    if (formatted.length === 10) {
      formatted = `+1${formatted}`;
    } else if (formatted.length === 11 && formatted.startsWith('1')) {
      formatted = `+${formatted}`;
    }
  }
  
  return formatted;
};

export const maskSensitiveData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = ['apiKey', 'authToken', 'secretAccessKey', 'password', 'secret'];
  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***masked***';
    }
  }

  return masked;
};

export const generateTrackingId = (): string => {
  return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
};

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

export const parseTemplate = (template: string, variables: Record<string, any>): string => {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
};

export const extractVariablesFromTemplate = (template: string): string[] => {
  const regex = /{{\\s*([^}]+)\\s*}}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1].trim());
  }
  
  return [...new Set(variables)]; // Remove duplicates
};