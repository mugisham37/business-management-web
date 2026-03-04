import { gql } from '@apollo/client';
import { DEPARTMENT_FRAGMENT } from '../fragments';

// Department Queries

/**
 * Get all departments
 * Note: Backend doesn't support pagination yet, so pagination is handled client-side
 */
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
