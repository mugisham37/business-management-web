'use client';

import React, { useState, useEffect } from 'react';
import { useSubscriptionStatus } from '@/lib/subscriptions';
import { useRealtime } from '@/hooks/useRealtime';

interface RealtimeIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RealtimeIndicator({
  position = 'top-right',
  size = 'md',
  showLabel = false,
  className = ''
}: RealtimeIndicatorProps) {
  const { status, isConnected, isConnecting, hasError } = useSubscriptionStatus();
  const { isConnected: wsConnected, connectionStatus } = useRealtime();
  const [pulseCount, setPulseCount] = useState(0);

  // Use WebSocket connection status if available, otherwise fall back to GraphQL subscriptions
  const actuallyConnected = wsConnected || isConnected;
  const actuallyConnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting' || isConnecting;
  const actuallyHasError = connectionStatus === 'error' || hasError;

  // Pulse animation for activity indication
  useEffect(() => {
    if (actuallyConnected) {
      const interval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [actuallyConnected]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getIndicatorColor = () => {
    if (actuallyConnected) return 'bg-green-400';
    if (actuallyConnecting) return 'bg-yellow-400';
    if (actuallyHasError) return 'bg-red-400';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (actuallyConnected) return 'Real-time connected';
    if (actuallyConnecting) return 'Connecting...';
    if (actuallyHasError) return 'Connection error';
    return 'Offline';
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="relative">
          {/* Main indicator dot */}
          <div className={`${getSizeClasses()} ${getIndicatorColor()} rounded-full`} />
          
          {/* Pulse animation for connected state */}
          {actuallyConnected && (
            <div 
              key={pulseCount}
              className={`absolute inset-0 ${getSizeClasses()} bg-green-400 rounded-full animate-ping opacity-75`}
            />
          )}
          
          {/* Spinning animation for connecting states */}
          {actuallyConnecting && (
            <div className={`absolute inset-0 ${getSizeClasses()} border-2 border-yellow-400 border-t-transparent rounded-full animate-spin`} />
          )}
        </div>

        {showLabel && (
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {getStatusText()}
          </div>
        )}
      </div>
    </div>
  );
}

export default RealtimeIndicator;