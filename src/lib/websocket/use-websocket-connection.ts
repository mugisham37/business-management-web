import { useEffect, useState, useCallback } from 'react';
import { wsConnectionManager, ConnectionState } from './connection-manager';

/**
 * WebSocket Connection Hook Return Type
 */
export interface UseWebSocketConnectionReturn {
  /** Current connection state */
  state: ConnectionState;
  /** Whether currently connected */
  isConnected: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Whether currently reconnecting */
  isReconnecting: boolean;
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  /** Manually trigger connection */
  connect: () => void;
  /** Manually trigger disconnection */
  disconnect: () => void;
}

/**
 * React Hook for WebSocket Connection Management
 * 
 * Provides reactive access to WebSocket connection state and controls.
 * Automatically connects on mount and disconnects on unmount.
 * 
 * Features:
 * - Automatic connection lifecycle management
 * - Reactive state updates
 * - Manual connect/disconnect controls
 * - Reconnection attempt tracking
 * 
 * Requirements: 5.1, 9.1
 * 
 * @param autoConnect - Whether to automatically connect on mount (default: true)
 * @returns WebSocket connection state and controls
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { state, isConnected, reconnectAttempts } = useWebSocketConnection();
 * 
 *   return (
 *     <div>
 *       <p>Status: {state}</p>
 *       {isConnected && <p>Connected!</p>}
 *       {reconnectAttempts > 0 && (
 *         <p>Reconnection attempts: {reconnectAttempts}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Manual connection control
 * function ConnectionControl() {
 *   const { isConnected, connect, disconnect } = useWebSocketConnection(false);
 * 
 *   return (
 *     <div>
 *       {isConnected ? (
 *         <button onClick={disconnect}>Disconnect</button>
 *       ) : (
 *         <button onClick={connect}>Connect</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocketConnection(
  autoConnect: boolean = true
): UseWebSocketConnectionReturn {
  // Initialize state from connection manager
  const [state, setState] = useState<ConnectionState>(() => 
    wsConnectionManager.getState()
  );

  // Memoized connect function
  const connect = useCallback(() => {
    wsConnectionManager.connect();
  }, []);

  // Memoized disconnect function
  const disconnect = useCallback(() => {
    wsConnectionManager.disconnect();
  }, []);

  useEffect(() => {
    // Auto-connect if enabled
    if (autoConnect) {
      wsConnectionManager.connect();
    }

    // Subscribe to state changes
    const unsubscribe = wsConnectionManager.onStateChange((newState) => {
      setState(newState);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Note: We don't disconnect on unmount because other components
      // might be using the connection. The connection manager is a singleton.
    };
  }, [autoConnect]);

  return {
    state,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isReconnecting: state === 'reconnecting',
    reconnectAttempts: wsConnectionManager.getReconnectAttempts(),
    connect,
    disconnect,
  };
}

/**
 * WebSocket Status Indicator Component Example
 * 
 * This is a reference implementation showing how to use the hook
 * to create a connection status indicator.
 * 
 * @example
 * ```typescript
 * import { useWebSocketConnection } from '@/lib/websocket/use-websocket-connection';
 * 
 * export function WebSocketStatus() {
 *   const { state, isConnected, reconnectAttempts } = useWebSocketConnection();
 * 
 *   const getStatusColor = () => {
 *     switch (state) {
 *       case 'connected': return 'green';
 *       case 'connecting': return 'yellow';
 *       case 'reconnecting': return 'orange';
 *       case 'disconnected': return 'red';
 *     }
 *   };
 * 
 *   return (
 *     <div className="flex items-center gap-2">
 *       <div 
 *         className="w-2 h-2 rounded-full"
 *         style={{ backgroundColor: getStatusColor() }}
 *       />
 *       <span className="text-sm">
 *         {state}
 *         {reconnectAttempts > 0 && ` (attempt ${reconnectAttempts})`}
 *       </span>
 *     </div>
 *   );
 * }
 * ```
 */

