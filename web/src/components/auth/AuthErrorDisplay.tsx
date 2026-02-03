'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Mail, 
  Lock, 
  Phone,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthError, AuthErrorCode, authErrorHandler } from '@/lib/auth/auth-errors';
import { cn } from '@/lib/utils/cn';

interface AuthErrorDisplayProps {
  error: AuthError | null;
  canRetry?: boolean;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
  onAction?: (action: string) => void;
  className?: string;
}

export function AuthErrorDisplay({
  error,
  canRetry = false,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onDismiss,
  onAction,
  className,
}: AuthErrorDisplayProps) {
  if (!error) return null;

  const { message, action } = authErrorHandler.getErrorMessage(error);
  const isNetworkError = [
    AuthErrorCode.NETWORK_ERROR,
    AuthErrorCode.CONNECTION_LOST,
    AuthErrorCode.TIMEOUT_ERROR,
  ].includes(error.code);

  // Enhanced logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [AuthErrorDisplay] Displaying error:', {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      isNetworkError,
      timestamp: new Date().toISOString()
    });
  }

  const getErrorIcon = () => {
    switch (error.code) {
      case AuthErrorCode.NETWORK_ERROR:
      case AuthErrorCode.CONNECTION_LOST:
        return <WifiOff className="w-5 h-5" />;
      case AuthErrorCode.TIMEOUT_ERROR:
        return <Wifi className="w-5 h-5" />;
      case AuthErrorCode.INVALID_CREDENTIALS:
        return <Lock className="w-5 h-5" />;
      case AuthErrorCode.EMAIL_NOT_VERIFIED:
        return <Mail className="w-5 h-5" />;
      case AuthErrorCode.ACCOUNT_LOCKED:
      case AuthErrorCode.ACCOUNT_DISABLED:
        return <Lock className="w-5 h-5" />;
      case AuthErrorCode.TOO_MANY_ATTEMPTS:
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getErrorColor = () => {
    if (isNetworkError) return 'orange';
    if (error.retryable) return 'yellow';
    return 'red';
  };

  const colorClasses = {
    red: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-900',
      text: 'text-red-700 dark:text-red-400',
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-900',
      text: 'text-orange-700 dark:text-orange-400',
      icon: 'text-orange-500',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-900',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
  };

  const colors = colorClasses[getErrorColor()];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'rounded-lg border p-4',
          colors.bg,
          colors.border,
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Error Icon */}
          <div className={cn('shrink-0 mt-0.5', colors.icon)}>
            {getErrorIcon()}
          </div>

          {/* Error Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className={cn('text-sm font-medium', colors.text)}>
                  {getErrorTitle(error.code)}
                </p>
                <p className={cn('text-sm mt-1', colors.text)}>
                  {message}
                </p>

                {/* Retry Information */}
                {error.retryable && retryCount > 0 && (
                  <p className={cn('text-xs mt-2 opacity-75', colors.text)}>
                    Attempt {retryCount} of {maxRetries}
                  </p>
                )}

                {/* Retry After Information */}
                {error.retryAfter && (
                  <p className={cn('text-xs mt-1 opacity-75', colors.text)}>
                    Please wait {error.retryAfter} seconds before retrying
                  </p>
                )}
              </div>

              {/* Dismiss Button */}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={cn(
                    'shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
                    colors.text
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              {/* Retry Button */}
              {canRetry && onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className={cn(
                    'text-white',
                    colors.button
                  )}
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              )}

              {/* Action Button */}
              {action && onAction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAction(error.actionRequired || 'RETRY')}
                  className={cn(
                    'border-current',
                    colors.text
                  )}
                >
                  {getActionIcon(error.actionRequired)}
                  {action}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function getErrorTitle(code: AuthErrorCode): string {
  switch (code) {
    case AuthErrorCode.NETWORK_ERROR:
      return 'Connection Problem';
    case AuthErrorCode.CONNECTION_LOST:
      return 'Connection Lost';
    case AuthErrorCode.TIMEOUT_ERROR:
      return 'Request Timeout';
    case AuthErrorCode.INVALID_CREDENTIALS:
      return 'Invalid Credentials';
    case AuthErrorCode.ACCOUNT_LOCKED:
      return 'Account Locked';
    case AuthErrorCode.ACCOUNT_DISABLED:
      return 'Account Disabled';
    case AuthErrorCode.EMAIL_NOT_VERIFIED:
      return 'Email Not Verified';
    case AuthErrorCode.TOO_MANY_ATTEMPTS:
      return 'Too Many Attempts';
    case AuthErrorCode.OAUTH_CANCELLED:
      return 'Sign-in Cancelled';
    case AuthErrorCode.OAUTH_FAILED:
      return 'Social Sign-in Failed';
    case AuthErrorCode.POPUP_BLOCKED:
      return 'Popup Blocked';
    case AuthErrorCode.SERVER_ERROR:
      return 'Server Error';
    case AuthErrorCode.SERVICE_UNAVAILABLE:
      return 'Service Unavailable';
    default:
      return 'Authentication Error';
  }
}

function getActionIcon(actionRequired?: string) {
  switch (actionRequired) {
    case 'VERIFY_EMAIL':
      return <Mail className="w-4 h-4 mr-2" />;
    case 'RESET_PASSWORD':
      return <Lock className="w-4 h-4 mr-2" />;
    case 'CONTACT_SUPPORT':
      return <Phone className="w-4 h-4 mr-2" />;
    default:
      return null;
  }
}

export default AuthErrorDisplay;