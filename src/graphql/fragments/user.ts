import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFragment on AuthUserType {
    id
    email
    firstName
    lastName
    hierarchyLevel
    organizationId
  }
`;
