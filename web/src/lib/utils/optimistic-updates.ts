/**
 * Optimistic Updates Utilities
 * 
 * Provides reusable patterns for optimistic UI updates with automatic rollback.
 * 
 * Features:
 * - Generic optimistic update helpers
 * - Automatic rollback on error
 * - Type-safe implementations
 * - List and detail update patterns
 * 
 * Requirements: Optimistic update patterns for better UX
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Context returned from optimistic update setup
 * Used for rollback on error
 */
export interface OptimisticContext<T> {
  previousData: T | undefined;
}

/**
 * Options for optimistic list updates
 */
export interface OptimisticListOptions<T> {
  queryClient: QueryClient;
  queryKey: readonly unknown[];
  updater: (items: T[]) => T[];
}

/**
 * Options for optimistic detail updates
 */
export interface OptimisticDetailOptions<T> {
  queryClient: QueryClient;
  queryKey: readonly unknown[];
  updater: (item: T) => T;
}

/**
 * Optimistically update a list of items
 * 
 * @param options - Update options
 * @returns Context for rollback
 * 
 * @example
 * ```tsx
 * // In mutation onMutate
 * const context = await optimisticListUpdate({
 *   queryClient,
 *   queryKey: queryKeys.users.list(),
 *   updater: (users) => users.filter(u => u.id !== deletedId),
 * });
 * ```
 */
export async function optimisticListUpdate<T>(
  options: OptimisticListOptions<T>
): Promise<OptimisticContext<T[]>> {
  const { queryClient, queryKey, updater } = options;

  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T[]>(queryKey);

  // Optimistically update
  if (previousData) {
    const updatedData = updater(previousData);
    queryClient.setQueryData<T[]>(queryKey, updatedData);
  }

  return { previousData };
}

/**
 * Optimistically update a single item
 * 
 * @param options - Update options
 * @returns Context for rollback
 * 
 * @example
 * ```tsx
 * // In mutation onMutate
 * const context = await optimisticDetailUpdate({
 *   queryClient,
 *   queryKey: queryKeys.users.detail(userId),
 *   updater: (user) => ({ ...user, firstName: 'John' }),
 * });
 * ```
 */
export async function optimisticDetailUpdate<T>(
  options: OptimisticDetailOptions<T>
): Promise<OptimisticContext<T>> {
  const { queryClient, queryKey, updater } = options;

  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  if (previousData) {
    const updatedData = updater(previousData);
    queryClient.setQueryData<T>(queryKey, updatedData);
  }

  return { previousData };
}

/**
 * Rollback optimistic update on error
 * 
 * @param queryClient - Query client instance
 * @param queryKey - Query key to rollback
 * @param context - Context from optimistic update
 * 
 * @example
 * ```tsx
 * // In mutation onError
 * rollbackOptimisticUpdate(queryClient, queryKey, context);
 * ```
 */
export function rollbackOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  context: OptimisticContext<T> | undefined
): void {
  if (context?.previousData !== undefined) {
    queryClient.setQueryData(queryKey, context.previousData);
  }
}

/**
 * Optimistically add item to list
 * 
 * @param options - Update options with new item
 * @returns Context for rollback
 */
export async function optimisticAddToList<T extends { id: string }>(
  options: Omit<OptimisticListOptions<T>, 'updater'> & { newItem: T }
): Promise<OptimisticContext<T[]>> {
  return optimisticListUpdate({
    ...options,
    updater: (items) => [...items, options.newItem],
  });
}

/**
 * Optimistically remove item from list
 * 
 * @param options - Update options with item ID
 * @returns Context for rollback
 */
export async function optimisticRemoveFromList<T extends { id: string }>(
  options: Omit<OptimisticListOptions<T>, 'updater'> & { itemId: string }
): Promise<OptimisticContext<T[]>> {
  return optimisticListUpdate({
    ...options,
    updater: (items) => items.filter((item) => item.id !== options.itemId),
  });
}

/**
 * Optimistically update item in list
 * 
 * @param options - Update options with item ID and updater
 * @returns Context for rollback
 */
export async function optimisticUpdateInList<T extends { id: string }>(
  options: Omit<OptimisticListOptions<T>, 'updater'> & {
    itemId: string;
    itemUpdater: (item: T) => T;
  }
): Promise<OptimisticContext<T[]>> {
  return optimisticListUpdate({
    ...options,
    updater: (items) =>
      items.map((item) =>
        item.id === options.itemId ? options.itemUpdater(item) : item
      ),
  });
}

/**
 * Optimistically toggle boolean field
 * 
 * @param options - Update options with field name
 * @returns Context for rollback
 */
export async function optimisticToggleField<T>(
  options: Omit<OptimisticDetailOptions<T>, 'updater'> & {
    fieldName: keyof T;
  }
): Promise<OptimisticContext<T>> {
  return optimisticDetailUpdate({
    ...options,
    updater: (item) => ({
      ...item,
      [options.fieldName]: !item[options.fieldName],
    }),
  });
}
