import { gql } from '@apollo/client';
import { DEPARTMENT_FRAGMENT } from '../fragments';

export const CREATE_DEPARTMENT_MUTATION = gql`
  ${DEPARTMENT_FRAGMENT}
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      ...DepartmentFragment
    }
  }
`;

export const UPDATE_DEPARTMENT_MUTATION = gql`
  ${DEPARTMENT_FRAGMENT}
  mutation UpdateDepartment($id: UUID!, $input: UpdateDepartmentInput!) {
    updateDepartment(id: $id, input: $input) {
      ...DepartmentFragment
    }
  }
`;

export const DELETE_DEPARTMENT_MUTATION = gql`
  mutation DeleteDepartment($id: UUID!) {
    deleteDepartment(id: $id) {
      success
    }
  }
`;
