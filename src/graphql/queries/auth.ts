import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragments';

export const VALIDATE_SESSION_QUERY = gql`
  ${USER_FRAGMENT}
  query ValidateSession {
    validateSession {
      isValid
      user {
        ...UserFragment
      }
    }
  }
`;

export const GET_ACTIVE_SESSIONS_QUERY = gql`
  query GetActiveSessions {
    activeSessions {
      id
      deviceInfo
      ipAddress
      lastActivity
      createdAt
    }
  }
`;
