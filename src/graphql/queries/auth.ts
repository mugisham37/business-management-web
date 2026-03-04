import { gql } from '@apollo/client';

// Session Queries

export const GET_ACTIVE_SESSIONS = gql`
  query GetActiveSessions {
    getActiveSessions {
      id
      userId
      userAgent
      ipAddress
      createdAt
      expiresAt
    }
  }
`;
