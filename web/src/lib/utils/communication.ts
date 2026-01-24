/**
 * Communication Utility Functions
 * Helper functions for communication operations, validation, formatting, and processing
 */

import { 
  CommunicationChannelType, 
  NotificationPriority, 
  AlertSeverity,
  ActionStyle,
  EmailMessage,
  SMSMessage,
  SlackMessage,
  TeamsMessage,
  TeamsSection,
  NotificationAction,
  CommunicationEvent,
  CommunicationError,
  EmailTemplate,
  SMSTemplate
} from '@/types/communication';

// Validation Functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  // Check for valid international format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(cleaned);
};

export const validateSlackChannel = (channel: string): boolean => {
  // Slack channels start with # or @ or are plain channel names
  return /^[#@]?[a-z0-9_-]+$/i.test(channel);
};

export const validateWebhookUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateCommunicationChannel = (channel: string): boolean => {
  return Object.values(CommunicationChannelType).includes(channel as CommunicationChannelType);
};

export const validateNotificationPriority = (priority: string): boolean => {
  return Object.values(NotificationPriority).includes(priority as NotificationPriority);
};

export const validateAlertSeverity = (severity: string): boolean => {
  return Object.values(AlertSeverity).includes(severity as AlertSeverity);
};

// Formatting Functions
export const formatPhoneNumber = (phoneNumber: string, defaultCountryCode = '+1'): string => {
  // Remove all non-digit characters except +
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add default country code
  if (!formatted.startsWith('+')) {
    if (formatted.length === 10 && defaultCountryCode === '+1') {
      formatted = `+1${formatted}`;
    } else if (formatted.length === 11 && formatted.startsWith('1') && defaultCountryCode === '+1') {
      formatted = `+${formatted}`;
    } else {
      formatted = `${defaultCountryCode}${formatted}`;
    }
  }
  
  return formatted;
};

export const formatEmailAddress = (email: string): string => {
  return email.toLowerCase().trim();
};

export const formatSlackChannel = (channel: string): string => {
  const cleaned = channel.trim();
  if (!cleaned.startsWith('#') && !cleaned.startsWith('@')) {
    return `#${cleaned}`;
  }
  return cleaned;
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format,
    timeStyle: format === 'short' ? 'short' : 'medium',
  }).format(dateObj);
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Template Processing Functions
export const parseTemplate = (template: string, variables: Record<string, unknown>): string => {
  let result = template;
  
  // Replace {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  
  return result;
};

export const extractVariablesFromTemplate = (template: string): string[] => {
  const regex = /{{\\s*([^}]+)\\s*}}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (match[1]) {
      variables.push(match[1].trim());
    }
  }
  
  return [...new Set(variables)]; // Remove duplicates
};

export const validateTemplateVariables = (template: string, variables: Record<string, unknown>): string[] => {
  const requiredVariables = extractVariablesFromTemplate(template);
  const missingVariables: string[] = [];
  
  for (const variable of requiredVariables) {
    if (!(variable in variables) || variables[variable] === undefined || variables[variable] === null) {
      missingVariables.push(variable);
    }
  }
  
  return missingVariables;
};

export const previewTemplate = (template: EmailTemplate | SMSTemplate, variables: Record<string, unknown>): {
  subject?: string;
  content: string;
  missingVariables: string[];
} => {
  const templateContent = 'htmlTemplate' in template ? template.htmlTemplate : template.message;
  const missingVariables = validateTemplateVariables(templateContent, variables);
  
  if ('subject' in template && 'htmlTemplate' in template) {
    // Email template
    return {
      subject: parseTemplate(template.subject, variables),
      content: parseTemplate(template.htmlTemplate, variables),
      missingVariables,
    };
  } else if ('message' in template) {
    // SMS template
    return {
      content: parseTemplate(template.message, variables),
      missingVariables,
    };
  }
  
  return {
    content: '',
    missingVariables,
  };
};

// Content Processing Functions
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

export const convertHtmlToText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

export const wordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const characterCount = (text: string, includeSpaces = true): number => {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
};

