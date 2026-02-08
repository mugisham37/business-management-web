import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to set custom rate limit for a route
 * @param limit - Maximum number of requests
 * @param ttl - Time window in seconds
 */
export const Throttle = (limit: number, ttl: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      SetMetadata('throttle_limit', limit)(target, propertyKey!, descriptor);
      SetMetadata('throttle_ttl', ttl)(target, propertyKey!, descriptor);
    }
    return descriptor;
  };
};

/**
 * Decorator to skip rate limiting for a route
 */
export const SkipThrottle = () => SetMetadata('skipThrottle', true);
