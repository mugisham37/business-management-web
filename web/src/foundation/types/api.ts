/**
 * API Response Types
 * 
 * Types for API responses including pagination and mutations.
 * These types are supplementary to the generated GraphQL types.
 * For GraphQL-generated types like AuthResponse, import from './generated/graphql-types'
 */

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
