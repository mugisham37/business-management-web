/**
 * React Query Provider
 * 
 * Wraps the application with QueryClientProvider and DevTools.
 * 
 * Features:
 * - QueryClient provider
 * - Development tools (dev only)
 * - Error boundary integration
 * 
 * Requirements: React Query setup for caching layer
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Query Provider Component
 * 
 * Provides React Query context to the application.
 * Includes DevTools in development mode for debugging.
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
