/**
 * UserService
 * 
 * Handles all user management operations including creating managers and workers,
 * updating users, and fetching user data.
 * 
 * Features:
 * - Request/response transformation
 * - Centralized error handling
 * - Cache updates after mutations
 * - Optimistic updates support
 * 
 * Requirements: 4.2, 4.8, 4.9, 4.10
 */

import { ApolloClient, FetchResult } from '@apollo/client';
import {
  CREATE_MANAGER,
  CREATE_WORKER,
  UPDATE_USER,
} from '@/graphql/mutations/users';
import {
  GET_USERS,
  GET_USER,
} from '@/graphql/queries/users';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';
import {
  updateUsersCache,
  updateUserCache,
  User,
} from '@/lib/cache/cache-updaters';

/**
 * Input types for user operations
 */
export interface CreateManagerInput {
  email: string;
  firstName: string;
  lastName: string;
  branchId?: string;
  departmentId?: string;
  phoneNumber?: string;
  credentialType?: 'PASSWORD' | 'PIN';
}

export interface CreateWorkerInput {
  email: string;
  firstName: string;
  lastName: string;
  branchId?: string;
  departmentId?: string;
  phoneNumber?: string;
  credentialType?: 'PASSWORD' | 'PIN';
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  branchId?: string;
  departmentId?: string;
  phoneNumber?: string;
  status?: string;
}

/**
 * Response types for user operations
 */
export interface CreateUserResponse {
  user: User;
  credentialType: 'PASSWORD' | 'PIN';
  temporaryCredential: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
}

/**
 * UserService class
 * Provides methods for all user management operations
 */
export class UserService {
  constructor(
    private apolloClient: ApolloClient
  ) {}

