'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Terminal,
  Play,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConnectionMonitor, ConnectionStatus } from '@/lib/graphql/connection-monitor';

interface ServerDependencyCheckProps {
  children: React.ReactNode;
  requireServer?: boolean;
  showInstructions?: boolean;
}

export function ServerDependencyCheck({ 
  children, 
  requireServer = true,
  showInstructions = true 
}: ServerDependencyCheckProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
    responseTime: null,
    error: null,
    serverInfo: null,
  });
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.log('🔍 [ServerDependencyCheck] Initializing server dependency check...');
    
    // Subscribe to connection status changes
    const unsubscribe = ConnectionMonitor.onConnectionChange((status) => {
      console.log(`📡 [ServerDependencyCheck] Connection status updated:`, status);
      setConnectionStatus(status);
      setIsChecking(false);
    });

    // Initial check
    checkServerConnection();

    return unsubscribe;
  }, []);

  const checkServerConnection = async () => {
    console.log('🔍 [ServerDependencyCheck] Checking server connection...');
    setIsChecking(true);
    setRetryCount(prev => prev + 1);
    
    try {
      const status = await ConnectionMonitor.forceCheck();
      console.log(`📊 [ServerDependencyCheck] Check completed:`, status);
    } catch (error) {
      console.error('❌ [ServerDependencyCheck] Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // If server is not required, always render children
  if (!requireServer) {
    return <>{children}</>;
  }

  // If server is connected, render children
  if (connectionStatus.isConnected) {
    console.log('✅ [ServerDependencyCheck] Server connected, rendering application');
    return <>{children}</>;
  }

  // Server is required but not connected - show blocking screen
  console.log('🚨 [ServerDependencyCheck] Server required but not connected, showing dependency screen');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Main Alert */}
        <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="font-semibold mb-2">Server Connection Required</div>
            <p>
              This application requires a connection to the backend server to function properly. 
              The server appears to be unavailable or not running.
            </p>
          </AlertDescription>
        </Alert>

        {/* Connection Status Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Server Status
              </h2>
            </div>
            <Button
              onClick={checkServerConnection}
              disabled={isChecking}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Retry'}
            </Button>
          </div>

          {/* Status Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium text-red-800 dark:text-red-200">
                    Server Disconnected
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Last checked: {connectionStatus.lastChecked.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Attempt #{retryCount}
              </div>
            </div>

            {/* Error Details */}
            {connectionStatus.error && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  Connection Error:
                </div>
                <code className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
                  {connectionStatus.error}
                </code>
              </div>
            )}

            {/* Expected Endpoints */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Expected Server Endpoints:
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <code className="text-blue-600 dark:text-blue-400">
                    {process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql'}
                  </code>
                  <span className="text-gray-500">- GraphQL API</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-blue-600 dark:text-blue-400">
                    {process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '/health') || 'http://localhost:3001/health'}
                  </code>
                  <span className="text-gray-500">- Health Check</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              How to Start the Server
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  1. Open a new terminal window
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Navigate to your project directory and open a separate terminal for the server.
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  2. Navigate to the server directory
                </div>
                <code className="block text-sm bg-black text-green-400 p-2 rounded mt-2">
                  cd server
                </code>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  3. Start the development server
                </div>
                <code className="block text-sm bg-black text-green-400 p-2 rounded mt-2">
                  npm run start:dev
                </code>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  The server should start on port 3001 and display startup messages.
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 font-medium text-green-800 dark:text-green-200 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Expected Output
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  You should see messages like:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>"🚀 Application is running on: http://localhost:3001"</li>
                    <li>"📊 GraphQL Playground: http://localhost:3001/graphql"</li>
                    <li>"❤️ Health Check: http://localhost:3001/health"</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={checkServerConnection}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                Check Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('http://localhost:3001/health', '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Test Health Endpoint
              </Button>
            </div>

            {/* Technical Details */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-t border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Technical Details
                </h4>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">GraphQL Endpoint:</span>
                    <code className="ml-2 text-blue-600 dark:text-blue-400">
                      {process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql'}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">WebSocket Endpoint:</span>
                    <code className="ml-2 text-blue-600 dark:text-blue-400">
                      {process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || 'ws://localhost:3001/graphql'}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Last Error:</span>
                    <code className="ml-2 text-red-600 dark:text-red-400">
                      {connectionStatus.error || 'Connection refused'}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">Retry Count:</span>
                    <span className="ml-2">{retryCount}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ServerDependencyCheck;