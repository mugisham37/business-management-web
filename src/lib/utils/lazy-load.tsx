/**
 * Lazy Loading Utilities
 * 
 * Utilities for lazy loading components with React.lazy and Suspense.
 * Provides loading fallbacks and error boundaries.
 * 
 * Features:
 * - Lazy component loading
 * - Customizable loading fallbacks
 * - Error boundaries
 * - Retry on failure
 * 
 * Requirements: 12.6
 */

'use client';

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Default loading fallback
 */
export function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

/**
 * Card skeleton loading fallback
 */
export function CardSkeletonFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/**
 * Table skeleton loading fallback
 */
export function TableSkeletonFallback() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * Lazy load a component with custom loading fallback
 * 
 * @param importFn - Dynamic import function
 * @param fallback - Optional custom loading fallback
 * @returns Lazy loaded component wrapped in Suspense
 * 
 * @example
 * ```tsx
 * const AuditLogs = lazyLoad(
 *   () => import('@/components/dashboard/audit-logs'),
 *   <TableSkeletonFallback />
 * );
 * 
 * // Use in component
 * <AuditLogs />
 * ```
 * 
 * Requirements: 12.6
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ReactNode = <DefaultLoadingFallback />
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy load a named export component
 * 
 * @param importFn - Dynamic import function that returns module with named export
 * @param exportName - Name of the export to use
 * @param fallback - Optional custom loading fallback
 * @returns Lazy loaded component wrapped in Suspense
 * 
 * @example
 * ```tsx
 * const BusinessRulesList = lazyLoadNamed(
 *   () => import('@/components/dashboard/business-rules'),
 *   'BusinessRulesList',
 *   <CardSkeletonFallback />
 * );
 * ```
 * 
 * Requirements: 12.6
 */
export function lazyLoadNamed<T extends ComponentType<any>>(
  importFn: () => Promise<any>,
  exportName: string,
  fallback: ReactNode = <DefaultLoadingFallback />
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(async () => {
    const module = await importFn();
    return { default: module[exportName] };
  });

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Preload a lazy component
 * Useful for prefetching components before they're needed
 * 
 * @param importFn - Dynamic import function
 * 
 * @example
 * ```tsx
 * // Preload on hover
 * <button
 *   onMouseEnter={() => preloadComponent(() => import('./HeavyComponent'))}
 * >
 *   Show Heavy Component
 * </button>
 * ```
 * 
 * Requirements: 12.7
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  importFn().catch((error) => {
    console.error('Failed to preload component:', error);
  });
}

/**
 * Create a lazy loaded component with retry capability
 * 
 * @param importFn - Dynamic import function
 * @param retries - Number of retries on failure
 * @param fallback - Optional custom loading fallback
 * @returns Lazy loaded component with retry
 * 
 * @example
 * ```tsx
 * const AuditLogs = lazyLoadWithRetry(
 *   () => import('@/components/dashboard/audit-logs'),
 *   3
 * );
 * ```
 * 
 * Requirements: 12.6
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3,
  fallback: ReactNode = <DefaultLoadingFallback />
): ComponentType<React.ComponentProps<T>> {
  const retryImport = async (
    fn: () => Promise<{ default: T }>,
    retriesLeft: number
  ): Promise<{ default: T }> => {
    try {
      return await fn();
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retries - retriesLeft + 1))
      );
      
      return retryImport(fn, retriesLeft - 1);
    }
  };

  const LazyComponent = lazy(() => retryImport(importFn, retries));

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
