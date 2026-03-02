import { gql } from '@apollo/client';
import { ORGANIZATION_FRAGMENT } from '../fragments';

export const GET_ORGANIZATIONS_QUERY = gql`
  ${ORGANIZATION_FRAGMENT}
  query GetOrganizations($filter: OrganizationFilterInput) {
    organizations(filter: $filter) {
      ...OrganizationFragment
    }
  }
`;
