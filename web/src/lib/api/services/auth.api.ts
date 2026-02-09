/**
 * Authentication API Service
 * 
 * Provides typed functions for all 12 authentication endpoints.
 * 
 * Endpoints:
 * - POST /auth/register - Register new organization owner
 * - POST /auth/verify-email - Verify email address
 * - POST /auth/resend-verification - Resend verification email
 * - POST /auth/login - Login as organization owner
 * - POST /auth/login/team-member - Login as team member
 * - POST /auth/login/mfa - Complete MFA login
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/logout - Logout current session
 * - POST /auth/logout-all - Logout all sessions
 * - POST /auth/password-reset/request - Request password reset
 * - POST /auth/password-reset/confirm - Confirm password reset
 * - POST /auth/change-password - Change password
 * - GET /auth/me - Get current user
 * 
 * Requirements: 6.1, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  LoginRequest,
  TeamMemberLoginRequest,
  MfaLoginRequest,
  PasswordResetRequestRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
} from '@/types/api/requests';
import type {
  ApiResponse,
  AuthResponse,
} from '@/types/api/responses';
import type { User } from '@/types/user';

export const authApi = {
  /**
   * Register a new organization owner
   * POST /auth/register
   */
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data),

  /**
   * Verify email address with token
   * POST /auth/verify-email
   */
  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data),

  /**
   * Resend email verification
   * POST /auth/resend-verification
   */
  resendVerification: (data: ResendVerificationRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, data),

  /**
   * Login as organization owner
   * POST /auth/login
   */
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data),

  /**
   * Login as team member
   * POST /auth/login/team-member
   */
  loginTeamMember: (data: TeamMemberLoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN_TEAM_MEMBER, data),

  /**
   * Complete MFA login with TOTP code
   * POST /auth/login/mfa
   */
  loginMfa: (data: MfaLoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN_MFA, data),

  /**
   * Refresh access token using refresh token cookie
   * POST /auth/refresh
   */
  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>(API_ENDPOINTS.AUTH.REFRESH),

  /**
   * Logout current session
   * POST /auth/logout
   */
  logout: () =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * Logout all sessions for current user
   * POST /auth/logout-all
   */
  logoutAll: () =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT_ALL),

  /**
   * Request password reset email
   * POST /auth/password-reset/request
   */
  requestPasswordReset: (data: PasswordResetRequestRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, data),

  /**
   * Confirm password reset with token
   * POST /auth/password-reset/confirm
   */
  confirmPasswordReset: (data: PasswordResetConfirmRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, data),

  /**
   * Change password for authenticated user
   * POST /auth/change-password
   */
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  getCurrentUser: () =>
    apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME),
};
