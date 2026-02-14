/**
 * Retry Link
 * 
 * Apollo Link that retries failed requests with exponential backoff.
 * Only retries network errors, not client errors (4xx).
 * Does not retry mutations by default to prevent duplicate operations.
 * 
 * Requirements: 4.3, 24.1, 24.2, 24.3, 24.4, 24.5
 */

import { RetryLink } from '@apollo/client/link/retry';

/**
 * Create the retry link with exponential backoff configuration
 * 
 * Retry Strategy:
 * - Initial delay: 1 second
 * - Maximum delay: 8 seconds
 * - Exponential backoff: delays double each retry (1s, 2s, 4s, 8s)
 * - Jitter: adds randomness to prevent thundering herd
 * - Max attempts: 3 retries
 * 
 * Retry Conditions:
 * - Only retry on network errors (connection failures, timeouts)
 * - Do NOT retry on GraphQL errors (4xx client errors, validation errors)
 * - Do NOT retry mutations by default (prevents duplicate operations)
 * - Allow retry override per operation via context
 */
export const createRetryLink = () => {
  return new RetryLink({
    delay: {
      // Initial delay before first retry (1 second)
      initial: 1000,
      
      // Maximum delay between retries (8 seconds)
      max: 8000,
      
      // Add random jitter to prevent thundering herd problem
      // Jitter adds randomness to retry timing when many clients retry simultaneously
      jitter: true,
    },
    
    attempts: {
      // Maximum number of retry attempts
      max: 3,
      
      /**
       * Determine if a request should be retried
       * 
       * @param error - The error that occurred
       * @param operation - The GraphQL operation that failed
       * @returns true if the request should be retried, false otherwise
       */
      retryIf: (error, operation) => {
        // Check if retry is explicitly disabled for this operation
        const context = operation.getContext();
        if (context.retry === false) {
          return false;
        }
        
        // Do not retry mutations by default (prevents duplicate operations)
        // Mutations can opt-in to retry by setting context.retry = true
        const isMutation = operation.query.definitions.some(
          (definition) =>
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'mutation'
        );
        
        if (isMutation && context.retry !== true) {
          console.log(`Not retrying mutation: ${operation.operationName}`);
          return false;
        }
        
        // Only retry if there's an error
        if (!error) {
          return false;
        }
        
        // Check if it's a network error (not a GraphQL error)
        const isNetworkError = !!(error as any).networkError;
        
        if (!isNetworkError) {
          console.log(`Not retrying non-network error for: ${operation.operationName}`);
          return false;
        }
        
        // Do not retry client errors (4xx status codes)
        const statusCode = (error as any).networkError?.statusCode;
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          console.log(
            `Not retrying client error (${statusCode}) for: ${operation.operationName}`
          );
          return false;
        }
        
        // Retry network errors (5xx, timeouts, connection failures)
        console.log(
          `Retrying network error for: ${operation.operationName}, Status: ${statusCode || 'unknown'}`
        );
        return true;
      },
    },
  });
};
