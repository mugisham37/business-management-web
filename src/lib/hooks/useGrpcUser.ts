/**
 * useGrpcUser Hook
 * 
 * React hook for gRPC User Service operations
 * Provides user management functionality with loading/error states
 */

import { useState, useCallback } from 'react';
import { userClient, type User, type ListUsersResponse } from '@/grpc/clients/user-client';
import { errorHandler } from '@/lib/errors/error-handler';
import type { AppError } from '@/lib/errors/error-types';

export interface UseGrpcUserResult {
  // State
  user: User | null;
  users: ListUsersResponse | null;
  loading: boolean;
  error: AppError | null;

  // Operations
  getUser: (userId: string) => Promise<User | null>;
  getUserByEmail: (email: string) => Promise<User | null>;
  listUsers: (options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<ListUsersResponse | null>;
  updateUser: (
    userId: string,
    updates: {
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    }
  ) => Promise<User | null>;
}

/**
 * Hook for gRPC User Service operations
 * 
 * @example
 * ```typescript
 * const { user, users, loading, error, getUser, listUsers, updateUser } = useGrpcUser();
 * 
 * // Get a single user
 * const user = await getUser('user-id');
 * 
 * // List users with pagination
 * const usersList = await listUsers({ page: 1, limit: 10 });
 * 
 * // Update user
 * await updateUser('user-id', { firstName: 'John', lastName: 'Doe' });
 * ```
 */
export function useGrpcUser(): UseGrpcUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<ListUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  /**
   * Get user by ID
   */
  const getUser = useCallback(async (userId: string): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userClient.getUser(userId);
      setUser(response);
      return response;
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get user by email
   */
  const getUserByEmail = useCallback(async (email: string): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userClient.getUserByEmail(email);
      setUser(response);
      return response;
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * List users with pagination
   */
  const listUsers = useCallback(
    async (options?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }): Promise<ListUsersResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await userClient.listUsers(options);
        setUsers(response);
        return response;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update user
   */
  const updateUser = useCallback(
    async (
      userId: string,
      updates: {
        email?: string;
        firstName?: string;
        lastName?: string;
        isActive?: boolean;
      }
    ): Promise<User | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await userClient.updateUser(userId, updates);
        setUser(response);
        return response;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    user,
    users,
    loading,
    error,
    getUser,
    getUserByEmail,
    listUsers,
    updateUser,
  };
}

