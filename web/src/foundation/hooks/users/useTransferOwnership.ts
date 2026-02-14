/**
 * Transfer Ownership Hook
 * 
 * Provides React hook for transferring organization ownership to another user.
 * This is a critical operation that changes the OWNER role between users.
 */

import {
  useTransferOwnershipMutation,
  MeDocument,
  UsersDocument,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to transfer organization ownership to another user
 * 
 * Features:
 * - Refetches current user (me) query after transfer
 * - Refetches users list to reflect role changes
 * - Error handling with formatted messages
 * 
 * Note: This operation changes the current user's role from OWNER to MANAGER
 * and promotes the target user to OWNER.
 * 
 * @returns transferOwnership function, loading state, and error
 */
export function useTransferOwnership() {
  const [transferOwnershipMutation, { loading, error }] = useTransferOwnershipMutation({
    refetchQueries: [
      { query: MeDocument },
      { query: UsersDocument, variables: { filters: {} } },
    ],
    awaitRefetchQueries: true,
  });

  const transferOwnership = async (newOwnerId: string): Promise<boolean> => {
    try {
      const result = await transferOwnershipMutation({
        variables: { newOwnerId },
      });
      return result.data?.transferOwnership ?? false;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    transferOwnership,
    loading,
    error: error ? formatError(error) : null,
  };
}
