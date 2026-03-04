import { gql } from '@apollo/client';
import { ORGANIZATION_FRAGMENT } from '../fragments';

// Organization Mutations

export const UPDATE_ORGANIZATION = gql`
  ${ORGANIZATION_FRAGMENT}
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      ...OrganizationFragment
    }
  }
`;
