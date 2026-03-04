import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: Record<string, any>; output: Record<string, any>; }
};

export type AuditFiltersInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AuditLogType = {
  __typename?: 'AuditLogType';
  action: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  hierarchyLevel?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  newValue?: Maybe<Scalars['JSON']['output']>;
  oldValue?: Maybe<Scalars['JSON']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  resourceId?: Maybe<Scalars['String']['output']>;
  resourceType: Scalars['String']['output'];
  result: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type AuditLogsResponse = {
  __typename?: 'AuditLogsResponse';
  logs: Array<AuditLogType>;
  total: Scalars['Int']['output'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  expiresIn: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  user: AuthUserType;
};

export type AuthUserType = {
  __typename?: 'AuthUserType';
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  hierarchyLevel: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  organizationId: Scalars['String']['output'];
};

export type BranchType = {
  __typename?: 'BranchType';
  address?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  managerId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organizationId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BranchesListResponse = {
  __typename?: 'BranchesListResponse';
  branches: Array<BranchType>;
  total: Scalars['Float']['output'];
};

export type BusinessRuleType = {
  __typename?: 'BusinessRuleType';
  appliesToLevel: Scalars['String']['output'];
  approverLevel: Scalars['String']['output'];
  basedOn: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  organizationId: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  ruleName: Scalars['String']['output'];
  thresholdValue: Scalars['Float']['output'];
  transactionType: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BusinessRulesListResponse = {
  __typename?: 'BusinessRulesListResponse';
  rules: Array<BusinessRuleType>;
  total: Scalars['Float']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type CreateBranchInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
};

export type CreateBusinessRuleInput = {
  appliesToLevel: Scalars['String']['input'];
  approverLevel: Scalars['String']['input'];
  basedOn: Scalars['String']['input'];
  priority: Scalars['Int']['input'];
  ruleName: Scalars['String']['input'];
  thresholdValue: Scalars['Float']['input'];
  transactionType: Scalars['String']['input'];
};

export type CreateDepartmentInput = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
};

export type CreateManagerInput = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  staffProfile: StaffProfileInput;
};

export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  credentialType: Scalars['String']['output'];
  temporaryCredential: Scalars['String']['output'];
  user: UserManagementType;
};

export type CreateWorkerInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  staffProfile: StaffProfileInput;
  usePIN?: InputMaybe<Scalars['Boolean']['input']>;
};

