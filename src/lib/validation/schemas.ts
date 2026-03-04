import { z } from 'zod';

// ============================================================================
// Basic Field Validators
// ============================================================================

/**
 * Email validation with RFC 5322 compliance
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

/**
 * Password validation with strength requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * PIN validation - exactly 6 digits
 */
export const pinSchema = z
  .string()
  .regex(/^\d{6}$/, 'PIN must be exactly 6 digits');

/**
 * Phone number validation with international format (E.164)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// ============================================================================
// Authentication Schemas
// ============================================================================

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * PIN login validation schema
 */
export const pinLoginSchema = z.object({
  email: emailSchema,
  pin: pinSchema,
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type PinLoginInput = z.infer<typeof pinLoginSchema>;

// ============================================================================
// User Management Schemas
// ============================================================================

/**
 * User creation validation schema
 */
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: passwordSchema,
  phone: phoneSchema.optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  hierarchyLevel: z.number().int().min(1).max(10),
  permissionIds: z.array(z.string().uuid()).min(1, 'At least one permission required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================================================
// Permission Management Schemas
// ============================================================================

/**
 * Module permission input validation schema
 */
export const modulePermissionSchema = z.object({
  module: z.string().min(1, 'Module name is required'),
  actions: z.array(z.string().min(1)).min(1, 'At least one action required'),
});

export type ModulePermissionInput = z.infer<typeof modulePermissionSchema>;

/**
 * Grant permissions validation schema
 */
export const grantPermissionsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  permissions: z.array(modulePermissionSchema).min(1, 'At least one permission required'),
});

export type GrantPermissionsInput = z.infer<typeof grantPermissionsSchema>;

/**
 * Revoke permissions validation schema
 */
export const revokePermissionsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  modules: z.array(z.string().min(1)).min(1, 'At least one module required'),
});

export type RevokePermissionsInput = z.infer<typeof revokePermissionsSchema>;

// ============================================================================
// Organization Management Schemas
// ============================================================================

/**
 * Update organization validation schema
 */
export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

/**
 * Create branch validation schema
 */
export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').max(100),
  code: z.string().min(1, 'Branch code is required').max(50),
  organizationId: z.string().uuid('Invalid organization ID'),
  address: z.string().max(500).optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

/**
 * Update branch validation schema
 */
export const updateBranchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  address: z.string().max(500).optional(),
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

/**
 * Create department validation schema
 */
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
  code: z.string().min(1, 'Department code is required').max(50),
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

/**
 * Update department validation schema
 */
export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  branchId: z.string().uuid('Invalid branch ID').optional(),
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

// ============================================================================
// Business Rule Schemas
// ============================================================================

/**
 * Create business rule validation schema
 */
export const createBusinessRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(100),
  transactionType: z.string().min(1, 'Transaction type is required'),
  appliesToLevel: z.string().min(1, 'Applies to level is required'),
  approverLevel: z.string().min(1, 'Approver level is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type CreateBusinessRuleInput = z.infer<typeof createBusinessRuleSchema>;

/**
 * Update business rule validation schema
 */
export const updateBusinessRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  appliesToLevel: z.string().min(1).optional(),
  approverLevel: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateBusinessRuleInput = z.infer<typeof updateBusinessRuleSchema>;

// ============================================================================
// Session Management Schemas
// ============================================================================

/**
 * Revoke session validation schema
 */
export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;

// ============================================================================
// Authentication Schemas (Additional)
// ============================================================================

/**
 * Register owner validation schema
 */
export const registerOwnerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  organizationName: z.string().min(1, 'Organization name is required').max(100),
});

export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ============================================================================
// User Management Schemas (Additional)
// ============================================================================

/**
 * Create manager validation schema
 */
export const createManagerSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: passwordSchema,
  phone: phoneSchema.optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
});

export type CreateManagerInput = z.infer<typeof createManagerSchema>;

/**
 * Create worker validation schema
 */
export const createWorkerSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: passwordSchema,
  phone: phoneSchema.optional(),
  organizationId: z.string().uuid('Invalid organization ID'),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;

/**
 * Update user validation schema
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema.optional(),
  branchId: z.string().uuid('Invalid branch ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================================================
// Audit Log Schemas
// ============================================================================

/**
 * Audit filters validation schema
 */
export const auditFiltersSchema = z.object({
  action: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type AuditFiltersInput = z.infer<typeof auditFiltersSchema>;
