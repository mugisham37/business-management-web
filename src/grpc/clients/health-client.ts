/**
 * Health Service gRPC Client
 * 
 * Provides methods for:
 * - Health check (unary)
 * - Health watch (streaming)
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { connectionPool } from '../utils/connection-pool';
import { mapGRPCError, isRetryableGRPCError, getRetryDelay } from '../utils/error-mapper';
import { config } from '@/lib/config/environment';
import { generateCorrelationId } from '@/lib/utils/correlation';
import path from 'path';

// Proto file path
const PROTO_PATH = path.join(process.cwd(), '../server/proto/common/health.proto');

// Load proto definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(process.cwd(), '../server/proto')],
});

const healthProto = grpc.loadPackageDefinition(packageDefinition).health as any;

// TypeScript interfaces matching proto definitions
export enum ServingStatus {
  UNKNOWN = 'UNKNOWN',
  SERVING = 'SERVING',
  NOT_SERVING = 'NOT_SERVING',
  SERVICE_UNKNOWN = 'SERVICE_UNKNOWN',
}

export enum ComponentStatus {
  UNKNOWN = 'UNKNOWN',
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED',
}

export interface ComponentHealth {
  status: ComponentStatus;
  message: string;
  details: Record<string, string>;
}

export interface HealthCheckRequest {
  service?: string;
}

export interface HealthCheckResponse {
  status: ServingStatus;
  components: Record<string, ComponentHealth>;
  timestamp: string;
}

export type HealthWatchCallback = (response: HealthCheckResponse) => void;
export type HealthWatchErrorCallback = (error: Error) => void;

class HealthClient {
  private client: any;
  private readonly serviceName = 'health';
  private readonly maxRetries = 3;
  private activeStreams: Set<grpc.ClientReadableStream<any>> = new Set();

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize gRPC client
   */
  private initializeClient(): void {
    const channel = connectionPool.getConnection(this.serviceName);
    
    // Use insecure credentials for development, SSL for production
    const credentials =
      process.env.NODE_ENV === 'production'
        ? grpc.credentials.createSsl()
        : grpc.credentials.createInsecure();
    
    this.client = new healthProto.HealthService(
      config.grpc.url,
      credentials,
      {
        channelOverride: channel,
      }
    );
  }

  /**
   * Check health status (unary call)
   */
  async check(service?: string): Promise<HealthCheckResponse> {
    const correlationId = generateCorrelationId();
    
    const request: HealthCheckRequest = {
      service,
    };

    return this.executeWithRetry<HealthCheckResponse>(
      () => this.callCheck(request),
      correlationId
    );
  }

  /**
   * Watch health status (streaming call)
   * Returns a function to cancel the stream
   */
  watch(
    onData: HealthWatchCallback,
    onError: HealthWatchErrorCallback,
    service?: string
  ): () => void {
    const request: HealthCheckRequest = {
      service,
    };

    const stream = this.client.Watch(request);
    this.activeStreams.add(stream);

    // Handle incoming data
    stream.on('data', (response: HealthCheckResponse) => {
      onData(response);
    });

    // Handle errors
    stream.on('error', (error: grpc.ServiceError) => {
      this.activeStreams.delete(stream);
      const mappedError = mapGRPCError(error, generateCorrelationId());
      // Convert AppError to Error for callback
      const errorObj = mappedError instanceof Error 
        ? mappedError 
        : new Error(mappedError.userMessage);
      onError(errorObj);
    });

    // Handle stream end
    stream.on('end', () => {
      this.activeStreams.delete(stream);
    });

    // Return cancel function
    return () => {
      stream.cancel();
      this.activeStreams.delete(stream);
    };
  }

  /**
   * Execute Check RPC call
   */
  private callCheck(request: HealthCheckRequest): Promise<HealthCheckResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.Check(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: HealthCheckResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    correlationId: string,
    attempt = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const grpcError = error as grpc.ServiceError;
      
      // Check if error is retryable and we haven't exceeded max retries
      if (isRetryableGRPCError(grpcError) && attempt < this.maxRetries) {
        const delay = getRetryDelay(attempt);
        console.warn(
          `[gRPC] Retrying ${this.serviceName} operation (attempt ${attempt + 1}/${this.maxRetries}) after ${delay}ms`,
          { correlationId, error: grpcError.message }
        );
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, correlationId, attempt + 1);
      }
      
      // Map and throw error
      throw mapGRPCError(grpcError, correlationId);
    }
  }

  /**
   * Cancel all active streams
   */
  cancelAllStreams(): void {
    for (const stream of this.activeStreams) {
      stream.cancel();
    }
    this.activeStreams.clear();
  }

  /**
   * Close client connection
   */
  close(): void {
    this.cancelAllStreams();
    connectionPool.closeConnection(this.serviceName);
  }
}

// Export singleton instance
export const healthClient = new HealthClient();
