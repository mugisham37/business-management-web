import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragments';

export const CREATE_MANAGER_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation CreateManager($input: CreateManagerInput!) {
    createManager(input: $input) {
      ...UserFragment
    }
  }
`;

export const CREATE_WORKER_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation CreateWorker($input: CreateWorkerInput!) {
    createWorker(input: $input) {
      ...UserFragment
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation UpdateUser($id: UUID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFragment
    }
  }
`;
