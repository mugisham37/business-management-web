// Subscription Manager
export { 
  SubscriptionManager, 
  subscriptionManager,
  type ConnectionStatus,
  type SubscriptionOptions,
  type SubscriptionResult
} from './subscription-manager';

// React Hooks
export {
  useSubscription,
  useSubscriptionStatus,
  useTenantSubscription,
  useMultipleSubscriptions,
  useResilientSubscription
} from './hooks';

// Tenant Filtering
export {
  TenantSubscriptionFilter,
  tenantSubscriptionFilter,
  type TenantFilterConfig,
  type TenantSubscriptionEvent
} from './tenant-filter';

// Authentication Handler
export {
  SubscriptionAuthHandler,
  subscriptionAuthHandler,
  type AuthState
} from './auth-handler';

// Re-export types for convenience
export type { DocumentNode, TypedDocumentNode } from '@apollo/client';