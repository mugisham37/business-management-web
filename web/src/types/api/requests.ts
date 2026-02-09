// API Request Types for Frontend-Backend Foundation Layer
// This file contains all request types for the 34 REST API endpoints

// ============================================================================
// Authentication Requests (12 endpoints)
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TeamMemberLoginRequest {
  email: string;
  password: string;
  organizationId: string;
}

export interface MfaLoginRequest {
  tempToken: string;
  code: string;
}

export interface PasswordResetRequestRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// MFA Requests (5 endpoints)
// ============================================================================

export interface MfaEnableRequest {
  code: string;
}

export interface MfaDisableRequest {
  code: string;
}

// ============================================================================
// User Management Requests (9 endpoints)
// ============================================================================

export interface InviteUserRequest {
  email: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterInvitationRequest {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ============================================================================
// Role Management Requests (6 endpoints)
// ============================================================================

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissions: string[];
}

export interface AssignRoleRequest {
  userId: string;
}

// ============================================================================
// Session Management Requests (2 endpoints)
// ============================================================================

// Note: GET /sessions and DELETE /sessions/:id don't require request bodies
// They use URL parameters only
