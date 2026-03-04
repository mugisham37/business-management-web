import { HEALTH_CHECK_QUERY } from '@/graphql/queries/health';

/**
 * Health Check Response Type
 * Matches the GraphQL schema HealthCheckResponse
 */
export interface HealthCheckResponse {
  status: string;
  database: {
    status: string;
    message?: string;
  };
  cache: {
    status: string;
    message?: string;
  };
  queue: {
    status: string;
    message?: string;
  };
  timestamp: string;
}

/**
 * Health Check Result
 * Simplified result for connection monitoring
 */
export interface HealthCheckResult {
  isHealthy: boolean;
  status: 'ok' | 'error' | 'degraded';
  message: string;
  details?: HealthCheckResponse;
  error?: string;
}

/**
 * Check Backend Health
 * 
 * Queries the GraphQL health endpoint to verify backend connectivity.
 * Uses a short timeout to fail fast if backend is unavailable.
 * 
 * @param client - Apollo Client instance
 * @param timeoutMs - Timeout in milliseconds (default: 5000ms)
 * @returns Health check result with status and details
 * 
 * Requirements: 2.1
 */
export async function checkBackendHealth(
  client: any,
  timeoutMs: number = 5000
): Promise<HealthCheckResult> {
  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeoutMs);
    });

    // Execute health check query with timeout
    const queryPromise = client.query({
      query: HEALTH_CHECK_QUERY,
      fetchPolicy: 'network-only', // Always fetch fresh data
      errorPolicy: 'all', // Return both data and errors
    });

    const result = await Promise.race([queryPromise, timeoutPromise]);

    // Check if we got data
    if (!result.data?.health) {
      return {
        isHealthy: false,
        status: 'error',
        message: 'Backend returned invalid response',
        error: 'No health data received',
      };
    }

    const health = result.data.health;

    // Determine overall health status
    const isHealthy = health.status === 'ok';
    const isDegraded = 
      health.database.status !== 'up' ||
      health.cache.status !== 'up' ||
      health.queue.status !== 'up';

    return {
      isHealthy,
      status: isHealthy ? (isDegraded ? 'degraded' : 'ok') : 'error',
      message: isHealthy 
        ? 'Backend is healthy and ready'
        : 'Backend is experiencing issues',
      details: health,
    };
  } catch (error) {
    // Handle network errors, timeouts, and GraphQL errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      isHealthy: false,
      status: 'error',
      message: 'Cannot connect to backend',
      error: errorMessage,
    };
  }
}
