import { Middleware } from '@reduxjs/toolkit';
import type { ApolloClient } from '@apollo/client';
import type { RootState } from '../index';
import {
  GET_USERS,
  GET_USER,
} from '@/graphql/queries/users';
import {
  GET_USER_PERMISSIONS,
} from '@/graphql/queries/permissions';
import {
  GET_ORGANIZATION,
} from '@/graphql/queries/organizations';
import {
  GET_BRANCHES,
} from '@/graphql/queries/branches';
import {
  GET_DEPARTMENTS,
} from '@/graphql/queries/departments';

/**
 * Apollo Cache Sync Middleware
 * 
 * Synchronizes Redux state changes with Apollo Client cache.
 * When Redux state is updated, this middleware updates the Apollo cache
 * to keep both data sources in sync.
 * 
 * This ensures that:
 * 1. Apollo queries reflect the latest Redux state
 * 2. Cache-first queries return up-to-date data
 * 3. Optimistic updates are consistent across both systems
 * 
 * Requirements: 5.6, 5.7
 */
export const createApolloSyncMiddleware = (
  apolloClient: ApolloClient
): Middleware => {
  return (store) => (next) => (action) => {
    // Execute the action first
    const result = next(action);

    // Sync state to Apollo cache after action completes
    const state = store.getState();

    try {
      // Sync users state to cache
      if (action.type?.startsWith('users/')) {
        syncUsersToCache(apolloClient, state);
      }

      // Sync permissions state to cache
      if (action.type?.startsWith('permissions/')) {
        syncPermissionsToCache(apolloClient, state);
      }

      // Sync organizations state to cache
      if (action.type?.startsWith('organizations/')) {
        syncOrganizationsToCache(apolloClient, state);
      }
    } catch (error: unknown) {
      // Log sync errors but don't break the application
      console.error('Apollo cache sync error:', error);
    }

    return result;
  };
};

/**
 * Sync users state to Apollo cache
 */
function syncUsersToCache(apolloClient: ApolloClient, state: RootState) {
  const { list, selectedUser } = state.users;

  // Update users list cache
  if (list.length > 0) {
    try {
      apolloClient.cache.writeQuery({
        query: GET_USERS,
        data: {
          getUsers: {
            users: list,
            total: list.length,
            __typename: 'UsersListResponse',
          },
        },
      });
    } catch {
      // Query might not be in cache yet, that's okay
    }
  }

  // Update selected user cache
  if (selectedUser) {
    try {
      apolloClient.cache.writeQuery({
        query: GET_USER,
        variables: { userId: selectedUser.id },
        data: {
          getUser: selectedUser,
        },
      });
    } catch {
      // Query might not be in cache yet, that's okay
    }
  }
}

/**
 * Sync permissions state to Apollo cache
 */
function syncPermissionsToCache(
  apolloClient: ApolloClient,
  state: RootState
) {
  const { userPermissions } = state.permissions;

  // Update each user's permissions in cache
  Object.entries(userPermissions).forEach(([userId, permissions]) => {
    try {
      apolloClient.cache.writeQuery({
        query: GET_USER_PERMISSIONS,
        variables: { userId },
        data: {
          getUserPermissions: permissions,
        },
      });
    } catch {
      // Query might not be in cache yet, that's okay
    }
  });
}

/**
 * Sync organizations state to Apollo cache
 */
function syncOrganizationsToCache(
  apolloClient: ApolloClient,
  state: RootState
) {
  const { organization, branches, departments } = state.organizations;

  // Update organization cache
  if (organization) {
    try {
      apolloClient.cache.writeQuery({
        query: GET_ORGANIZATION,
        data: {
          getOrganization: organization,
        },
      });
    } catch {
      // Query might not be in cache yet, that's okay
    }
  }

  // Update branches cache
  if (branches.length > 0) {
    try {
      apolloClient.cache.writeQuery({
        query: GET_BRANCHES,
        data: {
          getBranches: {
            branches,
            total: branches.length,
            __typename: 'BranchesListResponse',
          },
        },
      });
    } catch {
      // Query might not be in cache yet, that's okay
    }
  }

  // Update departments cache
  if (departments.length > 0) {
    try {
      apolloClient.cache.writeQuery({
        query: GET_DEPARTMENTS,
        data: {
          getDepartments: {
            departments,
            total: departments.length,
            __typename: 'DepartmentsListResponse',
          },
        },
      });
    } catch {
      // Query might not be in cache yet, that's okay
    }
  }
}
