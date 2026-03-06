import { z } from 'zod';

/**
 * Comprehensive validation schema for owner registration with onboarding
 * Matches backend RegisterOwnerInput exactly
 */
export const registerOwnerSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
  
  // Organization Information
  organizationName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s&.,'-]+$/, 'Company name contains invalid characters'),
  
  industry: z
    .string()
    .min(1, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters'),
  
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  
  website: z
    .string()
    .refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), 'Invalid URL format')
    .optional()
    .nullable(),
  
  // Business Operations
  businessType: z.enum(['product', 'service', 'both']),
  
  primaryActivities: z
    .array(z.string())
    .min(1, 'Select at least one primary activity')
    .max(10, 'You can select up to 10 activities'),
  
  businessStage: z.enum(['startup', 'growing', 'established']),
  
  // Business Goals
  businessGoals: z
    .array(z.string())
    .min(1, 'Select at least one business goal')
    .max(10, 'You can select up to 10 goals'),
  
  timeline: z.enum(['immediate', '1-3', '3-6', '6-12']),
  
  // User Preferences
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Invalid currency code format'),
  
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .max(100, 'Timezone must be less than 100 characters'),
  
  emailNotifications: z.boolean(),
  
  weeklyReports: z.boolean(),
  
  marketingUpdates: z.boolean(),
});

/**
 * Type inference from schema
 */
export type RegisterOwnerInput = z.infer<typeof registerOwnerSchema>;

/**
 * Validate a single field
 */
export function validateField(field: keyof RegisterOwnerInput, value: any): {
  valid: boolean;
  error: string | null;
} {
  try {
    const fieldSchema = registerOwnerSchema.shape[field];
    fieldSchema.parse(value);
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message };
    }
    return { valid: false, error: 'Invalid input' };
  }
}

/**
 * Validate step 1 (Company Information)
 */
export function validateStep1(data: Partial<RegisterOwnerInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const step1Schema = registerOwnerSchema.pick({
    organizationName: true,
    industry: true,
    companySize: true,
    website: true,
  });

  try {
    step1Schema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
}

/**
 * Validate step 2 (Business Operations)
 */
export function validateStep2(data: Partial<RegisterOwnerInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const step2Schema = registerOwnerSchema.pick({
    businessType: true,
    primaryActivities: true,
    businessStage: true,
  });

  try {
    step2Schema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
}

/**
 * Validate step 3 (Business Goals)
 */
export function validateStep3(data: Partial<RegisterOwnerInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const step3Schema = registerOwnerSchema.pick({
    businessGoals: true,
    timeline: true,
  });

  try {
    step3Schema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
}

/**
 * Validate personal information
 */
export function validatePersonalInfo(data: Partial<RegisterOwnerInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const personalSchema = registerOwnerSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
  });

  try {
    personalSchema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
}

/**
 * Validate all fields
 */
export function validateAll(data: Partial<RegisterOwnerInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  try {
    registerOwnerSchema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: 'Validation failed' } };
  }
}
