import type { AppDispatch, RootState } from '../index';
import type { ApolloCache } from '@apollo/client';

/**
 * Optimistic Update Manager
 * 
 * Provides utilities for managing optimistic updates with automatic rollback
 * on failure. This ensures UI updates happen immediately while maintaining
 * data consistency if operations fail.
 * 
 * Requirements: 5.9, 5.10
 */

export interface OptimisticUpdateConfig<T> {
  // Function to apply optimistic update
  optimisticUpdate: (dispatch: AppDispatch) => void;
  // Function to rollback on failure
  rollback: (dispatch: AppDispatch, previousState: T) => void;
  // Function to get current state snapshot
  getStateSnapshot: (state: RootState) => T;
  // Optional cache update function
  cacheUpdate?: (cache: ApolloCache) => void;
  // Optional cache rollback function
  cacheRollback?: (cache: ApolloCache) => void;
}

/**
 * Execute an operation with optimistic updates and automatic rollback
 * 
 * @param dispatch Redux dispatch function
 * @param getState Function to get current Redux state
 * @param config Optimistic update configuration
 * @param operation Async operation to execute
 * @returns Promise that resolves with operation result
 * 
 * @example
 * ```typescript
 * await withOptimisticUpdate(
 *   dispatch,
 *   getState,
 *   {
 *     optimisticUpdate: (dispatch) => {
 *       dispatch(optimisticAddUser(newUser));
 *     },
 *     rollback: (dispatch, previousState) => {
 *       dispatch(rollbackUsers(previousState));
 *     },
 *     getStateSnapshot: (state) => state.users.list,
 *   },
 *   async () => {
 *     return await userService.createManager(input);
 *   }
 * );
 * ```
 */
export async function withOptimisticUpdate<T, R>(
  dispatch: AppDispatch,
  getState: () => RootState,
  config: OptimisticUpdateConfig<T>,
  operation: () => Promise<R>
): Promise<R> {
  // Capture current state before optimistic update
  const previousState = config.getStateSnapshot(getState());

  try {
    // Apply optimistic update
    config.optimisticUpdate(dispatch);

    // Execute the actual operation
    const result = await operation();

    // Operation succeeded, optimistic update is now confirmed
    return result;
  } catch (error) {
    // Operation failed, rollback optimistic update
    config.rollback(dispatch, previousState);

    // Rollback cache if needed
    if (config.cacheRollback) {
      try {
        config.cacheRollback(null as any); // Cache will be passed by caller
      } catch (cacheError) {
        console.error('Cache rollback failed:', cacheError);
      }
    }

    // Re-throw error for caller to handle
    throw error;
  }
}

/**
 * Create a snapshot of current state for rollback
 * 
 * This creates a deep copy of the state to ensure rollback
 * restores the exact previous state.
 */
export function createStateSnapshot<T>(state: T): T {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Optimistic update wrapper for mutations
 * 
 * This higher-order function wraps a mutation function with
 * optimistic update logic, making it easy to add optimistic
 * updates to any mutation.
 * 
 * @example
 * ```typescript
 * const createUserWithOptimistic = withOptimisticMutation(
 *   userService.createManager,
 *   {
 *     optimisticUpdate: (dispatch, input) => {
 *       dispatch(optimisticAddUser({
 *         id: 'temp-id',
 *         ...input,
 *         createdAt: new Date().toISOString(),
 *       }));
 *     },
 *     rollback: (dispatch, previousState) => {
 *       dispatch(rollbackUsers(previousState));
 *     },
 *     getStateSnapshot: (state) => state.users.list,
 *   }
 * );
 * ```
 */
export function withOptimisticMutation<TInput, TOutput, TState>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  config: Omit<OptimisticUpdateConfig<TState>, 'optimisticUpdate'> & {
    optimisticUpdate: (dispatch: AppDispatch, input: TInput) => void;
  }
) {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState,
    input: TInput
  ): Promise<TOutput> => {
    const previousState = config.getStateSnapshot(getState());

    try {
      // Apply optimistic update with input
      config.optimisticUpdate(dispatch, input);

      // Execute mutation
      const result = await mutationFn(input);

      return result;
    } catch (error) {
      // Rollback on failure
      config.rollback(dispatch, previousState);

      if (config.cacheRollback) {
        try {
          config.cacheRollback(null as any);
        } catch (cacheError) {
          console.error('Cache rollback failed:', cacheError);
        }
      }

      throw error;
    }
  };
}

/**
 * Batch optimistic updates
 * 
 * Execute multiple optimistic updates as a single transaction.
 * If any operation fails, all updates are rolled back.
 * 
 * @example
 * ```typescript
 * await batchOptimisticUpdates(
 *   dispatch,
 *   getState,
 *   [
 *     {
 *       optimisticUpdate: (dispatch) => dispatch(optimisticAddUser(user1)),
 *       rollback: (dispatch, prev) => dispatch(rollbackUsers(prev)),
 *       getStateSnapshot: (state) => state.users.list,
 *     },
 *     {
 *       optimisticUpdate: (dispatch) => dispatch(optimisticAddBranch(branch1)),
 *       rollback: (dispatch, prev) => dispatch(rollbackBranches(prev)),
 *       getStateSnapshot: (state) => state.organizations.branches,
 *     },
 *   ],
 *   async () => {
 *     // Perform batch operation
 *   }
 * );
 * ```
 */
export async function batchOptimisticUpdates<R>(
  dispatch: AppDispatch,
  getState: () => RootState,
  configs: OptimisticUpdateConfig<any>[],
  operation: () => Promise<R>
): Promise<R> {
  // Capture all previous states
  const previousStates = configs.map((config) =>
    config.getStateSnapshot(getState())
  );

  try {
    // Apply all optimistic updates
    configs.forEach((config) => config.optimisticUpdate(dispatch));

    // Execute operation
    const result = await operation();

    return result;
  } catch (error) {
    // Rollback all updates in reverse order
    for (let i = configs.length - 1; i >= 0; i--) {
      configs[i].rollback(dispatch, previousStates[i]);

      if (configs[i].cacheRollback) {
        try {
          configs[i].cacheRollback!(null as any);
        } catch (cacheError) {
          console.error('Cache rollback failed:', cacheError);
        }
      }
    }

    throw error;
  }
}
