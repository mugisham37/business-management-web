/**
 * Loading Spinner Component
 * Shows loading state for modules and components
 */

import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className,
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`loading-spinner-container ${className || ''}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner-animation" />
      </div>
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';
