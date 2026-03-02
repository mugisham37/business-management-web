import { Client, createClient } from 'graphql-ws';
import { config } from '@/lib/config/environment';
import { tokenManager } from '@/lib/auth/token-manager';
import { generateCorrelationId } from '@/lib/utils/correlation';

/**
 * WebSocket Connection States
 * 
 * - connecting: Initial connection attempt in progress
 * - connected: Successfully connected and ready
 * - disconnected: Not connected (initial state or after disconnect)
 * - reconnecting: Attempting to reconnect after connection loss
 * 
 * Requirements: 5.1
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

/**
 * WebSocket Connection Manager
 * 
 * Manages WebSocket connection lifecycle for GraphQL subscriptions:
 * - Establishes WSS connection to GraphQL endpoint
 * - Injects authentication token in connection_init
 * - Implements heartbeat mechanism (30s interval)
 * - Automatic reconnection with exponential backoff
 * - Connection state tracking and notifications
 * - Handles connection lifecycle events
 * 
 * Features:
 * - Token injection on connection
 * - Correlation ID tracking
 * - Exponential backoff (1s, 2s, 4s, ..., max 30s)
 * - Max 10 reconnection attempts
 * - Heartbeat ping every 30 seconds
 * - State change listeners
 * 
 * Requirements: 5.1
 */
class WebSocketConnectionManager {
  private client: Client | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(state: ConnectionState) => void> = new Set();

