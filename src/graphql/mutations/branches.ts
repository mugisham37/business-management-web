import { gql } from '@apollo/client';
import { BRANCH_FRAGMENT } from '../fragments';

export const CREATE_BRANCH_MUTATION = gql`
  ${BRANCH_FRAGMENT}
  mutation CreateBranch($input: CreateBranchInput!) {
    createBranch(input: $input) {
      ...BranchFragment
    }
  }
`;

export const UPDATE_BRANCH_MUTATION = gql`
  ${BRANCH_FRAGMENT}
  mutation UpdateBranch($id: UUID!, $input: UpdateBranchInput!) {
    updateBranch(id: $id, input: $input) {
      ...BranchFragment
    }
  }
`;

export const DELETE_BRANCH_MUTATION = gql`
  mutation DeleteBranch($id: UUID!) {
    deleteBranch(id: $id) {
      success
    }
  }
`;
