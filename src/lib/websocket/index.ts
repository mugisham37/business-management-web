/**
 * WebSocket Module
 * 
 * Provides WebSocket connection management for real-time communication
 * with the GraphQL backend.
 * 
 * Features:
 * - Connection lifecycle management
 * - Automatic reconnection with exponential backoff
 * - Heartbeat mechanism
 * - State tracking and notifications
 * - React hooks for easy integration
 * 
 * Requirements: 5.1
 */

export {
  wsConnectionManager,
  type ConnectionState,
} from './connection-manager';

export {
  useWebSocketConnection,
  type UseWebSocketConnectionReturn,
} from './use-websocket-connection';

