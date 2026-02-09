/**
 * Error Logger Utility
 * 
 * Centralized error logging for the application.
 * Logs errors to console in development and sends to monitoring service in production.
 * 
 * Requirements: 9.4
 */

/**
 * Error context interface
 * Contains additional information about where and when the error occurred
 */
export interface ErrorContext {
  /**
   * User ID (if available)
   */
  userId?: string
  /**
   * Organization ID (if available)
   */
  organizationId?: string
  /**
   * Current step in the onboarding flow
   */
  step?: string
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>
}

/**
 * Error log entry interface
 */
interface ErrorLogEntry {
  timestamp: string
  error: Error | string
  context: ErrorContext
  environment: 'development' | 'production'
  userAgent: string
  url: string
}

/**
 * Log an error with context
 * 
 * In development: Logs to console with full details
 * In production: Sends to monitoring service (e.g., Sentry, LogRocket)
 * 
 * @param error - The error to log
 * @param context - Additional context about the error
 * 
 * @example
 * ```ts
 * try {
 *   await saveProgress(data)
 * } catch (error) {
 *   logError(error, {
 *     userId: user.id,
 *     organizationId: user.organizationId,
 *     step: 'business-info',
 *     metadata: { formData: data }
 *   })
 * }
 * ```
 */
export function logError(error: Error | string, context: ErrorContext = {}): void {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Create error log entry
  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    error,
    context,
    environment: isDevelopment ? 'development' : 'production',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  }

  // Development: Log to console with full details
  if (isDevelopment) {
    console.group('🔴 Error Log')
    console.error('Error:', error)
    console.log('Timestamp:', logEntry.timestamp)
    console.log('Context:', context)
    console.log('URL:', logEntry.url)
    console.log('User Agent:', logEntry.userAgent)
    console.groupEnd()
  } else {
    // Production: Send to monitoring service
    sendToMonitoringService(logEntry)
  }
}

/**
 * Log a warning with context
 * Similar to logError but for non-critical issues
 * 
 * @param message - The warning message
 * @param context - Additional context about the warning
 */
export function logWarning(message: string, context: ErrorContext = {}): void {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    console.group('⚠️ Warning Log')
    console.warn('Warning:', message)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Context:', context)
    console.groupEnd()
  } else {
    // Production: Send to monitoring service with lower severity
    sendToMonitoringService({
      timestamp: new Date().toISOString(),
      error: message,
      context,
      environment: 'production',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    }, 'warning')
  }
}

/**
 * Log an info message with context
 * For tracking important events that aren't errors
 * 
 * @param message - The info message
 * @param context - Additional context
 */
export function logInfo(message: string, context: ErrorContext = {}): void {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    console.group('ℹ️ Info Log')
    console.info('Info:', message)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Context:', context)
    console.groupEnd()
  }
  // In production, you might want to send this to analytics instead of error monitoring
}

/**
 * Send error log to monitoring service
 * 
 * This is a placeholder function that should be implemented based on your
 * monitoring service (e.g., Sentry, LogRocket, Datadog, etc.)
 * 
 * @param logEntry - The error log entry to send
 * @param severity - The severity level (error, warning, info)
 */
function sendToMonitoringService(
  logEntry: ErrorLogEntry,
  severity: 'error' | 'warning' | 'info' = 'error'
): void {
  // TODO: Implement monitoring service integration
  // Example implementations:
  
  // Sentry:
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(logEntry.error, {
  //     level: severity,
  //     contexts: {
  //       user: {
  //         id: logEntry.context.userId,
  //         organizationId: logEntry.context.organizationId,
  //       },
  //       onboarding: {
  //         step: logEntry.context.step,
  //       },
  //     },
  //     extra: logEntry.context.metadata,
  //   })
  // }
  
  // LogRocket:
  // if (typeof window !== 'undefined' && window.LogRocket) {
  //   window.LogRocket.captureException(logEntry.error, {
  //     tags: {
  //       step: logEntry.context.step,
  //     },
  //     extra: logEntry.context,
  //   })
  // }
  
  // Custom API endpoint:
  // fetch('/api/logs', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ...logEntry, severity }),
  // }).catch(err => {
  //   // Silently fail - don't want logging errors to break the app
  //   console.error('Failed to send log to monitoring service:', err)
  // })
  
  // For now, just log to console in production as fallback
  console.error('[Monitoring Service]', severity.toUpperCase(), logEntry)
}

/**
 * Create an error logger with pre-filled context
 * Useful for creating a logger instance for a specific component or flow
 * 
 * @param defaultContext - Default context to include in all logs
 * @returns Object with logging methods
 * 
 * @example
 * ```ts
 * const logger = createErrorLogger({
 *   userId: user.id,
 *   organizationId: user.organizationId,
 *   step: 'business-info'
 * })
 * 
 * try {
 *   await saveData()
 * } catch (error) {
 *   logger.error(error, { metadata: { action: 'save' } })
 * }
 * ```
 */
export function createErrorLogger(defaultContext: ErrorContext) {
  return {
    error: (error: Error | string, additionalContext?: ErrorContext) => {
      logError(error, { ...defaultContext, ...additionalContext })
    },
    warning: (message: string, additionalContext?: ErrorContext) => {
      logWarning(message, { ...defaultContext, ...additionalContext })
    },
    info: (message: string, additionalContext?: ErrorContext) => {
      logInfo(message, { ...defaultContext, ...additionalContext })
    },
  }
}

/**
 * Extract error message from various error types
 * Handles Error objects, strings, and unknown error types
 * 
 * @param error - The error to extract message from
 * @returns The error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'An unknown error occurred'
}

/**
 * Check if error is a network error
 * 
 * @param error - The error to check
 * @returns True if the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error)
  return (
    message.includes('Network Error') ||
    message.includes('Failed to fetch') ||
    message.includes('timeout') ||
    message.includes('ECONNREFUSED')
  )
}

/**
 * Check if error is an authentication error
 * 
 * @param error - The error to check
 * @returns True if the error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error)
  return (
    message.includes('401') ||
    message.includes('Unauthorized') ||
    message.includes('authentication') ||
    message.includes('token')
  )
}

/**
 * Check if error is a validation error
 * 
 * @param error - The error to check
 * @returns True if the error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const message = getErrorMessage(error)
  return (
    message.includes('400') ||
    message.includes('Bad Request') ||
    message.includes('validation') ||
    message.includes('invalid')
  )
}
