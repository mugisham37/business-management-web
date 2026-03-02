import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    firstName
    lastName
    phone
    status
    organizationId
    branchId
    departmentId
    hierarchyLevel
    permissions {
      ...PermissionFragment
    }
    createdAt
    updatedAt
  }
`;
