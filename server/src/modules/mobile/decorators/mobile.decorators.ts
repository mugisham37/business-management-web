import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to get device information from GraphQL context
 */
export const DeviceInfo = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    const deviceInfo = {
      deviceId: request.headers['x-device-id'] || 'unknown',
      deviceType: request.headers['x-device-type'] || 'unknown',
      appVersion: request.headers['x-app-version'] || 'unknown',
      osVersion: request.headers['x-os-version'] || 'unknown',
      platform: request.headers['x-platform'] || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
    };

    return data ? deviceInfo[data as keyof typeof deviceInfo] : deviceInfo;
  },
);

/**
 * Decorator to get connection information from GraphQL context
 */
export const ConnectionInfo = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    const connectionInfo = {
      type: request.headers['x-connection-type'] || 'unknown',
      quality: request.headers['x-connection-quality'] || 'unknown',
      bandwidth: request.headers['x-bandwidth'] || 'unknown',
    };

    return data ? connectionInfo[data as keyof typeof connectionInfo] : connectionInfo;
  },
);

/**
 * Decorator to get battery status from GraphQL context
 */
export const BatteryStatus = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    const batteryStatus = {
      level: parseFloat(request.headers['x-battery-level'] || '100'),
      charging: request.headers['x-battery-charging'] === 'true',
      lowPowerMode: request.headers['x-low-power-mode'] === 'true',
    };

    return data ? batteryStatus[data as keyof typeof batteryStatus] : batteryStatus;
  },
);

/**
 * Decorator to mark a resolver as mobile-optimized
 * This can be used for analytics and monitoring
 */
export const MobileOptimized = (options?: {
  compressionEnabled?: boolean;
  progressiveLoading?: boolean;
  cacheStrategy?: 'aggressive' | 'moderate' | 'conservative';
}) => SetMetadata('mobile-optimized', options || {});

/**
 * Decorator to require specific device capabilities
 */
export const RequireDeviceCapability = (...capabilities: string[]) =>
  SetMetadata('required-capabilities', capabilities);

/**
 * Decorator to mark a resolver as offline-capable
 */
export const OfflineCapable = (options?: {
  queueable?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
}) => SetMetadata('offline-capable', options || { queueable: true });

/**
 * Decorator to set data usage priority
 */
export const DataUsagePriority = (priority: 'critical' | 'high' | 'medium' | 'low') =>
  SetMetadata('data-usage-priority', priority);

/**
 * Decorator to set battery impact level
 */
export const BatteryImpact = (impact: 'high' | 'medium' | 'low') =>
  SetMetadata('battery-impact', impact);

/**
 * Decorator to enable automatic payload compression
 */
export const CompressPayload = (options?: {
  algorithm?: 'gzip' | 'deflate' | 'brotli';
  level?: number;
  threshold?: number;
}) => SetMetadata('compress-payload', options || { algorithm: 'gzip', level: 6 });

/**
 * Decorator to enable progressive loading
 */
export const ProgressiveLoad = (options?: {
  pageSize?: number;
  preloadNext?: boolean;
  cachePages?: boolean;
}) => SetMetadata('progressive-load', options || { pageSize: 20, preloadNext: true });

/**
 * Decorator to mark a mutation as sync-schedulable
 */
export const SyncSchedulable = (options?: {
  priority?: 'critical' | 'high' | 'medium' | 'low';
  deferrable?: boolean;
  estimatedDataUsage?: number;
}) => SetMetadata('sync-schedulable', options || { priority: 'medium', deferrable: true });