// Message Building Functions
export const buildEmailMessage = (params: {
  to: string | string[];
  subject: string;
  content: string;
  isHtml?: boolean;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  priority?: NotificationPriority;
}): EmailMessage => {
  return {
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    ...(params.isHtml ? { html: params.content } : { text: params.content }),
    ...(params.cc && { cc: params.cc }),
    ...(params.bcc && { bcc: params.bcc }),
    ...(params.replyTo && { replyTo: params.replyTo }),
    ...(params.priority && { priority: params.priority }),
  };
};

export const buildSMSMessage = (params: {
  to: string | string[];
  message: string;
  from?: string;
  scheduledAt?: Date;
  priority?: NotificationPriority;
}): SMSMessage => {
  return {
    to: Array.isArray(params.to) ? params.to : [params.to],
    message: params.message,
    ...(params.from && { from: params.from }),
    ...(params.scheduledAt && { scheduledAt: params.scheduledAt }),
    ...(params.priority && { priority: params.priority }),
  };
};

export const buildSlackMessage = (params: {
  channel: string;
  text: string;
  username?: string;
  iconEmoji?: string;
  threadTs?: string;
}): SlackMessage => {
  return {
    channel: formatSlackChannel(params.channel),
    text: params.text,
    ...(params.username && { username: params.username }),
    ...(params.iconEmoji && { iconEmoji: params.iconEmoji }),
    ...(params.threadTs && { threadTs: params.threadTs }),
  };
};

export const buildTeamsMessage = (params: {
  text?: string;
  summary?: string;
  themeColor?: string;
  title?: string;
  subtitle?: string;
}): TeamsMessage => {
  const message: TeamsMessage = {};
  
  if (params.text) message.text = params.text;
  if (params.summary) message.summary = params.summary;
  if (params.themeColor) message.themeColor = params.themeColor;
  
  if (params.title !== undefined || params.subtitle !== undefined) {
    const section: TeamsSection = {};
    if (params.title !== undefined) section.activityTitle = params.title;
    if (params.subtitle !== undefined) section.activitySubtitle = params.subtitle;
    message.sections = [section];
  }
  
  return message;
};

// Security Functions
export const maskSensitiveData = (data: unknown): unknown => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'apiKey', 'authToken', 'secretAccessKey', 'password', 'secret',
    'webhookUrl', 'botToken', 'serverToken', 'accountSid', 'authToken'
  ];
  
  const masked = { ...(data as Record<string, unknown>) };

  for (const field of sensitiveFields) {
    if (field in masked && masked[field]) {
      const value = String(masked[field]);
      if (value.length > 8) {
        masked[field] = `${value.substring(0, 4)}***${value.substring(value.length - 4)}`;
      } else {
        masked[field] = '***masked***';
      }
    }
  }

  return masked;
};

export const generateTrackingId = (): string => {
  return `track_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const generateMessageId = (channel: string): string => {
  return `${channel}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Retry and Error Handling Functions
export const calculateRetryDelay = (attempt: number, baseDelay = 1000, maxDelay = 30000): number => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

export const shouldRetry = (error: unknown, attempt: number, maxAttempts: number): boolean => {
  if (attempt >= maxAttempts) return false;
  
  const errorObj = error as Record<string, unknown>;
  
  // Don't retry client errors (4xx)
  if (typeof errorObj.status === 'number' && errorObj.status >= 400 && errorObj.status < 500) return false;
  
  // Don't retry validation errors
  if (errorObj?.code === 'VALIDATION_ERROR') return false;
  
  // Retry server errors and network errors
  return true;
};

export const createCommunicationError = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): CommunicationError => {
  return {
    code,
    message,
    ...(details && { details }),
    timestamp: new Date(),
  };
};

// Analytics and Metrics Functions
export const calculateSuccessRate = (successful: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((successful / total) * 100 * 100) / 100; // Round to 2 decimal places
};

export const calculateAverageResponseTime = (responseTimes: number[]): number => {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / responseTimes.length);
};

export const groupEventsByChannel = (events: CommunicationEvent[]): Record<string, CommunicationEvent[]> => {
  return events.reduce((groups, event) => {
    const channel = event.channel as string;
    if (!groups[channel]) {
      groups[channel] = [];
    }
    groups[channel].push(event);
    return groups;
  }, {} as Record<string, CommunicationEvent[]>);
};

