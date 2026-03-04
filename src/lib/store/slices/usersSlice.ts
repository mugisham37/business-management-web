import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserManagementType } from '../../types/generated/graphql';
import type { RootState } from '../index';

export interface UsersState {
  list: UserManagementType[];
  selectedUser: UserManagementType | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserManagementType[]>) => {
      state.list = action.payload;
      state.error = null;
    },
    addUser: (state, action: PayloadAction<UserManagementType>) => {
      state.list.push(action.payload);
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<UserManagementType>) => {
      const index = state.list.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      // Also update selected user if it's the same one
      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
      state.error = null;
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
      // Clear selected user if it was removed
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null;
      }
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<UserManagementType | null>) => {
      state.selectedUser = action.payload;
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
    // Optimistic update actions
    optimisticAddUser: (state, action: PayloadAction<UserManagementType>) => {
      // Store the previous state for potential rollback
      state.list.push(action.payload);
    },
    optimisticUpdateUser: (state, action: PayloadAction<UserManagementType>) => {
      const index = state.list.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
      if (state.selectedUser?.id === action.payload.id) {
        state.selectedUser = action.payload;
      }
    },
    optimisticRemoveUser: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null;
      }
    },
    // Rollback action for failed optimistic updates
    rollbackUsers: (state, action: PayloadAction<UserManagementType[]>) => {
      state.list = action.payload;
    },
    rollbackSelectedUser: (
      state,
      action: PayloadAction<UserManagementType | null>
    ) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  removeUser,
  setSelectedUser,
  setLoading,
  setError,
  clearError,
  optimisticAddUser,
  optimisticUpdateUser,
  optimisticRemoveUser,
  rollbackUsers,
  rollbackSelectedUser,
} = usersSlice.actions;

// Selectors
export const selectUsers = (state: RootState) => state.users.list;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;

// Derived selectors
export const selectUserById = (state: RootState, userId: string) =>
  state.users.list.find((user) => user.id === userId);

export const selectUsersByBranch = (state: RootState, branchId: string) =>
  state.users.list.filter((user) => user.branchId === branchId);

export const selectUsersByDepartment = (state: RootState, departmentId: string) =>
  state.users.list.filter((user) => user.departmentId === departmentId);

export const selectUsersByHierarchyLevel = (state: RootState, level: string) =>
  state.users.list.filter((user) => user.hierarchyLevel === level);

export const selectActiveUsers = (state: RootState) =>
  state.users.list.filter((user) => user.status === 'ACTIVE');

export default usersSlice.reducer;
