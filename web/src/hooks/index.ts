/**
 * Hooks Index
 * Central exports for all custom React hooks
 */

export { useCacheStrategy } from './useCacheStrategy';
export { useGraphQLMutations } from './useGraphQLMutations';
export { 
  useAuth, 
  useMFA, 
  usePermission, 
  useRequireAllPermissions, 
  useRequireAuth, 
  useAuthLoading, 
  useCurrentUser, 
  useTokens 
} from './useAuth';

// Communication hooks
export { 
  useCommunication, 
  useNotifications, 
  useEmail, 
  useSMS,
  useSlack,
  useTeams
} from '@/modules/communication';