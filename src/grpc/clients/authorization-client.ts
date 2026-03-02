/**
 * Authorization Service gRPC Client
 * 
 * Provides methods for:
 * - Permission checking
 * - Token validation
 * - User permissions retrieval
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { connectionPool } from '../utils/connection-pool';
import { mapGRPCError, isRetryableGRPCError, getRetryDelay } from '../utils/error-mapper';
import { config } from '@/lib/config/environment';
import { generateCorrelationId } from '@/lib/utils/correlation';
import path from 'path';

// Proto file path
const PROTO_PATH = path.join(process.cwd(), '../server/proto/services/authorization.proto');

// Load proto definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(process.cwd(), '../server/proto')],
});

const authProto = grpc.loadPackageDefinition(packageDefinition).authorization as any;

// TypeScript interfaces matching proto definitions
export interface CheckPermissionRequest {
  user_id: string;
  module: string;
  action: string;
  resource_id?: string;
  resource_scope?: {
    branch_id?: string;
    department_id?: string;
  };
  transaction_context?: {
    transaction_type: string;
    amount: number;
  };
  trace_metadata?: Record<string, string>;
}

export interface CheckPermissionResponse {
  authorized: boolean;
  failed_layer?: string;
  reason?: string;
  requires_approval: boolean;
  approver_level?: string;
  trace_metadata?: Record<string, string>;
}

export interface ValidateTokenRequest {
  access_token: string;
  trace_metadata?: Record<string, string>;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user_identity?: {
    user_id: string;
    organization_id: string;
    hierarchy_level: string;
    branch_id?: string;
    department_id?: string;
    permission_fingerprint: string;
    email: string;
    issued_at: string;
    expires_at: string;
  };
  error_code?: string;
  error_message?: string;
  trace_metadata?: Record<string, string>;
}

export interface GetUserPermissionsRequest {
  user_id: string;
  trace_metadata?: Record<string, string>;
}

export interface GetUserPermissionsResponse {
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
  permission_fingerprint: string;
  trace_metadata?: Record<string, string>;
}

class AuthorizationClient {
  private client: any;
  private readonly serviceName = 'authorization';
  private readonly maxRetries = 3;

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
    
    this.client = new authProto.AuthorizationService(
      config.grpc.url,
      credentials,
      {
        channelOverride: channel,
      }
    );
  }

  /**
   * Check if user has permission for a specific action
   */
  async checkPermission(
    userId: string,
    module: string,
    action: string,
    options?: {
      resourceId?: string;
      resourceScope?: { branchId?: string; departmentId?: string };
      transactionContext?: { transactionType: string; amount: number };
    }
  ): Promise<CheckPermissionResponse> {
    const correlationId = generateCorrelationId();
    
    const request: CheckPermissionRequest = {
      user_id: userId,
      module,
      action,
      resource_id: options?.resourceId,
      resource_scope: options?.resourceScope
        ? {
            branch_id: options.resourceScope.branchId,
            department_id: options.resourceScope.departmentId,
          }
        : undefined,
      transaction_context: options?.transactionContext
        ? {
            transaction_type: options.transactionContext.transactionType,
            amount: options.transactionContext.amount,
          }
        : undefined,
      trace_metadata: { correlationId },
    };

    return this.executeWithRetry(
      () => this.callCheckPermission(request),
      correlationId
    );
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<ValidateTokenResponse> {
    const correlationId = generateCorrelationId();
    
    const request: ValidateTokenRequest = {
      access_token: accessToken,
      trace_metadata: { correlationId },
    };

    return this.executeWithRetry(
      () => this.callValidateToken(request),
      correlationId
    );
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<GetUserPermissionsResponse> {
    const correlationId = generateCorrelationId();
    
    const request: GetUserPermissionsRequest = {
      user_id: userId,
      trace_metadata: { correlationId },
    };

    return this.executeWithRetry(
      () => this.callGetUserPermissions(request),
      correlationId
    );
  }

  /**
   * Execute CheckPermission RPC call
   */
  private callCheckPermission(
    request: CheckPermissionRequest
  ): Promise<CheckPermissionResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.CheckPermission(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: CheckPermissionResponse) => {
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
   * Execute ValidateToken RPC call
   */
  private callValidateToken(
    request: ValidateTokenRequest
  ): Promise<ValidateTokenResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.ValidateToken(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: ValidateTokenResponse) => {
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
   * Execute GetUserPermissions RPC call
   */
  private callGetUserPermissions(
    request: GetUserPermissionsRequest
  ): Promise<GetUserPermissionsResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.GetUserPermissions(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: GetUserPermissionsResponse) => {
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
   * Close client connection
   */
  close(): void {
    connectionPool.closeConnection(this.serviceName);
  }
}

// Export singleton instance
export const authorizationClient = new AuthorizationClient();
