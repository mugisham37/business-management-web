import { useState, useEffect, useCallback } from 'react';
import { 
  wsConnectionManager, 
  type ConnectionState 
} from '@/lib/websocket/connection-manager';

/**
 * WebSocket hook return interface
 * 
 * Requirements: 5.1, 9.1
 */
export interface UseWebSocketReturn {
  /** Current WebSocket connection state */
  state: ConnectionState;
  
  /** Whether WebSocket is connected */
  isConnected: boolean;
  
  /** Whether WebSocket is connecting */
  isConnecting: boolean;
  
  /** Whether WebSocket is disconnected */
  isDisconnected: boolean;
  
  /** Whether WebSocket is reconnecting */
  isReconnecting: boolean;
  
  /** Connect to WebSocket server */
  connect: () => void;
  
  /** Disconnect from WebSocket server */
  disconnect: () => void;
}

/**
 * useWebSocket Hook
 * 
 * React hook for managing WebSocket connection state and lifecycle.
 * Integrates with WebSocketConnectionManager to provide WebSocket
 * functionality in React components.
 * 
 * Features:
 * - Real-time connection state tracking
 * - Connection lifecycle management (connect/disconnect)
 * - Automatic state updates on connection changes
 * - Convenient boolean flags for each connection state
 * - Automatic cleanup on component unmount
 * 
 * The hook returns:
 * - `state`: Current connection state ('connecting' | 'connected' | 'disconnected' | 'reconnecting')
 * - Boolean flags for each state (isConnected, isConnecting, etc.)
 * - `connect()`: Method to establish WebSocket connection
 * - `disconnect()`: Method to close WebSocket connection
 * 
 * Requirements: 5.1, 9.1
 * 
 * @returns WebSocket connection state and control methods
 * 
 * @example
 * ```typescript
 * function WebSocketStatus() {
 *   const { state, isConnected, connect, disconnect } = useWebSocket();
 *   
 *   return (
 *     <div>
 *       <p>Status: {state}</p>
 *       {isConnected ? (
 *         <button onClick={disconnect}>Disconnect</button>
 *       ) : (
 *         <button onClick={connect}>Connect</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Auto-connect on mount
 * function RealtimeFeature() {
 *   const { isConnected, isReconnecting } = useWebSocket();
 *   
 *   useEffect(() => {
 *     wsConnectionManager.connect();
 *   }, []);
 *   
 *   if (isReconnecting) {
 *     return <div>Reconnecting...</div>;
 *   }
 *   
 *   if (!isConnected) {
 *     return <div>Not connected</div>;
 *   }
 *   
 *   return <div>Connected - receiving real-time updates</div>;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Connection indicator
 * function ConnectionIndicator() {
 *   const { state, isConnected } = useWebSocket();
 *   
 *   const statusColor = {
 *     connected: 'green',
 *     connecting: 'yellow',
 *     reconnecting: 'orange',
 *     disconnected: 'red',
 *   }[state];
 *   
 *   return (
 *     <div style={{ color: statusColor }}>
 *       {isConnected ? '● Online' : '○ Offline'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocket(): UseWebSocketReturn {
  // Track current connection state
  const [state, setState] = useState<ConnectionState>(
    wsConnectionManager.getState()
  );

  /**
   * Subscribe to connection state changes
   */
  useEffect(() => {
    // Update state when connection state changes
    const unsubscribe = wsConnectionManager.onStateChange((newState) => {
      setState(newState);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    wsConnectionManager.connect();
  }, []);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    wsConnectionManager.disconnect();
  }, []);

  // Derive boolean flags from state
  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting';
  const isDisconnected = state === 'disconnected';
  const isReconnecting = state === 'reconnecting';

  return {
    state,
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting,
    connect,
    disconnect,
  };
}