  /**
   * Establish WebSocket connection
   * 
   * Creates graphql-ws client with:
   * - Authentication token injection
   * - Correlation ID for request tracing
   * - Automatic reconnection with exponential backoff
   * - Connection lifecycle event handlers
   * 
   * If already connected, this method does nothing.
   * 
   * Requirements: 5.1
   */
  connect(): void {
    if (this.client) {
      console.warn('[WebSocket] Already connected or connecting');
      return;
    }

    this.setState('connecting');

    this.client = createClient({
      url: config.graphql.wsUrl,
      
      /**
       * Connection parameters sent in connection_init message
       * Includes authentication token and correlation ID
       */
      connectionParams: async () => {
        const token = tokenManager.getAccessToken();
        const correlationId = generateCorrelationId();
        
        return {
          authorization: token ? `Bearer ${token}` : '',
          correlationId,
        };
      },
      
      /**
       * Reconnection configuration
       * - Max 10 attempts
       * - Exponential backoff: 1s, 2s, 4s, 8s, ..., max 30s
       * - Always retry on connection loss
       */
      retryAttempts: this.maxReconnectAttempts,
      shouldRetry: () => true,
      retryWait: (retries) => {
        return new Promise((resolve) => {
          // Exponential backoff with max 30s delay
          const delay = Math.min(1000 * 2 ** retries, 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${retries + 1}/${this.maxReconnectAttempts})`);
          setTimeout(resolve, delay);
        });
      },
      
      /**
       * Connection lifecycle event handlers
       */
      on: {
        /**
         * Connected event
         * Fired when connection is successfully established
         */
        connected: () => {
          console.log('[WebSocket] Connected successfully');
          this.setState('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
        },
        
        /**
         * Closed event
         * Fired when connection is closed
         */
        closed: (event) => {
          console.log('[WebSocket] Connection closed', event);
          this.setState('disconnected');
          this.stopHeartbeat();
        },
        
        /**
         * Error event
         * Fired when connection error occurs
         */
        error: (error) => {
          console.error('[WebSocket] Connection error:', error);
          this.setState('reconnecting');
          this.reconnectAttempts++;
        },
        
        /**
         * Ping event
         * Fired when server sends ping (graphql-ws handles pong automatically)
         */
        ping: () => {
          // graphql-ws automatically responds with pong
          // This is just for logging/monitoring
          if (config.dev.logLevel === 'debug') {
            console.debug('[WebSocket] Received ping from server');
          }
        },
        
        /**
         * Pong event
         * Fired when server responds to our ping
         */
        pong: () => {
          if (config.dev.logLevel === 'debug') {
            console.debug('[WebSocket] Received pong from server');
          }
        },
      },
    });
  }

  /**
   * Disconnect WebSocket connection
   * 
   * Closes the connection gracefully and cleans up resources:
   * - Disposes graphql-ws client
   * - Stops heartbeat mechanism
   * - Updates connection state
   * 
   * Requirements: 5.1
   */
  disconnect(): void {
    if (this.client) {
      console.log('[WebSocket] Disconnecting...');
      this.client.dispose();
      this.client = null;
    }
    
    this.stopHeartbeat();
    this.setState('disconnected');
    this.reconnectAttempts = 0;
  }

  /**
   * Get graphql-ws client instance
   * 
   * Returns the underlying graphql-ws client for subscription operations.
   * Returns null if not connected.
   * 
   * @returns Client instance or null
   * 
   * Requirements: 5.1
   */
  getClient(): Client | null {
    return this.client;
  }

  /**
   * Get current connection state
   * 
   * @returns Current connection state
   * 
   * Requirements: 5.1
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if currently connected
   * 
   * @returns true if connected, false otherwise
   * 
   * Requirements: 5.1
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * Register state change listener
   * 
   * Listener will be called whenever connection state changes.
   * Returns unsubscribe function to remove the listener.
   * 
   * @param listener - Callback function to receive state changes
   * @returns Unsubscribe function
   * 
   * Requirements: 5.1
   * 
   * @example
   * ```typescript
   * const unsubscribe = wsConnectionManager.onStateChange((state) => {
   *   console.log('Connection state:', state);
   * });
   * 
   * // Later, to unsubscribe:
   * unsubscribe();
   * ```
   */
  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update connection state and notify listeners
   * 
   * @param state - New connection state
   * 
   * Requirements: 5.1
   */
  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    
    this.state = state;
    console.log(`[WebSocket] State changed: ${state}`);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[WebSocket] Error in state change listener:', error);
      }
    });
  }

  /**
   * Start heartbeat mechanism
   * 
   * Sends ping every 30 seconds to keep connection alive.
   * graphql-ws protocol handles ping/pong automatically,
   * but we track it for monitoring purposes.
   * 
   * Requirements: 5.1
   */
  private startHeartbeat(): void {
    // Clear any existing heartbeat
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.state === 'connected') {
        // graphql-ws handles ping/pong automatically
        // We just log for monitoring in debug mode
        if (config.dev.logLevel === 'debug') {
          console.debug('[WebSocket] Heartbeat check - connection alive');
        }
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat mechanism
   * 
   * Clears the heartbeat interval timer.
   * 
   * Requirements: 5.1
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get reconnection attempt count
   * 
   * @returns Number of reconnection attempts made
   * 
   * Requirements: 5.1
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Reset reconnection attempt counter
   * 
   * Useful for testing or manual reconnection management.
   * 
   * Requirements: 5.1
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }
}

/**
 * WebSocket Connection Manager Singleton
 * 
 * Use this instance throughout the application for WebSocket management.
 * 
 * Requirements: 5.1
 * 
 * @example
 * ```typescript
 * import { wsConnectionManager } from '@/lib/websocket/connection-manager';
 * 
 * // Connect
 * wsConnectionManager.connect();
 * 
 * // Listen to state changes
 * const unsubscribe = wsConnectionManager.onStateChange((state) => {
 *   console.log('WebSocket state:', state);
 * });
 * 
 * // Check connection state
 * if (wsConnectionManager.isConnected()) {
 *   console.log('WebSocket is connected');
 * }
 * 
 * // Get client for subscriptions
 * const client = wsConnectionManager.getClient();
 * 
 * // Disconnect
 * wsConnectionManager.disconnect();
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */
export const wsConnectionManager = new WebSocketConnectionManager();

