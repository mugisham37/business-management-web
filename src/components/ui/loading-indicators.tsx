/**
 * Loading Indicators
 * 
 * Reusable loading indicator components for queries and mutations.
 * Provides skeleton loaders for list views and inline spinners.
 * 
 * Requirements: 8.1, 8.4
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/**
 * QueryLoadingIndicator
 * 
 * Generic loading indicator for query operations.
 * Shows a spinner with optional message.
 * 
 * Requirements: 8.1
 */
export interface QueryLoadingIndicatorProps {
  message?: string;
  className?: string;
}

export function QueryLoadingIndicator({ 
  message = 'Loading...', 
  className 
}: QueryLoadingIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2 p-4', className)}>
      <Spinner className="size-5" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

/**
 * ListSkeletonLoader
 * 
 * Skeleton loader for list views.
 * Shows multiple skeleton rows to indicate loading list data.
 * 
 * Requirements: 8.4
 */
export interface ListSkeletonLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function ListSkeletonLoader({ 
  rows = 5, 
  columns = 1,
  className 
}: ListSkeletonLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * TableSkeletonLoader
 * 
 * Skeleton loader specifically for table views.
 * Shows header and body skeleton rows.
 * 
 * Requirements: 8.4
 */
export interface TableSkeletonLoaderProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeletonLoader({ 
  rows = 5, 
  columns = 4,
  showHeader = true,
  className 
}: TableSkeletonLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showHeader && (
        <div className="flex gap-3">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-10 flex-1" />
          ))}
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-12 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CardSkeletonLoader
 * 
 * Skeleton loader for card-based layouts.
 * Shows skeleton cards in a grid.
 * 
 * Requirements: 8.4
 */
export interface CardSkeletonLoaderProps {
  cards?: number;
  className?: string;
}

export function CardSkeletonLoader({ 
  cards = 6,
  className 
}: CardSkeletonLoaderProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * DetailSkeletonLoader
 * 
 * Skeleton loader for detail/form views.
 * Shows skeleton fields in a vertical layout.
 * 
 * Requirements: 8.4
 */
export interface DetailSkeletonLoaderProps {
  fields?: number;
  className?: string;
}

export function DetailSkeletonLoader({ 
  fields = 6,
  className 
}: DetailSkeletonLoaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * InlineSpinner
 * 
 * Small inline spinner for button actions and inline loading states.
 * 
 * Requirements: 8.5
 */
export interface InlineSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineSpinner({ 
  size = 'sm',
  className 
}: InlineSpinnerProps) {
  const sizeClasses = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  };

  return (
    <Spinner className={cn(sizeClasses[size], className)} />
  );
}

/**
 * FullPageLoader
 * 
 * Full page loading indicator for initial page loads.
 * 
 * Requirements: 8.1
 */
export interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ 
  message = 'Loading...' 
}: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
