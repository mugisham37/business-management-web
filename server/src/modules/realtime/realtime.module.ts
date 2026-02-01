import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { RealtimeService } from './services/realtime.service';
import { ConnectionManagerService } from './services/connection-manager.service';
import { NotificationService } from './services/notification.service';
import { NotificationWebhookService } from './services/notification-webhook.service';
import { LiveInventoryService } from './services/live-inventory.service';
import { LiveSalesDashboardService } from './services/live-sales-dashboard.service';
import { LiveCustomerActivityService } from './services/live-customer-activity.service';
import { LiveAnalyticsService } from './services/live-analytics.service';
import { AuthRealtimeEventService } from './services/auth-realtime-event.service';
import { CrossDeviceNotificationService } from './services/cross-device-notification.service';
import { SuspiciousActivityDetectorService } from './services/suspicious-activity-detector.service';
import { CommunicationIntegrationService } from '../communication/services/communication-integration.service';
import { SlackIntegrationService } from '../communication/services/slack-integration.service';
import { TeamsIntegrationService } from '../communication/services/teams-integration.service';
import { EmailNotificationService } from '../communication/services/email-notification.service';
import { SMSNotificationService } from '../communication/services/sms-notification.service';
import { LiveDataResolver } from './resolvers/live-data.resolver';
import { RealtimeResolver } from './resolvers/realtime.resolver';
import { NotificationResolver } from './resolvers/notification.resolver';
import { CommunicationIntegrationResolver } from './resolvers/communication-integration.resolver';
import { CommunicationModule } from '../communication/communication.module';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { LoggerModule } from '../logger/logger.module';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../queue/queue.module';
import { CacheModule } from '../cache/cache.module';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';

@Module({
  imports: [
    CommunicationModule,
    AuthModule,
    TenantModule,
    LoggerModule,
    DatabaseModule,
    forwardRef(() => QueueModule),
    CacheModule,
    GraphQLCommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    RealtimeGateway,
    RealtimeService,
    ConnectionManagerService,
    NotificationService,
    NotificationWebhookService,
    LiveInventoryService,
    LiveSalesDashboardService,
    LiveCustomerActivityService,
    LiveAnalyticsService,
    AuthRealtimeEventService,
    CrossDeviceNotificationService,
    SuspiciousActivityDetectorService,
    LiveDataResolver,
    RealtimeResolver,
    NotificationResolver,
    CommunicationIntegrationResolver,
  ],
  exports: [
    RealtimeService,
    RealtimeGateway,
    ConnectionManagerService,
    NotificationService,
    NotificationWebhookService,
    LiveInventoryService,
    LiveSalesDashboardService,
    LiveCustomerActivityService,
    LiveAnalyticsService,
    AuthRealtimeEventService,
    CrossDeviceNotificationService,
    SuspiciousActivityDetectorService,
  ],
})
export class RealtimeModule {}