export type DepartmentType = {
  __typename?: 'DepartmentType';
  branchId?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  managerId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organizationId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type DepartmentsListResponse = {
  __typename?: 'DepartmentsListResponse';
  departments: Array<DepartmentType>;
  total: Scalars['Float']['output'];
};

export type GrantPermissionsInput = {
  /** Permissions to grant */
  permissions: Array<ModulePermissionInput>;
  /** User ID to grant permissions to */
  userId: Scalars['String']['input'];
};

export type HealthCheckResponse = {
  __typename?: 'HealthCheckResponse';
  cache: ServiceHealth;
  database: ServiceHealth;
  queue: ServiceHealth;
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export type LoginInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  organizationName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
};

export type LoginWithPinInput = {
  email: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  pin: Scalars['String']['input'];
};

export type ModulePermissionInput = {
  /** Array of actions (e.g., CREATE, READ, UPDATE) */
  actions: Array<Scalars['String']['input']>;
  /** Module name (e.g., INVENTORY, SALES) */
  module: Scalars['String']['input'];
};

export type ModulePermissionType = {
  __typename?: 'ModulePermissionType';
  /** Array of actions */
  actions: Array<Scalars['String']['output']>;
  /** Module name */
  module: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  assignBranchManager: Scalars['Boolean']['output'];
  assignDepartmentManager: Scalars['Boolean']['output'];
  changePassword: Scalars['Boolean']['output'];
  createBranch: BranchType;
  createBusinessRule: BusinessRuleType;
  createDepartment: DepartmentType;
  createManager: CreateUserResponse;
  createWorker: CreateUserResponse;
  grantPermissions: Scalars['Boolean']['output'];
  login: AuthResponse;
  loginWithPin: AuthResponse;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthResponse;
  registerOwner: AuthResponse;
  revokeAllSessions: Scalars['Boolean']['output'];
  revokePermissions: Scalars['Boolean']['output'];
  revokeSession: Scalars['Boolean']['output'];
  updateBranch: BranchType;
  updateBusinessRule: BusinessRuleType;
  updateDepartment: DepartmentType;
  updateOrganization: OrganizationType;
  updateUser: UserManagementType;
};


export type MutationAssignBranchManagerArgs = {
  branchId: Scalars['String']['input'];
  managerId: Scalars['String']['input'];
};


export type MutationAssignDepartmentManagerArgs = {
  departmentId: Scalars['String']['input'];
  managerId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateBranchArgs = {
  input: CreateBranchInput;
};


export type MutationCreateBusinessRuleArgs = {
  input: CreateBusinessRuleInput;
};


export type MutationCreateDepartmentArgs = {
  input: CreateDepartmentInput;
};


export type MutationCreateManagerArgs = {
  input: CreateManagerInput;
};


export type MutationCreateWorkerArgs = {
  input: CreateWorkerInput;
};


export type MutationGrantPermissionsArgs = {
  input: GrantPermissionsInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLoginWithPinArgs = {
  input: LoginWithPinInput;
};


export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput;
};


export type MutationRegisterOwnerArgs = {
  input: RegisterOwnerInput;
};


export type MutationRevokePermissionsArgs = {
  input: RevokePermissionsInput;
};


export type MutationRevokeSessionArgs = {
  input: RevokeSessionInput;
};


export type MutationUpdateBranchArgs = {
  branchId: Scalars['String']['input'];
  input: UpdateBranchInput;
};


export type MutationUpdateBusinessRuleArgs = {
  input: UpdateBusinessRuleInput;
  ruleId: Scalars['String']['input'];
};


export type MutationUpdateDepartmentArgs = {
  departmentId: Scalars['String']['input'];
  input: UpdateDepartmentInput;
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserManagementInput;
  userId: Scalars['String']['input'];
};

export type OrganizationType = {
  __typename?: 'OrganizationType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ownerId?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PermissionHistoryResponse = {
  __typename?: 'PermissionHistoryResponse';
  /** Permission snapshots ordered by date */
  snapshots: Array<PermissionSnapshotType>;
  /** Total number of snapshots */
  total: Scalars['Float']['output'];
  /** User ID */
  userId: Scalars['String']['output'];
};

export type PermissionSnapshotType = {
  __typename?: 'PermissionSnapshotType';
  /** Snapshot creation timestamp */
  createdAt: Scalars['DateTime']['output'];
  /** Permission fingerprint hash */
  fingerprintHash: Scalars['String']['output'];
  /** Snapshot ID */
  id: Scalars['String']['output'];
  /** Reason for snapshot (PERMISSION_GRANT, PERMISSION_REVOKE, etc.) */
  reason: Scalars['String']['output'];
  /** Snapshot data (permissions at time of snapshot) */
  snapshotData: Scalars['JSON']['output'];
  /** User ID */
  userId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getActiveSessions: Array<SessionType>;
  getBranches: BranchesListResponse;
  getBusinessRules: BusinessRulesListResponse;
  getDepartments: DepartmentsListResponse;
  getOrganization?: Maybe<OrganizationType>;
  getOrganizationAuditLogs: AuditLogsResponse;
  getPermissionHistory: PermissionHistoryResponse;
  getResourceAuditLogs: AuditLogsResponse;
  getUser?: Maybe<UserManagementType>;
  getUserAuditLogs: AuditLogsResponse;
  getUserPermissions: UserPermissionsResponse;
  getUsers: UsersListResponse;
  /** Check health status of all services */
  health: HealthCheckResponse;
};


export type QueryGetBusinessRulesArgs = {
  transactionType?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetOrganizationAuditLogsArgs = {
  filters?: InputMaybe<AuditFiltersInput>;
  organizationId: Scalars['String']['input'];
};


export type QueryGetPermissionHistoryArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetResourceAuditLogsArgs = {
  resourceId: Scalars['String']['input'];
  resourceType: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserAuditLogsArgs = {
  filters?: InputMaybe<AuditFiltersInput>;
  userId: Scalars['String']['input'];
};


export type QueryGetUserPermissionsArgs = {
  userId: Scalars['String']['input'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterOwnerInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
  organizationSettings?: InputMaybe<Scalars['String']['input']>;
  organizationType: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RevokePermissionsInput = {
  /** Module names to revoke */
  modules: Array<Scalars['String']['input']>;
  /** User ID to revoke permissions from */
  userId: Scalars['String']['input'];
};

export type RevokeSessionInput = {
  sessionId: Scalars['String']['input'];
};

export type ServiceHealth = {
  __typename?: 'ServiceHealth';
  message?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type SessionType = {
  __typename?: 'SessionType';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  ipAddress: Scalars['String']['output'];
  userAgent: Scalars['String']['output'];
};

export type StaffProfileInput = {
  employeeCode?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  hireDate?: InputMaybe<Scalars['DateTime']['input']>;
  positionTitle?: InputMaybe<Scalars['String']['input']>;
};

export type StaffProfileType = {
  __typename?: 'StaffProfileType';
  createdAt: Scalars['DateTime']['output'];
  employeeCode?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  hireDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  positionTitle?: Maybe<Scalars['String']['output']>;
  reportsToUserId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type UpdateBranchInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBusinessRuleInput = {
  appliesToLevel?: InputMaybe<Scalars['String']['input']>;
  approverLevel?: InputMaybe<Scalars['String']['input']>;
  basedOn?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  ruleName?: InputMaybe<Scalars['String']['input']>;
  thresholdValue?: InputMaybe<Scalars['Float']['input']>;
  transactionType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDepartmentInput = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserManagementInput = {
  branchId?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UserManagementType = {
  __typename?: 'UserManagementType';
  branchId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdById?: Maybe<Scalars['String']['output']>;
  departmentId?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  hierarchyLevel: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  organizationId: Scalars['String']['output'];
  staffProfile?: Maybe<StaffProfileType>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UserPermissionsResponse = {
  __typename?: 'UserPermissionsResponse';
  /** Permission fingerprint hash */
  fingerprint: Scalars['String']['output'];
  /** User permissions by module */
  permissions: Array<ModulePermissionType>;
  /** User ID */
  userId: Scalars['String']['output'];
};

export type UserType = {
  __typename?: 'UserType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UsersListResponse = {
  __typename?: 'UsersListResponse';
  total: Scalars['Float']['output'];
  users: Array<UserManagementType>;
};
