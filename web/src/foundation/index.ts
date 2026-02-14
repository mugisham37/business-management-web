/**
 * Foundation Layer - Next.js 14 Frontend Infrastructure
 * 
 * This module provides core utilities, hooks, providers, and middleware
 * for communicating with the NestJS GraphQL backend.
 * 
 * Features:
 * - Type-safe GraphQL communication with generated types
 * - Authentication and authorization
 * - Token management with automatic refresh
 * - Permission checking with wildcard support
 * - Optimized caching with Apollo Client
 * - Error handling and user feedback
 * - Input validation with Zod
 * - Route protection with Next.js middleware
 * 
 * @module foundation
 */

// ============================================================================
// Configuration
// ============================================================================
export { env, isDevelopment, isProduction, isTest } from './config/env';
export type { EnvConfig } from './config/env';
export * from './config/routes';

// ============================================================================
// Types
// ============================================================================
// Generated GraphQL types (types only, no hooks - safe for server components)
export * from './types/generated/graphql-types';

// Additional domain models and utility types (non-conflicting exports)
export type { 
  PermissionModule,
  Session,
} from './types/models';

export type {
  PageInfo,
  PaginatedResponse,
  MFASetupResponse,
  MutationResponse,
} from './types/api';

export type {
  Nullable,
  Optional,
  PartialBy,
  RequiredBy,
  SortConfig,
  DateRangeFilter,
  StringFilter,
  NumberFilter,
  BooleanFilter,
  FilterConfig,
  PaginationConfig,
  ListQueryOptions,
} from './types/common';

export { SortDirection } from './types/common';

// ============================================================================
// Core Library
// ============================================================================
// Authentication
export * from './lib/auth';

// GraphQL Client
export * from './lib/graphql';

// Storage
export * from './lib/storage';

// Validation (export schemas and hooks, but not conflicting types)
export {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  createBranchSchema,
  createDepartmentSchema,
  useValidation,
} from './lib/validation';

export type {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
} from './lib/validation';

// ============================================================================
// React Hooks
// ============================================================================
// Export all hooks except those that conflict with providers
export {
  // Auth hooks
  useLogin,
  useEnableMFA,
  useDisableMFA,
  useVerifyMFA,
  useChangePassword,
  useRequestPasswordReset,
  useResetPassword,
  useActiveSessions,
  useRevokeSession,
  useLogoutAllDevices,
  // User hooks
  useMe,
  useUser,
  useUsers,
  useCreateManager,
  useCreateWorker,
  useUpdateUser,
  useDeleteUser,
  useTransferOwnership,
  // Permission hooks
  useAvailablePermissions,
  useModules,
  usePermissionsByModule,
  useAssignPermissions,
  useRevokePermissions,
  useManagePermissions,
  // Branch hooks
  useBranches,
  useCreateBranch,
  useAssignBranches,
  // Department hooks
  useDepartments,
  useCreateDepartment,
  useAssignDepartments,
  // Audit hooks
  useAuditLogs,
} from './hooks';

export type {
  // Auth hook types
  UseLoginReturn,
  UseEnableMFAReturn,
  UseDisableMFAReturn,
  UseVerifyMFAReturn,
  UseChangePasswordReturn,
  UseRequestPasswordResetReturn,
  UseResetPasswordReturn,
  UseActiveSessionsReturn,
  UseRevokeSessionReturn,
  UseLogoutAllDevicesReturn,
} from './hooks';

// ============================================================================
// Context Providers
// ============================================================================
export {
  // Providers
  RootProvider,
  GraphQLProvider,
  AuthProvider,
  PermissionProvider,
  // Hooks
  useAuth,
  usePermission,
  // Components
  PermissionGate,
} from './providers';

export type {
  RootProviderProps,
  GraphQLProviderProps,
  AuthProviderProps,
  AuthContextValue,
  PermissionProviderProps,
  PermissionContextValue,
  PermissionGateProps,
} from './providers';

// ============================================================================
// Utilities
// ============================================================================
export * from './utils/errors';
export * from './utils/token';
export * from './utils/formatters';
export * from './utils/validators';
export { ErrorBoundary } from './utils/ErrorBoundary';
export { 
  createPermissionChecker,
  type PermissionChecker,
  type PermissionSystemConfig,
} from './utils/permissions';
