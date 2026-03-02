import { gql } from '@apollo/client';
import { BRANCH_FRAGMENT } from '../fragments';

export const GET_BRANCHES_QUERY = gql`
  ${BRANCH_FRAGMENT}
  query GetBranches($organizationId: UUID!, $filter: BranchFilterInput) {
    branches(organizationId: $organizationId, filter: $filter) {
      ...BranchFragment
    }
  }
`;
