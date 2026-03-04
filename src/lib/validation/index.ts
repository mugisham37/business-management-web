/**
 * Validation System
 * 
 * This module provides comprehensive validation utilities for the foundation layer:
 * - Input validation schemas using Zod
 * - DTO validators with automatic transformations
 * - Type guards for runtime type checking
 * - Input validation helpers for pre-API call validation
 * - Input sanitization to prevent XSS attacks
 * - Server response validation
 */

// Server response validation
export {
  responseValidator,
  validatedFetch,
  createResponseValidator,
  validateWithRetry,
  createValidationLink,
  useValidatedFetch,
  type ValidationResult,
} from './response-validator';

// Input sanitization
export {
  sanitizeString,
  sanitizeObject,
  sanitizeArray,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeFormData,
  createSanitizer,
  type SanitizeOptions,
} from './sanitizer';

// Input validation helpers
export {
  validateInput,
  safeValidateInput,
  validateField,
  createValidator,
  validateMultiple,
} from './input-validator';

// Input validation schemas
export {
  // Basic field validators
  emailSchema,
  passwordSchema,
  pinSchema,
  phoneSchema,
  
  // Authentication schemas
  loginSchema,
  pinLoginSchema,
  registerOwnerSchema,
  changePasswordSchema,
  refreshTokenSchema,
  
  // User management schemas
  createUserSchema,
  createManagerSchema,
  createWorkerSchema,
  updateUserSchema,
  
  // Permission management schemas
  modulePermissionSchema,
  grantPermissionsSchema,
  revokePermissionsSchema,
  
  // Organization management schemas
  updateOrganizationSchema,
  createBranchSchema,
  updateBranchSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  
  // Business rule schemas
  createBusinessRuleSchema,
  updateBusinessRuleSchema,
  
  // Session management schemas
  revokeSessionSchema,
  
  // Audit log schemas
  auditFiltersSchema,
  
  // Types
  type LoginInput,
  type PinLoginInput,
  type RegisterOwnerInput,
  type ChangePasswordInput,
  type RefreshTokenInput,
  type CreateUserInput,
  type CreateManagerInput,
  type CreateWorkerInput,
  type UpdateUserInput,
  type ModulePermissionInput,
  type GrantPermissionsInput,
  type RevokePermissionsInput,
  type UpdateOrganizationInput,
  type CreateBranchInput,
  type UpdateBranchInput,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type CreateBusinessRuleInput,
  type UpdateBusinessRuleInput,
  type RevokeSessionInput,
  type AuditFiltersInput,
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
