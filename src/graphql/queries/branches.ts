import { gql } from '@apollo/client';
import { BRANCH_FRAGMENT } from '../fragments';

// Branch Queries

/**
 * Get all branches
 * Note: Backend doesn't support pagination yet, so pagination is handled client-side
 */
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
