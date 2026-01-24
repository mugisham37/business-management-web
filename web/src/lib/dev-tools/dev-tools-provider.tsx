'use client';

/**
 * Development Tools Provider
 * Provides development utilities and debugging capabilities
 * Conditionally enabled based on environment
 */

import React, { ReactNode, createContext, useContext } from 'react';

/**
 * Dev Tools Context Interface
 */
export interface DevToolsContextType {
  enabled: boolean;
  debugMode: boolean;
  toggleDebugMode: () => void;
  log: (message: string, data?: unknown) => void;
}

/**
 * Dev Tools Context
 */
const DevToolsContext = createContext<DevToolsContextType | undefined>(undefined);

/**
 * Dev Tools Provider Props
 */
export interface DevToolsProviderProps {
  children: ReactNode;
  enabled?: boolean;
  debugMode?: boolean;
}

/**
 * Dev Tools Provider Component
 * Provides development utilities context
 */
export const DevToolsProvider: React.FC<DevToolsProviderProps> = ({
  children,
  enabled = process.env.NODE_ENV === 'development',
  debugMode = false,
}) => {
  const [debug, setDebug] = React.useState(debugMode);

  const toggleDebugMode = () => {
    setDebug(prev => !prev);
    if (enabled) {
      console.log('[DevTools] Debug mode toggled to:', !debug);
    }
  };

  const log = (message: string, data?: unknown) => {
    if (enabled && debug) {
      console.log(`[DevTools] ${message}`, data);
    }
  };

  const contextValue: DevToolsContextType = {
    enabled,
    debugMode: debug,
    toggleDebugMode,
    log,
  };

  return (
    <DevToolsContext.Provider value={contextValue}>
      {children}
    </DevToolsContext.Provider>
  );
};

DevToolsProvider.displayName = 'DevToolsProvider';

/**
 * Hook to use dev tools context
 */
export function useDevTools(): DevToolsContextType {
  const context = useContext(DevToolsContext);

  if (context === undefined) {
    throw new Error('useDevTools must be used within a DevToolsProvider');
  }

  return context;
}
