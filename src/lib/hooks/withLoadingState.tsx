/**
 * withLoadingState HOC
 * 
 * Higher-order component that wraps query results with loading indicators.
 * Automatically shows skeleton loaders during loading states.
 * 
 * Requirements: 8.1, 8.4
 */

import React from 'react';
import { 
  QueryLoadingIndicator, 
  ListSkeletonLoader,
  TableSkeletonLoader,
  CardSkeletonLoader,
  DetailSkeletonLoader,
} from '@/components/ui/loading-indicators';
import { AppError } from '@/lib/errors/error-types';

/**
 * Loading state configuration
 */
export type LoadingIndicatorType = 'spinner' | 'list' | 'table' | 'card' | 'detail';

export interface LoadingStateConfig {
  type?: LoadingIndicatorType;
  message?: string;
  rows?: number;
  columns?: number;
  cards?: number;
  fields?: number;
}

/**
 * Props for components wrapped with loading state
 */
export interface WithLoadingStateProps {
  loading: boolean;
  error: AppError | null;
  loadingConfig?: LoadingStateConfig;
}

/**
 * withLoadingState
 * 
 * HOC that adds loading indicators to components.
 * Shows appropriate loading indicator based on configuration.
 * 
 * @param Component - Component to wrap
 * @param defaultConfig - Default loading configuration
 * 
 * Requirements: 8.1, 8.4
 */
export function withLoadingState<P extends object>(
  Component: React.ComponentType<P>,
  defaultConfig: LoadingStateConfig = { type: 'spinner' }
) {
  return function WithLoadingStateComponent(
    props: P & WithLoadingStateProps
  ) {
    const { loading, error, loadingConfig, ...componentProps } = props;
    const config = { ...defaultConfig, ...loadingConfig };

    // Show loading indicator
    if (loading) {
      switch (config.type) {
        case 'list':
          return (
            <ListSkeletonLoader 
              rows={config.rows} 
              columns={config.columns}
            />
          );
        case 'table':
          return (
            <TableSkeletonLoader 
              rows={config.rows} 
              columns={config.columns}
            />
          );
        case 'card':
          return <CardSkeletonLoader cards={config.cards} />;
        case 'detail':
          return <DetailSkeletonLoader fields={config.fields} />;
        case 'spinner':
        default:
          return <QueryLoadingIndicator message={config.message} />;
      }
    }

    // Show error state (component should handle error display)
    if (error) {
      return <Component {...(componentProps as P)} />;
    }

    // Show component with data
    return <Component {...(componentProps as P)} />;
  };
}

/**
 * useLoadingState Hook
 * 
 * Hook that provides loading state utilities for components.
 * Returns loading indicator component based on configuration.
 * 
 * Requirements: 8.1, 8.4
 */
export function useLoadingState(
  loading: boolean,
  config: LoadingStateConfig = { type: 'spinner' }
) {
  if (!loading) return null;

  switch (config.type) {
    case 'list':
      return (
        <ListSkeletonLoader 
          rows={config.rows} 
          columns={config.columns}
        />
      );
    case 'table':
      return (
        <TableSkeletonLoader 
          rows={config.rows} 
          columns={config.columns}
        />
      );
    case 'card':
      return <CardSkeletonLoader cards={config.cards} />;
    case 'detail':
      return <DetailSkeletonLoader fields={config.fields} />;
    case 'spinner':
    default:
      return <QueryLoadingIndicator message={config.message} />;
  }
}
