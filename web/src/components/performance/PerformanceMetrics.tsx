/**
 * Performance Metrics Component
 * Displays detailed performance metrics
 */

import React from 'react';

export interface MetricItem {
  label: string;
  value: string | number;
  unit?: string;
}

export interface PerformanceMetricsProps {
  items: MetricItem[];
  className?: string;
  columns?: number;
}

/**
 * PerformanceMetrics Component
 * Displays performance metrics in a list or grid format
 */
export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  items,
  className,
  columns = 2,
}) => {
  return (
    <div
      className={`performance-metrics ${className || ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem',
      }}
    >
      {items.map((item, index) => (
        <div key={index} className="performance-metric-item">
          <dt className="performance-metric-label">{item.label}</dt>
          <dd className="performance-metric-value">
            {item.value}
            {item.unit && <span className="performance-metric-unit">{item.unit}</span>}
          </dd>
        </div>
      ))}
    </div>
  );
};

PerformanceMetrics.displayName = 'PerformanceMetrics';
