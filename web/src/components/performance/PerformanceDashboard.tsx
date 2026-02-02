/**
 * Performance Dashboard Component
 * Displays performance metrics and insights
 */

import React from 'react';

export interface PerformanceMetricsData {
  metric: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export interface PerformanceDashboardProps {
  metrics?: PerformanceMetricsData[];
  title?: string;
  className?: string;
}

/**
 * PerformanceDashboard Component
 * Displays performance metrics in a dashboard view
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics = [],
  title = 'Performance Dashboard',
  className,
}) => {
  return (
    <div className={`performance-dashboard ${className || ''}`}>
      <h1 className="performance-dashboard-title">{title}</h1>
      <div className="performance-dashboard-grid">
        {metrics.length > 0 ? (
          metrics.map((metric, index) => (
            <div key={index} className={`performance-metric-card status-${metric.status}`}>
              <h3 className="performance-metric-title">{metric.metric}</h3>
              <p className="performance-metric-value">
                {metric.value} {metric.unit}
              </p>
              <span className={`performance-metric-badge badge-${metric.status}`}>
                {metric.status}
              </span>
            </div>
          ))
        ) : (
          <p className="performance-dashboard-empty">No metrics available</p>
        )}
      </div>
    </div>
  );
};

PerformanceDashboard.displayName = 'PerformanceDashboard';
