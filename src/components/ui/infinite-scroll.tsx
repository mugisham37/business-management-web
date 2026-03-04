/**
 * InfiniteScroll Component
 * 
 * Provides infinite scroll functionality for long lists.
 * Automatically loads more data when user scrolls near the bottom.
 * 
 * Features:
 * - Automatic loading on scroll
 * - Configurable threshold for triggering load
 * - Loading indicator
 * - Error handling
 * - Customizable loader component
 * 
 * Requirements: 12.2
 */

'use client';

import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { Spinner } from './spinner';

export interface InfiniteScrollProps {
  /** Child elements to render */
  children: ReactNode;
  /** Function to call when more data should be loaded */
  onLoadMore: () => void | Promise<void>;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Whether there is more data to load */
  hasMore?: boolean;
  /** Distance from bottom (in pixels) to trigger load */
  threshold?: number;
  /** Custom loader component */
  loader?: ReactNode;
  /** Custom end message when no more data */
  endMessage?: ReactNode;
  /** Container className */
  className?: string;
}

/**
 * InfiniteScroll Component
 * 
 * @example
 * ```tsx
 * <InfiniteScroll
 *   onLoadMore={loadMoreUsers}
 *   loading={loading}
 *   hasMore={hasMore}
 *   threshold={200}
 * >
 *   {users.map(user => <UserCard key={user.id} user={user} />)}
 * </InfiniteScroll>
 * ```
 * 
 * Requirements: 12.2
 */
export function InfiniteScroll({
  children,
  onLoadMore,
  loading = false,
  hasMore = true,
  threshold = 300,
  loader,
  endMessage,
  className = '',
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // Only trigger if:
      // 1. Element is intersecting
      // 2. Not currently loading
      // 3. Has more data to load
      if (entry.isIntersecting && !isLoadingRef.current && hasMore && !loading) {
        isLoadingRef.current = true;
        
        Promise.resolve(onLoadMore()).finally(() => {
          isLoadingRef.current = false;
        });
      }
    },
    [onLoadMore, hasMore, loading]
  );

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1,
    });

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [handleIntersection, threshold]);

  // Reset loading ref when loading prop changes
  useEffect(() => {
    if (!loading) {
      isLoadingRef.current = false;
    }
  }, [loading]);

  return (
    <div className={className}>
      {children}
      
      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-px" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          {loader || (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="h-5 w-5" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}
      
      {/* End message */}
      {!hasMore && !loading && (
        <div className="flex justify-center py-4 text-sm text-muted-foreground">
          {endMessage || 'No more items to load'}
        </div>
      )}
    </div>
  );
}
