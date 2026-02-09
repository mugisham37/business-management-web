/**
 * ErrorMessage Component
 * 
 * Reusable error message component for onboarding flow.
 * Displays user-friendly error messages with retry functionality.
 * 
 * Requirements: 9.1, 9.2, 9.5
 */

"use client"

import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert"
import { Button } from "@/components/ui/Button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorMessageProps {
  /**
   * Error message to display
   */
  error: string | Error | null
  /**
   * Optional title for the error
   * @default "Something went wrong"
   */
  title?: string
  /**
   * Callback function to retry the failed operation
   */
  onRetry?: () => void
  /**
   * Whether the retry operation is in progress
   * @default false
   */
  isRetrying?: boolean
  /**
   * Custom retry button text
   * @default "Try again"
   */
  retryText?: string
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether to show the error icon
   * @default true
   */
  showIcon?: boolean
  /**
   * Whether the alert can be dismissed
   * @default false
   */
  dismissible?: boolean
  /**
   * Callback when the alert is dismissed
   */
  onDismiss?: () => void
}

/**
 * Maps technical error messages to user-friendly messages
 */
const getUserFriendlyMessage = (error: string | Error | null): string => {
  if (!error) return "An unexpected error occurred"
  
  const errorMessage = typeof error === "string" ? error : error.message
  
  // Network errors
  if (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
    return "Unable to connect to the server. Please check your internet connection and try again."
  }
  
  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    return "The request took too long to complete. Please try again."
  }
  
  // Authentication errors
  if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
    return "Your session has expired. Please log in again."
  }
  
  // Validation errors
  if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
    return "Please check your input and try again."
  }
  
  // Server errors
  if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
    return "The server encountered an error. Please try again in a few moments."
  }
  
  // Service unavailable
  if (errorMessage.includes("503") || errorMessage.includes("Service Unavailable")) {
    return "The service is temporarily unavailable. Please try again later."
  }
  
  // Default: return the original message if it's user-friendly enough
  // (doesn't contain technical jargon)
  if (
    !errorMessage.includes("Error:") &&
    !errorMessage.includes("Exception") &&
    !errorMessage.includes("undefined") &&
    !errorMessage.includes("null") &&
    errorMessage.length < 150
  ) {
    return errorMessage
  }
  
  // Fallback for technical errors
  return "An unexpected error occurred. Please try again."
}

/**
 * ErrorMessage Component
 * 
 * Displays user-friendly error messages with optional retry functionality.
 * Automatically maps technical errors to user-friendly messages.
 * 
 * @example
 * ```tsx
 * <ErrorMessage
 *   error="Network Error"
 *   onRetry={() => refetch()}
 *   isRetrying={isLoading}
 * />
 * ```
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title = "Something went wrong",
  onRetry,
  isRetrying = false,
  retryText = "Try again",
  className,
  showIcon = true,
  dismissible = false,
  onDismiss,
}) => {
  if (!error) return null

  const friendlyMessage = getUserFriendlyMessage(error)

  return (
    <Alert
      variant="destructive"
      className={className}
      dismissible={dismissible}
      onDismiss={onDismiss}
      showIcon={showIcon}
      icon={showIcon ? <AlertCircle /> : undefined}
    >
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <p>{friendlyMessage}</p>
          {onRetry && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="h-8"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    {retryText}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Compact version of ErrorMessage for inline display
 */
export const ErrorMessageCompact: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  isRetrying = false,
  retryText = "Retry",
  className,
}) => {
  if (!error) return null

  const friendlyMessage = getUserFriendlyMessage(error)

  return (
    <div className={`flex items-center justify-between gap-3 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive ${className || ""}`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{friendlyMessage}</span>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-7 text-xs"
        >
          {isRetrying ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            retryText
          )}
        </Button>
      )}
    </div>
  )
}

export default ErrorMessage
