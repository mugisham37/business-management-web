'use client';

import React, { Component, ReactNode } from 'react';
import { errorHandler } from './error-handler';
import { ErrorCategory } from './error-types';

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
      code: 'REACT_ERROR',
      message: error.message,
      userMessage: 'Something went wrong. Please try again.',
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

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try again.</p>
          <button onClick={this.reset}>Try Again</button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error.message}</pre>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
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