  /**
   * Create a new manager user
   * Managers have elevated permissions and can manage workers
   * 
   * @param input - Manager creation data
   * @returns Created user with temporary credentials
   * @throws AppError on failure
   * 
   * Requirements: 4.2, 4.8, 4.9, 4.10
   */
  async createManager(input: CreateManagerInput): Promise<CreateUserResponse> {
    try {
      // Transform input (Requirements: 4.8)
      const transformedInput = this.transformCreateUserInput(input);

      const { data, errors } = await this.apolloClient.mutate({
        mutation: CREATE_MANAGER,
        variables: { input: transformedInput },
        // Update cache after mutation
        update: (cache: any, { data }: any) => {
          if (data?.createManager?.user) {
            updateUsersCache(cache, data.createManager.user);
          }
        },
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.createManager) {
        throw new Error('No data returned from createManager mutation');
      }

      // Transform response (Requirements: 4.9)
      return this.transformCreateUserResponse(data.createManager);
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Create a new worker user
   * Workers have basic permissions for operational tasks
   * 
   * @param input - Worker creation data
   * @returns Created user with temporary credentials
   * @throws AppError on failure
   * 
   * Requirements: 4.2, 4.8, 4.9, 4.10
   */
  async createWorker(input: CreateWorkerInput): Promise<CreateUserResponse> {
    try {
      const transformedInput = this.transformCreateUserInput(input);

      const { data, errors } = await this.apolloClient.mutate({
        mutation: CREATE_WORKER,
        variables: { input: transformedInput },
        // Update cache after mutation
        update: (cache: any, { data }: any) => {
          if (data?.createWorker?.user) {
            updateUsersCache(cache, data.createWorker.user);
          }
        },
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.createWorker) {
        throw new Error('No data returned from createWorker mutation');
      }

      return this.transformCreateUserResponse(data.createWorker);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Update an existing user
   * Can update user profile information and assignments
   * 
   * @param userId - ID of user to update
   * @param input - Updated user data
   * @returns Updated user
   * @throws AppError on failure
   * 
   * Requirements: 4.2, 4.8, 4.9, 4.10
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    try {
      const transformedInput = this.transformUpdateUserInput(input);

      const { data, errors } = await this.apolloClient.mutate({
        mutation: UPDATE_USER,
        variables: { userId, input: transformedInput },
        // Update cache after mutation
        update: (cache: any, { data }: any) => {
          if (data?.updateUser) {
            updateUserCache(cache, data.updateUser);
          }
        },
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.updateUser) {
        throw new Error('No data returned from updateUser mutation');
      }

      return this.transformUserResponse(data.updateUser);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get a single user by ID
   * Fetches detailed user information including staff profile
   * 
   * @param userId - ID of user to fetch
   * @returns User data
   * @throws AppError on failure
   * 
   * Requirements: 4.2, 4.9, 4.10
   */
  async getUser(userId: string): Promise<User> {
    try {
      const { data, errors } = await this.apolloClient.query({
        query: GET_USER,
        variables: { userId },
        fetchPolicy: 'cache-first',
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.getUser) {
        throw new Error('User not found');
      }

      return this.transformUserResponse(data.getUser);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get all users in the organization
   * Fetches list of users with pagination support
   * 
   * @returns List of users with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.2, 4.9, 4.10
   */
  async getUsers(): Promise<UsersListResponse> {
    try {
      const { data, errors } = await this.apolloClient.query({
        query: GET_USERS,
        fetchPolicy: 'cache-first',
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.getUsers) {
        throw new Error('No data returned from getUsers query');
      }

      return this.transformUsersListResponse(data.getUsers);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Transform create user input to GraphQL format
   * Requirements: 4.8
   */
  private transformCreateUserInput(
    input: CreateManagerInput | CreateWorkerInput
  ): CreateManagerInput | CreateWorkerInput {
    return {
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      branchId: input.branchId,
      departmentId: input.departmentId,
      phoneNumber: input.phoneNumber?.trim(),
      credentialType: input.credentialType || 'PASSWORD',
    };
  }

  /**
   * Transform update user input to GraphQL format
   * Requirements: 4.8
   */
  private transformUpdateUserInput(input: UpdateUserInput): UpdateUserInput {
    const transformed: UpdateUserInput = {};

    if (input.firstName !== undefined) {
      transformed.firstName = input.firstName.trim();
    }
    if (input.lastName !== undefined) {
      transformed.lastName = input.lastName.trim();
    }
    if (input.branchId !== undefined) {
      transformed.branchId = input.branchId;
    }
    if (input.departmentId !== undefined) {
      transformed.departmentId = input.departmentId;
    }
    if (input.phoneNumber !== undefined) {
      transformed.phoneNumber = input.phoneNumber.trim();
    }
    if (input.status !== undefined) {
      transformed.status = input.status;
    }

    return transformed;
  }

  /**
   * Transform create user response to application format
   * Requirements: 4.9
   */
  private transformCreateUserResponse(data: any): CreateUserResponse {
    return {
      user: this.transformUserResponse(data.user),
      credentialType: data.credentialType,
      temporaryCredential: data.temporaryCredential,
    };
  }

  /**
   * Transform user response to application format
   * Requirements: 4.9
   */
  private transformUserResponse(data: any): User {
    return {
      __typename: data.__typename || 'User',
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      hierarchyLevel: data.hierarchyLevel,
      organizationId: data.organizationId,
      branchId: data.branchId,
      departmentId: data.departmentId,
      status: data.status,
      isActive: data.status === 'ACTIVE',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Transform users list response to application format
   * Requirements: 4.9
   */
  private transformUsersListResponse(data: any): UsersListResponse {
    return {
      users: data.users.map((user: any) => this.transformUserResponse(user)),
      total: data.total,
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let userServiceInstance: UserService | null = null;

export const getUserService = (): UserService => {
  if (!userServiceInstance) {
    const { apolloClient } = require('@/lib/api/apollo-client');
    userServiceInstance = new UserService(apolloClient);
  }
  return userServiceInstance;
};

export const userService = getUserService();
