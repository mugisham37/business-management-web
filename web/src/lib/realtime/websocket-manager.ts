/**
 * WebSocket Manager
 * Manages WebSocket connections for real-time functionality
 */

import { EventEmitter } from 'events';

export interface WebSocketConfig {
  url: string;
  protocols?: string[] | undefined;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface WebSocketMessage {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: Date;
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  error?: Error | undefined;
  reconnectAttempts: number;
  lastConnected?: Date | undefined;
  lastDisconnected?: Date | undefined;
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketConnectionState;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private subscriptions = new Set<string>();

  constructor(config: Partial<WebSocketConfig> = {}) {
    super();
    
    this.config = {
      url: config.url || `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/realtime`,
      protocols: config.protocols,
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 5000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      timeout: config.timeout || 10000,
    };

    this.state = {
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      hasError: false,
      reconnectAttempts: 0,
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(token?: string, tenantId?: string): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return;
    }

    this.setState({ isConnecting: true, hasError: false, error: undefined });

    try {
      // Add authentication parameters to URL
      const url = new URL(this.config.url);
      if (token) url.searchParams.set('token', token);
      if (tenantId) url.searchParams.set('tenantId', tenantId);

      this.ws = new WebSocket(url.toString(), this.config.protocols);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Set connection timeout
      setTimeout(() => {
        if (this.state.isConnecting) {
          this.handleError(new Error('Connection timeout'));
          this.ws?.close();
        }
      }, this.config.timeout);

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    this.clearHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      reconnectAttempts: 0,
      lastDisconnected: new Date(),
      error: undefined,
    });
  }

  /**
   * Send message to server
   */
  send(message: WebSocketMessage): void {
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date(),
    };

    if (this.state.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(messageWithTimestamp));
        this.emit('messageSent', messageWithTimestamp);
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.emit('sendError', error);
      }
    } else {
      // Queue message for later sending
      this.messageQueue.push(messageWithTimestamp);
      this.emit('messageQueued', messageWithTimestamp);
    }
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(eventType: string, data?: Record<string, unknown>): void {
    this.subscriptions.add(eventType);
    this.send({
      type: 'subscribe',
      data: { eventType, ...data },
    });
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(eventType: string): void {
    this.subscriptions.delete(eventType);
    this.send({
      type: 'unsubscribe',
      data: { eventType },
    });
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketConnectionState {
    return { ...this.state };
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Force reconnection
   */
  reconnect(): void {
    this.disconnect();
    setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      const tenantId = localStorage.getItem('currentTenantId');
      this.connect(token || undefined, tenantId || undefined);
    }, 1000);
  }

  // Private methods

  private handleOpen(): void {
    console.log('WebSocket connected');
    
    this.setState({
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      hasError: false,
      error: undefined,
      reconnectAttempts: 0,
      lastConnected: new Date(),
    });

    // Send queued messages
    this.flushMessageQueue();

    // Start heartbeat
    this.startHeartbeat();

    // Re-establish subscriptions
    this.reestablishSubscriptions();

    this.emit('connected');
  }

  private handleMessage(event: MessageEvent<string>): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage & Record<string, unknown>;
      this.emit('message', message);
      
      // Handle specific message types
      switch (message.type) {
        case 'pong':
          this.emit('pong');
          break;
        case 'auth_success':
          this.emit('authenticated', message.data);
          break;
        case 'auth_error':
          this.emit('authError', message.data);
          break;
        case 'subscription_success':
          this.emit('subscriptionSuccess', message.data);
          break;
        case 'subscription_error':
          this.emit('subscriptionError', message.data);
          break;
        default:
          this.emit(`message:${message.type}`, message.data);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.emit('parseError', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    
    this.clearHeartbeat();
    
    this.setState({
      isConnected: false,
      isConnecting: false,
      lastDisconnected: new Date(),
      hasError: false,
      error: undefined,
      isReconnecting: false,
    });

    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Attempt reconnection if not a clean close
    if (event.code !== 1000 && this.state.reconnectAttempts < this.config.reconnectAttempts) {
      this.attemptReconnection();
    }
  }

  private handleError(error: Event | Error): void {
    console.error('WebSocket error:', error);
    
    const errorObj = error instanceof Error ? error : new Error('WebSocket error');
    
    this.setState({
      hasError: true,
      error: errorObj,
      isConnecting: false,
      isConnected: false,
      isReconnecting: false,
    });

    this.emit('error', errorObj);
  }

  private attemptReconnection(): void {
    if (this.state.reconnectAttempts >= this.config.reconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.setState({
      isReconnecting: true,
      reconnectAttempts: this.state.reconnectAttempts + 1,
      hasError: false,
      error: undefined,
      isConnected: false,
      isConnecting: false,
    });

    const delay = this.config.reconnectDelay * Math.pow(2, this.state.reconnectAttempts - 1);
    
    console.log(`Attempting reconnection in ${delay}ms (attempt ${this.state.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      const tenantId = localStorage.getItem('currentTenantId');
      this.connect(token || undefined, tenantId || undefined);
    }, delay);

    this.emit('reconnecting', { attempt: this.state.reconnectAttempts, delay });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.state.isConnected) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private reestablishSubscriptions(): void {
    for (const eventType of this.subscriptions) {
      this.send({
        type: 'subscribe',
        data: { eventType },
      });
    }
  }

  private setState(updates: Partial<WebSocketConnectionState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', this.state);
  }
}

// Singleton instance
export const webSocketManager = new WebSocketManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webSocketManager.disconnect();
  });
}