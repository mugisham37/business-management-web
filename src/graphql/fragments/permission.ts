import { gql } from '@apollo/client';

export const PERMISSION_FRAGMENT = gql`
  fragment PermissionFragment on Permission {
    id
    name
    description
    module
    action
    hierarchyLevel
    createdAt
    updatedAt
  }
`;
