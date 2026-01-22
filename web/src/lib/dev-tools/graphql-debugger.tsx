/**
 * GraphQL Operations and Cache Debugging Tools
 * Development-mode debugging tools for GraphQL operations and Apollo cache
 * Requirements: 10.7
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { InMemoryCache } from '@apollo/client';

interface CacheEntry {
  id: string;
  typename: string;
  data: any;
  size: number;
}

interface OperationLog {
  id: string;
  timestamp: Date;
  type: 'query' | 'mutation' | 'subscription';
  operationName: string;
  variables: any;
  result: any;
  duration: number;
  cacheHit: boolean;
}

class GraphQLDebugger {
  private operations: OperationLog[] = [];
  private listeners: ((operations: OperationLog[]) => void)[] = [];
  private client: any;

  constructor(client: any) {
    this.client = client;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercept Apollo Client operations
    const originalQuery = this.client.query;
    const originalMutate = this.client.mutate;

    this.client.query = async (options: any) => {
      const startTime = Date.now();
      const operationName = this.extractOperationName(options.query);
      
      try {
        const result = await originalQuery.call(this.client, options);
        const duration = Date.now() - startTime;
        
        this.logOperation({
          type: 'query',
          operationName,
          variables: options.variables,
          result: result.data,
          duration,
          cacheHit: result.networkStatus === 1, // From cache
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.logOperation({
          type: 'query',
          operationName,
          variables: options.variables,
          result: { error: error.message },
          duration,
          cacheHit: false,
        });
        
        throw error;
      }
    };

    this.client.mutate = async (options: any) => {
      const startTime = Date.now();
      const operationName = this.extractOperationName(options.mutation);
      
      try {
        const result = await originalMutate.call(this.client, options);
        const duration = Date.now() - startTime;
        
        this.logOperation({
          type: 'mutation',
          operationName,
          variables: options.variables,
          result: result.data,
          duration,
          cacheHit: false,
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.logOperation({
          type: 'mutation',
          operationName,
          variables: options.variables,
          result: { error: error.message },
          duration,
          cacheHit: false,
        });
        
        throw error;
      }
    };
  }

  private extractOperationName(query: any): string {
    try {
      const definition = query.definitions[0];
      return definition.name?.value || 'Anonymous';
    } catch {
      return 'Unknown';
    }
  }

  private logOperation(operation: Omit<OperationLog, 'id' | 'timestamp'>) {
    const log: OperationLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...operation,
    };

    this.operations.unshift(log);
    
    // Keep only last 100 operations
    if (this.operations.length > 100) {
      this.operations = this.operations.slice(0, 100);
    }

    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.operations]));
  }

  public subscribe(listener: (operations: OperationLog[]) => void) {
    this.listeners.push(listener);
    listener([...this.operations]);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getCacheEntries(): CacheEntry[] {
    const cache = this.client.cache as InMemoryCache;
    const entries: CacheEntry[] = [];

    try {
      // Extract cache data
      const cacheData = cache.extract();
      
      Object.entries(cacheData).forEach(([id, data]) => {
        const typename = (data as any).__typename || 'Unknown';
        const size = JSON.stringify(data).length;
        
        entries.push({
          id,
          typename,
          data,
          size,
        });
      });
    } catch (error) {
      console.error('Failed to extract cache data:', error);
    }

    return entries.sort((a, b) => b.size - a.size);
  }

  public clearCache() {
    this.client.cache.reset();
  }

  public clearOperations() {
    this.operations = [];
    this.notifyListeners();
  }
}

let debuggerInstance: GraphQLDebugger | null = null;

export function GraphQLDebugPanel() {
  const client = useApolloClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'operations' | 'cache'>('operations');
  const [operations, setOperations] = useState<OperationLog[]>([]);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    if (!debuggerInstance) {
      debuggerInstance = new GraphQLDebugger(client);
    }

    const unsubscribe = debuggerInstance.subscribe(setOperations);
    
    return unsubscribe;
  }, [client]);

  useEffect(() => {
    if (isOpen && activeTab === 'cache') {
      setCacheEntries(debuggerInstance?.getCacheEntries() || []);
    }
  }, [isOpen, activeTab]);

  const refreshCache = () => {
    setCacheEntries(debuggerInstance?.getCacheEntries() || []);
  };

  const clearCache = () => {
    debuggerInstance?.clearCache();
    setCacheEntries([]);
  };

  const clearOperations = () => {
    debuggerInstance?.clearOperations();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-20 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-medium"
        title="Open GraphQL Debugger"
      >
        🔍 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">GraphQL Debugger</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('operations')}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === 'operations'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Operations ({operations.length})
              </button>
              <button
                onClick={() => setActiveTab('cache')}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === 'cache'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cache ({cacheEntries.length})
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'operations' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">Recent Operations</h3>
                <button
                  onClick={clearOperations}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {operations.map(operation => (
                  <div key={operation.id} className="border-b p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          operation.type === 'query' ? 'bg-blue-100 text-blue-800' :
                          operation.type === 'mutation' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {operation.type.toUpperCase()}
                        </span>
                        <span className="font-medium">{operation.operationName}</span>
                        {operation.cacheHit && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            CACHED
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {operation.duration}ms • {operation.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {Object.keys(operation.variables || {}).length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">Variables:</div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
                          {JSON.stringify(operation.variables, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Result:</div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(operation.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
                
                {operations.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No operations logged yet. Execute some GraphQL operations to see them here.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">Cache Entries</h3>
                <div className="flex gap-2">
                  <button
                    onClick={refreshCache}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={clearCache}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {cacheEntries.map(entry => (
                  <div key={entry.id} className="border-b p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          {entry.typename}
                        </span>
                        <span className="font-mono text-sm">{entry.id}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.size} bytes
                      </div>
                    </div>
                    
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
                  </div>
                ))}
                
                {cacheEntries.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No cache entries found. Execute some GraphQL queries to populate the cache.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}