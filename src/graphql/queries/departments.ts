import { gql } from '@apollo/client';
import { DEPARTMENT_FRAGMENT } from '../fragments';

// Department Queries

export const GET_DEPARTMENTS = gql`
  ${DEPARTMENT_FRAGMENT}
  query GetDepartments {
    getDepartments {
      departments {
        ...DepartmentFragment
      }
      total
    }
  }
`;
