import { z } from 'zod';
import { ValidationError } from '../errors/error-types';

/**
 * Server Response Validator
 * 
 * Validates server responses before using data to prevent malformed data issues.
 * Ensures response structure matches expected types.
 * 
 * Requirements: 13.10 - Validate server responses before using data
 */

/**
 * Response validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationError;
}

/**
 * Response Validator
 * 
 * Validates server responses against expected schemas.
 */
class ResponseValidator {
  /**
   * Validate response data against a schema
   * 
   * @param schema - Zod schema to validate against
   * @param data - Response data to validate
   * @param context - Optional context for error messages
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const result = responseValidator.validate(userSchema, serverResponse);
   * if (result.success) {
   *   // Use result.data safely
   * } else {
   *   // Handle result.error
   * }
   * ```
   */
  validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<T> {
    try {
      const validated = schema.parse(data);
      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const contextMessage = context ? ` in ${context}` : '';
        return {
          success: false,
          error: new ValidationError(
            `Server response validation failed${contextMessage}`,
            'The server returned unexpected data. Please try again.',
            error.flatten().fieldErrors as Record<string, string[]>
          ),
        };
      }
      
      return {
        success: false,
        error: new ValidationError(
          'Response validation error',
          'An unexpected error occurred while validating server response',
          {}
        ),
      };
    }
  }
  
  /**
   * Validate response and throw on error
   * 
   * @param schema - Zod schema to validate against
   * @param data - Response data to validate
   * @param context - Optional context for error messages
   * @returns Validated data
   * @throws ValidationError if validation fails
   * 
   * @example
   * ```typescript
   * const user = responseValidator.validateOrThrow(userSchema, serverResponse);
   * // Use user safely - will throw if invalid
   * ```
   */
  validateOrThrow<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): T {
    const result = this.validate(schema, data, context);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data!;
  }
  
  /**
   * Validate array response
   * 
   * @param itemSchema - Schema for array items
   * @param data - Array data to validate
   * @param context - Optional context for error messages
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const result = responseValidator.validateArray(userSchema, serverResponse);
   * if (result.success) {
   *   // Use result.data as User[]
   * }
   * ```
   */
  validateArray<T>(
    itemSchema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<T[]> {
    const arraySchema = z.array(itemSchema);
    return this.validate(arraySchema, data, context);
  }
  
  /**
   * Validate paginated response
   * 
   * @param itemSchema - Schema for array items
   * @param data - Paginated response data
   * @param context - Optional context for error messages
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const result = responseValidator.validatePaginated(userSchema, serverResponse);
   * if (result.success) {
   *   // Use result.data.items, result.data.total, etc.
   * }
   * ```
   */
  validatePaginated<T>(
    itemSchema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): ValidationResult<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const paginatedSchema = z.object({
      items: z.array(itemSchema),
      total: z.number().int().min(0),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
      hasMore: z.boolean().optional(),
    });
    
    return this.validate(paginatedSchema, data, context);
  }
  
  /**
   * Validate GraphQL response
   * 
   * @param dataSchema - Schema for the data field
   * @param response - GraphQL response
   * @param context - Optional context for error messages
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const result = responseValidator.validateGraphQL(userSchema, graphqlResponse);
   * if (result.success) {
   *   // Use result.data safely
   * }
   * ```
   */
  validateGraphQL<T>(
    dataSchema: z.ZodSchema<T>,
    response: unknown,
    context?: string
  ): ValidationResult<T> {
    // First validate the GraphQL response structure
    const graphqlSchema = z.object({
      data: dataSchema.nullable(),
      errors: z.array(z.object({
        message: z.string(),
        extensions: z.record(z.any()).optional(),
      })).optional(),
    });
    
    const structureResult = this.validate(graphqlSchema, response, context);
    
    if (!structureResult.success) {
      return structureResult as ValidationResult<T>;
    }
    
    // Check for GraphQL errors
    if (structureResult.data!.errors && structureResult.data!.errors.length > 0) {
      return {
        success: false,
        error: new ValidationError(
          'GraphQL error in response',
          structureResult.data!.errors[0].message,
          {}
        ),
      };
    }
    
    // Check for null data
    if (structureResult.data!.data === null) {
      return {
        success: false,
        error: new ValidationError(
          'Null data in GraphQL response',
          'The server returned no data',
          {}
        ),
      };
    }
    
    return {
      success: true,
      data: structureResult.data!.data,
    };
  }
  
  /**
   * Validate error response
   * 
   * @param response - Error response
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const result = responseValidator.validateError(errorResponse);
   * if (result.success) {
   *   // Use result.data.message, result.data.code
   * }
   * ```
   */
  validateError(response: unknown): ValidationResult<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }> {
    const errorSchema = z.object({
      message: z.string(),
      code: z.string().optional(),
      details: z.record(z.any()).optional(),
    });
    
    return this.validate(errorSchema, response, 'error response');
  }
}

