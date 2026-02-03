'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Terminal,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectionMonitor, ConnectionStatus as IConnectionStatus } from '@/lib/graphql/connection-monitor';
import { ConnectionStatus } from './ConnectionStatus';
import { DevelopmentLogger } from './DevelopmentLogger';
import { cn } from '@/lib/utils/cn';

interface ConnectionStatusBarProps {
  className?: string;
  showInDevelopment?: boolean;
}

export function ConnectionStatusBar({ 
  className,
  showInDevelopment = true 
}: ConnectionStatusBarProps) {
  const [status, setStatus] = useState<IConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
    responseTime: null,
    error: null,
    serverInfo: null,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development or when there are connection issues
  const shouldShow = showInDevelopment && (
    process.env.NODE_ENV === 'development' || 
    !status.isConnected
  );

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = ConnectionMonitor.onConnectionChange((newStatus) => {
      setStatus(newStatus);
      
      // Show the bar if there are connection issues
      if (!newStatus.isConnected) {
        setIsVisible(true);
      }
    });

    // Initial check
    ConnectionMonitor.forceCheck();

    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsVisible(shouldShow);
  }, [shouldShow]);

  const getStatusIcon = () => {
    if (status.isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (status.isConnected) {
      return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200';
    } else {
      return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-sm',
            getStatusColor(),
            className
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    Server: {status.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  {status.responseTime && (
                    <Badge variant="outline" className="text-xs">
                      {status.responseTime}ms
                    </Badge>
                  )}
                  {status.serverInfo?.environment && (
                    <Badge variant="outline" className="text-xs">
                      {status.serverInfo.environment}
                    </Badge>
                  )}
                </div>
                {status.error && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs opacity-75">
                      {status.error.length > 50 ? `${status.error.substring(0, 50)}...` : status.error}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowLogger(!showLogger)}
                      className="h-7 px-2 text-xs"
                    >
                      <Terminal className="w-3 h-3 mr-1" />
                      Logs
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDetails(!showDetails)}
                      className="h-7 px-2 text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => ConnectionMonitor.forceCheck()}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
                {status.isConnected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVisible(false)}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Connection Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="max-w-2xl w-full">
            <ConnectionStatus
              showDetails={true}
              onClose={() => setShowDetails(false)}
            />
          </div>
        </div>
      )}

      {/* Development Logger */}
      <DevelopmentLogger
        isOpen={showLogger}
        onClose={() => setShowLogger(false)}
      />
    </>
  );
}

export default ConnectionStatusBar;