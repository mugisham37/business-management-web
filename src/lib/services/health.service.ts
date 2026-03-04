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

import { ApolloClient } from '@apollo/client';
import { HEALTH } from '@/graphql/queries/health';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

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
    private apolloClient: ApolloClient
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
    } catch (error) {
      // If health check fails, consider backend unhealthy
      return false;
    }
  }

  /**
   * Transform health response to application format
   * Requirements: 4.9
   */
  private transformHealthResponse(data: any): HealthCheckResponse {
    return {
      status: data.status,
      timestamp: data.timestamp,
      database: {
        status: data.database.status,
        message: data.database.message,
      },
      cache: {
        status: data.cache.status,
        message: data.cache.message,
      },
      queue: {
        status: data.queue.status,
        message: data.queue.message,
      },
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let healthServiceInstance: HealthService | null = null;

export const getHealthService = (): HealthService => {
  if (!healthServiceInstance) {
    const { apolloClient } = require('@/lib/api/apollo-client');
    healthServiceInstance = new HealthService(apolloClient);
  }
  return healthServiceInstance;
};

export const healthService = getHealthService();
