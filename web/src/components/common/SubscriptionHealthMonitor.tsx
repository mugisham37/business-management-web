'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionStatus } from '@/lib/subscriptions';

interface SubscriptionHealthMonitorProps {
  className?: string;
  showMetrics?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

interface HealthMetrics {
  uptime: number;
  reconnectCount: number;
  lastReconnect: Date | null;
  averageLatency: number;
  errorRate: number;
}

export function SubscriptionHealthMonitor({
  className = '',
  showMetrics = false,
  autoHide = true,
  hideDelay = 5000
}: SubscriptionHealthMonitorProps) {
  const { status, stats, isConnected, hasError } = useSubscriptionStatus();
  const [isVisible, setIsVisible] = useState(!autoHide);
  const [metrics, setMetrics] = useState<HealthMetrics>({
    uptime: 0,
    reconnectCount: 0,
    lastReconnect: null,
    averageLatency: 0,
    errorRate: 0
  });

  // Auto-hide logic
  useEffect(() => {
    if (autoHide && isConnected) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    } else if (!isConnected || hasError) {
      setIsVisible(true);
    }
  }, [autoHide, isConnected, hasError, hideDelay]);

  // Update metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        uptime: isConnected ? prev.uptime + 1 : 0
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Track reconnections
  useEffect(() => {
    if (status === 'reconnecting') {
      setMetrics(prev => ({
        ...prev,
        reconnectCount: prev.reconnectCount + 1,
        lastReconnect: new Date()
      }));
    }
  }, [status]);

  if (!isVisible) {
    return null;
  }

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getHealthScore = (): number => {
    let score = 100;
    
    // Deduct points for errors
    if (hasError) score -= 30;
    if (status === 'disconnected') score -= 50;
    if (status === 'reconnecting') score -= 20;
    
    // Deduct points for frequent reconnections
    if (metrics.reconnectCount > 5) score -= 20;
    if (metrics.reconnectCount > 10) score -= 30;
    
    return Math.max(0, score);
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const healthScore = getHealthScore();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Real-time Connection Health</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Health Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Health Score</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-sm font-medium ${
            isConnected ? 'text-green-600' : hasError ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Active Subscriptions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Subscriptions</span>
          <span className="text-sm font-medium text-gray-900">
            {stats.totalSubscriptions}
          </span>
        </div>

        {/* Connection Pools */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection Pools</span>
          <span className="text-sm font-medium text-gray-900">
            {stats.totalPools}
          </span>
        </div>

        {showMetrics && (
          <>
            {/* Uptime */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">
                {formatUptime(metrics.uptime)}
              </span>
            </div>

            {/* Reconnection Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reconnections</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.reconnectCount}
              </span>
            </div>

            {/* Last Reconnection */}
            {metrics.lastReconnect && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Reconnect</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.lastReconnect.toLocaleTimeString()}
                </span>
              </div>
            )}
          </>
        )}

        {/* Pool Details */}
        {stats.poolStats.size > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Pool Details</h4>
            <div className="space-y-1">
              {Array.from(stats.poolStats.entries()).map(([poolKey, poolStat]) => (
                <div key={poolKey} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 truncate max-w-20">
                    {poolKey === 'default' ? 'Default' : poolKey}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900">{poolStat.subscriptions}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      poolStat.status === 'connected' ? 'bg-green-400' :
                      poolStat.status === 'connecting' || poolStat.status === 'reconnecting' ? 'bg-yellow-400' :
                      poolStat.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionHealthMonitor;