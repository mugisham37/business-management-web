/**
 * User Service gRPC Client
 * 
 * Provides methods for:
 * - Getting user by ID
 * - Getting user by email
 * - Listing users
 * - Updating user
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { connectionPool } from '../utils/connection-pool';
import { mapGRPCError, isRetryableGRPCError, getRetryDelay } from '../utils/error-mapper';
import { config } from '@/lib/config/environment';
import { generateCorrelationId } from '@/lib/utils/correlation';
import path from 'path';

// Proto file path
const PROTO_PATH = path.join(process.cwd(), '../server/proto/services/user.proto');

// Load proto definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(process.cwd(), '../server/proto')],
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

// TypeScript interfaces matching proto definitions
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface GetUserRequest {
  id: string;
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface ListUsersRequest {
  pagination?: {
    page: number;
    limit: number;
    sort_by?: string;
    sort_order?: string;
  };
}

export interface ListUsersResponse {
  users: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface UserResponse {
  user: User;
}

class UserClient {
  private client: any;
  private readonly serviceName = 'user';
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
    
    this.client = new userProto.UserService(
      config.grpc.url,
      credentials,
      {
        channelOverride: channel,
      }
    );
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    const correlationId = generateCorrelationId();
    
    const request: GetUserRequest = {
      id: userId,
    };

    const response = await this.executeWithRetry<UserResponse>(
      () => this.callGetUser(request),
      correlationId
    );

    return response.user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    const correlationId = generateCorrelationId();
    
    const request: GetUserByEmailRequest = {
      email,
    };

    const response = await this.executeWithRetry<UserResponse>(
      () => this.callGetUserByEmail(request),
      correlationId
    );

    return response.user;
  }

  /**
   * List users with pagination
   */
  async listUsers(options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ListUsersResponse> {
    const correlationId = generateCorrelationId();
    
    const request: ListUsersRequest = {
      pagination: options
        ? {
            page: options.page || 1,
            limit: options.limit || 10,
            sort_by: options.sortBy,
            sort_order: options.sortOrder,
          }
        : undefined,
    };

    return this.executeWithRetry<ListUsersResponse>(
      () => this.callListUsers(request),
      correlationId
    );
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updates: {
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    }
  ): Promise<User> {
    const correlationId = generateCorrelationId();
    
    const request: UpdateUserRequest = {
      id: userId,
      email: updates.email,
      first_name: updates.firstName,
      last_name: updates.lastName,
      is_active: updates.isActive,
    };

    const response = await this.executeWithRetry<UserResponse>(
      () => this.callUpdateUser(request),
      correlationId
    );

    return response.user;
  }

  /**
   * Execute GetUser RPC call
   */
  private callGetUser(request: GetUserRequest): Promise<UserResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.GetUser(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: UserResponse) => {
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
   * Execute GetUserByEmail RPC call
   */
  private callGetUserByEmail(request: GetUserByEmailRequest): Promise<UserResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.GetUserByEmail(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: UserResponse) => {
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
   * Execute ListUsers RPC call
   */
  private callListUsers(request: ListUsersRequest): Promise<ListUsersResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.ListUsers(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: ListUsersResponse) => {
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
   * Execute UpdateUser RPC call
   */
  private callUpdateUser(request: UpdateUserRequest): Promise<UserResponse> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + config.grpc.requestTimeout / 1000);

      this.client.UpdateUser(
        request,
        { deadline },
        (error: grpc.ServiceError | null, response: UserResponse) => {
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
export const userClient = new UserClient();
