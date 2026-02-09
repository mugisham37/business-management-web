/**
 * API Configuration Constants
 * 
 * Centralized configuration for API client behavior including
 * base URL, timeouts, and retry logic.
 * 
 * Environment-specific configuration:
 * - Development: Verbose logging, longer timeouts for debugging
 * - Production: Minimal logging, optimized timeouts
 * 
 * Requirements: 15.1, 15.2, 19.1
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  
  // Environment-specific timeout configuration
  // Development: 60 seconds for debugging
  // Production: 30 seconds for optimal performance
  TIMEOUT: isDevelopment ? 60000 : 30000,
  
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000, // 1 second
    MAX_DELAY: 4000, // 4 seconds
    BACKOFF_MULTIPLIER: 2,
  },
  HEADERS: {
    CONTENT_TYPE: 'application/json',
  },
  
  // Logging configuration
  LOGGING: {
    // Enable detailed request/response logging in development
    ENABLED: isDevelopment,
    // Log request details (method, URL, headers, data)
    LOG_REQUESTS: isDevelopment,
    // Log response details (status, headers, data)
    LOG_RESPONSES: isDevelopment,
    // Log detailed error information
    LOG_ERRORS: true, // Always log errors, but with different verbosity
    // Verbose error logging (stack traces, full error objects)
    VERBOSE_ERRORS: isDevelopment,
  },
} as const;

// Export environment flags for convenience
export const ENV = {
  isDevelopment,
  isProduction,
  isTest: process.env.NODE_ENV === 'test',
} as const;
