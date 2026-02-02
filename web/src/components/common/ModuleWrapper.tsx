/**
 * Module Wrapper Components
 * Provides layout and UI wrapper components for modules
 */

import React, { ReactNode } from 'react';

export interface ModuleWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * ModuleWrapper Component
 * Wraps module content with consistent styling and layout
 */
export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({
  children,
  className,
  title,
  subtitle,
}) => {
  return (
    <div className={`module-wrapper ${className || ''}`}>
      {title && (
        <div className="module-wrapper-header">
          <h1 className="module-wrapper-title">{title}</h1>
          {subtitle && <p className="module-wrapper-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="module-wrapper-content">{children}</div>
    </div>
  );
};

ModuleWrapper.displayName = 'ModuleWrapper';

export interface ModuleSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * ModuleSection Component
 * Represents a section within a module
 */
export const ModuleSection: React.FC<ModuleSectionProps> = ({
  children,
  className,
  title,
  isLoading,
  error,
}) => {
  return (
    <section className={`module-section ${className || ''}`}>
      {title && <h2 className="module-section-title">{title}</h2>}
      {isLoading && <div className="module-section-loading">Loading...</div>}
      {error && <div className="module-section-error">Error: {error.message}</div>}
      {!isLoading && !error && <div className="module-section-content">{children}</div>}
    </section>
  );
};

ModuleSection.displayName = 'ModuleSection';

export interface ModuleGridProps {
  children: ReactNode;
  className?: string;
  columns?: number;
  gap?: string;
}

/**
 * ModuleGrid Component
 * Provides grid layout for module content
 */
export const ModuleGrid: React.FC<ModuleGridProps> = ({
  children,
  className,
  columns = 3,
  gap = '1rem',
}) => {
  return (
    <div
      className={`module-grid ${className || ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
};

ModuleGrid.displayName = 'ModuleGrid';
