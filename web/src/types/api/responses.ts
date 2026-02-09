// API Response Types for Frontend-Backend Foundation Layer
// This file contains all response types for the 34 REST API endpoints

import type { User } from '../user';
import type { Role } from '../role';

// ============================================================================
// Common Response Types
// ============================================================================

/**
 * Standard API response wrapper
 * All successful API responses follow this structure
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Standard API error response
 * All error responses follow this structure
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}

/**
 * Paginated response wrapper
 * Used for endpoints that return lists with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Authentication Response Types
// ============================================================================

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ============================================================================
// MFA Response Types
// ============================================================================

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MfaStatusResponse {
  enabled: boolean;
  backupCodesRemaining: number;
}

export interface BackupCodesResponse {
  backupCodes: string[];
}

// ============================================================================
// User Response Types
// ============================================================================

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserHierarchyResponse {
  user: UserResponse;
  createdUsers: UserResponse[];
  depth: number;
}

// ============================================================================
// Role Response Types
// ============================================================================

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  permissions: PermissionResponse[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// ============================================================================
// Session Response Types
// ============================================================================

export interface SessionResponse {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}
