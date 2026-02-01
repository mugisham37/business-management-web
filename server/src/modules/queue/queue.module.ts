import { Module, Global, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';

// Core Services
import { QueueService } from './queue.service';
import { QueueManagementService } from './services/queue-management.service';
import { JobManagementService } from './services/job-management.service';
import { QueueAnalyticsService } from './services/queue-analytics.service';

// Processors
import { EmailProcessor } from './processors/email.processor';
import { ReportProcessor } from './processors/report.processor';
import { SyncProcessor } from './processors/sync.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';

// GraphQL Resolvers
import { QueueResolver } from './resolvers/queue.resolver';
import { JobResolver } from './resolvers/job.resolver';
import { QueueFieldResolver } from './resolvers/queue-field.resolver';
import { JobFieldResolver } from './resolvers/job-field.resolver';

// DataLoaders and Context
import { QueueDataLoader } from './dataloaders/queue.dataloader';
import { QueueContextProvider } from './providers/queue-context.provider';

// Guards
import { 
  QueuePermissionGuard,
  QueueTenantGuard,
  QueueRateLimitGuard,
  QueueValidationGuard,
  QueueHealthGuard,
  QueueMaintenanceGuard 
} from './guards/queue.guards';

// Interceptors
import {
  QueueAuditInterceptor,
  QueueCacheInterceptor,
  QueueMonitoringInterceptor,
  QueueRetryInterceptor,
  QueueTimeoutInterceptor,
  QueueTransformInterceptor
} from './interceptors/queue.interceptors';

// Plugins and Filters
import { QueueComplexityPlugin } from './plugins/queue-complexity.plugin';
import { SubscriptionFilter } from './filters/subscription.filter';

// External Modules
import { CommunicationModule } from '../communication/communication.module';
import { CacheModule } from '../cache/cache.module';
import { LoggerModule } from '../logger/logger.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [
    ConfigModule,
    CommunicationModule,
    CacheModule,
    LoggerModule,
    forwardRef(() => RealtimeModule),
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        
        return {
          redis: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
          },
          defaultJobOptions: {
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 50,      // Keep last 50 failed jobs
            attempts: 3,           // Retry failed jobs 3 times
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
          settings: {
            stalledInterval: 30000,
            maxStalledCount: 1,
          },
        };
      },
      inject: [ConfigService],
    }),
    
    // Register individual queues with specific configurations
    BullModule.registerQueue(
      { 
        name: 'email',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 25,
          attempts: 3,
        },
      },
      { 
        name: 'reports',
        defaultJobOptions: {
          removeOnComplete: 20,
          removeOnFail: 10,
          attempts: 2,
          timeout: 300000, // 5 minutes
        },
      },
      { 
        name: 'sync',
        defaultJobOptions: {
          removeOnComplete: 30,
          removeOnFail: 15,
          attempts: 5,
          timeout: 600000, // 10 minutes
        },
      },
      { 
        name: 'notifications',
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
        },
      },
      { 
        name: 'analytics',
        defaultJobOptions: {
          removeOnComplete: 200,
          removeOnFail: 100,
          attempts: 3,
          timeout: 300000, // 5 minutes
        },
      },
    ),
  ],
  providers: [
    // Core Services
    QueueService,
    QueueManagementService,
    JobManagementService,
    QueueAnalyticsService,
    
    // Processors
    EmailProcessor,
    ReportProcessor,
    SyncProcessor,
    NotificationProcessor,
    AnalyticsProcessor,
    
    // GraphQL Resolvers
    QueueResolver,
    JobResolver,
    QueueFieldResolver,
    JobFieldResolver,
    
    // DataLoaders and Context
    QueueDataLoader,
    QueueContextProvider,
    
    // Guards
    QueuePermissionGuard,
    QueueTenantGuard,
    QueueRateLimitGuard,
    QueueValidationGuard,
    QueueHealthGuard,
    QueueMaintenanceGuard,
    
    // Interceptors
    QueueAuditInterceptor,
    QueueCacheInterceptor,
    QueueMonitoringInterceptor,
    QueueRetryInterceptor,
    QueueTimeoutInterceptor,
    QueueTransformInterceptor,
    
    // Plugins and Filters
    QueueComplexityPlugin,
    SubscriptionFilter,
    
    // GraphQL PubSub
    {
      provide: PubSub,
      useValue: new PubSub(),
    },
  ],
  exports: [
    // Core Services
    QueueService,
    QueueManagementService,
    JobManagementService,
    QueueAnalyticsService,
    
    // DataLoaders and Context
    QueueDataLoader,
    QueueContextProvider,
    
    // Export guards and interceptors for use in other modules
    QueuePermissionGuard,
    QueueTenantGuard,
    QueueRateLimitGuard,
    QueueValidationGuard,
    QueueAuditInterceptor,
    QueueCacheInterceptor,
    QueueMonitoringInterceptor,
    
    // Plugins and Filters
    QueueComplexityPlugin,
    SubscriptionFilter,
  ],
})
export class QueueModule {}