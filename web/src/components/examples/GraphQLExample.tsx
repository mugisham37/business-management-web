'use client';

/**
 * GraphQL Example Component
 * Demonstrates GraphQL client functionality and connection status
 */

import React, { useEffect, useState } from 'react';

export interface GraphQLStatus {
  isConnected: boolean;
  latency?: number;
  lastUpdated?: Date;
  error?: string;
}

/**
 * GraphQL Example Component
 */
const GraphQLExample: React.FC = () => {
  const [status, setStatus] = useState<GraphQLStatus>({
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate GraphQL connection check
    const checkConnection = async () => {
      try {
        // In production, this would check actual GraphQL endpoint
        const startTime = performance.now();
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const latency = Math.round(performance.now() - startTime);
        
        setStatus({
          isConnected: true,
          latency,
          lastUpdated: new Date(),
        });
      } catch (error) {
        setStatus({
          isConnected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Checking GraphQL connection...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm font-medium">
            {status.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {status.latency !== undefined && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Latency: {status.latency}ms
          </div>
        )}
        
        {status.error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            Error: {status.error}
          </div>
        )}
        
        {status.lastUpdated && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Last updated: {status.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphQLExample;
