/**
 * API Response Types
 * 
 * Types for API responses including pagination, authentication, and mutations.
 * These types define the structure of data returned from the GraphQL API.
 */

import type { User } from './models';

/**
 * Page information for paginated queries
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

/**
 * Generic paginated response wrapper
 * @template T - The type of items in the paginated list
 */
export interface PaginatedResponse<T> {
  nodes: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

/**
 * Authentication response from login/OAuth mutations
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  requiresMFA: boolean;
  user?: User;
}

/**
 * MFA setup response containing QR code and backup codes
 */
export interface MFASetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

/**
 * Generic mutation response wrapper
 * @template T - The type of data returned on success
 */
export interface MutationResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
