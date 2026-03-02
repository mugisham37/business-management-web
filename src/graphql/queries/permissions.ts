import { gql } from '@apollo/client';
import { PERMISSION_FRAGMENT } from '../fragments';

export const GET_PERMISSIONS_QUERY = gql`
  ${PERMISSION_FRAGMENT}
  query GetPermissions($filter: PermissionFilterInput) {
    permissions(filter: $filter) {
      ...PermissionFragment
    }
  }
`;
