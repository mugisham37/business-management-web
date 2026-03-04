import { gql } from '@apollo/client';
import { ORGANIZATION_FRAGMENT } from '../fragments';

// Organization Queries

export const GET_ORGANIZATION = gql`
  ${ORGANIZATION_FRAGMENT}
  query GetOrganization {
    getOrganization {
      ...OrganizationFragment
    }
  }
`;
