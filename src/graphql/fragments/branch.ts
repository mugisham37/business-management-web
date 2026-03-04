import { gql } from '@apollo/client';

export const BRANCH_FRAGMENT = gql`
  fragment BranchFragment on BranchType {
    id
    name
    code
    organizationId
    managerId
    address
    createdAt
    updatedAt
  }
`;
