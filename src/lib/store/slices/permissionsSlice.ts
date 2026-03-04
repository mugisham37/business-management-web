import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  UserPermissionsResponse,
  ModulePermissionType,
  PermissionHistoryResponse,
} from '../../types/generated/graphql';
import type { RootState } from '../index';

export interface PermissionsState {
  // User permissions by userId
  userPermissions: Record<string, UserPermissionsResponse>;
  // Permission history by userId
  permissionHistory: Record<string, PermissionHistoryResponse>;
  // Currently selected user for permission management
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  userPermissions: {},
  permissionHistory: {},
  selectedUserId: null,
  loading: false,
  error: null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setUserPermissions: (
      state,
      action: PayloadAction<{ userId: string; permissions: UserPermissionsResponse }>
    ) => {
      state.userPermissions[action.payload.userId] = action.payload.permissions;
      state.error = null;
    },
    updateUserPermissions: (
      state,
      action: PayloadAction<{
        userId: string;
        permissions: ModulePermissionType[];
        fingerprint: string;
      }>
    ) => {
      const { userId, permissions, fingerprint } = action.payload;
      if (state.userPermissions[userId]) {
        state.userPermissions[userId].permissions = permissions;
        state.userPermissions[userId].fingerprint = fingerprint;
      } else {
        state.userPermissions[userId] = {
          userId,
          permissions,
          fingerprint,
          __typename: 'UserPermissionsResponse',
        };
      }
      state.error = null;
    },
    grantPermissionsOptimistic: (
      state,
      action: PayloadAction<{
        userId: string;
        newPermissions: ModulePermissionType[];
      }>
    ) => {
      const { userId, newPermissions } = action.payload;
      if (state.userPermissions[userId]) {
        const existing = state.userPermissions[userId].permissions;
        // Merge new permissions with existing
        const merged = [...existing];
        newPermissions.forEach((newPerm) => {
          const existingIndex = merged.findIndex((p) => p.module === newPerm.module);
          if (existingIndex !== -1) {
            // Merge actions
            const existingActions = merged[existingIndex].actions;
            const combinedActions = Array.from(
              new Set([...existingActions, ...newPerm.actions])
            );
            merged[existingIndex] = {
              ...merged[existingIndex],
              actions: combinedActions,
            };
          } else {
            merged.push(newPerm);
          }
        });
        state.userPermissions[userId].permissions = merged;
      }
    },
    revokePermissionsOptimistic: (
      state,
      action: PayloadAction<{
        userId: string;
        modules: string[];
      }>
    ) => {
      const { userId, modules } = action.payload;
      if (state.userPermissions[userId]) {
        state.userPermissions[userId].permissions = state.userPermissions[
          userId
        ].permissions.filter((p) => !modules.includes(p.module));
      }
    },
    setPermissionHistory: (
      state,
      action: PayloadAction<{ userId: string; history: PermissionHistoryResponse }>
    ) => {
      state.permissionHistory[action.payload.userId] = action.payload.history;
      state.error = null;
    },
    setSelectedUserId: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUserPermissions: (state, action: PayloadAction<string>) => {
      delete state.userPermissions[action.payload];
    },
    // Rollback action for failed optimistic updates
    rollbackUserPermissions: (
      state,
      action: PayloadAction<{ userId: string; permissions: UserPermissionsResponse }>
    ) => {
      state.userPermissions[action.payload.userId] = action.payload.permissions;
    },
  },
});

export const {
  setUserPermissions,
  updateUserPermissions,
  grantPermissionsOptimistic,
  revokePermissionsOptimistic,
  setPermissionHistory,
  setSelectedUserId,
  setLoading,
  setError,
  clearError,
  clearUserPermissions,
  rollbackUserPermissions,
} = permissionsSlice.actions;

// Selectors
export const selectUserPermissions = (state: RootState, userId: string) =>
  state.permissions.userPermissions[userId];

export const selectPermissionHistory = (state: RootState, userId: string) =>
  state.permissions.permissionHistory[userId];

export const selectSelectedUserId = (state: RootState) =>
  state.permissions.selectedUserId;

export const selectPermissionsLoading = (state: RootState) => state.permissions.loading;

export const selectPermissionsError = (state: RootState) => state.permissions.error;

// Derived selectors
export const selectUserHasModule = (
  state: RootState,
  userId: string,
  module: string
) => {
  const permissions = state.permissions.userPermissions[userId];
  return permissions?.permissions.some((p) => p.module === module) ?? false;
};

export const selectUserHasAction = (
  state: RootState,
  userId: string,
  module: string,
  action: string
) => {
  const permissions = state.permissions.userPermissions[userId];
  const modulePermission = permissions?.permissions.find((p) => p.module === module);
  return modulePermission?.actions.includes(action) ?? false;
};

export const selectUserModules = (state: RootState, userId: string) => {
  const permissions = state.permissions.userPermissions[userId];
  return permissions?.permissions.map((p) => p.module) ?? [];
};

export default permissionsSlice.reducer;
