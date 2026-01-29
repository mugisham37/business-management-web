/**
 * GraphQL Permission Interceptor
 * Intercepts GraphQL operations to validate permissions before execution
 * Requirement 10.4: GraphQL operation permission validation
 */

import { ApolloLink, Operation, NextLink, FetchResult } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { permissionValidationService } from './PermissionValidationService';
import { GraphQLError } from 'graphql';

interface OperationContext {
  operationName: string;
  operationType?: 'query' | 'mutation' | 'subscription';
  variables?: Record<string, unknown>;
  userId?: string;
  skipPermissionCheck?: boolean;
}

/**
 * GraphQL Permission Interceptor Link
 * Apollo Link that validates permissions before executing GraphQL operations
 */
export class GraphQLPermissionInterceptor extends ApolloLink {
  private readonly publicOperations = new Set([
    'login',
    'register',
    'forgotPassword',
    'resetPassword',
    'refreshToken',
    'getSocialAuthUrl',
  ]);

  constructor() {
    super();
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    return new Observable((observer) => {
      this.validateOperation(operation)
        .then((isValid) => {
          if (!isValid) {
            observer.error(new GraphQLError('Insufficient permissions for this operation', {
              extensions: {
                code: 'FORBIDDEN',
                operationName: operation.operationName,
              },
            }));
            return;
          }

          // Continue with the operation if validation passes
          const subscription = forward(operation).subscribe({
            next: (result) => observer.next(result),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });

          // Return cleanup function
          return () => subscription.unsubscribe();
        })
        .catch((error) => {
          console.error('Permission validation error:', error);
          observer.error(new GraphQLError('Permission validation failed', {
            extensions: {
              code: 'INTERNAL_ERROR',
              originalError: error.message,
            },
          }));
        });
    });
  }

  /**
   * Validate operation permissions
   */
  private async validateOperation(operation: Operation): Promise<boolean> {
    const context = this.extractOperationContext(operation);

    // Skip validation for public operations
    if (this.isPublicOperation(context.operationName)) {
      return true;
    }

    // Skip validation if explicitly requested
    if (context.skipPermissionCheck) {
      return true;
    }

    // Skip validation if no operation name (introspection queries, etc.)
    if (!context.operationName) {
      return true;
    }

    try {
      const validationResult = await permissionValidationService.validateGraphQLOperation(
        context.operationName,
        context.userId,
        context.variables
      );

      if (!validationResult.hasAccess) {
        console.warn('GraphQL operation blocked:', {
          operation: context.operationName,
          reason: validationResult.reason,
          requiredPermissions: validationResult.requiredPermissions,
          requiredTier: validationResult.requiredTier,
        });
      }

      return validationResult.hasAccess;
    } catch (error) {
      console.error('Permission validation failed:', error);
      // Allow operation to proceed on validation error to prevent breaking the app
      return true;
    }
  }

  /**
   * Extract operation context from Apollo operation
   */
  private extractOperationContext(operation: Operation): OperationContext {
    const { operationName, query, variables } = operation;
    const context = operation.getContext();

    // Determine operation type from query
    let operationType: 'query' | 'mutation' | 'subscription' | undefined;
    if (query.definitions.length > 0) {
      const definition = query.definitions[0];
      if (definition && definition.kind === 'OperationDefinition') {
        operationType = definition.operation;
      }
    }

    return {
      operationName: operationName || '',
      operationType,
      variables,
      userId: context.userId,
      skipPermissionCheck: context.skipPermissionCheck,
    };
  }

  /**
   * Check if operation is public (doesn't require authentication)
   */
  private isPublicOperation(operationName?: string): boolean {
    if (!operationName) return false;
    return this.publicOperations.has(operationName);
  }

  /**
   * Add public operation to the whitelist
   */
  public addPublicOperation(operationName: string): void {
    this.publicOperations.add(operationName);
  }

  /**
   * Remove public operation from the whitelist
   */
  public removePublicOperation(operationName: string): void {
    this.publicOperations.delete(operationName);
  }

  /**
   * Get all public operations
   */
  public getPublicOperations(): string[] {
    return Array.from(this.publicOperations);
  }
}

/**
 * Create GraphQL Permission Interceptor Link
 */
export function createPermissionInterceptorLink(): GraphQLPermissionInterceptor {
  return new GraphQLPermissionInterceptor();
}

/**
 * Context helper for skipping permission checks
 */
export function skipPermissionCheck() {
  return {
    skipPermissionCheck: true,
  };
}

/**
 * Context helper for setting user ID for permission checks
 */
export function withUserId(userId: string) {
  return {
    userId,
  };
}

/**
 * Higher-order function to wrap GraphQL operations with permission context
 */
export function withPermissionContext<T extends Record<string, unknown>>(
  context: T
): T & { skipPermissionCheck?: boolean; userId?: string } {
  return context;
}

/**
 * Permission-aware GraphQL operation executor
 */
export class PermissionAwareGraphQLExecutor {
  private interceptor: GraphQLPermissionInterceptor;

  constructor() {
    this.interceptor = new GraphQLPermissionInterceptor();
  }

  /**
   * Execute operation with permission validation
   */
  async executeWithPermissionCheck<T = Record<string, unknown>>(
    operation: {
      operationName: string;
      operationType: 'query' | 'mutation' | 'subscription';
      variables?: Record<string, unknown>;
    },
    userId?: string
  ): Promise<{ canExecute: boolean; reason?: string }> {
    try {
      const validationResult = await permissionValidationService.validateGraphQLOperation(
        operation.operationName,
        userId,
        operation.variables
      );

      return {
        canExecute: validationResult.hasAccess,
        reason: validationResult.reason || undefined,
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        canExecute: false,
        reason: 'Permission validation error',
      };
    }
  }

  /**
   * Batch validate multiple operations
   */
  async batchValidateOperations(
    operations: Array<{
      operationName: string;
      operationType: 'query' | 'mutation' | 'subscription';
      variables?: Record<string, unknown>;
    }>,
    userId?: string
  ): Promise<Record<string, { canExecute: boolean; reason?: string }>> {
    const results: Record<string, { canExecute: boolean; reason?: string }> = {};

    await Promise.all(
      operations.map(async (operation) => {
        try {
          const validationResult = await permissionValidationService.validateGraphQLOperation(
            operation.operationName,
            userId,
            operation.variables
          );

          results[operation.operationName] = {
            canExecute: validationResult.hasAccess,
            reason: validationResult.reason || undefined,
          };
        } catch (error) {
          console.error(`Permission check failed for ${operation.operationName}:`, error);
          results[operation.operationName] = {
            canExecute: false,
            reason: 'Permission validation error',
          };
        }
      })
    );

    return results;
  }

  /**
   * Get interceptor instance
   */
  getInterceptor(): GraphQLPermissionInterceptor {
    return this.interceptor;
  }
}

// Export singleton instance
export const permissionAwareExecutor = new PermissionAwareGraphQLExecutor();