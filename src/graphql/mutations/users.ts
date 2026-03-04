import { gql } from '@apollo/client';

// User Management Mutations

export const CREATE_MANAGER = gql`
  mutation CreateManager($input: CreateManagerInput!) {
    createManager(input: $input) {
      user {
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
      credentialType
      temporaryCredential
    }
  }
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($input: CreateWorkerInput!) {
    createWorker(input: $input) {
      user {
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
      credentialType
      temporaryCredential
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($userId: String!, $input: UpdateUserManagementInput!) {
    updateUser(userId: $userId, input: $input) {
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
  }
`;
