import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PubSub } from 'graphql-subscriptions';

// Services
import { CommunicationIntegrationService } from './services/communication-integration.service';
import { SlackIntegrationService } from './services/slack-integration.service';
import { TeamsIntegrationService } from './services/teams-integration.service';
import { EmailNotificationService } from './services/email-notification.service';
import { SMSNotificationService } from './services/sms-notification.service';

// Integration Services
import { AuthCommunicationIntegrationService } from './integrations/auth-integration.service';
import { BusinessCommunicationIntegrationService } from './integrations/business-integration.service';
import { SystemCommunicationIntegrationService } from './integrations/system-integration.service';

// Resolvers
import { CommunicationResolver } from './resolvers/communication.resolver';
import { EmailResolver } from './resolvers/email.resolver';
import { SMSResolver } from './resolvers/sms.resolver';
import { SlackResolver } from './resolvers/slack.resolver';
import { TeamsResolver } from './resolvers/teams.resolver';

// Guards
import {
  CommunicationChannelGuard,
  NotificationPriorityGuard,
  AlertSeverityGuard,
  CommunicationTemplateGuard,
  CommunicationRateLimitGuard,
  DeliveryTrackingGuard,
  CommunicationQuotaGuard,
  CommunicationPermissionGuard,
  CommunicationContentGuard,
  CommunicationSchedulingGuard,
} from './guards/communication.guards';

// Interceptors
import {
  CommunicationLoggingInterceptor,
  CommunicationMetricsInterceptor,
  CommunicationRetryInterceptor,
  CommunicationValidationInterceptor,
  CommunicationCacheInterceptor,
  CommunicationTransformInterceptor,
  CommunicationSecurityInterceptor,
} from './interceptors/communication.interceptors';

// External modules
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    AuthModule,
    CacheModule,
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    // Core Services
    CommunicationIntegrationService,
    SlackIntegrationService,
    TeamsIntegrationService,
    EmailNotificationService,
    SMSNotificationService,

    // Integration Services
    AuthCommunicationIntegrationService,
    BusinessCommunicationIntegrationService,
    SystemCommunicationIntegrationService,

    // Resolvers
    CommunicationResolver,
    EmailResolver,
    SMSResolver,
    SlackResolver,
    TeamsResolver,

    // Guards (applied globally for communication operations)
    {
      provide: APP_GUARD,
      useClass: CommunicationPermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CommunicationQuotaGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CommunicationContentGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CommunicationSchedulingGuard,
    },

    // Interceptors (applied globally for communication operations)
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationSecurityInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationValidationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationMetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationRetryInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CommunicationTransformInterceptor,
    },

    // Additional Guards (for specific use cases)
    CommunicationChannelGuard,
    NotificationPriorityGuard,
    AlertSeverityGuard,
    CommunicationTemplateGuard,
    CommunicationRateLimitGuard,
    DeliveryTrackingGuard,

    // PubSub for real-time subscriptions
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [
    // Core Services (for use in other modules)
    CommunicationIntegrationService,
    SlackIntegrationService,
    TeamsIntegrationService,
    EmailNotificationService,
    SMSNotificationService,

    // Integration Services (for use in other modules)
    AuthCommunicationIntegrationService,
    BusinessCommunicationIntegrationService,
    SystemCommunicationIntegrationService,

    // Guards (for use in other modules)
    CommunicationChannelGuard,
    NotificationPriorityGuard,
    AlertSeverityGuard,
    CommunicationTemplateGuard,
    CommunicationRateLimitGuard,
    DeliveryTrackingGuard,
    CommunicationQuotaGuard,
    CommunicationPermissionGuard,
    CommunicationContentGuard,
    CommunicationSchedulingGuard,

    // Interceptors (for use in other modules)
    CommunicationLoggingInterceptor,
    CommunicationMetricsInterceptor,
    CommunicationRetryInterceptor,
    CommunicationValidationInterceptor,
    CommunicationCacheInterceptor,
    CommunicationTransformInterceptor,
    CommunicationSecurityInterceptor,

    // PubSub
    'PUB_SUB',
  ],
})
export class CommunicationModule {}