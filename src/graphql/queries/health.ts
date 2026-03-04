import { gql } from '@apollo/client';

// Health Check Query

export const HEALTH = gql`
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
