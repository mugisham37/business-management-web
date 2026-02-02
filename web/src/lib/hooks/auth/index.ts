/**
 * Authentication Hooks Index
 * 
 * Centralized export of all authentication-related hooks
 * for easy importing throughout the application.
 */

// Core authentication hooks
export { useAuth } from './useAuth';
export { useMFA } from './useMFA';
export { useSocialAuth } from './useSocialAuth';
export { usePermissions } from './usePermissions';
export { useSecurity } from './useSecurity';
export { useTier } from './useTier';

// Re-export types for convenience
export type {
  AuthUser,
  LoginInput,
  RegisterInput,
  LoginResponse,
  MfaSetupResponse,
  MfaStatusResponse,
  SocialProvider,
  Permission,
  Role,
  BusinessTier,
  UserRole,
} from '../../graphql/generated/types';