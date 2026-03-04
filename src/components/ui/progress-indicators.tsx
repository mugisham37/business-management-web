/**
 * Progress Indicators
 * 
 * Progress indicator components for long-running operations.
 * Provides visual feedback for operations with known or unknown duration.
 * 
 * Requirements: 8.7
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/**
 * ProgressIndicator
 * 
 * Generic progress indicator with percentage display.
 * Shows determinate progress for operations with known duration.
 * 
 * Requirements: 8.7
 */
export interface ProgressIndicatorProps {
  /**
   * Progress percentage (0-100)
   */
  value: number;
  
  /**
   * Label to display above progress bar
   */
  label?: string;
  
  /**
   * Show percentage text
   */
  showPercentage?: boolean;
  
  /**
   * Additional message to display
   */
  message?: string;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  className?: string;
}

export function ProgressIndicator({
  value,
  label,
  showPercentage = true,
  message,
  size = 'md',
  className,
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <Progress value={value} className={sizeClasses[size]} />
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

/**
 * IndeterminateProgress
 * 
 * Indeterminate progress indicator for operations with unknown duration.
 * Shows continuous animation without specific percentage.
 * 
 * Requirements: 8.7
 */
export interface IndeterminateProgressProps {
  label?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IndeterminateProgress({
  label,
  message,
  size = 'md',
  className,
}: IndeterminateProgressProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          <span className="font-medium">{label}</span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-secondary', sizeClasses[size])}>
        <div
          className="h-full w-1/3 animate-progress bg-primary"
          style={{
            animation: 'progress 1.5s ease-in-out infinite',
          }}
        />
      </div>
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

/**
 * StepProgress
 * 
 * Step-based progress indicator for multi-step operations.
 * Shows current step and total steps.
 * 
 * Requirements: 8.7
 */
export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  steps,
  className,
}: StepProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {steps && steps[currentStep - 1] && (
        <p className="text-sm text-muted-foreground">
          {steps[currentStep - 1]}
        </p>
      )}
    </div>
  );
}

/**
 * QueryProgress
 * 
 * Specialized progress indicator for query operations.
 * Shows loading state with estimated time or record count.
 * 
 * Requirements: 8.7
 */
export interface QueryProgressProps {
  /**
   * Number of records loaded
   */
  loaded?: number;
  
  /**
   * Total number of records (if known)
   */
  total?: number;
  
  /**
   * Query operation label
   */
  label?: string;
  
  /**
   * Show as indeterminate if total is unknown
   */
  indeterminate?: boolean;
  
  className?: string;
}

export function QueryProgress({
  loaded,
  total,
  label = 'Loading data',
  indeterminate = false,
  className,
}: QueryProgressProps) {
  if (indeterminate || !total) {
    return (
      <IndeterminateProgress
        label={label}
        message={loaded ? `${loaded.toLocaleString()} records loaded` : undefined}
        className={className}
      />
    );
  }

  const progress = (loaded! / total) * 100;

  return (
    <ProgressIndicator
      value={progress}
      label={label}
      message={`${loaded?.toLocaleString()} of ${total.toLocaleString()} records`}
      className={className}
    />
  );
}

/**
 * TimeProgress
 * 
 * Progress indicator with elapsed time display.
 * Useful for long-running operations.
 * 
 * Requirements: 8.7
 */
export interface TimeProgressProps {
  /**
   * Start time in milliseconds
   */
  startTime: number;
  
  /**
   * Progress percentage (0-100), optional
   */
  value?: number;
  
  /**
   * Label to display
   */
  label?: string;
  
  /**
   * Show elapsed time
   */
  showElapsed?: boolean;
  
  className?: string;
}

export function TimeProgress({
  startTime,
  value,
  label = 'Processing',
  showElapsed = true,
  className,
}: TimeProgressProps) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatElapsed = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  if (value === undefined) {
    return (
      <IndeterminateProgress
        label={label}
        message={showElapsed ? `Elapsed: ${formatElapsed(elapsed)}` : undefined}
        className={className}
      />
    );
  }

  return (
    <ProgressIndicator
      value={value}
      label={label}
      message={showElapsed ? `Elapsed: ${formatElapsed(elapsed)}` : undefined}
      className={className}
    />
  );
}

/**
 * BatchProgress
 * 
 * Progress indicator for batch operations.
 * Shows success, error, and pending counts.
 * 
 * Requirements: 8.7
 */
export interface BatchProgressProps {
  total: number;
  success: number;
  error: number;
  pending: number;
  label?: string;
  className?: string;
}

export function BatchProgress({
  total,
  success,
  error,
  pending,
  label = 'Processing batch',
  className,
}: BatchProgressProps) {
  const completed = success + error;
  const progress = (completed / total) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {completed} / {total}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="size-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">
            Success: {success}
          </span>
        </div>
        {error > 0 && (
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">
              Error: {error}
            </span>
          </div>
        )}
        {pending > 0 && (
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">
              Pending: {pending}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Add keyframes for indeterminate progress animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes progress {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(400%);
      }
    }
  `;
  document.head.appendChild(style);
}
