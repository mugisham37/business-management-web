/**
 * Apollo Type Helpers
 * 
 * This file provides type mappings and helper types to bridge between
 * local application types and GraphQL generated types.
 * 
 * IMPORTANT: Always use the generated GraphQL types from @/lib/types/generated/graphql
 * These helpers are only for convenience and type safety.
 */

import type {
  UserManagementType,
  AuthUserType,
  BranchType,
  DepartmentType,
  BusinessRuleType,
  OrganizationType,
  ModulePermissionType,
  SessionType,
  AuditLogType,
  UserPermissionsResponse,
  PermissionSnapshotType,
  HealthCheckResponse,
  CreateUserResponse,
} from '@/lib/types/generated/graphql';

/**
 * User type union - can be either UserManagementType or AuthUserType
 * depending on the context (management vs authentication)
 */
export type User = UserManagementType | AuthUserType;

/**
 * Type aliases that match the GraphQL schema exactly
 * Use these in your application code for consistency
 */
export type Branch = BranchType;
export type Department = DepartmentType;
export type BusinessRule = BusinessRuleType;
export type Organization = OrganizationType;
export type Permission = ModulePermissionType;
export type Session = SessionType;
export type AuditLog = AuditLogType;
export type UserPermissions = UserPermissionsResponse;
export type PermissionSnapshot = PermissionSnapshotType;
export type HealthCheck = HealthCheckResponse;

/**
 * Type guard to check if a user is UserManagementType
 */
export function isUserManagementType(user: User): user is UserManagementType {
  return user.__typename === 'UserManagementType';
}

/**
 * Type guard to check if a user is AuthUserType
 */
export function isAuthUserType(user: User): user is AuthUserType {
  return user.__typename === 'AuthUserType';
}

/**
 * Helper to convert hierarchyLevel from string to number for display
 * The GraphQL schema uses string, but we may want to display as number
 */
export function parseHierarchyLevel(level: string): number {
  const parsed = parseInt(level, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Helper to convert hierarchyLevel from number to string for GraphQL
 */
export function stringifyHierarchyLevel(level: number): string {
  return level.toString();
}

/**
 * Response type mappings for hooks
 */
export interface UseUsersReturn {
  users?: UserManagementType[];
  paginatedUsers: UserManagementType[];
  user?: UserManagementType;
  loading: boolean;
  error?: Error;
  createUser: (input: any) => Promise<CreateUserResponse>;
  updateUser: (userId: string, input: any) => Promise<UserManagementType>;
  deleteUser: (userId: string) => Promise<boolean>;
  refetch: () => void;
}

export interface UseBranchesReturn {
  branches?: BranchType[];
  paginatedBranches: BranchType[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
  loading: boolean;
  branchesLoading: boolean;
  error?: Error;
  createBranch: (input: any) => Promise<BranchType>;
  updateBranch: (branchId: string, input: any) => Promise<BranchType>;
  assignManager: (branchId: string, managerId: string) => Promise<boolean>;
  refetch: () => void;
}

export interface UseDepartmentsReturn {
  departments?: DepartmentType[];
  paginatedDepartments: DepartmentType[];
  loading: boolean;
  error?: Error;
  createDepartment: (input: any) => Promise<DepartmentType>;
  updateDepartment: (departmentId: string, input: any) => Promise<DepartmentType>;
  assignManager: (departmentId: string, managerId: string) => Promise<boolean>;
  refetch: () => void;
}

export interface UseBusinessRulesReturn {
  businessRules?: BusinessRuleType[];
  loading: boolean;
  error?: Error;
  createBusinessRule: (input: any) => Promise<BusinessRuleType>;
  updateBusinessRule: (ruleId: string, input: any) => Promise<BusinessRuleType>;
  refetch: () => void;
}

export interface UseOrganizationReturn {
  organization?: OrganizationType;
  loading: boolean;
  error?: Error;
  updateOrganization: (input: any) => Promise<OrganizationType>;
  refetch: () => void;
}

export interface UsePermissionsReturn {
  permissions?: ModulePermissionType[];
  permissionHistory?: PermissionSnapshotType[];
  loading: boolean;
  error?: Error;
  grantPermissions: (userId: string, permissions: any[]) => Promise<boolean>;
  revokePermissions: (userId: string, modules: string[]) => Promise<boolean>;
  refetch: () => void;
}

export interface UseSessionsReturn {
  sessions?: SessionType[];
  loading: boolean;
  error?: Error;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllSessions: () => Promise<boolean>;
  refetch: () => void;
}

export interface UseHealthCheckReturn {
  health?: HealthCheckResponse;
  loading: boolean;
  error?: Error;
  refetch: () => void;
}
