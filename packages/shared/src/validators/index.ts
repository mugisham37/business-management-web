/**
 * Shared Validators
 */

import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email().max(254);

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be no more than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one digit')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

// ID validation
export const idSchema = z.string().uuid();

// Name validation
export const nameSchema = z.string().min(1).max(100).trim();

// URL validation
export const urlSchema = z.string().url();

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Sort validation
export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

// Date range validation
export const dateRangeSchema = z
  .object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(data => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
  });

// Common validation helpers
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function validateId(id: string): boolean {
  return idSchema.safeParse(id).success;
}
