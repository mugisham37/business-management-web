import { gql } from '@apollo/client';

export const DEPARTMENT_FRAGMENT = gql`
  fragment DepartmentFragment on Department {
    id
    name
    code
    branchId
    description
    status
    createdAt
    updatedAt
  }
`;
