/**
 * useOperationQueue Hook
 * 
 * Hook for managing a queue of concurrent operations with independent loading states.
 * Ensures each operation has its own loading indicator without blocking others.
 * 
 * Requirements: 8.3
 */

import { useState, useCallback, useRef } from 'react';
import { AppError, UnknownError } from '@/lib/errors/error-types';

/**
 * Operation status
 */
export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Operation state
 */
export interface Operation<T = any> {
  id: string;
  status: OperationStatus;
  loading: boolean;
  error: AppError | null;
  result: T | null;
  startedAt: number | null;
  completedAt: number | null;
}

/**
 * useOperationQueue Hook
 * 
 * Manages multiple concurrent operations with independent loading states.
 * Each operation is tracked separately and can be queried by ID.
 * 
 * Requirements: 8.3
 * 
 * @example
 * ```tsx
 * const { operations, execute, isOperationLoading, getOperation } = useOperationQueue();
 * 
 * const handleBulkDelete = async (userIds: string[]) => {
 *   await Promise.all(
 *     userIds.map(id =>
 *       execute(`delete-${id}`, async () => await deleteUser(id))
 *     )
 *   );
 * };
 * 
 * return users.map(user => (
 *   <LoadingButton
 *     key={user.id}
 *     loading={isOperationLoading(`delete-${user.id}`)}
 *     onClick={() => execute(`delete-${user.id}`, () => deleteUser(user.id))}
 *   >
 *     Delete
 *   </LoadingButton>
 * ));
 * ```
 */
export function useOperationQueue<T = any>() {
  const [operations, setOperations] = useState<Record<string, Operation<T>>>({});
  const operationsRef = useRef<Record<string, Operation<T>>>({});

  // Keep ref in sync with state
  operationsRef.current = operations;

  /**
   * Execute an operation
   */
  const execute = useCallback(
    async (operationId: string, operationFn: () => Promise<T>): Promise<T> => {
      // Initialize operation
      const operation: Operation<T> = {
        id: operationId,
        status: 'pending',
        loading: true,
        error: null,
        result: null,
        startedAt: Date.now(),
        completedAt: null,
      };

      setOperations(prev => ({
        ...prev,
        [operationId]: operation,
      }));

      try {
        const result = await operationFn();

        // Update operation with success
        setOperations(prev => ({
          ...prev,
          [operationId]: {
            ...prev[operationId],
            status: 'success',
            loading: false,
            result,
            completedAt: Date.now(),
          },
        }));

        return result;
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'Operation failed',
              'Operation failed',
              err
            );

        // Update operation with error
        setOperations(prev => ({
          ...prev,
          [operationId]: {
            ...prev[operationId],
            status: 'error',
            loading: false,
            error: appError,
            completedAt: Date.now(),
          },
        }));

        throw appError;
      }
    },
    []
  );

  /**
   * Check if a specific operation is loading
   */
  const isOperationLoading = useCallback(
    (operationId: string): boolean => {
      return operations[operationId]?.loading || false;
    },
    [operations]
  );

  /**
   * Get operation state
   */
  const getOperation = useCallback(
    (operationId: string): Operation<T> | null => {
      return operations[operationId] || null;
    },
    [operations]
  );

  /**
   * Check if any operation is loading
   */
  const isAnyLoading = useCallback((): boolean => {
    return Object.values(operations).some(op => op.loading);
  }, [operations]);

  /**
   * Get all loading operations
   */
  const getLoadingOperations = useCallback((): Operation<T>[] => {
    return Object.values(operations).filter(op => op.loading);
  }, [operations]);

  /**
   * Get operation count by status
   */
  const getOperationCount = useCallback(
    (status?: OperationStatus): number => {
      if (!status) {
        return Object.keys(operations).length;
      }
      return Object.values(operations).filter(op => op.status === status).length;
    },
    [operations]
  );

  /**
   * Clear a specific operation
   */
  const clearOperation = useCallback((operationId: string) => {
    setOperations(prev => {
      const newOperations = { ...prev };
      delete newOperations[operationId];
      return newOperations;
    });
  }, []);

  /**
   * Clear all operations
   */
  const clearAll = useCallback(() => {
    setOperations({});
  }, []);

  /**
   * Clear completed operations
   */
  const clearCompleted = useCallback(() => {
    setOperations(prev => {
      const newOperations: Record<string, Operation<T>> = {};
      Object.entries(prev).forEach(([id, op]) => {
        if (op.status === 'pending') {
          newOperations[id] = op;
        }
      });
      return newOperations;
    });
  }, []);

  return {
    operations,
    execute,
    isOperationLoading,
    getOperation,
    isAnyLoading,
    getLoadingOperations,
    getOperationCount,
    clearOperation,
    clearAll,
    clearCompleted,
  };
}

/**
 * useLoadingStates Hook
 * 
 * Simplified hook for managing multiple independent loading states.
 * Useful for tracking loading states of multiple UI elements.
 * 
 * Requirements: 8.3
 * 
 * @example
 * ```tsx
 * const { isLoading, setLoading } = useLoadingStates();
 * 
 * const handleAction = async (id: string) => {
 *   setLoading(id, true);
 *   try {
 *     await performAction(id);
 *   } finally {
 *     setLoading(id, false);
 *   }
 * };
 * 
 * return items.map(item => (
 *   <LoadingButton
 *     key={item.id}
 *     loading={isLoading(item.id)}
 *     onClick={() => handleAction(item.id)}
 *   >
 *     Action
 *   </LoadingButton>
 * ));
 * ```
 */
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const isLoading = useCallback(
    (key: string): boolean => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const newStates = { ...prev };
        delete newStates[key];
        return newStates;
      });
    } else {
      setLoadingStates({});
    }
  }, []);

  return {
    isLoading,
    setLoading,
    isAnyLoading,
    clearLoading,
  };
}
