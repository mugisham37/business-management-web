import { gql } from '@apollo/client';

export const BRANCH_FRAGMENT = gql`
  fragment BranchFragment on Branch {
    id
    name
    code
    organizationId
    address
    phone
    status
    createdAt
    updatedAt
  }
`;
