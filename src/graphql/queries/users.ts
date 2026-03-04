import { gql } from '@apollo/client';

// User Queries

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      users {
        id
        email
        firstName
        lastName
        hierarchyLevel
        organizationId
        branchId
        departmentId
        status
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: String!) {
    getUser(userId: $userId) {
      id
      email
      firstName
      lastName
      hierarchyLevel
      organizationId
      branchId
      departmentId
      status
      createdAt
      updatedAt
      staffProfile {
        id
        fullName
        employeeCode
        positionTitle
        hireDate
        reportsToUserId
        createdAt
        updatedAt
      }
    }
  }
`;
