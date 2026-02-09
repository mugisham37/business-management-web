/**
 * API Configuration Constants
 * 
 * Centralized configuration for API client behavior including
 * base URL, timeouts, and retry logic.
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 30000, // 30 seconds
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000, // 1 second
    MAX_DELAY: 4000, // 4 seconds
    BACKOFF_MULTIPLIER: 2,
  },
  HEADERS: {
    CONTENT_TYPE: 'application/json',
  },
} as const;
