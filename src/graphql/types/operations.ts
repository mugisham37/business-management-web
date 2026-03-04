/**
 * GraphQL Operation Types
 * 
 * Type definitions for GraphQL queries and mutations
 * to ensure type safety with Apollo Client v4
 * 
 * Requirements: 2.2, 2.7
 */

import type {
  AuthResponse,
  UserManagementType,
  CreateUserResponse,
  OrganizationType,
  BranchType,
  DepartmentType,
  BusinessRuleType,
  UserPermissionsResponse,
  PermissionHistoryResponse,
  SessionType,
  AuditLogsResponse,
  HealthCheckResponse,
  UsersListResponse,
  BranchesListResponse,
  DepartmentsListResponse,
  BusinessRulesListResponse,
} from '@/lib/types/generated/graphql';

// ============================================================================
// Auth Mutations
// ============================================================================

export type RegisterOwnerData = {
  registerOwner: AuthResponse;
};

export type LoginData = {
  login: AuthResponse;
};

export type LoginWithPinData = {
  loginWithPin: AuthResponse;
};

export type RefreshTokenData = {
  refreshToken: AuthResponse;
};

export type LogoutData = {
  logout: boolean;
};

export type ChangePasswordData = {
  changePassword: boolean;
};

// ============================================================================
// User Mutations
// ============================================================================

export type CreateManagerData = {
  createManager: CreateUserResponse;
};

export type CreateWorkerData = {
  createWorker: CreateUserResponse;
};

export type UpdateUserData = {
  updateUser: UserManagementType;
};

// ============================================================================
// User Queries
// ============================================================================

export type GetUsersData = {
  getUsers: UsersListResponse;
};

export type GetUserData = {
  getUser: UserManagementType | null;
};

// ============================================================================
// Organization Mutations
// ============================================================================

export type UpdateOrganizationData = {
  updateOrganization: OrganizationType;
};

// ============================================================================
// Organization Queries
// ============================================================================

export type GetOrganizationData = {
  getOrganization: OrganizationType | null;
};

// ============================================================================
// Branch Mutations
// ============================================================================

export type CreateBranchData = {
  createBranch: BranchType;
};

export type UpdateBranchData = {
  updateBranch: BranchType;
};

export type AssignBranchManagerData = {
  assignBranchManager: boolean;
};

// ============================================================================
// Branch Queries
// ============================================================================

export type GetBranchesData = {
  getBranches: BranchesListResponse;
};

// ============================================================================
// Department Mutations
// ============================================================================

export type CreateDepartmentData = {
  createDepartment: DepartmentType;
};

export type UpdateDepartmentData = {
  updateDepartment: DepartmentType;
};

export type AssignDepartmentManagerData = {
  assignDepartmentManager: boolean;
};

// ============================================================================
// Department Queries
// ============================================================================

export type GetDepartmentsData = {
  getDepartments: DepartmentsListResponse;
};

// ============================================================================
// Business Rule Mutations
// ============================================================================

export type CreateBusinessRuleData = {
  createBusinessRule: BusinessRuleType;
};

export type UpdateBusinessRuleData = {
  updateBusinessRule: BusinessRuleType;
};

// ============================================================================
// Business Rule Queries
// ============================================================================

export type GetBusinessRulesData = {
  getBusinessRules: BusinessRulesListResponse;
};

// ============================================================================
// Permission Mutations
// ============================================================================

export type GrantPermissionsData = {
  grantPermissions: boolean;
};

export type RevokePermissionsData = {
  revokePermissions: boolean;
};

// ============================================================================
// Permission Queries
// ============================================================================

export type GetUserPermissionsData = {
  getUserPermissions: UserPermissionsResponse;
};

export type GetPermissionHistoryData = {
  getPermissionHistory: PermissionHistoryResponse;
};

// ============================================================================
// Session Mutations
// ============================================================================

export type RevokeSessionData = {
  revokeSession: boolean;
};

export type RevokeAllSessionsData = {
  revokeAllSessions: boolean;
};

// ============================================================================
// Session Queries
// ============================================================================

export type GetActiveSessionsData = {
  getActiveSessions: SessionType[];
};

// ============================================================================
// Audit Queries
// ============================================================================

export type GetUserAuditLogsData = {
  getUserAuditLogs: AuditLogsResponse;
};

export type GetOrganizationAuditLogsData = {
  getOrganizationAuditLogs: AuditLogsResponse;
};

export type GetResourceAuditLogsData = {
  getResourceAuditLogs: AuditLogsResponse;
};

// ============================================================================
// Health Queries
// ============================================================================

export type HealthData = {
  health: HealthCheckResponse;
};
