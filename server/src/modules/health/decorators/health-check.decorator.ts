import { SetMetadata, applyDecorators, UseInterceptors } from '@nestjs/common';
import { HealthLoggingInterceptor } from '../interceptors/health-logging.interceptor';
import { HealthMetricsInterceptor } from '../interceptors/health-metrics.interceptor';

export const HEALTH_CHECK_KEY = 'health_check';
export const HEALTH_MONITOR_KEY = 'health_monitor';
export const HEALTH_CRITICAL_KEY = 'health_critical';

export interface HealthCheckOptions {
  name?: string;
  description?: string;
  timeout?: number;
  retries?: number;
  critical?: boolean;
  tags?: string[];
}

/**
 * Decorator to mark a method as a health check
 */
export const HealthCheck = (options: HealthCheckOptions = {}) => {
  return applyDecorators(
    SetMetadata(HEALTH_CHECK_KEY, {
      name: options.name,
      description: options.description,
      timeout: options.timeout || 5000,
      retries: options.retries || 3,
      critical: options.critical || false,
      tags: options.tags || [],
    }),
    UseInterceptors(HealthLoggingInterceptor, HealthMetricsInterceptor),
  );
};

/**
 * Decorator to mark a method as monitored for health metrics
 */
export const HealthMonitor = (name?: string) => {
  return applyDecorators(
    SetMetadata(HEALTH_MONITOR_KEY, { name }),
    UseInterceptors(HealthMetricsInterceptor),
  );
};

/**
 * Decorator to mark a health check as critical
 */
export const CriticalHealthCheck = (options: Omit<HealthCheckOptions, 'critical'> = {}) => {
  return HealthCheck({ ...options, critical: true });
};

/**
 * Decorator for health check field resolvers
 */
export const HealthCheckField = (description?: string) => {
  return applyDecorators(
    SetMetadata('health_field', { description }),
    UseInterceptors(HealthMetricsInterceptor),
  );
};

/**
 * Decorator to exclude a method from health monitoring
 */
export const ExcludeFromHealthMonitoring = () => {
  return SetMetadata('exclude_health_monitoring', true);
};

/**
 * Decorator to set health check priority
 */
export const HealthCheckPriority = (priority: 'low' | 'medium' | 'high' | 'critical') => {
  const priorityMap = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  
  return SetMetadata('health_priority', priorityMap[priority]);
};

/**
 * Decorator to set health check interval
 */
export const HealthCheckInterval = (intervalSeconds: number) => {
  return SetMetadata('health_interval', intervalSeconds);
};

/**
 * Decorator to add tags to health checks
 */
export const HealthCheckTags = (...tags: string[]) => {
  return SetMetadata('health_tags', tags);
};

/**
 * Decorator to set health check dependencies
 */
export const HealthCheckDependencies = (...dependencies: string[]) => {
  return SetMetadata('health_dependencies', dependencies);
};

/**
 * Decorator for async health checks
 */
export const AsyncHealthCheck = (options: HealthCheckOptions & { asyncTimeout?: number } = {}) => {
  return applyDecorators(
    HealthCheck(options),
    SetMetadata('async_health_check', {
      asyncTimeout: options.asyncTimeout || 10000,
    }),
  );
};

/**
 * Decorator to mark a health check as requiring authentication
 */
export const AuthenticatedHealthCheck = (options: HealthCheckOptions = {}) => {
  return applyDecorators(
    HealthCheck(options),
    SetMetadata('requires_auth', true),
  );
};

/**
 * Decorator to mark a health check as public (no authentication required)
 */
export const PublicHealthCheck = (options: HealthCheckOptions = {}) => {
  return applyDecorators(
    HealthCheck(options),
    SetMetadata('public_health_check', true),
  );
};

/**
 * Decorator to set custom health check metadata
 */
export const HealthCheckMetadata = (metadata: Record<string, any>) => {
  return SetMetadata('health_metadata', metadata);
};

/**
 * Decorator for health checks that should run in a specific environment
 */
export const EnvironmentHealthCheck = (environments: string[], options: HealthCheckOptions = {}) => {
  return applyDecorators(
    HealthCheck(options),
    SetMetadata('health_environments', environments),
  );
};

/**
 * Decorator for health checks that should be grouped together
 */
export const HealthCheckGroup = (groupName: string, options: HealthCheckOptions = {}) => {
  return applyDecorators(
    HealthCheck(options),
    SetMetadata('health_group', groupName),
  );
};