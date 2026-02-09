/**
 * Session Management API Service
 * 
 * Provides typed functions for all 2 session management endpoints.
 * 
 * Endpoints:
 * - GET /sessions - Get all active sessions for current user
 * - DELETE /sessions/:id - Delete/revoke a session
 * 
 * Requirements: 6.5, 11.1, 11.3
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  ApiResponse,
  SessionResponse,
} from '@/types/api/responses';

export const sessionsApi = {
  /**
   * Get all active sessions for current user
   * GET /sessions
   */
  getAll: () =>
    apiClient.get<ApiResponse<SessionResponse[]>>(API_ENDPOINTS.SESSIONS.GET_ALL),

  /**
   * Delete/revoke a session
   * DELETE /sessions/:id
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.SESSIONS.DELETE(id)),
};