/**
 * Singleton instance of Response Validator
 */
export const responseValidator = new ResponseValidator();

/**
 * Create a validated fetch wrapper
 * 
 * @param schema - Schema to validate response against
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Validated response data
 * @throws ValidationError if response is invalid
 * 
 * @example
 * ```typescript
 * const user = await validatedFetch(
 *   userSchema,
 *   '/api/users/123',
 *   { method: 'GET' }
 * );
 * // user is guaranteed to match userSchema
 * ```
 */
export async function validatedFetch<T>(
  schema: z.ZodSchema<T>,
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return responseValidator.validateOrThrow(schema, data, `fetch ${url}`);
}

/**
 * Create a response validator for a specific schema
 * 
 * @param schema - Schema to validate against
 * @param context - Optional context for error messages
 * @returns Validator function
 * 
 * @example
 * ```typescript
 * const validateUser = createResponseValidator(userSchema, 'user response');
 * 
 * // Later in code
 * const result = validateUser(serverResponse);
 * if (result.success) {
 *   // Use result.data
 * }
 * ```
 */
export function createResponseValidator<T>(
  schema: z.ZodSchema<T>,
  context?: string
): (data: unknown) => ValidationResult<T> {
  return (data: unknown) => responseValidator.validate(schema, data, context);
}

/**
 * Validate response with automatic retry on validation failure
 * 
 * @param schema - Schema to validate against
 * @param fetchFn - Function that fetches data
 * @param maxRetries - Maximum number of retries
 * @param context - Optional context for error messages
 * @returns Validated data
 * @throws ValidationError if all retries fail
 * 
 * @example
 * ```typescript
 * const user = await validateWithRetry(
 *   userSchema,
 *   () => fetch('/api/users/123').then(r => r.json()),
 *   3
 * );
 * ```
 */
export async function validateWithRetry<T>(
  schema: z.ZodSchema<T>,
  fetchFn: () => Promise<unknown>,
  maxRetries: number = 3,
  context?: string
): Promise<T> {
  let lastError: ValidationError | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await fetchFn();
      return responseValidator.validateOrThrow(schema, data, context);
    } catch (error) {
      if (error instanceof ValidationError) {
        lastError = error;
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError || new ValidationError(
    'Validation failed after retries',
    'Unable to validate server response after multiple attempts',
    {}
  );
}

/**
 * Middleware for validating Apollo GraphQL responses
 * 
 * @param schema - Schema to validate against
 * @returns Apollo Link
 * 
 * @example
 * ```typescript
 * import { ApolloLink } from '@apollo/client';
 * import { createValidationLink } from '@/lib/validation/response-validator';
 * 
 * const validationLink = createValidationLink(getUserSchema);
 * const client = new ApolloClient({
 *   link: ApolloLink.from([validationLink, httpLink]),
 *   cache,
 * });
 * ```
 */
export function createValidationLink<T>(schema: z.ZodSchema<T>) {
  return {
    request: (operation: any, forward: any) => {
      return forward(operation).map((response: any) => {
        if (response.data) {
          const result = responseValidator.validate(
            schema,
            response.data,
            `GraphQL ${operation.operationName}`
          );
          
          if (!result.success) {
            throw result.error;
          }
          
          response.data = result.data;
        }
        
        return response;
      });
    },
  };
}

/**
 * React hook for validated data fetching
 * 
 * @param schema - Schema to validate against
 * @param fetchFn - Function that fetches data
 * @returns Validated data, loading state, and error
 * 
 * @example
 * ```typescript
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data, loading, error } = useValidatedFetch(
 *     userSchema,
 *     () => fetch(`/api/users/${userId}`).then(r => r.json())
 *   );
 *   
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <div>{data.name}</div>;
 * }
 * ```
 */
export function useValidatedFetch<T>(
  schema: z.ZodSchema<T>,
  fetchFn: () => Promise<unknown>
): {
  data: T | null;
  loading: boolean;
  error: ValidationError | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<ValidationError | null>(null);
  
  const fetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const responseData = await fetchFn();
      const result = responseValidator.validate(schema, responseData);
      
      if (result.success) {
        setData(result.data!);
      } else {
        setError(result.error!);
      }
    } catch (err) {
      setError(
        new ValidationError(
          'Fetch error',
          err instanceof Error ? err.message : 'Unknown error',
          {}
        )
      );
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetch();
  }, []);
  
  return {
    data,
    loading,
    error,
    refetch: fetch,
  };
}

// Import React for the hook
import React from 'react';
