/**
 * Location GraphQL Subscriptions
 * Real-time subscription definitions for location module
 */

import { gql } from '@apollo/client';

// Location Status Subscription
export const LOCATION_STATUS_CHANGED = gql`
  subscription LocationStatusChanged {
    locationStatusChanged {
      id
      name
      code
      status
      updatedAt
    }
  }
`;

// Promotion Activation Subscription
export const PROMOTION_ACTIVATED = gql`
  subscription PromotionActivated {
    promotionActivated
  }
`;

// Sync Status Subscription
export const SYNC_STATUS_CHANGED = gql`
  subscription SyncStatusChanged {
    syncStatusChanged
  }
`;