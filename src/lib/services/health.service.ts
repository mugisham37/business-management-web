/**
 * HealthService
 * 
 * Handles health check operations for monitoring backend service status.
 * 
 * Features:
 * - System health check
 * - Database status
 * - Cache status
 * - Queue status
 * - Response transformation
 * - Centralized error handling
 * 
 * Requirements: 4.7, 4.9, 4.10
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { HEALTH } from '@/graphql/queries/health';
import { errorHandler } from '@/lib/errors/error-handler';

/**
 * Response types for health check operations
 */
export interface ComponentHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  message?: string;
}

export interface HealthCheckResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  database: ComponentHealth;
  cache: ComponentHealth;
  queue: ComponentHealth;
}

/**
 * HealthService class
 * Provides methods for health check operations
 */
export class HealthService {
  constructor(
    private apolloClient: ApolloClient<NormalizedCacheObject>
  ) {}

  /**
   * Check backend service health
   * Fetches health status of all backend components
   * 
   * @returns Health check response with component statuses
   * @throws AppError on failure
   * 
   * Requirements: 4.7, 4.9, 4.10
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: HEALTH,
        fetchPolicy: 'network-only', // Always fetch fresh health status
      });


      if (!data?.health) {
        throw new Error('No health data returned');
      }

      // Transform response (Requirements: 4.9)
      return this.transformHealthResponse(data.health);
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Check if backend is healthy
   * Convenience method that returns boolean
   * 
   * @returns True if all components are healthy, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'HEALTHY';
    } catch {
      // If health check fails, consider backend unhealthy
      return false;
    }
  }

  /**
   * Transform health response to application format
   * Requirements: 4.9
   */
  private transformHealthResponse(data: Record<string, unknown>): HealthCheckResponse {
    const database = data.database as Record<string, unknown>;
    const cache = data.cache as Record<string, unknown>;
    const queue = data.queue as Record<string, unknown>;
    return {
      status: data.status as HealthCheckResponse['status'],
      timestamp: data.timestamp as string,
      database: {
        status: database.status as ComponentHealth['status'],
        message: database.message as string | undefined,
      },
      cache: {
        status: cache.status as ComponentHealth['status'],
        message: cache.message as string | undefined,
      },
      queue: {
        status: queue.status as ComponentHealth['status'],
        message: queue.message as string | undefined,
      },
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let healthServiceInstance: HealthService | null = null;

export const getHealthService = async (): Promise<HealthService> => {
  if (!healthServiceInstance) {
    const { apolloClient } = await import('@/lib/api/apollo-client');
    healthServiceInstance = new HealthService(apolloClient);
  }
  return healthServiceInstance;
};
