/**
 * Communication Cache Strategies
 * Intelligent caching and invalidation for communication data
 */

import { InMemoryCache, gql } from '@apollo/client';
import { 
  CommunicationChannel,
  CommunicationStats,
  EmailTemplate,
  SMSTemplate,
  EmailProvider,
  SMSProvider,
  CommunicationEvent,
  ChannelUsageStats
} from '@/types/communication';

// Cache field policies for communication data
export const communicationCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        // Communication channels - cache by tenant
        getCommunicationChannels: {
          keyArgs: ['tenantId'],
          merge(existing: CommunicationChannel[] = [], incoming: CommunicationChannel[]) {
            return incoming;
          },
        },
        
        // Communication stats - cache with time-based invalidation
        getCommunicationStats: {
          keyArgs: ['tenantId', 'filter'],
          merge(existing: CommunicationStats | undefined, incoming: CommunicationStats) {
            return incoming;
          },
        },
        
        // Channel usage stats
        getChannelUsageStats: {
          keyArgs: ['tenantId', 'filter'],
          merge(existing: ChannelUsageStats[] = [], incoming: ChannelUsageStats[]) {
            return incoming;
          },
        },
        
        // Email templates - cache by tenant and category
        getEmailTemplates: {
          keyArgs: ['tenantId', 'category'],
          merge(existing: EmailTemplate[] = [], incoming: EmailTemplate[]) {
            return incoming;
          },
        },
        
        // SMS templates - cache by tenant and category
        getSMSTemplates: {
          keyArgs: ['tenantId', 'category'],
          merge(existing: SMSTemplate[] = [], incoming: SMSTemplate[]) {
            return incoming;
          },
        },
        
        // Email providers - cache by tenant
        getEmailProviders: {
          keyArgs: ['tenantId'],
          merge(existing: EmailProvider[] = [], incoming: EmailProvider[]) {
            return incoming;
          },
        },
        
        // SMS providers - cache by tenant
        getSMSProviders: {
          keyArgs: ['tenantId'],
          merge(existing: SMSProvider[] = [], incoming: SMSProvider[]) {
            return incoming;
          },
        },
        
        // Individual templates
        getEmailTemplate: {
          keyArgs: ['tenantId', 'templateName'],
        },
        
        getSMSTemplate: {
          keyArgs: ['tenantId', 'templateName'],
        },
        
        // Configuration queries
        getSlackConfiguration: {
          keyArgs: ['tenantId'],
        },
        
        getTeamsConfiguration: {
          keyArgs: ['tenantId'],
        },
        
        isSlackConfigured: {
          keyArgs: ['tenantId'],
        },
        
        isTeamsConfigured: {
          keyArgs: ['tenantId'],
        },
      },
    },
    
    // Communication channel type policy
    CommunicationChannel: {
      keyFields: ['type'],
      fields: {
        configuration: {
          merge(existing = {}, incoming = {}) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
    
    // Email template type policy
    EmailTemplate: {
      keyFields: ['name'],
      fields: {
        variables: {
          merge(existing: string[] = [], incoming: string[]) {
            return incoming;
          },
        },
      },
    },
    
    // SMS template type policy
    SMSTemplate: {
      keyFields: ['name'],
      fields: {
        variables: {
          merge(existing: string[] = [], incoming: string[]) {
            return incoming;
          },
        },
      },
    },
    
    // Provider type policies
    EmailProvider: {
      keyFields: ['type'],
      fields: {
        configuration: {
          merge(existing = {}, incoming = {}) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
    
    SMSProvider: {
      keyFields: ['type'],
      fields: {
        configuration: {
          merge(existing = {}, incoming = {}) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
    
    // Communication stats type policy
    CommunicationStats: {
      keyFields: false, // Don't normalize, always replace
      fields: {
        channelBreakdown: {
          merge(existing = {}, incoming = {}) {
            return incoming;
          },
        },
        priorityBreakdown: {
          merge(existing = {}, incoming = {}) {
            return incoming;
          },
        },
      },
    },
    
    // Communication event type policy
    CommunicationEvent: {
      keyFields: ['id'],
      fields: {
        metadata: {
          merge(existing = {}, incoming = {}) {
            return { ...existing, ...incoming };
          },
        },
      },
    },
  },
};

// Cache invalidation utilities
export class CommunicationCacheManager {
  private cache: InMemoryCache;

  constructor(cache: InMemoryCache) {
    this.cache = cache;
  }

  // Invalidate communication channels cache
  invalidateChannels(tenantId: string): void {
    this.cache.evict({
      fieldName: 'getCommunicationChannels',
      args: { tenantId },
    });
    this.cache.gc();
  }

  // Invalidate communication stats cache
  invalidateStats(tenantId: string, filter?: any): void {
    if (filter) {
      this.cache.evict({
        fieldName: 'getCommunicationStats',
        args: { tenantId, filter },
      });
    } else {
      // Invalidate all stats for tenant
      this.cache.modify({
        fields: {
          getCommunicationStats(existing, { DELETE }) {
            return DELETE;
          },
        },
      });
    }
    this.cache.gc();
  }

  // Invalidate email templates cache
  invalidateEmailTemplates(tenantId: string, category?: string): void {
    if (category) {
      this.cache.evict({
        fieldName: 'getEmailTemplates',
        args: { tenantId, category },
      });
    } else {
      // Invalidate all email templates for tenant
      this.cache.modify({
        fields: {
          getEmailTemplates(existing, { DELETE }) {
            return DELETE;
          },
        },
      });
    }
    this.cache.gc();
  }

  // Invalidate SMS templates cache
  invalidateSMSTemplates(tenantId: string, category?: string): void {
    if (category) {
      this.cache.evict({
        fieldName: 'getSMSTemplates',
        args: { tenantId, category },
      });
    } else {
      // Invalidate all SMS templates for tenant
      this.cache.modify({
        fields: {
          getSMSTemplates(existing, { DELETE }) {
            return DELETE;
          },
        },
      });
    }
    this.cache.gc();
  }

  // Invalidate specific template
  invalidateEmailTemplate(tenantId: string, templateName: string): void {
    this.cache.evict({
      fieldName: 'getEmailTemplate',
      args: { tenantId, templateName },
    });
    // Also invalidate the templates list
    this.invalidateEmailTemplates(tenantId);
  }

  invalidateSMSTemplate(tenantId: string, templateName: string): void {
    this.cache.evict({
      fieldName: 'getSMSTemplate',
      args: { tenantId, templateName },
    });
    // Also invalidate the templates list
    this.invalidateSMSTemplates(tenantId);
  }

  // Invalidate providers cache
  invalidateEmailProviders(tenantId: string): void {
    this.cache.evict({
      fieldName: 'getEmailProviders',
      args: { tenantId },
    });
    this.cache.gc();
  }

  invalidateSMSProviders(tenantId: string): void {
    this.cache.evict({
      fieldName: 'getSMSProviders',
      args: { tenantId },
    });
    this.cache.gc();
  }

  // Invalidate integration configurations
  invalidateSlackConfiguration(tenantId: string): void {
    this.cache.evict({
      fieldName: 'getSlackConfiguration',
      args: { tenantId },
    });
    this.cache.evict({
      fieldName: 'isSlackConfigured',
      args: { tenantId },
    });
    this.cache.gc();
  }

  invalidateTeamsConfiguration(tenantId: string): void {
    this.cache.evict({
      fieldName: 'getTeamsConfiguration',
      args: { tenantId },
    });
    this.cache.evict({
      fieldName: 'isTeamsConfigured',
      args: { tenantId },
    });
    this.cache.gc();
  }

  // Invalidate all communication data for tenant
  invalidateAllCommunicationData(tenantId: string): void {
    this.invalidateChannels(tenantId);
    this.invalidateStats(tenantId);
    this.invalidateEmailTemplates(tenantId);
    this.invalidateSMSTemplates(tenantId);
    this.invalidateEmailProviders(tenantId);
    this.invalidateSMSProviders(tenantId);
    this.invalidateSlackConfiguration(tenantId);
    this.invalidateTeamsConfiguration(tenantId);
  }

  // Update cache after successful operations
  updateChannelAfterConfiguration(tenantId: string, channelType: string, enabled: boolean): void {
    this.cache.modify({
      fields: {
        getCommunicationChannels(existingChannels: CommunicationChannel[] = [], { readField }) {
          return existingChannels.map(channel => 
            channel.type === channelType 
              ? { ...channel, enabled }
              : channel
          );
        },
      },
    });
  }

  updateStatsAfterSend(tenantId: string): void {
    // Invalidate stats to force refresh with new data
    this.invalidateStats(tenantId);
  }

  addTemplateToCache(tenantId: string, template: EmailTemplate | SMSTemplate, isEmail: boolean): void {
    const fieldName = isEmail ? 'getEmailTemplates' : 'getSMSTemplates';
    
    this.cache.modify({
      fields: {
        [fieldName](existingTemplates: (EmailTemplate | SMSTemplate)[] = [], { readField }) {
          // Add new template to the beginning of the list
          return [template, ...existingTemplates];
        },
      },
    });
  }

  removeTemplateFromCache(tenantId: string, templateName: string, isEmail: boolean): void {
    const fieldName = isEmail ? 'getEmailTemplates' : 'getSMSTemplates';
    
    this.cache.modify({
      fields: {
        [fieldName](existingTemplates: (EmailTemplate | SMSTemplate)[] = [], { readField }) {
          return existingTemplates.filter(template => template.name !== templateName);
        },
      },
    });
  }

  updateTemplateInCache(tenantId: string, templateName: string, updatedTemplate: EmailTemplate | SMSTemplate, isEmail: boolean): void {
    const fieldName = isEmail ? 'getEmailTemplates' : 'getSMSTemplates';
    
    this.cache.modify({
      fields: {
        [fieldName](existingTemplates: (EmailTemplate | SMSTemplate)[] = [], { readField }) {
          return existingTemplates.map(template => 
            template.name === templateName 
              ? { ...template, ...updatedTemplate }
              : template
          );
        },
      },
    });
  }

  // Optimistic updates for better UX
  optimisticChannelUpdate(tenantId: string, channelType: string, enabled: boolean): () => void {
    const originalData = this.cache.readQuery({
      query: gql`
        query GetCommunicationChannels($tenantId: ID!) {
          getCommunicationChannels(tenantId: $tenantId) {
            type
            enabled
            configuration
            priority
            fallbackChannels
          }
        }
      `,
      variables: { tenantId },
    });

    // Apply optimistic update
    this.updateChannelAfterConfiguration(tenantId, channelType, enabled);

    // Return rollback function
    return () => {
      if (originalData) {
        this.cache.writeQuery({
          query: gql`
            query GetCommunicationChannels($tenantId: ID!) {
              getCommunicationChannels(tenantId: $tenantId) {
                type
                enabled
                configuration
                priority
                fallbackChannels
              }
            }
          `,
          variables: { tenantId },
          data: originalData,
        });
      }
    };
  }

  optimisticTemplateAdd(tenantId: string, template: EmailTemplate | SMSTemplate, isEmail: boolean): () => void {
    const fieldName = isEmail ? 'getEmailTemplates' : 'getSMSTemplates';
    const queryName = isEmail ? 'GetEmailTemplates' : 'GetSMSTemplates';
    
    const originalData = this.cache.readQuery({
      query: gql`
        query ${queryName}($tenantId: ID!) {
          ${fieldName}(tenantId: $tenantId) {
            name
            ${isEmail ? 'subject' : ''}
            ${isEmail ? 'htmlTemplate' : 'message'}
            ${isEmail ? 'textTemplate' : ''}
            variables
            category
            ${isEmail ? '' : 'maxLength'}
          }
        }
      `,
      variables: { tenantId },
    });

    // Apply optimistic update
    this.addTemplateToCache(tenantId, template, isEmail);

    // Return rollback function
    return () => {
      if (originalData) {
        this.cache.writeQuery({
          query: gql`
            query ${queryName}($tenantId: ID!) {
              ${fieldName}(tenantId: $tenantId) {
                name
                ${isEmail ? 'subject' : ''}
                ${isEmail ? 'htmlTemplate' : 'message'}
                ${isEmail ? 'textTemplate' : ''}
                variables
                category
                ${isEmail ? '' : 'maxLength'}
              }
            }
          `,
          variables: { tenantId },
          data: originalData,
        });
      }
    };
  }

  // Cache warming - preload frequently accessed data
  warmCache(tenantId: string): void {
    // Preload communication channels
    this.cache.readQuery({
      query: gql`
        query GetCommunicationChannels($tenantId: ID!) {
          getCommunicationChannels(tenantId: $tenantId) {
            type
            enabled
            configuration
            priority
            fallbackChannels
          }
        }
      `,
      variables: { tenantId },
    });

    // Preload email templates
    this.cache.readQuery({
      query: gql`
        query GetEmailTemplates($tenantId: ID!) {
          getEmailTemplates(tenantId: $tenantId) {
            name
            subject
            htmlTemplate
            textTemplate
            variables
            category
          }
        }
      `,
      variables: { tenantId },
    });

    // Preload SMS templates
    this.cache.readQuery({
      query: gql`
        query GetSMSTemplates($tenantId: ID!) {
          getSMSTemplates(tenantId: $tenantId) {
            name
            message
            variables
            category
            maxLength
          }
        }
      `,
      variables: { tenantId },
    });
  }

  // Cache cleanup - remove old or unused data
  cleanupCache(): void {
    // Remove expired stats (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    this.cache.modify({
      fields: {
        getCommunicationStats(existing, { DELETE, readField }) {
          const generatedAt = readField('generatedAt');
          if (generatedAt && new Date(generatedAt) < oneHourAgo) {
            return DELETE;
          }
          return existing;
        },
      },
    });

    this.cache.gc();
  }
}

// Export cache manager instance
export const createCommunicationCacheManager = (cache: InMemoryCache): CommunicationCacheManager => {
  return new CommunicationCacheManager(cache);
};

// Cache key generators
export const generateCacheKey = {
  channels: (tenantId: string) => `communication:channels:${tenantId}`,
  stats: (tenantId: string, filter?: any) => 
    `communication:stats:${tenantId}:${filter ? JSON.stringify(filter) : 'all'}`,
  emailTemplates: (tenantId: string, category?: string) => 
    `communication:email:templates:${tenantId}:${category || 'all'}`,
  smsTemplates: (tenantId: string, category?: string) => 
    `communication:sms:templates:${tenantId}:${category || 'all'}`,
  emailProviders: (tenantId: string) => `communication:email:providers:${tenantId}`,
  smsProviders: (tenantId: string) => `communication:sms:providers:${tenantId}`,
  slackConfig: (tenantId: string) => `communication:slack:config:${tenantId}`,
  teamsConfig: (tenantId: string) => `communication:teams:config:${tenantId}`,
};

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  CHANNELS: 5 * 60 * 1000, // 5 minutes
  STATS: 2 * 60 * 1000, // 2 minutes
  TEMPLATES: 10 * 60 * 1000, // 10 minutes
  PROVIDERS: 15 * 60 * 1000, // 15 minutes
  CONFIGURATIONS: 30 * 60 * 1000, // 30 minutes
} as const;