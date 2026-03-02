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
 * Permission creation validation schema
 */
export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100),
  description: z.string().max(500).optional(),
  module: z.enum([
    'users',
    'permissions',
    'organizations',
    'branches',
    'departments',
    'business_rules',
    'audit_logs',
    'reports',
  ]),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage']),
  hierarchyLevel: z.number().int().min(1).max(10),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
