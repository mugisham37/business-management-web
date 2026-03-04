import { gql } from '@apollo/client';

export const DEPARTMENT_FRAGMENT = gql`
  fragment DepartmentFragment on DepartmentType {
    id
    name
    code
    organizationId
    branchId
    managerId
    createdAt
    updatedAt
  }
`;
