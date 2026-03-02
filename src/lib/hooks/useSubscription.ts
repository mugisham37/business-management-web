import { useEffect, useState, useRef } from 'react';
import { DocumentNode, print } from 'graphql';
import { wsConnectionManager } from '@/lib/websocket/connection-manager';

/**
 * Options for useSubscription hook
 * 
 * Requirements: 5.2
 */
export interface UseSubscriptionOptions<TData, TVariables> {
  /** GraphQL subscription query document */
  query: DocumentNode;
  
  /** Variables for the subscription query */
  variables?: TVariables;
  
  /** Skip subscription if true */
  skip?: boolean;
  
  /** Callback when new data is received */
  onData?: (data: TData) => void;
  
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  
  /** Callback when subscription completes */
  onComplete?: () => void;
}

/**
 * Return value from useSubscription hook
 * 
 * Requirements: 5.2
 */
export interface UseSubscriptionReturn<TData> {
  /** Latest data received from subscription */
  data: TData | null;
  
  /** Loading state - true until first data received */
  loading: boolean;
  
  /** Error if subscription failed */
  error: Error | null;
}

/**
 * React hook for GraphQL subscriptions
 * 
 * Manages subscription lifecycle:
 * - Establishes subscription when component mounts
 * - Handles incoming data updates
 * - Manages loading and error states
 * - Automatically cleans up on unmount
 * - Supports skip option to conditionally subscribe
 * 
 * Features:
 * - Automatic subscription cleanup
 * - Loading state management
 * - Error handling
 * - Data callbacks
 * - Skip functionality
 * - WebSocket connection integration
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = useSubscription({
 *   query: ON_AUDIT_LOG_CREATED,
 *   variables: { userId: '123' },
 *   onData: (data) => {
 *     console.log('New audit log:', data);
 *   },
 * });
 * ```
 */
export function useSubscription<TData = any, TVariables = any>(
  options: UseSubscriptionOptions<TData, TVariables>
): UseSubscriptionReturn<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Use ref to store callbacks to avoid re-subscribing when they change
  const callbacksRef = useRef({
    onData: options.onData,
    onError: options.onError,
    onComplete: options.onComplete,
  });
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onData: options.onData,
      onError: options.onError,
      onComplete: options.onComplete,
    };
  }, [options.onData, options.onError, options.onComplete]);

  useEffect(() => {
    // Skip subscription if skip option is true
    if (options.skip) {
      setLoading(false);
      return;
    }

    // Get WebSocket client
    const client = wsConnectionManager.getClient();
    
    if (!client) {
      const connectionError = new Error('WebSocket not connected. Call wsConnectionManager.connect() first.');
      setError(connectionError);
      setLoading(false);
      
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(connectionError);
      }
      
      return;
    }

    // Reset state when starting new subscription
    setLoading(true);
    setError(null);

    // Subscribe to GraphQL subscription
    const unsubscribe = client.subscribe<TData>(
      {
        query: print(options.query),
        variables: options.variables as Record<string, unknown> | undefined,
      },
      {
        /**
         * Called when new data is received
         */
        next: (result) => {
          // Only update state if component is still mounted
          if (!isMountedRef.current) return;
          
          if (result.data) {
            setData(result.data);
            setLoading(false);
            
            // Call onData callback if provided
            if (callbacksRef.current.onData) {
              callbacksRef.current.onData(result.data);
            }
          }
          
          // Handle errors in result
          if (result.errors && result.errors.length > 0) {
            const subscriptionError = new Error(
              result.errors.map(e => e.message).join(', ')
            );
            setError(subscriptionError);
            setLoading(false);
            
            if (callbacksRef.current.onError) {
              callbacksRef.current.onError(subscriptionError);
            }
          }
        },
        
        /**
         * Called when subscription error occurs
         */
        error: (err) => {
          // Only update state if component is still mounted
          if (!isMountedRef.current) return;
          
          const subscriptionError = err instanceof Error ? err : new Error(String(err));
          setError(subscriptionError);
          setLoading(false);
          
          // Call onError callback if provided
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(subscriptionError);
          }
        },
        
        /**
         * Called when subscription completes
         */
        complete: () => {
          // Only update state if component is still mounted
          if (!isMountedRef.current) return;
          
          setLoading(false);
          
          // Call onComplete callback if provided
          if (callbacksRef.current.onComplete) {
            callbacksRef.current.onComplete();
          }
        },
      }
    );

    // Cleanup function - unsubscribe when component unmounts or dependencies change
    return () => {
      unsubscribe();
    };
  }, [options.query, options.variables, options.skip]);
  
  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { data, loading, error };
}
