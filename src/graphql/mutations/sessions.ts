import { gql } from '@apollo/client';

// Session Mutations

export const REVOKE_SESSION = gql`
  mutation RevokeSession($input: RevokeSessionInput!) {
    revokeSession(input: $input)
  }
`;

export const REVOKE_ALL_SESSIONS = gql`
  mutation RevokeAllSessions {
    revokeAllSessions
  }
`;
