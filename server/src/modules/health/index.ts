// Main module
export { HealthModule } from './health.module';

// Services
export { HealthService } from './services/health.service';
export { HealthMonitoringService } from './services/health-monitoring.service';
export { HealthAlertService } from './services/health-alert.service';
export { HealthHistoryService } from './services/health-history.service';
export { HealthMetricsService } from './services/health-metrics.service';
export { HealthNotificationService } from './services/health-notification.service';

// Indicators
export { DatabaseHealthIndicator } from './indicators/database-health.indicator';
export { RedisHealthIndicator } from './indicators/redis-health.indicator';
export { MemoryHealthIndicator } from './indicators/memory-health.indicator';
export { DiskHealthIndicator } from './indicators/disk-health.indicator';
export { QueueHealthIndicator } from './indicators/queue-health.indicator';
export { ExternalServiceHealthIndicator } from './indicators/external-service-health.indicator';
export { GraphQLHealthIndicator } from './indicators/graphql-health.indicator';

// Resolvers
export { HealthResolver } from './resolvers/health.resolver';
export { HealthMonitoringResolver } from './resolvers/health-monitoring.resolver';
export { HealthAlertResolver } from './resolvers/health-alert.resolver';
export { HealthHistoryResolver } from './resolvers/health-history.resolver';
export { HealthMetricsResolver } from './resolvers/health-metrics.resolver';
export { HealthDashboardResolver } from './resolvers/health-dashboard.resolver';

// Guards
export { HealthAccessGuard } from './guards/health-access.guard';
export { HealthAdminGuard } from './guards/health-admin.guard';

// Interceptors
export { HealthLoggingInterceptor } from './interceptors/health-logging.interceptor';
export { HealthMetricsInterceptor } from './interceptors/health-metrics.interceptor';

// Decorators
export * from './decorators/health-check.decorator';

// Processors
export { HealthCheckProcessor } from './processors/health-check.processor';

// Types (explicitly import to avoid conflict with HealthCheck decorator)
export { HealthStatus, HealthCheckType, HealthSeverity, HealthMetric, HealthDetails, HealthCheck as HealthCheckClass, SystemHealth, HealthHistory, HealthTrend, HealthAlert, HealthDashboard } from './types/health.types';

// Inputs
export * from './inputs/health.input';