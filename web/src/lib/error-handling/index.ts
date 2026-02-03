/**
 * Error Handling Module
 * 
 * Provides centralized error handling and reporting utilities:
 * - Global error boundary configuration
 * - Error reporting service integration
 * - Network retry logic
 * - Circuit breaker pattern
 */

export interface ErrorReportingConfig {
  enabled: boolean;
  environment: 'development' | 'production' | 'staging';
  sampleRate?: number;
}

export interface NetworkRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

export interface ErrorHandlingConfig {
  errorReporting: ErrorReportingConfig;
  networkRetry: NetworkRetryConfig;
  circuitBreaker: CircuitBreakerConfig;
}

// Error handler state
let errorHandlingConfig: ErrorHandlingConfig | null = null;

/**
 * Initialize error handling with the provided configuration
 */
export function initializeErrorHandling(config: ErrorHandlingConfig): void {
  errorHandlingConfig = config;

  if (typeof window !== 'undefined') {
    // Set up global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      handleGlobalError({
        message: String(message),
        source,
        lineno,
        colno,
        error,
      });
      return false; // Don't prevent default handling
    };

    // Set up unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      handleUnhandledRejection(event);
    };
  }

  if (config.errorReporting.enabled) {
    console.log(`[ErrorHandling] Initialized for ${config.errorReporting.environment} environment`);
  }
}

/**
 * Get current error handling configuration
 */
export function getErrorHandlingConfig(): ErrorHandlingConfig | null {
  return errorHandlingConfig;
}

interface GlobalErrorData {
  message: string;
  source?: string | undefined;
  lineno?: number | undefined;
  colno?: number | undefined;
  error?: Error | undefined;
}

/**
 * Handle global errors
 */
function handleGlobalError(data: GlobalErrorData): void {
  if (!errorHandlingConfig?.errorReporting.enabled) {
    return;
  }

  // Sample rate check
  if (errorHandlingConfig.errorReporting.sampleRate !== undefined) {
    if (Math.random() > errorHandlingConfig.errorReporting.sampleRate) {
      return;
    }
  }

  const errorReport = {
    type: 'global_error',
    message: data.message,
    source: data.source,
    lineno: data.lineno,
    colno: data.colno,
    stack: data.error?.stack,
    environment: errorHandlingConfig.errorReporting.environment,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // In production, you would send this to your error reporting service
  if (errorHandlingConfig.errorReporting.environment === 'development') {
    console.error('[ErrorHandling] Global error:', errorReport);
  }
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  if (!errorHandlingConfig?.errorReporting.enabled) {
    return;
  }

  const errorReport = {
    type: 'unhandled_rejection',
    reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
    environment: errorHandlingConfig.errorReporting.environment,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  if (errorHandlingConfig.errorReporting.environment === 'development') {
    console.error('[ErrorHandling] Unhandled rejection:', errorReport);
  }
}

/**
 * Report an error manually
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
  if (!errorHandlingConfig?.errorReporting.enabled) {
    return;
  }

  const errorReport = {
    type: 'manual_report',
    message: error.message,
    stack: error.stack,
    context,
    environment: errorHandlingConfig.errorReporting.environment,
    timestamp: new Date().toISOString(),
  };

  if (errorHandlingConfig.errorReporting.environment === 'development') {
    console.error('[ErrorHandling] Reported error:', errorReport);
  }
}

/**
 * Create a network request with retry logic
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<NetworkRetryConfig>
): Promise<T> {
  const config = {
    ...errorHandlingConfig?.networkRetry,
    ...retryConfig,
  };

  const maxRetries = config.maxRetries ?? 3;
  const baseDelay = config.baseDelay ?? 1000;
  const maxDelay = config.maxDelay ?? 30000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

// Circuit breaker state
const circuitBreakerState = new Map<string, {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}>();

/**
 * Execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const cbConfig = {
    ...errorHandlingConfig?.circuitBreaker,
    ...config,
  };

  const failureThreshold = cbConfig.failureThreshold ?? 5;
  const resetTimeout = cbConfig.resetTimeout ?? 60000;

  let state = circuitBreakerState.get(key);

  if (!state) {
    state = { failures: 0, lastFailure: 0, isOpen: false };
    circuitBreakerState.set(key, state);
  }

  // Check if circuit should be reset
  if (state.isOpen && Date.now() - state.lastFailure > resetTimeout) {
    state.isOpen = false;
    state.failures = 0;
  }

  // If circuit is open, fail fast
  if (state.isOpen) {
    throw new Error(`Circuit breaker is open for: ${key}`);
  }

  try {
    const result = await fn();
    state.failures = 0;
    return result;
  } catch (error) {
    state.failures++;
    state.lastFailure = Date.now();

    if (state.failures >= failureThreshold) {
      state.isOpen = true;
    }

    throw error;
  }
}
