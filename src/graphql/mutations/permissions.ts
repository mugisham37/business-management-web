import { gql } from '@apollo/client';

// Permission Mutations

export const GRANT_PERMISSIONS = gql`
  mutation GrantPermissions($input: GrantPermissionsInput!) {
    grantPermissions(input: $input)
  }
`;

export const REVOKE_PERMISSIONS = gql`
  mutation RevokePermissions($input: RevokePermissionsInput!) {
    revokePermissions(input: $input)
  }
`;
