import { gql } from '@apollo/client';

/**
 * Health Check Query
 * 
 * Queries the backend health endpoint to verify:
 * - Overall system status
 * - Database connectivity
 * - Cache (Redis) availability
 * - Queue (Redis) availability
 * 
 * Used for startup health checks and connection monitoring.
 * 
 * Requirements: 2.1
 */
export const HEALTH_CHECK_QUERY = gql`
  query HealthCheck {
    health {
      status
      database {
        status
        message
      }
      cache {
        status
        message
      }
      queue {
        status
        message
      }
      timestamp
    }
  }
`;
