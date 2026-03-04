import { gql } from '@apollo/client';

// Health Check Query

export const HEALTH_CHECK_QUERY = gql`
  query Health {
    health {
      status
      timestamp
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
    }
  }
`;

// Alias for backward compatibility
export const HEALTH = HEALTH_CHECK_QUERY;
