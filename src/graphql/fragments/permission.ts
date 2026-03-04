import { gql } from '@apollo/client';

export const PERMISSION_FRAGMENT = gql`
  fragment PermissionFragment on ModulePermissionType {
    module
    actions
  }
`;
