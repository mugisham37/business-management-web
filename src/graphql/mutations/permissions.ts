import { gql } from '@apollo/client';
import { PERMISSION_FRAGMENT } from '../fragments';

export const CREATE_PERMISSION_MUTATION = gql`
  ${PERMISSION_FRAGMENT}
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      ...PermissionFragment
    }
  }
`;

export const UPDATE_PERMISSION_MUTATION = gql`
  ${PERMISSION_FRAGMENT}
  mutation UpdatePermission($id: UUID!, $input: UpdatePermissionInput!) {
    updatePermission(id: $id, input: $input) {
      ...PermissionFragment
    }
  }
`;

export const DELETE_PERMISSION_MUTATION = gql`
  mutation DeletePermission($id: UUID!) {
    deletePermission(id: $id) {
      success
    }
  }
`;