export const groupEventsByPriority = (events: CommunicationEvent[]): Record<string, CommunicationEvent[]> => {
  return events.reduce((groups, event) => {
    const priority = (event.metadata?.priority as string) || 'unknown';
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(event);
    return groups;
  }, {} as Record<string, CommunicationEvent[]>);
};

export const filterEventsByDateRange = (
  events: CommunicationEvent[],
  startDate: Date,
  endDate: Date
): CommunicationEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= startDate && eventDate <= endDate;
  });
};

// Notification Action Helpers
export const createNotificationAction = (
  id: string,
  label: string,
  url?: string,
  style: ActionStyle = ActionStyle.PRIMARY
): NotificationAction => {
  return {
    id,
    label,
    ...(url && { url }),
    style,
  };
};

export const validateNotificationActions = (actions: NotificationAction[]): string[] => {
  const errors: string[] = [];
  
  actions.forEach((action, index) => {
    if (!action.id) {
      errors.push(`Action ${index + 1}: ID is required`);
    }
    if (!action.label) {
      errors.push(`Action ${index + 1}: Label is required`);
    }
    if (action.url && !validateWebhookUrl(action.url)) {
      errors.push(`Action ${index + 1}: Invalid URL format`);
    }
  });
  
  return errors;
};

// Batch Processing Functions
export const createBatches = <T>(items: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const processBatchesWithDelay = async <T, R>(
  batches: T[][],
  processor: (batch: T[]) => Promise<R>,
  delayMs = 1000
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < batches.length; i++) {
    const result = await processor(batches[i] ?? []);
    results.push(result);
    
    // Add delay between batches (except for the last one)
    if (i < batches.length - 1 && delayMs > 0) {
      await delay(delayMs);
    }
  }
  
  return results;
};

// Channel Priority Functions
export const sortChannelsByPriority = (channels: { type: string; priority?: number }[]): typeof channels => {
  return [...channels].sort((a, b) => (a.priority || 0) - (b.priority || 0));
};

export const getChannelFallbacks = (
  primaryChannel: string,
  allChannels: { type: string; fallbackChannels?: string[] }[]
): string[] => {
  const channel = allChannels.find(c => c.type === primaryChannel);
  return channel?.fallbackChannels || [];
};

// Metadata Helpers
export const createCommunicationMetadata = (
  tenantId: string,
  userId: string,
  additionalData?: Record<string, unknown>
): Record<string, unknown> => {
  return {
    tenantId,
    userId,
    timestamp: new Date().toISOString(),
    requestId: generateTrackingId(),
    ...additionalData,
  };
};

export const extractMetadataValue = <T = unknown>(metadata: Record<string, unknown> | undefined, key: string, defaultValue?: T): T | undefined => {
  return (metadata?.[key] as T) ?? defaultValue;
};

// Helper Functions
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export all utility functions as a single object for easier importing
export const CommunicationUtils = {
  // Validation
  validateEmail,
  validatePhoneNumber,
  validateSlackChannel,
  validateWebhookUrl,
  validateCommunicationChannel,
  validateNotificationPriority,
  validateAlertSeverity,
  
  // Formatting
  formatPhoneNumber,
  formatEmailAddress,
  formatSlackChannel,
  formatCurrency,
  formatDate,
  formatDuration,
  
  // Template Processing
  parseTemplate,
  extractVariablesFromTemplate,
  validateTemplateVariables,
  previewTemplate,
  
  // Content Processing
  sanitizeHtml,
  truncateText,
  stripHtml,
  convertHtmlToText,
  wordCount,
  characterCount,
  
  // Message Building
  buildEmailMessage,
  buildSMSMessage,
  buildSlackMessage,
  buildTeamsMessage,
  
  // Security
  maskSensitiveData,
  generateTrackingId,
  generateMessageId,
  
  // Error Handling
  calculateRetryDelay,
  shouldRetry,
  createCommunicationError,
  
  // Analytics
  calculateSuccessRate,
  calculateAverageResponseTime,
  groupEventsByChannel,
  groupEventsByPriority,
  filterEventsByDateRange,
  
  // Notification Actions
  createNotificationAction,
  validateNotificationActions,
  
  // Batch Processing
  createBatches,
  delay,
  processBatchesWithDelay,
  
  // Channel Management
  sortChannelsByPriority,
  getChannelFallbacks,
  
  // Metadata
  createCommunicationMetadata,
  extractMetadataValue,
};