/**
 * Mobile WebSocket Manager
 * Handles WebSocket connections with mobile-specific optimizations
 */

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { secureStorage, STORAGE_KEYS } from '@/lib/storage';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

export interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
  connectionId?: string;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
export type WebSocketStateHandler = (state: WebSocketState) => void;

export class MobileWebSocketManager {
  private static instance: MobileWebSocketManager;
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState = {
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
  };
  
  private eventHandlers = new Map<string, Set<WebSocketEventHandler>>();
  private stateHandlers = new Set<WebSocketStateHandler>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  
  private isAppActive = true;
  private isNetworkAvailable = true;
  private messageQueue: WebSocketMessage[] = [];

  private constructor() {
    this.config = {
      url: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:4000/graphql',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
    };

    this.setupAppStateListener();
    this.setupNetworkListener();
  }

  static getInstance(): MobileWebSocketManager {
    if (!MobileWebSocketManager.instance) {
      MobileWebSocketManager.instance = new MobileWebSocketManager();
    }
    return MobileWebSocketManager.instance;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return;
    }

    if (!this.isNetworkAvailable) {
      console.log('Network not available, queuing connection');
      return;
    }

    this.updateState({ isConnecting: true, lastError: undefined });

    try {
      const tokens = await secureStorage.getTokens();
      if (!tokens?.accessToken) {
        throw new Error('No access token available');
      }

      const wsUrl = `${this.config.url}?token=${tokens.accessToken}&platform=${Platform.OS}`;
      
      this.ws = new WebSocket(wsUrl, this.config.protocols);
      
      // Set connection timeout
      this.connectionTimer = setTimeout(() => {
        if (this.state.isConnecting) {
          this.handleConnectionTimeout();
        }
      }, this.config.connectionTimeout);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.updateState({
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
    });
  }

  /**
   * Send message to server
   */
  send(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: Date.now(),
    };

    if (this.state.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(fullMessage));
      } catch (error) {
        console.error('Failed to send message:', error);
        this.queueMessage(fullMessage);
      }
    } else {
      this.queueMessage(fullMessage);
    }
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);

    // Auto-connect if not connected
    if (!this.state.isConnected && !this.state.isConnecting) {
      this.connect();
    }

    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: WebSocketStateHandler): () => void {
    this.stateHandlers.add(handler);
    
    // Immediately call with current state
    handler(this.state);

    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return { ...this.state };
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    
    this.clearTimers();
    this.updateState({
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      connectionId: this.generateConnectionId(),
    });

    this.startHeartbeat();
    this.processMessageQueue();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === 'pong') {
        return;
      }

      // Dispatch to event handlers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    
    this.clearTimers();
    this.updateState({
      isConnected: false,
      isConnecting: false,
    });

    // Attempt reconnection if not a clean close
    if (event.code !== 1000 && this.shouldReconnect()) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    this.updateState({
      lastError: 'Connection error occurred',
    });
  }

  private handleConnectionTimeout(): void {
    console.log('WebSocket connection timeout');
    
    if (this.ws) {
      this.ws.close();
    }

    this.updateState({
      isConnecting: false,
      lastError: 'Connection timeout',
    });

    if (this.shouldReconnect()) {
      this.scheduleReconnect();
    }
  }

  private handleConnectionError(error: any): void {
    console.error('WebSocket connection error:', error);
    
    this.updateState({
      isConnecting: false,
      lastError: error.message || 'Connection failed',
    });

    if (this.shouldReconnect()) {
      this.scheduleReconnect();
    }
  }

  private shouldReconnect(): boolean {
    return (
      this.isAppActive &&
      this.isNetworkAvailable &&
      this.state.reconnectAttempts < this.config.maxReconnectAttempts &&
      this.eventHandlers.size > 0
    );
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.state.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.updateState({
        reconnectAttempts: this.state.reconnectAttempts + 1,
      });
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected) {
        this.send({
          type: 'ping',
          payload: { timestamp: Date.now() },
        });
      }
    }, this.config.heartbeatInterval);
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.state.isConnected) {
      const message = this.messageQueue.shift()!;
      try {
        this.ws?.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send queued message:', error);
        break;
      }
    }
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      this.isAppActive = nextAppState === 'active';
      
      if (this.isAppActive && this.isNetworkAvailable && !this.state.isConnected) {
        // Reconnect when app becomes active
        this.connect();
      } else if (!this.isAppActive && this.state.isConnected) {
        // Optionally disconnect when app goes to background
        // this.disconnect();
      }
    });
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasAvailable = this.isNetworkAvailable;
      this.isNetworkAvailable = state.isConnected ?? false;
      
      if (!wasAvailable && this.isNetworkAvailable && this.isAppActive) {
        // Network became available, attempt connection
        this.connect();
      } else if (wasAvailable && !this.isNetworkAvailable) {
        // Network lost, update state
        this.updateState({
          lastError: 'Network connection lost',
        });
      }
    });
  }

  private updateState(updates: Partial<WebSocketState>): void {
    this.state = { ...this.state, ...updates };
    
    this.stateHandlers.forEach(handler => {
      try {
        handler(this.state);
      } catch (error) {
        console.error('Error in state handler:', error);
      }
    });
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Platform.OS}`;
  }
}