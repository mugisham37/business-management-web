import { GraphQLError } from 'graphql';
import * as grpc from '@grpc/grpc-js';
import { UserDto, PermissionDto, OrganizationDto } from './dto-validators';

// ============================================================================
// Entity Type Guards
// ============================================================================

/**
 * Type guard to check if an object is a valid User
 * 
 * @param obj - Object to check
 * @returns True if object is a User
 * 
 * @example
 * ```typescript
 * if (isUser(data)) {
 *   console.log(data.email); // TypeScript knows data is UserDto
 * }
 * ```
 */
export function isUser(obj: unknown): obj is UserDto {
  if (!obj || typeof obj !== 'object') return false;

  const user = obj as Record<string, unknown>;

  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    (user.phone === null || typeof user.phone === 'string') &&
    (user.status === 'active' || user.status === 'inactive' || user.status === 'suspended') &&
    typeof user.organizationId === 'string' &&
    (user.branchId === null || typeof user.branchId === 'string') &&
    (user.departmentId === null || typeof user.departmentId === 'string') &&
    typeof user.hierarchyLevel === 'number' &&
    Array.isArray(user.permissions) &&
    (user.createdAt instanceof Date || typeof user.createdAt === 'string') &&
    (user.updatedAt instanceof Date || typeof user.updatedAt === 'string')
  );
}

/**
 * Type guard to check if an object is a valid Permission
 * 
 * @param obj - Object to check
 * @returns True if object is a Permission
 * 
 * @example
 * ```typescript
 * if (isPermission(data)) {
 *   console.log(data.module); // TypeScript knows data is PermissionDto
 * }
 * ```
 */
export function isPermission(obj: unknown): obj is PermissionDto {
  if (!obj || typeof obj !== 'object') return false;

  const permission = obj as Record<string, unknown>;

  return (
    typeof permission.id === 'string' &&
    typeof permission.name === 'string' &&
    (permission.description === null || typeof permission.description === 'string') &&
    typeof permission.module === 'string' &&
    typeof permission.action === 'string' &&
    typeof permission.hierarchyLevel === 'number' &&
    (permission.createdAt instanceof Date || typeof permission.createdAt === 'string') &&
    (permission.updatedAt instanceof Date || typeof permission.updatedAt === 'string')
  );
}

/**
 * Type guard to check if an object is a valid Organization
 * 
 * @param obj - Object to check
 * @returns True if object is an Organization
 * 
 * @example
 * ```typescript
 * if (isOrganization(data)) {
 *   console.log(data.code); // TypeScript knows data is OrganizationDto
 * }
 * ```
 */
export function isOrganization(obj: unknown): obj is OrganizationDto {
  if (!obj || typeof obj !== 'object') return false;

  const org = obj as Record<string, unknown>;

  return (
    typeof org.id === 'string' &&
    typeof org.name === 'string' &&
    typeof org.code === 'string' &&
    (org.status === 'active' || org.status === 'inactive') &&
    (org.createdAt instanceof Date || typeof org.createdAt === 'string') &&
    (org.updatedAt instanceof Date || typeof org.updatedAt === 'string')
  );
}

// ============================================================================
// Error Type Guards
// ============================================================================

/**
 * Type guard to check if an error is a GraphQL error
 * 
 * @param error - Error to check
 * @returns True if error is a GraphQLError
 * 
 * @example
 * ```typescript
 * try {
 *   await apolloClient.query(...);
 * } catch (error) {
 *   if (isGraphQLError(error)) {
 *     console.log(error.extensions); // TypeScript knows error is GraphQLError
 *   }
 * }
 * ```
 */
export function isGraphQLError(error: unknown): error is GraphQLError {
  if (!error || typeof error !== 'object') return false;

  const gqlError = error as Record<string, unknown>;

  return (
    typeof gqlError.message === 'string' &&
    'extensions' in gqlError &&
    (gqlError.extensions === undefined ||
      gqlError.extensions === null ||
      typeof gqlError.extensions === 'object')
  );
}

/**
 * Type guard to check if an error is a gRPC ServiceError
 * 
 * @param error - Error to check
 * @returns True if error is a gRPC ServiceError
 * 
 * @example
 * ```typescript
 * try {
 *   await grpcClient.checkPermission(...);
 * } catch (error) {
 *   if (isGRPCError(error)) {
 *     console.log(error.code); // TypeScript knows error is ServiceError
 *   }
 * }
 * ```
 */
export function isGRPCError(error: unknown): error is grpc.ServiceError {
  if (!error || typeof error !== 'object') return false;

  const grpcError = error as Record<string, unknown>;

  return (
    typeof grpcError.code === 'number' &&
    typeof grpcError.message === 'string' &&
    'details' in grpcError &&
    typeof grpcError.details === 'string'
  );
}

// ============================================================================
// Array Type Guards
// ============================================================================

/**
 * Type guard to check if an array contains only Users
 * 
 * @param arr - Array to check
 * @returns True if array contains only Users
 */
export function isUserArray(arr: unknown): arr is UserDto[] {
  return Array.isArray(arr) && arr.every(isUser);
}

/**
 * Type guard to check if an array contains only Permissions
 * 
 * @param arr - Array to check
 * @returns True if array contains only Permissions
 */
export function isPermissionArray(arr: unknown): arr is PermissionDto[] {
  return Array.isArray(arr) && arr.every(isPermission);
}

/**
 * Type guard to check if an array contains only Organizations
 * 
 * @param arr - Array to check
 * @returns True if array contains only Organizations
 */
export function isOrganizationArray(arr: unknown): arr is OrganizationDto[] {
  return Array.isArray(arr) && arr.every(isOrganization);
}
