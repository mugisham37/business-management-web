/**
 * Module Error Fallback Component
 * Displays error states for failed module loading
 */

import React from 'react';

export interface ModuleErrorFallbackProps {
  error: Error;
  moduleName?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ModuleErrorFallback Component
 * Displays user-friendly error message when module fails to load
 */
export const ModuleErrorFallback: React.FC<ModuleErrorFallbackProps> = ({
  error,
  moduleName,
  onRetry,
  className,
}) => {
  return (
    <div className={`module-error-fallback ${className || ''}`}>
      <div className="module-error-content">
        <h2 className="module-error-title">
          Failed to load {moduleName ? `${moduleName} module` : 'module'}
        </h2>
        <p className="module-error-message">{error.message}</p>
        {onRetry && (
          <button className="module-error-retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

ModuleErrorFallback.displayName = 'ModuleErrorFallback';
