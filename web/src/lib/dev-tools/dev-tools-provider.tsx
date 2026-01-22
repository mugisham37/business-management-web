/**
 * Development Tools Provider
 * Provides all development tools in a single component
 * Requirements: 10.1, 10.6, 10.7
 */

'use client';

import React from 'react';
import { HotReloadStatus } from './hot-reload-enhancer';
import { GraphQLPlayground } from './graphql-playground';
import { GraphQLDebugPanel } from './graphql-debugger';

interface DevToolsProviderProps {
  children: React.ReactNode;
  enableHotReload?: boolean;
  enableGraphQLPlayground?: boolean;
  enableGraphQLDebugger?: boolean;
}

export function DevToolsProvider({
  children,
  enableHotReload = true,
  enableGraphQLPlayground = true,
  enableGraphQLDebugger = true,
}: DevToolsProviderProps) {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Development Tools Overlay */}
      {enableHotReload && <HotReloadStatus />}
      {enableGraphQLPlayground && <GraphQLPlayground />}
      {enableGraphQLDebugger && <GraphQLDebugPanel />}
      
      {/* Development Tools Panel Toggle */}
      <DevToolsToggle />
    </>
  );
}

function DevToolsToggle() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-gray-800 text-white px-2 py-1 rounded text-xs z-50"
        title="Show Dev Tools"
      >
        🛠️
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white p-2 rounded shadow-lg z-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium">Dev Tools</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <div>🔥 Hot Reload: Active</div>
        <div>🚀 GraphQL Playground: Available</div>
        <div>🔍 GraphQL Debugger: Available</div>
        <div>
          <a 
            href="/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            📚 API Docs: Available
          </a>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          Press F12 to open browser DevTools
        </div>
      </div>
    </div>
  );
}