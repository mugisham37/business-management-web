import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  OrganizationType,
  BranchType,
  DepartmentType,
} from '../../types/generated/graphql';
import type { RootState } from '../index';

export interface OrganizationsState {
  organization: OrganizationType | null;
  branches: BranchType[];
  departments: DepartmentType[];
  selectedBranch: BranchType | null;
  selectedDepartment: DepartmentType | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationsState = {
  organization: null,
  branches: [],
  departments: [],
  selectedBranch: null,
  selectedDepartment: null,
  loading: false,
  error: null,
};

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setOrganization: (state, action: PayloadAction<OrganizationType | null>) => {
      state.organization = action.payload;
      state.error = null;
    },
    updateOrganization: (state, action: PayloadAction<Partial<OrganizationType>>) => {
      if (state.organization) {
        state.organization = { ...state.organization, ...action.payload };
      }
      state.error = null;
    },
    setBranches: (state, action: PayloadAction<BranchType[]>) => {
      state.branches = action.payload;
      state.error = null;
    },
    addBranch: (state, action: PayloadAction<BranchType>) => {
      state.branches.push(action.payload);
      state.error = null;
    },
    updateBranch: (state, action: PayloadAction<BranchType>) => {
      const index = state.branches.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.branches[index] = action.payload;
      }
      // Also update selected branch if it's the same one
      if (state.selectedBranch?.id === action.payload.id) {
        state.selectedBranch = action.payload;
      }
      state.error = null;
    },
    removeBranch: (state, action: PayloadAction<string>) => {
      state.branches = state.branches.filter((b) => b.id !== action.payload);
      // Clear selected branch if it was removed
      if (state.selectedBranch?.id === action.payload) {
        state.selectedBranch = null;
      }
      state.error = null;
    },
    setDepartments: (state, action: PayloadAction<DepartmentType[]>) => {
      state.departments = action.payload;
      state.error = null;
    },
    addDepartment: (state, action: PayloadAction<DepartmentType>) => {
      state.departments.push(action.payload);
      state.error = null;
    },
    updateDepartment: (state, action: PayloadAction<DepartmentType>) => {
      const index = state.departments.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
      // Also update selected department if it's the same one
      if (state.selectedDepartment?.id === action.payload.id) {
        state.selectedDepartment = action.payload;
      }
      state.error = null;
    },
    removeDepartment: (state, action: PayloadAction<string>) => {
      state.departments = state.departments.filter((d) => d.id !== action.payload);
      // Clear selected department if it was removed
      if (state.selectedDepartment?.id === action.payload) {
        state.selectedDepartment = null;
      }
      state.error = null;
    },
    setSelectedBranch: (state, action: PayloadAction<BranchType | null>) => {
      state.selectedBranch = action.payload;
    },
    setSelectedDepartment: (state, action: PayloadAction<DepartmentType | null>) => {
      state.selectedDepartment = action.payload;
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
    optimisticAddBranch: (state, action: PayloadAction<BranchType>) => {
      state.branches.push(action.payload);
    },
    optimisticUpdateBranch: (state, action: PayloadAction<BranchType>) => {
      const index = state.branches.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.branches[index] = action.payload;
      }
      if (state.selectedBranch?.id === action.payload.id) {
        state.selectedBranch = action.payload;
      }
    },
    optimisticAddDepartment: (state, action: PayloadAction<DepartmentType>) => {
      state.departments.push(action.payload);
    },
    optimisticUpdateDepartment: (state, action: PayloadAction<DepartmentType>) => {
      const index = state.departments.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
      if (state.selectedDepartment?.id === action.payload.id) {
        state.selectedDepartment = action.payload;
      }
    },
    optimisticUpdateOrganization: (
      state,
      action: PayloadAction<Partial<OrganizationType>>
    ) => {
      if (state.organization) {
        state.organization = { ...state.organization, ...action.payload };
      }
    },
    // Rollback actions for failed optimistic updates
    rollbackBranches: (state, action: PayloadAction<BranchType[]>) => {
      state.branches = action.payload;
    },
    rollbackDepartments: (state, action: PayloadAction<DepartmentType[]>) => {
      state.departments = action.payload;
    },
    rollbackOrganization: (state, action: PayloadAction<OrganizationType | null>) => {
      state.organization = action.payload;
    },
  },
});

export const {
  setOrganization,
  updateOrganization,
  setBranches,
  addBranch,
  updateBranch,
  removeBranch,
  setDepartments,
  addDepartment,
  updateDepartment,
  removeDepartment,
  setSelectedBranch,
  setSelectedDepartment,
  setLoading,
  setError,
  clearError,
  optimisticAddBranch,
  optimisticUpdateBranch,
  optimisticAddDepartment,
  optimisticUpdateDepartment,
  optimisticUpdateOrganization,
  rollbackBranches,
  rollbackDepartments,
  rollbackOrganization,
} = organizationsSlice.actions;

// Selectors
export const selectOrganization = (state: RootState) => state.organizations.organization;
export const selectBranches = (state: RootState) => state.organizations.branches;
export const selectDepartments = (state: RootState) => state.organizations.departments;
export const selectSelectedBranch = (state: RootState) =>
  state.organizations.selectedBranch;
export const selectSelectedDepartment = (state: RootState) =>
  state.organizations.selectedDepartment;
export const selectOrganizationsLoading = (state: RootState) =>
  state.organizations.loading;
export const selectOrganizationsError = (state: RootState) => state.organizations.error;

// Derived selectors
export const selectBranchById = (state: RootState, branchId: string) =>
  state.organizations.branches.find((branch) => branch.id === branchId);

export const selectDepartmentById = (state: RootState, departmentId: string) =>
  state.organizations.departments.find((dept) => dept.id === departmentId);

export const selectDepartmentsByBranch = (state: RootState, branchId: string) =>
  state.organizations.departments.filter((dept) => dept.branchId === branchId);

export const selectBranchesWithManager = (state: RootState) =>
  state.organizations.branches.filter((branch) => branch.managerId !== null);

export const selectBranchesWithoutManager = (state: RootState) =>
  state.organizations.branches.filter((branch) => branch.managerId === null);

export const selectDepartmentsWithManager = (state: RootState) =>
  state.organizations.departments.filter((dept) => dept.managerId !== null);

export const selectDepartmentsWithoutManager = (state: RootState) =>
  state.organizations.departments.filter((dept) => dept.managerId === null);

export default organizationsSlice.reducer;
