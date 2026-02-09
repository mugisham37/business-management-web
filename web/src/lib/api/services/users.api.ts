/**
 * User Management API Service
 * 
 * Provides typed functions for all 9 user management endpoints.
 * 
 * Endpoints:
 * - POST /users/invite - Invite a new user
 * - POST /users/register-invitation - Register using invitation token
 * - GET /users/:id - Get user by ID
 * - PATCH /users/:id - Update user
 * - DELETE /users/:id - Delete user
 * - POST /users/:id/suspend - Suspend user
 * - POST /users/:id/reactivate - Reactivate suspended user
 * - GET /users/:id/hierarchy - Get user hierarchy
 * - GET /users/:id/created-users - Get users created by user
 * 
 * Requirements: 6.3
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  InviteUserRequest,
  RegisterInvitationRequest,
  UpdateUserRequest,
} from '@/types/api/requests';
import type {
  ApiResponse,
  AuthResponse,
  UserResponse,
  UserHierarchyResponse,
} from '@/types/api/responses';

export const usersApi = {
  /**
   * Invite a new user to the organization
   * POST /users/invite
   */
  invite: (data: InviteUserRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.USERS.INVITE, data),

  /**
   * Register using invitation token
   * POST /users/register-invitation
   */
  registerInvitation: (data: RegisterInvitationRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.USERS.REGISTER_INVITATION, data),

  /**
   * Get user by ID
   * GET /users/:id
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USERS.GET_BY_ID(id)),

  /**
   * Update user information
   * PATCH /users/:id
   */
  update: (id: string, data: UpdateUserRequest) =>
    apiClient.patch<ApiResponse<UserResponse>>(API_ENDPOINTS.USERS.UPDATE(id), data),

  /**
   * Delete user
   * DELETE /users/:id
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.USERS.DELETE(id)),

  /**
   * Suspend user account
   * POST /users/:id/suspend
   */
  suspend: (id: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.USERS.SUSPEND(id)),

  /**
   * Reactivate suspended user account
   * POST /users/:id/reactivate
   */
  reactivate: (id: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.USERS.REACTIVATE(id)),

  /**
   * Get user hierarchy (user and their created users)
   * GET /users/:id/hierarchy
   */
  getHierarchy: (id: string) =>
    apiClient.get<ApiResponse<UserHierarchyResponse>>(API_ENDPOINTS.USERS.HIERARCHY(id)),

  /**
   * Get all users created by this user
   * GET /users/:id/created-users
   */
  getCreatedUsers: (id: string) =>
    apiClient.get<ApiResponse<UserResponse[]>>(API_ENDPOINTS.USERS.CREATED_USERS(id)),
};
