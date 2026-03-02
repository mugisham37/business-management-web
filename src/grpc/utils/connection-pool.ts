/**
 * gRPC Connection Pool
 * 
 * Manages a pool of gRPC connections with:
 * - Maximum 10 concurrent connections
 * - Connection reuse
 * - Keepalive settings
 * - Automatic connection management
 */

import * as grpc from '@grpc/grpc-js';
import { config } from '@/lib/config/environment';

interface ConnectionConfig {
  serviceName: string;
  credentials?: grpc.ChannelCredentials;
}

class GRPCConnectionPool {
  private connections: Map<string, grpc.Channel> = new Map();
  private readonly maxConnections = 10;
  private activeConnections = 0;

  /**
   * Get or create a connection for a service
   */
  getConnection(serviceName: string): grpc.Channel {
    // Return existing connection if available
    if (this.connections.has(serviceName)) {
      const connection = this.connections.get(serviceName)!;
      
      // Check if connection is still valid
      const state = connection.getConnectivityState(false);
      if (state !== grpc.connectivityState.SHUTDOWN) {
        return connection;
      }
      
      // Remove dead connection
      this.connections.delete(serviceName);
      this.activeConnections--;
    }

    // Check pool capacity
    if (this.activeConnections >= this.maxConnections) {
      throw new Error(
        `gRPC connection pool exhausted. Maximum ${this.maxConnections} connections allowed.`
      );
    }

    // Create new connection
    const connection = this.createConnection(serviceName);
    this.connections.set(serviceName, connection);
    this.activeConnections++;

    return connection;
  }

  /**
   * Create a new gRPC connection with keepalive settings
   */
  private createConnection(serviceName: string): grpc.Channel {
    // Use insecure credentials for development, SSL for production
    const credentials =
      process.env.NODE_ENV === 'production'
        ? grpc.credentials.createSsl()
        : grpc.credentials.createInsecure();

    // Create channel with keepalive options
    const channel = new grpc.Channel(config.grpc.url, credentials, {
      // Keepalive settings
      'grpc.keepalive_time_ms': 30000, // Send keepalive ping every 30 seconds
      'grpc.keepalive_timeout_ms': 5000, // Wait 5 seconds for keepalive response
      'grpc.http2.max_pings_without_data': 0, // Allow unlimited pings without data
      'grpc.keepalive_permit_without_calls': 1, // Allow keepalive pings when no calls active
      
      // Connection settings
      'grpc.max_receive_message_length': 4 * 1024 * 1024, // 4MB max receive
      'grpc.max_send_message_length': 4 * 1024 * 1024, // 4MB max send
      'grpc.initial_reconnect_backoff_ms': 1000, // 1 second initial backoff
      'grpc.max_reconnect_backoff_ms': 30000, // 30 seconds max backoff
    });

    // Monitor connection state changes
    this.monitorConnection(serviceName, channel);

    return channel;
  }

  /**
   * Monitor connection state and handle reconnection
   */
  private monitorConnection(serviceName: string, channel: grpc.Channel): void {
    const checkState = () => {
      const state = channel.getConnectivityState(true);
      
      if (state === grpc.connectivityState.SHUTDOWN) {
        console.warn(`[gRPC] Connection to ${serviceName} shut down`);
        this.connections.delete(serviceName);
        this.activeConnections--;
        return;
      }

      // Watch for state changes
      channel.watchConnectivityState(
        state,
        Date.now() + 30000, // 30 second deadline
        (error) => {
          if (!error) {
            checkState(); // Continue monitoring
          }
        }
      );
    };

    checkState();
  }

  /**
   * Close a specific connection
   */
  closeConnection(serviceName: string): void {
    const connection = this.connections.get(serviceName);
    if (connection) {
      connection.close();
      this.connections.delete(serviceName);
      this.activeConnections--;
    }
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    for (const [serviceName, connection] of this.connections.entries()) {
      connection.close();
    }
    this.connections.clear();
    this.activeConnections = 0;
  }

  /**
   * Get current pool statistics
   */
  getStats(): {
    activeConnections: number;
    maxConnections: number;
    availableSlots: number;
    connections: string[];
  } {
    return {
      activeConnections: this.activeConnections,
      maxConnections: this.maxConnections,
      availableSlots: this.maxConnections - this.activeConnections,
      connections: Array.from(this.connections.keys()),
    };
  }
}

// Export singleton instance
export const connectionPool = new GRPCConnectionPool();
