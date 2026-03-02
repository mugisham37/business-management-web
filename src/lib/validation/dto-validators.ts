import { z } from 'zod';
import { ValidationError } from '../errors/error-types';

// ============================================================================
// User DTO Validator
// ============================================================================

/**
 * User DTO validation schema with automatic transformations
 */
export const userDtoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']),
  organizationId: z.string().uuid(),
  branchId: z.string().uuid().nullable(),
  departmentId: z.string().uuid().nullable(),
  hierarchyLevel: z.number().int(),
  permissions: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      module: z.string(),
      action: z.string(),
    })
  ),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type UserDto = z.infer<typeof userDtoSchema>;

// ============================================================================
// Permission DTO Validator
// ============================================================================

/**
 * Permission DTO validation schema with automatic transformations
 */
export const permissionDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  module: z.string(),
  action: z.string(),
  hierarchyLevel: z.number().int(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type PermissionDto = z.infer<typeof permissionDtoSchema>;

// ============================================================================
// Organization DTO Validator
// ============================================================================

/**
 * Organization DTO validation schema with automatic transformations
 */
export const organizationDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type OrganizationDto = z.infer<typeof organizationDtoSchema>;

// ============================================================================
// Branch DTO Validator
// ============================================================================

/**
 * Branch DTO validation schema with automatic transformations
 */
export const branchDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  organizationId: z.string().uuid(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type BranchDto = z.infer<typeof branchDtoSchema>;

// ============================================================================
// Department DTO Validator
// ============================================================================

/**
 * Department DTO validation schema with automatic transformations
 */
export const departmentDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  branchId: z.string().uuid(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type DepartmentDto = z.infer<typeof departmentDtoSchema>;

// ============================================================================
// Validation Helper Function
// ============================================================================

/**
 * Generic DTO validation helper function
 * 
 * Validates data against a Zod schema and throws a ValidationError if validation fails.
 * Automatically transforms data according to schema transformations (e.g., string to Date).
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and transformed data
 * @throws ValidationError if validation fails
 * 
 * @example
 * ```typescript
 * const user = validateDto(userDtoSchema, serverResponse);
 * // user.createdAt is now a Date object
 * ```
 */
export function validateDto<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'DTO validation failed',
        'Invalid data received from server',
        error.flatten().fieldErrors as Record<string, string[]>
      );
    }
    throw error;
  }
}
