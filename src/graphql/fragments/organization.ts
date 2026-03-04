import { gql } from '@apollo/client';

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationFragment on OrganizationType {
    id
    name
    type
    status
    ownerId
    createdAt
    updatedAt
  }
`;
