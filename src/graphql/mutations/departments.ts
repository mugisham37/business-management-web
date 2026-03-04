import { gql } from '@apollo/client';
import { DEPARTMENT_FRAGMENT } from '../fragments';

export const CREATE_DEPARTMENT = gql`
  ${DEPARTMENT_FRAGMENT}
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      ...DepartmentFragment
    }
  }
`;

export const UPDATE_DEPARTMENT = gql`
  ${DEPARTMENT_FRAGMENT}
  mutation UpdateDepartment($departmentId: String!, $input: UpdateDepartmentInput!) {
    updateDepartment(departmentId: $departmentId, input: $input) {
      ...DepartmentFragment
    }
  }
`;

export const ASSIGN_DEPARTMENT_MANAGER = gql`
  mutation AssignDepartmentManager($departmentId: String!, $managerId: String!) {
    assignDepartmentManager(departmentId: $departmentId, managerId: $managerId)
  }
`;
