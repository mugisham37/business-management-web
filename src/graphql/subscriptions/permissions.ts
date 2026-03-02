import { gql } from '@apollo/client';

/**
 * Subscription: OnPermissionChanged
 * 
 * Subscribe to permission changes for a specific user.
 * Triggers when permissions are granted, revoked, or modified.
 * 
 * Features:
 * - Real-time permission updates
 * - Includes new permission fingerprint
 * - Provides change reason and timestamp
 * - Enables immediate UI updates
 * 
 * Use Cases:
 * - Update UI when user permissions change
 * - Force re-authentication on permission revocation
 * - Show notification when new permissions granted
 * - Sync permission state across multiple tabs
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = useSubscription({
 *   query: ON_PERMISSION_CHANGED,
 *   variables: { userId: currentUser.id },
 *   onData: (data) => {
 *     const change = data.onPermissionChanged;
 *     console.log('Permissions changed:', change.reason);
 *     
 *     // Clear permission cache
 *     permissionChecker.clearCache();
 *     
 *     // Optionally force re-authentication if fingerprint changed
 *     if (change.fingerprintChanged) {
 *       refreshToken();
 *     }
 *   },
 * });
 * ```
 */
export const ON_PERMISSION_CHANGED = gql`
  subscription OnPermissionChanged($userId: String!) {
    onPermissionChanged(userId: $userId) {
      userId
      permissions {
        module
        actions
      }
      fingerprint
      fingerprintChanged
      reason
      changedAt
      changedBy
    }
  }
`;
