import { gql } from '@apollo/client';
import { DEPARTMENT_FRAGMENT } from '../fragments';

export const GET_DEPARTMENTS_QUERY = gql`
  ${DEPARTMENT_FRAGMENT}
  query GetDepartments($branchId: UUID!, $filter: DepartmentFilterInput) {
    departments(branchId: $branchId, filter: $filter) {
      ...DepartmentFragment
    }
  }
`;
