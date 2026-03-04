import { gql } from '@apollo/client';

// Permission Queries

export const GET_USER_PERMISSIONS = gql`
  query GetUserPermissions($userId: String!) {
    getUserPermissions(userId: $userId) {
      userId
      fingerprint
      permissions {
        module
        actions
      }
    }
  }
`;

export const GET_PERMISSION_HISTORY = gql`
  query GetPermissionHistory($userId: String!) {
    getPermissionHistory(userId: $userId) {
      userId
      total
      snapshots {
        id
        userId
        reason
        snapshotData
        fingerprintHash
        createdAt
      }
    }
  }
`;
