/**
 * gRPC Type Definitions
 * 
 * This file provides TypeScript type definitions for gRPC services.
 * Types are manually defined to ensure type safety until proto generation is complete.
 */

// Common types
export interface PaginationRequest {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Error {
  code: string;
  message: string;
  details?: Record<string, string>;
  timestamp: string;
  correlationId: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

// Health Service types
export enum ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
  SERVICE_UNKNOWN = 3,
}

export enum ComponentHealthStatus {
  UNKNOWN = 0,
  HEALTHY = 1,
  UNHEALTHY = 2,
  DEGRADED = 3,
}

export interface ComponentHealth {
  status: ComponentHealthStatus;
  message: string;
  details?: Record<string, string>;
}

export interface HealthCheckRequest {
  service?: string;
}

export interface HealthCheckResponse {
  status: ServingStatus;
  components?: Record<string, ComponentHealth>;
  timestamp: string;
}

// User Service types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserRequest {
  id: string;
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface ListUsersRequest {
  pagination?: PaginationRequest;
}

export interface ListUsersResponse {
  users: User[];
  meta: PaginationMeta;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantId: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface DeleteUserRequest {
  id: string;
}

export interface UserResponse {
  user: User;
}

// Authorization Service types
export enum HierarchyLevel {
  HIERARCHY_LEVEL_UNSPECIFIED = 0,
  OWNER = 1,
  MANAGER = 2,
  WORKER = 3,
}

export interface ResourceScope {
  branchId?: string;
  departmentId?: string;
}

export interface TransactionContext {
  transactionType: string;
  amount: number;
}

export interface CheckPermissionRequest {
  userId: string;
  module: string;
  action: string;
  resourceId?: string;
  resourceScope?: ResourceScope;
  transactionContext?: TransactionContext;
  traceMetadata?: Record<string, string>;
}

export interface CheckPermissionResponse {
  authorized: boolean;
  failedLayer?: string;
  reason?: string;
  requiresApproval: boolean;
  approverLevel?: HierarchyLevel;
  traceMetadata?: Record<string, string>;
}

export interface ValidateTokenRequest {
  accessToken: string;
  traceMetadata?: Record<string, string>;
}

export interface UserIdentity {
  userId: string;
  organizationId: string;
  hierarchyLevel: HierarchyLevel;
  branchId?: string;
  departmentId?: string;
  permissionFingerprint: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userIdentity?: UserIdentity;
  errorCode?: string;
  errorMessage?: string;
  traceMetadata?: Record<string, string>;
}

export interface GetUserPermissionsRequest {
  userId: string;
  traceMetadata?: Record<string, string>;
}

export interface ModulePermission {
  module: string;
  actions: string[];
}

export interface GetUserPermissionsResponse {
  permissions: ModulePermission[];
  permissionFingerprint: string;
  traceMetadata?: Record<string, string>;
}

// Service client interfaces
export interface IHealthService {
  check(request: HealthCheckRequest): Promise<HealthCheckResponse>;
  watch(request: HealthCheckRequest): AsyncIterable<HealthCheckResponse>;
}

export interface IUserService {
  getUser(request: GetUserRequest): Promise<UserResponse>;
  getUserByEmail(request: GetUserByEmailRequest): Promise<UserResponse>;
  listUsers(request: ListUsersRequest): Promise<ListUsersResponse>;
  createUser(request: CreateUserRequest): Promise<UserResponse>;
  updateUser(request: UpdateUserRequest): Promise<UserResponse>;
  deleteUser(request: DeleteUserRequest): Promise<SuccessResponse>;
}

export interface IAuthorizationService {
  checkPermission(request: CheckPermissionRequest): Promise<CheckPermissionResponse>;
  validateToken(request: ValidateTokenRequest): Promise<ValidateTokenResponse>;
  getUserPermissions(request: GetUserPermissionsRequest): Promise<GetUserPermissionsResponse>;
}
