/**
 * Complete Auth GraphQL Queries
 * Re-exports all auth query operations needed by auth managers
 */

// Re-export all queries from auth.ts
export {
  // Authentication Queries
  REQUIRES_MFA_QUERY,
  ME_QUERY,
  // MFA Queries
  MFA_STATUS_QUERY,
  IS_MFA_ENABLED_QUERY,
  // Permission Queries
  GET_PERMISSIONS_QUERY,
  MY_PERMISSIONS_QUERY,
  GET_ROLES_QUERY,
  GET_ROLE_PERMISSIONS_QUERY,
  HAS_PERMISSION_QUERY,
  GET_ALL_PERMISSIONS_QUERY,
  GET_DETAILED_PERMISSIONS_QUERY,
  CHECK_PERMISSION_QUERY,
  GET_AVAILABLE_PERMISSIONS_QUERY,
} from './auth';
