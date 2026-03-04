import { z } from 'zod';
import { ValidationError } from '../errors/error-types';

/**
 * Input Validator
 * 
 * Provides utilities for validating user inputs before API calls.
 * Validates data against Zod schemas and throws ValidationError if validation fails.
 * 
 * Requirements: 13.1 - Validate all user inputs before sending to backend
 */

/**
 * Validates input data against a Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Optional context for error messages (e.g., "login form", "user creation")
 * @returns Validated data
 * @throws ValidationError if validation fails
 * 
 * @example
 * ```typescript
 * const validatedInput = validateInput(loginSchema, formData, 'login form');
 * await authService.login(validatedInput);
 * ```
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>;
      const contextMessage = context ? ` in ${context}` : '';
      
      throw new ValidationError(
        `Validation failed${contextMessage}`,
        'Please check your input and try again',
        fieldErrors
      );
    }
    throw error;
  }
}

/**
 * Validates input data and returns validation result without throwing
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag, data (if valid), and errors (if invalid)
 * 
 * @example
 * ```typescript
 * const result = safeValidateInput(loginSchema, formData);
 * if (result.success) {
 *   await authService.login(result.data);
 * } else {
 *   displayErrors(result.errors);
 * }
 * ```
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): 
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: Record<string, string[]> } 
{
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null,
    };
  }
  
  return {
    success: false,
    data: null,
    errors: result.error.flatten().fieldErrors as Record<string, string[]>,
  };
}

/**
 * Validates a single field value against a schema
 * 
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @returns Error message if invalid, null if valid
 * 
 * @example
 * ```typescript
 * const emailError = validateField(emailSchema, userInput.email);
 * if (emailError) {
 *   setFieldError('email', emailError);
 * }
 * ```
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): string | null {
  const result = schema.safeParse(value);
  
  if (result.success) {
    return null;
  }
  
  // Return first error message
  const errors = result.error.issues;
  return errors.length > 0 ? errors[0].message : 'Invalid value';
}

/**
 * Creates a validation function for a specific schema
 * 
 * @param schema - Zod schema to validate against
 * @param context - Optional context for error messages
 * @returns Validation function
 * 
 * @example
 * ```typescript
 * const validateLoginInput = createValidator(loginSchema, 'login form');
 * 
 * // Later in code
 * const validatedData = validateLoginInput(formData);
 * ```
 */
export function createValidator<T>(
  schema: z.ZodSchema<T>,
  context?: string
): (data: unknown) => T {
  return (data: unknown) => validateInput(schema, data, context);
}

/**
 * Validates multiple inputs at once
 * 
 * @param validations - Array of validation configurations
 * @returns Array of validated data in the same order
 * @throws ValidationError if any validation fails
 * 
 * @example
 * ```typescript
 * const [validatedUser, validatedPermissions] = validateMultiple([
 *   { schema: createUserSchema, data: userData, context: 'user form' },
 *   { schema: grantPermissionsSchema, data: permissionsData, context: 'permissions' },
 * ]);
 * ```
 */
export function validateMultiple<T extends unknown[]>(
  validations: Array<{
    schema: z.ZodSchema<unknown>;
    data: unknown;
    context?: string;
  }>
): T {
  const results: unknown[] = [];
  const allErrors: Record<string, Record<string, string[]>> = {};
  let hasErrors = false;
  
  for (let i = 0; i < validations.length; i++) {
    const { schema, data, context } = validations[i];
    const result = schema.safeParse(data);
    
    if (result.success) {
      results.push(result.data);
    } else {
      hasErrors = true;
      const contextKey = context || `validation_${i}`;
      allErrors[contextKey] = result.error.flatten().fieldErrors as Record<string, string[]>;
      results.push(null);
    }
  }
  
  if (hasErrors) {
    // Flatten all errors into a single object
    const flatErrors: Record<string, string[]> = {};
    for (const [contextKey, errors] of Object.entries(allErrors)) {
      for (const [field, messages] of Object.entries(errors)) {
        const key = `${contextKey}.${field}`;
        flatErrors[key] = messages;
      }
    }
    
    throw new ValidationError(
      'Multiple validation errors occurred',
      'Please check your inputs and try again',
      flatErrors
    );
  }
  
  return results as T;
}
