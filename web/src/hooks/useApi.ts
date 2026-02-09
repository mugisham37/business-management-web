import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api/responses';

interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

interface UseApiReturn<T, Args extends any[]> extends UseApiState<T> {
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
}

export function useApi<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<{ data: { data: T } }>
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState({ data: null, error: null, isLoading: true });
      
      try {
        const response = await apiFunction(...args);
        const data = response.data.data;
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        const apiError = error.response?.data || {
          statusCode: 500,
          message: 'An unexpected error occurred',
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
        };
        setState({ data: null, error: apiError, isLoading: false });
        throw apiError;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, execute, reset };
}
