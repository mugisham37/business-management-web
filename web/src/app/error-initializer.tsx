'use client';

import { useEffect } from 'react';
import { initializeErrorHandling } from '@/lib/error-handling';

type Environment = 'development' | 'production' | 'staging';

const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV;
  if (env === 'production' || env === 'development') {
    return env;
  }
  return 'staging';
};

/**
 * Client component that initializes error handling on mount
 * Separated from layout.tsx to maintain metadata export in Server Component
 */
export function ErrorInitializer() {
  useEffect(() => {
    initializeErrorHandling({
      errorReporting: {
        enabled: process.env.NODE_ENV === 'production',
        environment: getEnvironment(),
        sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      },
      networkRetry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
      },
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
      },
    });
  }, []);

  return null;
}
