/**
 * Territory Management Hooks
 * Complete hook implementation for territory operations
 */

import { useCallback } from 'react';
import { 
  useQuery, 
  useMutation,
  QueryHookOptions,
  MutationHookOptions,
  FetchResult
} from '@apollo/client';
import { 
  GET_TERRITORY,
  GET_TERRITORIES
} from '@/graphql/queries/location-queries';
import {
  CREATE_TERRITORY,
  UPDATE_TERRITORY,
  ASSIGN_LOCATION_TO_TERRITORY
} from '@/graphql/mutations/location-mutations';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';

// Types
export interface Territory {
  id: string;
  name: string;
  code: string;
  locations?: Location[];
  manager?: Employee;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
}

export interface CreateTerritoryInput {
  name: string;
  code: string;
  description?: string;
  type: string;
  parentTerritoryId?: string;
  assignedFranchiseId?: string;
  assignedUserId?: string;
}

export interface UpdateTerritoryInput {
  name?: string;
  description?: string;
  type?: string;
  parentTerritoryId?: string;
  assignedFranchiseId?: string;
  assignedUserId?: string;
  isActive?: boolean;
}

// Hook for single territory
export function useTerritory(id: string, options?: QueryHookOptions) {
  const { tenant: currentTenant } = useTenant();
  
  const { data, loading, error, refetch } = useQuery(GET_TERRITORY, {
    variables: { id },
    skip: !currentTenant?.id || !id,
    errorPolicy: 'all',
    ...options,
  });

  const territory = data?.territory;

  return {
    territory,
    loading,
    error,
    refetch,
  };
}

// Hook for multiple territories
export function useTerritories(options?: QueryHookOptions) {
  const { tenant: currentTenant } = useTenant();

  const { data, loading, error, refetch } = useQuery(GET_TERRITORIES, {
    skip: !currentTenant?.id,
    errorPolicy: 'all',
    ...options,
  });

  const territories = data?.territories || [];

  return {
    territories,
    loading,
    error,
    refetch,
  };
}

// Hook for territory mutations
export function useTerritoryMutations() {
  const { user } = useAuth();
  const { tenant: currentTenant } = useTenant();

  const [createTerritoryMutation] = useMutation(CREATE_TERRITORY);
  const [updateTerritoryMutation] = useMutation(UPDATE_TERRITORY);
  const [assignLocationToTerritoryMutation] = useMutation(ASSIGN_LOCATION_TO_TERRITORY);

  const createTerritory = useCallback(async (
    input: CreateTerritoryInput,
    options?: MutationHookOptions
  ): Promise<FetchResult<{ createTerritory: Territory }>> => {
    if (!currentTenant?.id || !user?.id) {
      throw new Error('User must be authenticated and have a current tenant');
    }

    return createTerritoryMutation({
      variables: { input },
      refetchQueries: ['GetTerritories'],
      ...options,
    });
  }, [createTerritoryMutation, currentTenant?.id, user?.id]);

  const updateTerritory = useCallback(async (
    id: string,
    input: UpdateTerritoryInput,
    options?: MutationHookOptions
  ): Promise<FetchResult<{ updateTerritory: Territory }>> => {
    if (!currentTenant?.id || !user?.id) {
      throw new Error('User must be authenticated and have a current tenant');
    }

    return updateTerritoryMutation({
      variables: { id, input },
      refetchQueries: ['GetTerritory', 'GetTerritories'],
      ...options,
    });
  }, [updateTerritoryMutation, currentTenant?.id, user?.id]);

  const assignLocationToTerritory = useCallback(async (
    territoryId: string,
    locationId: string,
    options?: MutationHookOptions
  ): Promise<FetchResult<{ assignLocationToTerritory: Territory }>> => {
    if (!currentTenant?.id || !user?.id) {
      throw new Error('User must be authenticated and have a current tenant');
    }

    return assignLocationToTerritoryMutation({
      variables: { territoryId, locationId },
      refetchQueries: ['GetTerritory', 'GetTerritories', 'GetLocation'],
      ...options,
    });
  }, [assignLocationToTerritoryMutation, currentTenant?.id, user?.id]);

  return {
    createTerritory,
    updateTerritory,
    assignLocationToTerritory,
  };
}

// Hook for territory validation
export function useTerritoryValidation() {
  const validateTerritoryCode = useCallback((code: string): string | null => {
    if (!code) return 'Territory code is required';
    if (code.length > 50) return 'Code must be 50 characters or less';
    return null;
  }, []);

  const validateTerritoryName = useCallback((name: string): string | null => {
    if (!name) return 'Territory name is required';
    if (name.length > 255) return 'Name must be 255 characters or less';
    return null;
  }, []);

  const validateTerritory = useCallback((territory: CreateTerritoryInput | UpdateTerritoryInput): Record<string, string> => {
    const errors: Record<string, string> = {};

    if ('name' in territory) {
      const nameError = validateTerritoryName(territory.name!);
      if (nameError) errors.name = nameError;
    }

    if ('code' in territory) {
      const codeError = validateTerritoryCode(territory.code!);
      if (codeError) errors.code = codeError;
    }

    return errors;
  }, [validateTerritoryName, validateTerritoryCode]);

  return {
    validateTerritoryCode,
    validateTerritoryName,
    validateTerritory,
  };
}

// Main territory management hook
export function useTerritoryManagement() {
  const territoryMutations = useTerritoryMutations();
  const territoryValidation = useTerritoryValidation();

  return {
    ...territoryMutations,
    ...territoryValidation,
  };
}