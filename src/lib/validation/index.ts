/**
 * Validation System
 * 
 * This module provides comprehensive validation utilities for the foundation layer:
 * - Input validation schemas using Zod
 * - DTO validators with automatic transformations
 * - Type guards for runtime type checking
 */

// Input validation schemas
export {
  emailSchema,
  passwordSchema,
  pinSchema,
  phoneSchema,
  loginSchema,
  pinLoginSchema,
  createUserSchema,
  createPermissionSchema,
  type LoginInput,
  type PinLoginInput,
  type CreateUserInput,
  type CreatePermissionInput,
} from './schemas';

// DTO validators
export {
  userDtoSchema,
  permissionDtoSchema,
  organizationDtoSchema,
  branchDtoSchema,
  departmentDtoSchema,
  validateDto,
  type UserDto,
  type PermissionDto,
  type OrganizationDto,
  type BranchDto,
  type DepartmentDto,
} from './dto-validators';

// Type guards
export {
  isUser,
  isPermission,
  isOrganization,
  isGraphQLError,
  isGRPCError,
  isUserArray,
  isPermissionArray,
  isOrganizationArray,
} from './type-guards';
