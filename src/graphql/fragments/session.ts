import { gql } from '@apollo/client';

export const SESSION_FRAGMENT = gql`
  fragment SessionFragment on SessionType {
    id
    userId
    userAgent
    ipAddress
    createdAt
    expiresAt
  }
`;
