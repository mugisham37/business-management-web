import { gql } from '@apollo/client';
import { ORGANIZATION_FRAGMENT } from '../fragments';

export const CREATE_ORGANIZATION_MUTATION = gql`
  ${ORGANIZATION_FRAGMENT}
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      ...OrganizationFragment
    }
  }
`;
