import type { ApolloClient } from '@apollo/client';
import type { AppDispatch } from '../index';
import { setUsers, setSelectedUser } from '../slices/usersSlice';
import { setUserPermissions, setPermissionHistory } from '../slices/permissionsSlice';
import {
  setOrganization,
  setBranches,
  setDepartments,
} from '../slices/organizationsSlice';
import {
  GET_USERS,
  GET_USER,
} from '@/graphql/queries/users';
import {
  GET_USER_PERMISSIONS,
  GET_PERMISSION_HISTORY,
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
import type {
  GetUsersData,
  GetUserData,
  GetUserPermissionsData,
  GetPermissionHistoryData,
  GetOrganizationData,
  GetBranchesData,
  GetDepartmentsData,
} from '@/graphql/types/operations';

/**
 * Cache to State Sync Utilities
 * 
 * These functions read data from Apollo cache and dispatch actions
 * to update Redux state. This ensures state management stays in sync
 * with cached GraphQL data.
 * 
 * Use these after GraphQL queries complete to populate Redux state.
 * 
 * Requirements: 5.6, 5.7
 */

/**
 * Sync users from Apollo cache to Redux state
 */
export function syncUsersFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch
) {
  try {
    // Read users list from cache
    const usersData = apolloClient.cache.readQuery<GetUsersData>({
      query: GET_USERS,
    });

    if (usersData?.getUsers?.users) {
      dispatch(setUsers(usersData.getUsers.users));
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync a specific user from Apollo cache to Redux state
 */
export function syncUserFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch,
  userId: string
) {
  try {
    const userData = apolloClient.cache.readQuery<GetUserData>({
      query: GET_USER,
      variables: { userId },
    });

    if (userData?.getUser) {
      dispatch(setSelectedUser(userData.getUser));
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync user permissions from Apollo cache to Redux state
 */
export function syncUserPermissionsFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch,
  userId: string
) {
  try {
    const permissionsData = apolloClient.cache.readQuery<GetUserPermissionsData>({
      query: GET_USER_PERMISSIONS,
      variables: { userId },
    });

    if (permissionsData?.getUserPermissions) {
      dispatch(
        setUserPermissions({
          userId,
          permissions: permissionsData.getUserPermissions,
        })
      );
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync permission history from Apollo cache to Redux state
 */
export function syncPermissionHistoryFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch,
  userId: string
) {
  try {
    const historyData = apolloClient.cache.readQuery<GetPermissionHistoryData>({
      query: GET_PERMISSION_HISTORY,
      variables: { userId },
    });

    if (historyData?.getPermissionHistory) {
      dispatch(
        setPermissionHistory({
          userId,
          history: historyData.getPermissionHistory,
        })
      );
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync organization from Apollo cache to Redux state
 */
export function syncOrganizationFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch
) {
  try {
    const orgData = apolloClient.cache.readQuery<GetOrganizationData>({
      query: GET_ORGANIZATION,
    });

    if (orgData?.getOrganization) {
      dispatch(setOrganization(orgData.getOrganization));
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync branches from Apollo cache to Redux state
 */
export function syncBranchesFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch
) {
  try {
    const branchesData = apolloClient.cache.readQuery<GetBranchesData>({
      query: GET_BRANCHES,
    });

    if (branchesData?.getBranches?.branches) {
      dispatch(setBranches(branchesData.getBranches.branches));
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync departments from Apollo cache to Redux state
 */
export function syncDepartmentsFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch
) {
  try {
    const departmentsData = apolloClient.cache.readQuery<GetDepartmentsData>({
      query: GET_DEPARTMENTS,
    });

    if (departmentsData?.getDepartments?.departments) {
      dispatch(setDepartments(departmentsData.getDepartments.departments));
    }
  } catch {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync all data from Apollo cache to Redux state
 * 
 * Use this on app initialization to populate Redux state
 * from cached GraphQL data.
 */
export function syncAllFromCache(
  apolloClient: ApolloClient,
  dispatch: AppDispatch
) {
  syncUsersFromCache(apolloClient, dispatch);
  syncOrganizationFromCache(apolloClient, dispatch);
  syncBranchesFromCache(apolloClient, dispatch);
  syncDepartmentsFromCache(apolloClient, dispatch);
}
