import { gql } from '@apollo/client';
import { BRANCH_FRAGMENT } from '../fragments';

export const CREATE_BRANCH = gql`
  ${BRANCH_FRAGMENT}
  mutation CreateBranch($input: CreateBranchInput!) {
    createBranch(input: $input) {
      ...BranchFragment
    }
  }
`;

export const UPDATE_BRANCH = gql`
  ${BRANCH_FRAGMENT}
  mutation UpdateBranch($branchId: String!, $input: UpdateBranchInput!) {
    updateBranch(branchId: $branchId, input: $input) {
      ...BranchFragment
    }
  }
`;

export const ASSIGN_BRANCH_MANAGER = gql`
  mutation AssignBranchManager($branchId: String!, $managerId: String!) {
    assignBranchManager(branchId: $branchId, managerId: $managerId)
  }
`;
