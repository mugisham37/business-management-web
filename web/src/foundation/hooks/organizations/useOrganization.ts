/**
 * Organization Query Hook
 * 
 * React hook for fetching the current organization data.
 */

'use client';

import { useOrganizationQuery } from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to fetch current organization
 * 
 * Returns the organization data for the authenticated user's organization.
 * Useful for displaying organization settings and information.
 * 
 * @returns Object with organization data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * function OrganizationSettings() {
 *   const { organization, loading, error, refetch } = useOrganization();
 *   
 *   if (loading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!organization) return <div>No organization found</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{organization.businessName}</h1>
 *       <p>Industry: {organization.industry}</p>
 *       <p>Plan: {organization.selectedPlan}</p>
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganization() {
  const { data, loading, error, refetch } = useOrganizationQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    organization: data?.organization ?? null,
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}
