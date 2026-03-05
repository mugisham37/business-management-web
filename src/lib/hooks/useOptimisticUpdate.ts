/**
 * useOptimisticUpdate Hook
 * 
 * Hook for managing optimistic updates that don't block the UI.
 * Provides immediate feedback while the mutation is in progress.
 * 
 * Requirements: 8.6
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppError, UnknownError } from '@/lib/errors/error-types';

/**
 * Optimistic update state
 */
export interface OptimisticUpdateState<T> {
  /**
   * Whether the mutation is in progress (background operation)
   */
  isPending: boolean;
  
  /**
   * Whether the optimistic update was applied
   */
  isOptimistic: boolean;
  
  /**
   * Error if the mutation failed
   */
  error: AppError | null;
  
  /**
   * Current data (optimistic or confirmed)
   */
  data: T | null;
  
  /**
   * Original data before optimistic update
   */
  originalData: T | null;
}

/**
 * useOptimisticUpdate Hook
 * 
 * Manages optimistic updates with automatic rollback on failure.
 * UI remains interactive during the mutation.
 * 
 * Requirements: 8.6
 * 
 * @example
 * ```tsx
 * const { data, isPending, isOptimistic, execute } = useOptimisticUpdate(initialData);
 * 
 * const handleUpdate = async (newData) => {
 *   await execute(
 *     newData,
 *     async () => await updateUser(newData)
 *   );
 * };
 * 
 * return (
 *   <div>
 *     <UserDisplay data={data} />
 *     {isOptimistic && <Badge>Saving...</Badge>}
 *     <Button onClick={() => handleUpdate(newData)}>
 *       Update
 *     </Button>
 *   </div>
 * );
 * ```
 */
export function useOptimisticUpdate<T>(initialData: T | null = null) {
  const [state, setState] = useState<OptimisticUpdateState<T>>({
    isPending: false,
    isOptimistic: false,
    error: null,
    data: initialData,
    originalData: null,
  });

  const stateRef = useRef(state);

  // Keep ref in sync with state via effect
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Execute mutation with optimistic update
   */
  const execute = useCallback(
    async (
      optimisticData: T,
      mutationFn: () => Promise<T>
    ): Promise<T> => {
      const currentData = stateRef.current.data;

      // Apply optimistic update immediately (non-blocking)
      setState({
        isPending: true,
        isOptimistic: true,
        error: null,
        data: optimisticData,
        originalData: currentData,
      });

      try {
        // Execute mutation in background
        const result = await mutationFn();

        // Update with confirmed data
        setState({
          isPending: false,
          isOptimistic: false,
          error: null,
          data: result,
          originalData: null,
        });

        return result;
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'Update failed',
              'Update failed',
              err
            );

        // Rollback to original data
        setState({
          isPending: false,
          isOptimistic: false,
          error: appError,
          data: currentData,
          originalData: null,
        });

        throw appError;
      }
    },
    []
  );

  /**
   * Update data without mutation (for external updates)
   */
  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isPending: false,
      isOptimistic: false,
      error: null,
      data: initialData,
      originalData: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    setData,
    reset,
  };
}

/**
 * useOptimisticList Hook
 * 
 * Specialized hook for optimistic updates on lists.
 * Supports add, update, remove operations with automatic rollback.
 * 
 * Requirements: 8.6
 * 
 * @example
 * ```tsx
 * const { items, isPending, add, update, remove } = useOptimisticList(initialItems);
 * 
 * const handleAddUser = async (user) => {
 *   await add(user, async () => await createUser(user));
 * };
 * 
 * const handleUpdateUser = async (id, updates) => {
 *   await update(id, updates, async () => await updateUser(id, updates));
 * };
 * 
 * const handleDeleteUser = async (id) => {
 *   await remove(id, async () => await deleteUser(id));
 * };
 * 
 * return (
 *   <div>
 *     {items.map(item => (
 *       <UserCard
 *         key={item.id}
 *         user={item}
 *         onUpdate={(updates) => handleUpdateUser(item.id, updates)}
 *         onDelete={() => handleDeleteUser(item.id)}
 *       />
 *     ))}
 *     {isPending(item.id) && <Badge>Saving...</Badge>}
 *   </div>
 * );
 * ```
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[] = []
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, AppError>>({});
  const snapshotRef = useRef<Record<string, T[]>>({});

  /**
   * Check if an item operation is pending
   */
  const isPending = useCallback(
    (itemId: string): boolean => {
      return pendingOperations.has(itemId);
    },
    [pendingOperations]
  );

  /**
   * Add item with optimistic update
   */
  const add = useCallback(
    async (item: T, mutationFn: () => Promise<T>): Promise<T> => {
      const operationId = item.id;

      // Save snapshot
      snapshotRef.current[operationId] = [...items];

      // Optimistically add item
      setItems(prev => [...prev, item]);
      setPendingOperations(prev => new Set(prev).add(operationId));

      try {
        const result = await mutationFn();

        // Replace optimistic item with confirmed item
        setItems(prev =>
          prev.map(i => (i.id === item.id ? result : i))
        );

        return result;
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'Add failed',
              'Add failed',
              err
            );

        // Rollback
        setItems(snapshotRef.current[operationId] || items);
        setErrors(prev => ({ ...prev, [operationId]: appError }));

        throw appError;
      } finally {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
        delete snapshotRef.current[operationId];
      }
    },
    [items]
  );

  /**
   * Update item with optimistic update
   */
  const update = useCallback(
    async (
      itemId: string,
      updates: Partial<T>,
      mutationFn: () => Promise<T>
    ): Promise<T> => {
      // Save snapshot
      snapshotRef.current[itemId] = [...items];

      // Optimistically update item
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      setPendingOperations(prev => new Set(prev).add(itemId));

      try {
        const result = await mutationFn();

        // Replace optimistic item with confirmed item
        setItems(prev =>
          prev.map(item => (item.id === itemId ? result : item))
        );

        return result;
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'Update failed',
              'Update failed',
              err
            );

        // Rollback
        setItems(snapshotRef.current[itemId] || items);
        setErrors(prev => ({ ...prev, [itemId]: appError }));

        throw appError;
      } finally {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        delete snapshotRef.current[itemId];
      }
    },
    [items]
  );

  /**
   * Remove item with optimistic update
   */
  const remove = useCallback(
    async (itemId: string, mutationFn: () => Promise<void>): Promise<void> => {
      // Save snapshot
      snapshotRef.current[itemId] = [...items];

      // Optimistically remove item
      setItems(prev => prev.filter(item => item.id !== itemId));
      setPendingOperations(prev => new Set(prev).add(itemId));

      try {
        await mutationFn();
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'Remove failed',
              'Remove failed',
              err
            );

        // Rollback
        setItems(snapshotRef.current[itemId] || items);
        setErrors(prev => ({ ...prev, [itemId]: appError }));

        throw appError;
      } finally {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        delete snapshotRef.current[itemId];
      }
    },
    [items]
  );

  /**
   * Get error for specific item
   */
  const getError = useCallback(
    (itemId: string): AppError | null => {
      return errors[itemId] || null;
    },
    [errors]
  );

  /**
   * Clear error for specific item
   */
  const clearError = useCallback((itemId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });
  }, []);

  /**
   * Check if any operation is pending
   */
  const isAnyPending = useCallback((): boolean => {
    return pendingOperations.size > 0;
  }, [pendingOperations]);

  return {
    items,
    setItems,
    isPending,
    isAnyPending,
    add,
    update,
    remove,
    getError,
    clearError,
  };
}
