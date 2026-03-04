import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFragment on UserManagementType {
    id
    email
    firstName
    lastName
    hierarchyLevel
    organizationId
    branchId
    departmentId
    status
    createdAt
    updatedAt
  }
`;
