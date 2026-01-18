import { Module, Global } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

// Indicators
import { DatabaseHealthIndicator } from './indicators/database-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { MemoryHealthIndicator } from './indicators/memory-health.indicator';
import { DiskHealthIndicator } from './indicators/disk-health.indicator';
import { QueueHealthIndicator } from './indicators/queue-health.indicator';
import { ExternalServiceHealthIndicator } from './indicators/external-service-health.indicator';
import { GraphQLHealthIndicator } from './indicators/graphql-health.indicator';

// Services
import { HealthService } from './services/health.service';
import { HealthMonitoringService } from './services/health-monitoring.service';
import { HealthAlertService } from './services/health-alert.service';
import { HealthHistoryService } from './services/health-history.service';
import { HealthMetricsService } from './services/health-metrics.service';
import { HealthNotificationService } from './services/health-notification.service';

// Resolvers
import { HealthResolver } from './resolvers/health.resolver';
import { HealthMonitoringResolver } from './resolvers/health-monitoring.resolver';
import { HealthAlertResolver } from './resolvers/health-alert.resolver';
import { HealthHistoryResolver } from './resolvers/health-history.resolver';
import { HealthMetricsResolver } from './resolvers/health-metrics.resolver';
import { HealthDashboardResolver } from './resolvers/health-dashboard.resolver';

// Guards
import { HealthAccessGuard } from './guards/health-access.guard';
import { HealthAdminGuard } from './guards/health-admin.guard';

// Interceptors
import { HealthLoggingInterceptor } from './interceptors/health-logging.interceptor';
import { HealthMetricsInterceptor } from './interceptors/health-metrics.interceptor';

// Decorators
import { HealthCheckDecorator } from './decorators/health-check.decorator';

// Processors
import { HealthCheckProcessor } from './processors/health-check.processor';
import { HealthAlertProcessor } from './processors/health-alert.processor';

@Global()
@Module({
  imports: [
    TerminusModule,
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    // Indicators
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
    QueueHealthIndicator,
    ExternalServiceHealthIndicator,
    GraphQLHealthIndicator,
    
    // Services
    HealthService,
    HealthMonitoringService,
    HealthAlertService,
    HealthHistoryService,
    HealthMetricsService,
    HealthNotificationService,
    
    // Resolvers
    HealthResolver,
    HealthMonitoringResolver,
    HealthAlertResolver,
    HealthHistoryResolver,
    HealthMetricsResolver,
    HealthDashboardResolver,
    
    // Guards
    HealthAccessGuard,
    HealthAdminGuard,
    
    // Interceptors
    HealthLoggingInterceptor,
    HealthMetricsInterceptor,
    
    // Decorators
    HealthCheckDecorator,
    
    // Processors
    HealthCheckProcessor,
    HealthAlertProcessor,
  ],
  exports: [
    HealthService,
    HealthMonitoringService,
    HealthAlertService,
    HealthHistoryService,
    HealthMetricsService,
    HealthNotificationService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
    QueueHealthIndicator,
    ExternalServiceHealthIndicator,
    GraphQLHealthIndicator,
    HealthAccessGuard,
    HealthAdminGuard,
    HealthLoggingInterceptor,
    HealthMetricsInterceptor,
  ],
})
export class HealthModule {}