import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragments';

export const GET_USERS_QUERY = gql`
  ${USER_FRAGMENT}
  query GetUsers($filter: UserFilterInput, $limit: Int, $offset: Int) {
    users(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        ...UserFragment
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
      }
    }
  }
`;

export const GET_USER_BY_ID_QUERY = gql`
  ${USER_FRAGMENT}
  query GetUserById($id: UUID!) {
    user(id: $id) {
      ...UserFragment
    }
  }
`;
