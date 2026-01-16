import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Resolvers
import { MobileApiResolver } from './resolvers/mobile-api.resolver';
import { PushNotificationResolver } from './resolvers/push-notification.resolver';
import { BiometricAuthResolver } from './resolvers/biometric-auth.resolver';
import { LocationResolver } from './resolvers/location.resolver';
import { CameraResolver } from './resolvers/camera.resolver';
import { BatteryOptimizationResolver } from './resolvers/battery-optimization.resolver';
import { DataUsageResolver } from './resolvers/data-usage.resolver';
import { SyncSchedulerResolver } from './resolvers/sync-scheduler.resolver';
import { OfflineSyncResolver } from './resolvers/offline-sync.resolver';

// Services
import { MobileOptimizationService } from './services/mobile-optimization.service';
import { PayloadCompressionService } from './services/payload-compression.service';
import { ProgressiveLoadingService } from './services/progressive-loading.service';
import { OfflineDataSyncService } from './services/offline-data-sync.service';
import { PushNotificationService } from './services/push-notification.service';
import { BiometricAuthService } from './services/biometric-auth.service';
import { LocationBasedService } from './services/location-based.service';
import { CameraIntegrationService } from './services/camera-integration.service';
import { BatteryOptimizationService } from './services/battery-optimization.service';
import { DataUsageOptimizationService } from './services/data-usage-optimization.service';
import { IntelligentSyncSchedulerService } from './services/intelligent-sync-scheduler.service';

// Modules
import { CacheModule } from '../cache/cache.module';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../queue/queue.module';
import { GraphQLCommonModule } from '../../common/graphql/graphql-common.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    DatabaseModule,
    QueueModule,
    GraphQLCommonModule,
  ],
  providers: [
    // Resolvers
    MobileApiResolver,
    PushNotificationResolver,
    BiometricAuthResolver,
    LocationResolver,
    CameraResolver,
    BatteryOptimizationResolver,
    DataUsageResolver,
    SyncSchedulerResolver,
    OfflineSyncResolver,
    
    // Services
    MobileOptimizationService,
    PayloadCompressionService,
    ProgressiveLoadingService,
    OfflineDataSyncService,
    PushNotificationService,
    BiometricAuthService,
    LocationBasedService,
    CameraIntegrationService,
    BatteryOptimizationService,
    DataUsageOptimizationService,
    IntelligentSyncSchedulerService,
  ],
  exports: [
    // Export all services for use in other modules
    MobileOptimizationService,
    PayloadCompressionService,
    ProgressiveLoadingService,
    OfflineDataSyncService,
    PushNotificationService,
    BiometricAuthService,
    LocationBasedService,
    CameraIntegrationService,
    BatteryOptimizationService,
    DataUsageOptimizationService,
    IntelligentSyncSchedulerService,
  ],
})
export class MobileModule {}