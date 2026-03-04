import { gql } from '@apollo/client';
import { BRANCH_FRAGMENT } from '../fragments';

// Branch Queries

export const GET_BRANCHES = gql`
  ${BRANCH_FRAGMENT}
  query GetBranches {
    getBranches {
      branches {
        ...BranchFragment
      }
      total
    }
  }
`;
