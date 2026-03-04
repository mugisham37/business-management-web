/**
 * LoadMoreButton Component
 * 
 * Provides a button-based alternative to infinite scroll.
 * Users click to explicitly load more data.
 * 
 * Features:
 * - Manual load trigger
 * - Loading state
 * - Disabled when no more data
 * - Customizable appearance
 * 
 * Requirements: 12.2
 */

'use client';

import { Button } from './button';
import { Spinner } from './spinner';

export interface LoadMoreButtonProps {
  /** Function to call when button is clicked */
  onLoadMore: () => void | Promise<void>;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Whether there is more data to load */
  hasMore?: boolean;
  /** Custom button text */
  text?: string;
  /** Custom loading text */
  loadingText?: string;
  /** Custom end message when no more data */
  endMessage?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg';
  /** Container className */
  className?: string;
}

/**
 * LoadMoreButton Component
 * 
 * @example
 * ```tsx
 * <LoadMoreButton
 *   onLoadMore={loadMoreUsers}
 *   loading={loading}
 *   hasMore={hasMore}
 *   text="Load More Users"
 * />
 * ```
 * 
 * Requirements: 12.2
 */
export function LoadMoreButton({
  onLoadMore,
  loading = false,
  hasMore = true,
  text = 'Load More',
  loadingText = 'Loading...',
  endMessage = 'No more items',
  variant = 'outline',
  size = 'default',
  className = '',
}: LoadMoreButtonProps) {
  if (!hasMore && !loading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <p className="text-sm text-muted-foreground">{endMessage}</p>
      </div>
    );
  }

  return (
    <div className={`flex justify-center py-4 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={onLoadMore}
        disabled={loading || !hasMore}
        className="min-w-[120px]"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {loadingText}
          </>
        ) : (
          text
        )}
      </Button>
    </div>
  );
}
