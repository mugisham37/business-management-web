import { useCallback } from 'react';
import { z } from 'zod';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Custom hook for validating data against Zod schemas
 * 
 * @param schema - Zod schema to validate against
 * @returns Object with validate function
 * 
 * @example
 * ```tsx
 * const { validate } = useValidation(loginSchema);
 * 
 * const handleSubmit = (formData) => {
 *   const result = validate(formData);
 *   if (result.success) {
 *     // Submit data
 *     console.log(result.data);
 *   } else {
 *     // Display errors
 *     console.log(result.errors);
 *   }
 * };
 * ```
 */
export function useValidation<T extends z.ZodType>(schema: T) {
  /**
   * Validates data against the provided schema
   * 
   * @param data - Data to validate
   * @returns Validation result with success flag, validated data, or field-specific errors
   */
  const validate = useCallback(
    (data: unknown): ValidationResult<z.infer<T>> => {
      const result = schema.safeParse(data);

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }

      // Convert Zod errors to field-specific error messages
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      return {
        success: false,
        errors,
      };
    },
    [schema]
  );

  return { validate };
}
