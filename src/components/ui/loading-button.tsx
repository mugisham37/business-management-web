/**
 * LoadingButton Component
 * 
 * Button component with built-in loading state support.
 * Automatically disables and shows spinner during mutations.
 * 
 * Requirements: 8.2, 8.5
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/loading-indicators';
import { cn } from '@/lib/utils';

/**
 * LoadingButton Props
 */
export interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  /**
   * Whether the button is in loading state
   */
  loading?: boolean;
  
  /**
   * Text to show when loading (optional)
   */
  loadingText?: string;
  
  /**
   * Position of the spinner
   */
  spinnerPosition?: 'left' | 'right';
  
  /**
   * Size of the spinner
   */
  spinnerSize?: 'sm' | 'md' | 'lg';
}

/**
 * LoadingButton
 * 
 * Button that shows loading state during async operations.
 * Automatically disables button and shows spinner when loading.
 * 
 * Requirements: 8.2, 8.5
 * 
 * @example
 * ```tsx
 * <LoadingButton
 *   loading={isSubmitting}
 *   loadingText="Saving..."
 *   onClick={handleSubmit}
 * >
 *   Save Changes
 * </LoadingButton>
 * ```
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      spinnerPosition = 'left',
      spinnerSize = 'sm',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const displayText = loading && loadingText ? loadingText : children;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(className)}
        {...props}
      >
        {loading && spinnerPosition === 'left' && (
          <InlineSpinner size={spinnerSize} className="mr-2" />
        )}
        {displayText}
        {loading && spinnerPosition === 'right' && (
          <InlineSpinner size={spinnerSize} className="ml-2" />
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

/**
 * IconLoadingButton
 * 
 * Icon-only button with loading state.
 * Shows spinner in place of icon when loading.
 * 
 * Requirements: 8.2, 8.5
 */
export interface IconLoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  icon?: React.ReactNode;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

export const IconLoadingButton = React.forwardRef<HTMLButtonElement, IconLoadingButtonProps>(
  (
    {
      loading = false,
      icon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        size="icon"
        className={cn(className)}
        {...props}
      >
        {loading ? <InlineSpinner size="sm" /> : icon}
      </Button>
    );
  }
);

IconLoadingButton.displayName = 'IconLoadingButton';
