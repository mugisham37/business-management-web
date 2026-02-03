'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Server,
  Activity,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectionMonitor, ConnectionStatus as IConnectionStatus, EndpointStatus } from '@/lib/graphql/connection-monitor';
import { cn } from '@/lib/utils/cn';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
  onClose?: () => void;
}

export function ConnectionStatus({ showDetails = false, className, onClose }: ConnectionStatusProps) {
  const [status, setStatus] = useState<IConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
    responseTime: null,
    error: null,
    serverInfo: null,
  });
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribeStatus = ConnectionMonitor.onConnectionChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubscribeEndpoints = ConnectionMonitor.onEndpointChange((newEndpoints) => {
      setEndpoints(newEndpoints);
    });

    // Initial check
    ConnectionMonitor.forceCheck();

    return () => {
      unsubscribeStatus();
      unsubscribeEndpoints();
    };
  }, []);

  const handleForceCheck = async () => {
    setIsChecking(true);
    try {
      await ConnectionMonitor.forceCheck();
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (status.isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (status.isConnected) return 'green';
    return 'red';
  };

  const getEndpointIcon = (endpoint: EndpointStatus) => {
    switch (endpoint.status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'checking':
        return <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <WifiOff className="w-3 h-3 text-red-500" />;
    }
  };

  if (!showFullDetails) {
    // Compact status indicator
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {getStatusIcon()}
        <span className={cn(
          'text-sm font-medium',
          status.isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {status.isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {status.responseTime && (
          <Badge variant="outline" className="text-xs">
            {status.responseTime}ms
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowFullDetails(true)}
          className="h-6 px-2 text-xs"
        >
          Details
        </Button>
      </div>
    );
  }

  // Full details panel
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-80',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Server Connection
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleForceCheck}
              disabled={isChecking}
              className="h-8 px-2"
            >
              <RefreshCw className={cn('w-4 h-4', isChecking && 'animate-spin')} />
            </Button>
            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Overall Status */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className={cn(
                'font-medium',
                status.isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {status.isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last checked: {status.lastChecked.toLocaleTimeString()}
              </div>
            </div>
          </div>
          {status.responseTime && (
            <Badge variant={status.isConnected ? 'default' : 'destructive'}>
              {status.responseTime}ms
            </Badge>
          )}
        </div>

        {/* Server Info */}
        {status.serverInfo && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-200">Server Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                  {status.serverInfo.status || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                <span className="ml-2 font-medium">
                  {status.serverInfo.environment || 'Unknown'}
                </span>
              </div>
              {status.serverInfo.uptime && (
                <div className="col-span-2">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(status.serverInfo.uptime)} seconds
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {status.error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-800 dark:text-red-200">Connection Error</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">{status.error}</p>
          </div>
        )}

        {/* Endpoints Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Endpoints
          </h4>
          {endpoints.map((endpoint, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
            >
              <div className="flex items-center gap-2">
                {getEndpointIcon(endpoint)}
                <div>
                  <div className="font-medium text-sm">{endpoint.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-48">
                    {endpoint.url}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    endpoint.status === 'connected' ? 'default' :
                    endpoint.status === 'error' ? 'secondary' :
                    endpoint.status === 'checking' ? 'outline' : 'destructive'
                  }
                  className="text-xs"
                >
                  {endpoint.status}
                </Badge>
                {endpoint.responseTime && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {endpoint.responseTime}ms
                  </div>
                )}
                {endpoint.error && (
                  <div className="text-xs text-red-500 dark:text-red-400 mt-1 max-w-32 truncate">
                    {endpoint.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => console.log(ConnectionMonitor.getConnectionSummary())}
          >
            Log Summary
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFullDetails(false)}
            >
              Minimize
            </Button>
            <Button
              size="sm"
              onClick={handleForceCheck}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ConnectionStatus;