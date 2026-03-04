/**
 * useMutationState Hook
 * 
 * Hook for managing mutation loading states.
 * Provides utilities for tracking multiple concurrent mutations.
 * 
 * Requirements: 8.2, 8.3, 8.5
 */

import { useState, useCallback, useRef } from 'react';
import { AppError, UnknownError } from '@/lib/errors/error-types';

/**
 * Mutation state for a single operation
 */
export interface MutationState {
  loading: boolean;
  error: AppError | null;
  data: unknown;
}

/**
 * useMutationState Hook
 * 
 * Manages loading state for a single mutation operation.
 * 
 * Requirements: 8.2, 8.5
 * 
 * @example
 * ```tsx
 * const { loading, error, execute } = useMutationState();
 * 
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     return await createUser(input);
 *   });
 * };
 * 
 * return (
 *   <LoadingButton loading={loading} onClick={handleSubmit}>
 *     Create User
 *   </LoadingButton>
 * );
 * ```
 */
export function useMutationState<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (mutationFn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await mutationFn();
      setData(result);
      return result;
    } catch (err) {
      const appError: AppError = err && typeof err === 'object' && 'category' in err
        ? (err as AppError)
        : new UnknownError(
            err instanceof Error ? err.message : 'An error occurred',
            'An error occurred',
            err
          );
      setError(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

/**
 * useConcurrentMutations Hook
 * 
 * Manages loading states for multiple concurrent mutations.
 * Each mutation is tracked independently.
 * 
 * Requirements: 8.3
 * 
 * @example
 * ```tsx
 * const { isLoading, execute } = useConcurrentMutations();
 * 
 * const handleDelete = async (id: string) => {
 *   await execute(`delete-${id}`, async () => {
 *     return await deleteUser(id);
 *   });
 * };
 * 
 * return users.map(user => (
 *   <LoadingButton
 *     key={user.id}
 *     loading={isLoading(`delete-${user.id}`)}
 *     onClick={() => handleDelete(user.id)}
 *   >
 *     Delete
 *   </LoadingButton>
 * ));
 * ```
 */
export function useConcurrentMutations() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, AppError>>({});
  const [results, setResults] = useState<Record<string, unknown>>({});

  const execute = useCallback(
    async <T,>(operationId: string, mutationFn: () => Promise<T>): Promise<T> => {
      // Set loading state for this operation
      setLoadingStates(prev => ({ ...prev, [operationId]: true }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[operationId];
        return newErrors;
      });

      try {
        const result = await mutationFn();
        setResults(prev => ({ ...prev, [operationId]: result }));
        return result;
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'An error occurred',
              'An error occurred',
              err
            );
        setErrors(prev => ({ ...prev, [operationId]: appError }));
        throw appError;
      } finally {
        setLoadingStates(prev => ({ ...prev, [operationId]: false }));
      }
    },
    []
  );

  const isLoading = useCallback(
    (operationId: string): boolean => {
      return loadingStates[operationId] || false;
    },
    [loadingStates]
  );

  const getError = useCallback(
    (operationId: string): AppError | null => {
      return errors[operationId] || null;
    },
    [errors]
  );

  const getResult = useCallback(
    (operationId: string): unknown => {
      return results[operationId];
    },
    [results]
  );

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const reset = useCallback((operationId?: string) => {
    if (operationId) {
      setLoadingStates(prev => {
        const newStates = { ...prev };
        delete newStates[operationId];
        return newStates;
      });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[operationId];
        return newErrors;
      });
      setResults(prev => {
        const newResults = { ...prev };
        delete newResults[operationId];
        return newResults;
      });
    } else {
      setLoadingStates({});
      setErrors({});
      setResults({});
    }
  }, []);

  return {
    execute,
    isLoading,
    getError,
    getResult,
    isAnyLoading,
    reset,
  };
}

/**
 * useFormSubmit Hook
 * 
 * Specialized hook for form submission with loading state.
 * Prevents double submission and provides loading feedback.
 * 
 * Requirements: 8.2, 8.5
 * 
 * @example
 * ```tsx
 * const { isSubmitting, handleSubmit } = useFormSubmit(async (data) => {
 *   await createUser(data);
 * });
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <LoadingButton type="submit" loading={isSubmitting}>
 *       Submit
 *     </LoadingButton>
 *   </form>
 * );
 * ```
 */
export function useFormSubmit<T = unknown>(
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: AppError) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const submittingRef = useRef(false);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent, data?: T) => {
      if (event) {
        event.preventDefault();
      }

      // Prevent double submission
      if (submittingRef.current) {
        return;
      }

      submittingRef.current = true;
      setIsSubmitting(true);
      setError(null);

      try {
        await onSubmit(data as T);
        onSuccess?.();
      } catch (err) {
        const appError: AppError = err && typeof err === 'object' && 'category' in err
          ? (err as AppError)
          : new UnknownError(
              err instanceof Error ? err.message : 'Submission failed',
              'Submission failed',
              err
            );
        setError(appError);
        onError?.(appError);
      } finally {
        setIsSubmitting(false);
        submittingRef.current = false;
      }
    },
    [onSubmit, onSuccess, onError]
  );

  return {
    isSubmitting,
    error,
    handleSubmit,
  };
}
