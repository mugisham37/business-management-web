/**
 * Connection Monitor Service
 * 
 * Monitors server connection status and provides detailed logging
 * for development and production environments.
 */

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  responseTime: number | null;
  error: string | null;
  serverInfo: {
    status?: string;
    uptime?: number;
    environment?: string;
    version?: string;
  } | null;
}

export interface EndpointStatus {
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error' | 'checking';
  lastChecked: Date | null;
  responseTime: number | null;
  error: string | null;
}

class ConnectionMonitorService {
  private static instance: ConnectionMonitorService;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastChecked: new Date(),
    responseTime: null,
    error: null,
    serverInfo: null,
  };

  private endpoints: EndpointStatus[] = [
    {
      name: 'Health Check',
      url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '/health') || 'http://localhost:3001/health',
      status: 'disconnected',
      lastChecked: null,
      responseTime: null,
      error: null,
    },
    {
      name: 'GraphQL',
      url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
      status: 'disconnected',
      lastChecked: null,
      responseTime: null,
      error: null,
    },
    {
      name: 'GraphQL Playground',
      url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
      status: 'disconnected',
      lastChecked: null,
      responseTime: null,
      error: null,
    },
  ];

  private listeners: Array<(status: ConnectionStatus) => void> = [];
  private endpointListeners: Array<(endpoints: EndpointStatus[]) => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startMonitoring();
    }
  }

  static getInstance(): ConnectionMonitorService {
    if (!ConnectionMonitorService.instance) {
      ConnectionMonitorService.instance = new ConnectionMonitorService();
    }
    return ConnectionMonitorService.instance;
  }

  /**
   * Start monitoring server connection
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.log('🔍 Starting connection monitoring...');
    
    // Initial check
    this.checkConnection();
    
    // Set up periodic checks every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, 30000);

    // Check on page visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkConnection();
        }
      });
    }

    // Check on online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.log('🌐 Network connection restored, checking server...');
        this.checkConnection();
      });

      window.addEventListener('offline', () => {
        this.log('📴 Network connection lost');
        this.updateConnectionStatus({
          isConnected: false,
          lastChecked: new Date(),
          responseTime: null,
          error: 'Network offline',
          serverInfo: null,
        });
      });
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    this.log('⏹️ Connection monitoring stopped');
  }

  /**
   * Check server connection status
   */
  async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();
    this.log('🔍 Checking server connection...');

    try {
      // Check health endpoint first
      const healthEndpoint = this.endpoints.find(e => e.name === 'Health Check');
      if (healthEndpoint) {
        await this.checkEndpoint(healthEndpoint);
      }

      // Check GraphQL endpoint
      const graphqlEndpoint = this.endpoints.find(e => e.name === 'GraphQL');
      if (graphqlEndpoint) {
        await this.checkGraphQLEndpoint(graphqlEndpoint);
      }

      // Determine overall connection status
      const isConnected = this.endpoints.some(e => e.status === 'connected');
      const responseTime = Date.now() - startTime;

      const status: ConnectionStatus = {
        isConnected,
        lastChecked: new Date(),
        responseTime,
        error: isConnected ? null : 'Server not accessible',
        serverInfo: isConnected ? this.connectionStatus.serverInfo : null,
      };

      this.updateConnectionStatus(status);
      this.notifyEndpointListeners();

      if (isConnected) {
        this.log(`✅ Server connection established (${responseTime}ms)`);
      } else {
        this.log('❌ Server connection failed');
      }

      return status;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status: ConnectionStatus = {
        isConnected: false,
        lastChecked: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        serverInfo: null,
      };

      this.updateConnectionStatus(status);
      this.log(`❌ Connection check failed: ${status.error}`);
      return status;
    }
  }

  /**
   * Check individual endpoint
   */
  private async checkEndpoint(endpoint: EndpointStatus): Promise<void> {
    const startTime = Date.now();
    endpoint.status = 'checking';
    endpoint.lastChecked = new Date();

    try {
      this.log(`🔗 Checking ${endpoint.name} at ${endpoint.url}`);

      const response = await fetch(endpoint.url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        endpoint.status = 'connected';
        endpoint.responseTime = responseTime;
        endpoint.error = null;

        // Store server info if this is health endpoint
        if (endpoint.name === 'Health Check') {
          this.connectionStatus.serverInfo = {
            status: data.status,
            uptime: data.uptime,
            environment: data.environment,
            version: data.version,
          };
        }

        this.log(`✅ ${endpoint.name} connected (${responseTime}ms) - Status: ${response.status}`);
      } else {
        endpoint.status = 'error';
        endpoint.responseTime = responseTime;
        endpoint.error = `HTTP ${response.status}: ${response.statusText}`;
        this.log(`⚠️ ${endpoint.name} error: ${endpoint.error}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      endpoint.status = 'disconnected';
      endpoint.responseTime = responseTime;
      endpoint.error = error instanceof Error ? error.message : 'Unknown error';

      if (endpoint.error.includes('Failed to fetch') || endpoint.error.includes('NetworkError')) {
        this.log(`❌ ${endpoint.name} not accessible - Server likely not running`);
      } else {
        this.log(`❌ ${endpoint.name} failed: ${endpoint.error}`);
      }
    }
  }

  /**
   * Check GraphQL endpoint specifically
   */
  private async checkGraphQLEndpoint(endpoint: EndpointStatus): Promise<void> {
    const startTime = Date.now();
    endpoint.status = 'checking';
    endpoint.lastChecked = new Date();

    try {
      this.log(`🔗 Checking GraphQL endpoint at ${endpoint.url}`);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { __typename }',
        }),
        signal: AbortSignal.timeout(10000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        endpoint.status = 'connected';
        endpoint.responseTime = responseTime;
        endpoint.error = null;

        if (data.data && data.data.__typename === 'Query') {
          this.log(`✅ GraphQL endpoint connected (${responseTime}ms) - Schema accessible`);
        } else if (data.errors) {
          this.log(`⚠️ GraphQL endpoint connected but returned errors: ${JSON.stringify(data.errors)}`);
        }
      } else {
        endpoint.status = 'error';
        endpoint.responseTime = responseTime;
        endpoint.error = `HTTP ${response.status}: ${response.statusText}`;
        this.log(`⚠️ GraphQL endpoint error: ${endpoint.error}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      endpoint.status = 'disconnected';
      endpoint.responseTime = responseTime;
      endpoint.error = error instanceof Error ? error.message : 'Unknown error';

      if (endpoint.error.includes('Failed to fetch') || endpoint.error.includes('NetworkError')) {
        this.log(`❌ GraphQL endpoint not accessible - Server likely not running`);
      } else {
        this.log(`❌ GraphQL endpoint failed: ${endpoint.error}`);
      }
    }
  }

  /**
   * Force immediate connection check
   */
  async forceCheck(): Promise<ConnectionStatus> {
    this.log('🔄 Force checking connection...');
    return await this.checkConnection();
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get endpoint statuses
   */
  getEndpointStatuses(): EndpointStatus[] {
    return [...this.endpoints];
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current status
    callback(this.connectionStatus);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to endpoint status changes
   */
  onEndpointChange(callback: (endpoints: EndpointStatus[]) => void): () => void {
    this.endpointListeners.push(callback);
    
    // Immediately call with current endpoints
    callback(this.endpoints);
    
    // Return unsubscribe function
    return () => {
      const index = this.endpointListeners.indexOf(callback);
      if (index > -1) {
        this.endpointListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update connection status and notify listeners
   */
  private updateConnectionStatus(status: ConnectionStatus): void {
    const wasConnected = this.connectionStatus.isConnected;
    this.connectionStatus = status;

    // Notify listeners
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });

    // Log connection state changes
    if (wasConnected !== status.isConnected) {
      if (status.isConnected) {
        this.log('🟢 Server connection established');
      } else {
        this.log('🔴 Server connection lost');
      }
    }
  }

  /**
   * Notify endpoint listeners
   */
  private notifyEndpointListeners(): void {
    this.endpointListeners.forEach(callback => {
      try {
        callback(this.endpoints);
      } catch (error) {
        console.error('Error in endpoint status callback:', error);
      }
    });
  }

  /**
   * Enhanced logging with timestamps and context
   */
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [ConnectionMonitor] ${message}`;
    
    console.log(logMessage);
    
    // Also emit as event for UI components to display
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('connection-log', {
        detail: { message: logMessage, timestamp: new Date() }
      }));
    }
  }

  /**
   * Get connection summary for debugging
   */
  getConnectionSummary(): string {
    const status = this.connectionStatus;
    const endpoints = this.endpoints;
    
    let summary = `\n=== CONNECTION SUMMARY ===\n`;
    summary += `Overall Status: ${status.isConnected ? '🟢 Connected' : '🔴 Disconnected'}\n`;
    summary += `Last Checked: ${status.lastChecked.toLocaleString()}\n`;
    summary += `Response Time: ${status.responseTime ? `${status.responseTime}ms` : 'N/A'}\n`;
    
    if (status.serverInfo) {
      summary += `Server Environment: ${status.serverInfo.environment || 'Unknown'}\n`;
      summary += `Server Uptime: ${status.serverInfo.uptime ? `${Math.round(status.serverInfo.uptime)}s` : 'Unknown'}\n`;
    }
    
    summary += `\n--- ENDPOINTS ---\n`;
    endpoints.forEach(endpoint => {
      const statusIcon = endpoint.status === 'connected' ? '🟢' : 
                        endpoint.status === 'error' ? '🟡' : 
                        endpoint.status === 'checking' ? '🔄' : '🔴';
      summary += `${statusIcon} ${endpoint.name}: ${endpoint.status}`;
      if (endpoint.responseTime) {
        summary += ` (${endpoint.responseTime}ms)`;
      }
      if (endpoint.error) {
        summary += ` - ${endpoint.error}`;
      }
      summary += `\n`;
    });
    
    return summary;
  }
}

// Export singleton instance
export const ConnectionMonitor = ConnectionMonitorService.getInstance();