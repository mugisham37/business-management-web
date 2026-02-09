/**
 * Role Management API Service
 * 
 * Provides typed functions for all 6 role management endpoints.
 * 
 * Endpoints:
 * - POST /roles - Create a new role
 * - GET /roles/:id - Get role by ID
 * - PATCH /roles/:id - Update role
 * - DELETE /roles/:id - Delete role
 * - POST /roles/:id/permissions - Assign permissions to role
 * - POST /roles/:id/assign - Assign role to user
 * 
 * Requirements: 6.4
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  AssignRoleRequest,
} from '@/types/api/requests';
import type {
  ApiResponse,
  RoleResponse,
} from '@/types/api/responses';

export const rolesApi = {
  /**
   * Create a new role
   * POST /roles
   */
  create: (data: CreateRoleRequest) =>
    apiClient.post<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.CREATE, data),

  /**
   * Get role by ID
   * GET /roles/:id
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.GET_BY_ID(id)),

  /**
   * Update role information
   * PATCH /roles/:id
   */
  update: (id: string, data: UpdateRoleRequest) =>
    apiClient.patch<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.UPDATE(id), data),

  /**
   * Delete role
   * DELETE /roles/:id
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ROLES.DELETE(id)),

  /**
   * Assign permissions to role
   * POST /roles/:id/permissions
   */
  assignPermissions: (id: string, data: AssignPermissionsRequest) =>
    apiClient.post<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), data),

  /**
   * Assign role to user
   * POST /roles/:id/assign
   */
  assignRole: (id: string, data: AssignRoleRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.ROLES.ASSIGN_ROLE(id), data),
};
