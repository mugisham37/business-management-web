'use client';

import React, { Component, ReactNode } from 'react';
import { errorHandler } from './error-handler';
import { ErrorCategory, ERROR_CODES } from './error-types';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  level: 'root' | 'route' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Fallback component for displaying user-friendly error messages
 */
export const ErrorFallback: React.FC<{
  error: Error;
  reset: () => void;
  level?: 'root' | 'route' | 'component';
}> = ({ error, reset, level = 'component' }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {level === 'root' ? 'Application Error' : 'Something went wrong'}
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400">
          {level === 'root'
            ? 'We encountered an unexpected error. Please refresh the page or try again later.'
            : 'We're sorry for the inconvenience. Please try again.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          {level === 'root' && (
            <button
              onClick={() => window.location.href = '/'}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Go to Home
            </button>
          )}
        </div>

        {/* Development Error Details */}
        {isDevelopment && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              Error Details (Development Only)
            </summary>
            <div className="mt-2 space-y-2 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Error Message:
                </p>
                <pre className="mt-1 overflow-x-auto text-xs text-gray-800 dark:text-gray-200">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Stack Trace:
                  </p>
                  <pre className="mt-1 overflow-x-auto text-xs text-gray-800 dark:text-gray-200">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * Generic Error Boundary component with configurable levels
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = {
      category: ErrorCategory.CLIENT,
      code: ERROR_CODES.REACT_ERROR,
      message: error.message,
      userMessage: 'Something went wrong. Please try again.',
      originalError: error,
      timestamp: new Date(),
      stack: error.stack,
      context: {
        componentStack: errorInfo.componentStack,
        level: this.props.level,
      },
    };

    errorHandler.logError(appError);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return <ErrorFallback error={this.state.error} reset={this.reset} level={this.props.level} />;
    }

    return this.props.children;
  }
}

/**
 * Root-level error boundary for application-wide errors
 */
export const RootErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="root">{children}</ErrorBoundary>
);

/**
 * Route-level error boundary for page-specific errors
 */
export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="route">{children}</ErrorBoundary>
);

/**
 * Component-level error boundary for isolated component errors
 */
export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
);
