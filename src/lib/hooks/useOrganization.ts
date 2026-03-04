/**
 * useOrganization Hook
 * 
 * React hook for organization management operations.
 * Provides access to organization update and fetch operations with loading/error states.
 * 
 * Features:
 * - Update organization settings
 * - Fetch organization data
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.3, 3.10, 3.11
 */

import { useState, useCallback } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation } from '@apollo/client/react';

import { GET_ORGANIZATION } from '@/graphql/queries/organizations';
import { UPDATE_ORGANIZATION } from '@/graphql/mutations/organizations';
import type {
  GetOrganizationData,
  UpdateOrganizationData,
} from '@/graphql/types/operations';
import { updateCacheAfterUpdateOrganization } from '@/lib/cache/cache-updaters';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Input types for organization operations
 */
export interface UpdateOrganizationInput {
  name?: string;
  status?: string;
  type?: string;
}

/**
 * Organization type
 */
export interface Organization {
  id: string;
  name: string;
  ownerId?: string | null;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseOrganizationReturn {
  // Query data
  organization: Organization | undefined;
  
  // Loading states
  loading: boolean;
  organizationLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  updateOrganization: (input: UpdateOrganizationInput) => Promise<Organization>;
  refetchOrganization: () => Promise<void>;
}

/**
 * useOrganization Hook
 * 
 * @returns Organization management operations and data
 * 
 * Requirements: 3.3, 3.10, 3.11
 */
export function useOrganization(): UseOrganizationReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Query for organization
  const {
    data: organizationData,
    loading: organizationLoading,
    error: organizationError,
    refetch: refetchOrganizationData,
  } = useApolloQuery<GetOrganizationData>(GET_ORGANIZATION, {
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (organizationError && !error) {
    setError(errorHandler.handle(organizationError));
  }

  // Mutation for updating organization
  const [updateOrganizationMutation] = useApolloMutation<UpdateOrganizationData>(UPDATE_ORGANIZATION, {
    update: (cache, { data }) => {
      if (data?.updateOrganization) {
        updateCacheAfterUpdateOrganization(cache, data.updateOrganization);
      }
    },
  });

  /**
   * Update organization settings
   * Requirements: 3.3, 3.11
   */
  const updateOrganization = useCallback(
    async (input: UpdateOrganizationInput): Promise<Organization> => {
      setOperationLoading(true);
      setError(null);

      try {
        const currentOrg = organizationData?.getOrganization;
        
        const { data } = await updateOrganizationMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: currentOrg ? {
            updateOrganization: {
              __typename: 'OrganizationType',
              id: currentOrg.id,
              name: input.name || currentOrg.name,
              ownerId: currentOrg.ownerId,
              type: input.type || currentOrg.type,
              status: input.status || currentOrg.status,
              createdAt: currentOrg.createdAt,
              updatedAt: new Date().toISOString(),
            },
          } : undefined,
        });

        if (!data?.updateOrganization) {
          throw new Error('No data returned from updateOrganization mutation');
        }

        return data.updateOrganization;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [updateOrganizationMutation, organizationData]
  );

  /**
   * Refetch organization data
   * Requirements: 3.3
   */
  const refetchOrganization = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetchOrganizationData();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchOrganizationData]);

  // Combine loading states
  const loading = operationLoading || organizationLoading;

  // Handle query errors
  if (organizationError && !error) {
    setError(errorHandler.handle(organizationError));
  }

  return {
    // Data
    organization: organizationData?.getOrganization ?? undefined,
    
    // Loading states
    loading,
    organizationLoading,
    
    // Error state
    error,
    
    // Operations
    updateOrganization,
    refetchOrganization,
  };
}
