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
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch
) {
  try {
    // Read users list from cache
    const usersData = apolloClient.cache.readQuery({
      query: GET_USERS,
    });

    if (usersData?.getUsers?.users) {
      dispatch(setUsers(usersData.getUsers.users));
    }
  } catch (error) {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync a specific user from Apollo cache to Redux state
 */
export function syncUserFromCache(
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch,
  userId: string
) {
  try {
    const userData = apolloClient.cache.readQuery({
      query: GET_USER,
      variables: { userId },
    });

    if (userData?.getUser) {
      dispatch(setSelectedUser(userData.getUser));
    }
  } catch (error) {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync user permissions from Apollo cache to Redux state
 */
export function syncUserPermissionsFromCache(
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch,
  userId: string
) {
  try {
    const permissionsData = apolloClient.cache.readQuery({
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
  } catch (error) {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync permission history from Apollo cache to Redux state
 */
export function syncPermissionHistoryFromCache(
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch,
  userId: string
) {
  try {
    const historyData = apolloClient.cache.readQuery({
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
  } catch (error) {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync organization from Apollo cache to Redux state
 */
export function syncOrganizationFromCache(
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch
) {
  try {
    const orgData = apolloClient.cache.readQuery({
      query: GET_ORGANIZATION,
    });

    if (orgData?.getOrganization) {
      dispatch(setOrganization(orgData.getOrganization));
    }
  } catch (error) {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync branches from Apollo cache to Redux state
 */
export function syncBranchesFromCache(
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch
) {
  try {
    const branchesData = apolloClient.cache.readQuery({
      query: GET_BRANCHES,
    });

    if (branchesData?.getBranches?.branches) {
      dispatch(setBranches(branchesData.getBranches.branches));
    }
  } catch (error) {
    // Query not in cache yet, that's okay
  }
}

/**
 * Sync departments from Apollo cache to Redux state
 */
export function syncDepartmentsFromCache(
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch
) {
  try {
    const departmentsData = apolloClient.cache.readQuery({
      query: GET_DEPARTMENTS,
    });

    if (departmentsData?.getDepartments?.departments) {
      dispatch(setDepartments(departmentsData.getDepartments.departments));
    }
  } catch (error) {
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
  apolloClient: ApolloClient<any>,
  dispatch: AppDispatch
) {
  syncUsersFromCache(apolloClient, dispatch);
  syncOrganizationFromCache(apolloClient, dispatch);
  syncBranchesFromCache(apolloClient, dispatch);
  syncDepartmentsFromCache(apolloClient, dispatch);
}
