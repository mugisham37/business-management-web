/**
 * Organization Update Hook
 * 
 * Provides React hook for updating organization with optimistic updates
 * and automatic cache management.
 */

import {
  useUpdateOrganizationMutation,
  OrganizationDocument,
  type UpdateOrganizationInput,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to update organization
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache update
 * - Error handling with formatted messages
 * - Typically requires OWNER role
 * 
 * @returns updateOrganization function, loading state, and error
 * 
 * @example
 * ```tsx
 * function OrganizationSettingsForm({ organization }: { organization: Organization }) {
 *   const { updateOrganization, loading, error } = useUpdateOrganization();
 *   
 *   const handleSubmit = async (data: UpdateOrganizationInput) => {
 *     try {
 *       await updateOrganization(data);
 *       toast.success('Organization updated successfully');
 *     } catch (err) {
 *       toast.error(error?.message || 'Failed to update organization');
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input name="businessName" defaultValue={organization.businessName} />
 *       <input name="industry" defaultValue={organization.industry} />
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Saving...' : 'Save Changes'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateOrganization() {
  const [updateOrganizationMutation, { loading, error }] =
    useUpdateOrganizationMutation({
      update: (cache, { data }) => {
        if (!data?.updateOrganization) return;

        try {
          // Update the organization in the cache
          cache.writeQuery({
            query: OrganizationDocument,
            data: {
              organization: data.updateOrganization,
            },
          });
        } catch (err) {
          // Cache write might fail
          console.warn('Failed to update organization cache:', err);
        }
      },
      optimisticResponse: (variables) => ({
        __typename: 'Mutation',
        updateOrganization: {
          __typename: 'Organization',
          id: '', // Will be filled by server
          businessName: variables.input.businessName ?? '',
          businessType: variables.input.businessType ?? null,
          employeeCount: variables.input.employeeCount ?? null,
          industry: variables.input.industry ?? null,
          country: variables.input.country ?? null,
          selectedModules: variables.input.selectedModules ?? [],
          primaryGoal: variables.input.primaryGoal ?? null,
          cloudProvider: variables.input.cloudProvider ?? null,
          region: variables.input.region ?? null,
          storageVolume: variables.input.storageVolume ?? null,
          compression: variables.input.compression ?? false,
          activeHours: variables.input.activeHours ?? null,
          integrations: variables.input.integrations ?? [],
          selectedPlan: variables.input.selectedPlan ?? null,
          billingCycle: variables.input.billingCycle ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });

  const updateOrganization = async (input: UpdateOrganizationInput) => {
    try {
      const result = await updateOrganizationMutation({ variables: { input } });
      return result.data?.updateOrganization;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    updateOrganization,
    loading,
    error: error ? formatError(error) : null,
  };
}
