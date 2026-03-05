/**
 * useDebouncedCallback Hook
 * 
 * Debounces a callback function, preventing it from being called
 * until after a specified delay since the last invocation.
 * Also cancels pending requests when a new one is made.
 * 
 * Features:
 * - Configurable delay
 * - Automatic cleanup
 * - Cancel pending callbacks
 * - TypeScript generic support
 * 
 * Requirements: 12.3
 */

import { useCallback, useRef, useEffect, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * useDebouncedCallback Hook
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function with cancel method
 * 
 * @example
 * ```tsx
 * const searchUsers = useDebouncedCallback((term: string) => {
 *   fetchUsers({ search: term });
 * }, 300);
 * 
 * // In input handler
 * const handleChange = (e) => {
 *   searchUsers(e.target.value);
 * };
 * 
 * // Cancel pending search
 * searchUsers.cancel();
 * ```
 * 
 * Requirements: 12.3
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): DebouncedFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Create debounced function with cancel method using useMemo
  const debouncedCallback = useMemo(() => {
    const fn = ((...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    }) as DebouncedFunction<T>;

    fn.cancel = cancel;
    return fn;
  }, [delay, cancel]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return debouncedCallback;
}
