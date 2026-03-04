/**
 * useBusinessRules Hook
 * 
 * React hook for business rule management operations.
 * Provides access to business rule CRUD operations with loading/error states.
 * 
 * Features:
 * - Create and update business rules
 * - Fetch business rules list
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.6, 3.10, 3.11
 */

import { useState, useCallback } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation } from '@apollo/client/react';

import type { ApolloCache } from '@apollo/client/cache';
import { GET_BUSINESS_RULES } from '@/graphql/queries/business-rules';
import {
  CREATE_BUSINESS_RULE,
  UPDATE_BUSINESS_RULE,
} from '@/graphql/mutations/business-rules';
import type {
  GetBusinessRulesData,
  CreateBusinessRuleData,
  UpdateBusinessRuleData,
} from '@/graphql/types/operations';
import { updateBusinessRulesCache, BusinessRule } from '@/lib/cache/cache-updaters';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Input types for business rule operations
 */
export interface CreateBusinessRuleInput {
  ruleName: string;
  transactionType: string;
  basedOn: string;
  thresholdValue: number;
  appliesToLevel: string;
  approverLevel: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateBusinessRuleInput {
  ruleName?: string;
  transactionType?: string;
  basedOn?: string;
  thresholdValue?: number;
  appliesToLevel?: string;
  approverLevel?: string;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  priority?: number;
  isActive?: boolean;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseBusinessRulesReturn {
  // Query data
  businessRules: BusinessRule[] | undefined;
  
  // Loading states
  loading: boolean;
  businessRulesLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  createBusinessRule: (input: CreateBusinessRuleInput) => Promise<BusinessRule>;
  updateBusinessRule: (ruleId: string, input: UpdateBusinessRuleInput) => Promise<BusinessRule>;
  refetchBusinessRules: () => Promise<void>;
}

/**
 * useBusinessRules Hook
 * 
 * @returns Business rule management operations and data
 * 
 * Requirements: 3.6, 3.10, 3.11
 */
export function useBusinessRules(): UseBusinessRulesReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Query for business rules list
  const {
    data: businessRulesData,
    loading: businessRulesLoading,
    error: businessRulesError,
    refetch: refetchBusinessRulesList,
  } = useApolloQuery<GetBusinessRulesData>(GET_BUSINESS_RULES, {
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (businessRulesError && !error) {
    setError(errorHandler.handle(businessRulesError));
  }

  // Mutation for creating business rule
  const [createBusinessRuleMutation] = useApolloMutation<CreateBusinessRuleData>(CREATE_BUSINESS_RULE, {
    update: (cache, { data }) => {
      if (data?.createBusinessRule) {
        updateBusinessRulesCache(cache, data.createBusinessRule);
      }
    },
  });

  // Mutation for updating business rule
  const [updateBusinessRuleMutation] = useApolloMutation<UpdateBusinessRuleData>(UPDATE_BUSINESS_RULE, {
    update: (cache: ApolloCache, { data }) => {
      if (data?.updateBusinessRule) {
        updateBusinessRulesCache(cache, data.updateBusinessRule, false);
      }
    },
  });

  /**
   * Create a new business rule
   * Requirements: 3.6, 3.11
   */
  const createBusinessRule = useCallback(
    async (input: CreateBusinessRuleInput): Promise<BusinessRule> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await createBusinessRuleMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            createBusinessRule: {
              __typename: 'BusinessRuleType',
              id: `temp-${Date.now()}`,
              organizationId: '', // Will be filled by server
              ruleName: input.ruleName,
              transactionType: input.transactionType,
              basedOn: input.basedOn,
              thresholdValue: input.thresholdValue,
              appliesToLevel: input.appliesToLevel,
              approverLevel: input.approverLevel,
              priority: input.priority || 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.createBusinessRule) {
          throw new Error('No data returned from createBusinessRule mutation');
        }

        return data.createBusinessRule;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [createBusinessRuleMutation]
  );

  /**
   * Update an existing business rule
   * Requirements: 3.6, 3.11
   */
  const updateBusinessRule = useCallback(
    async (ruleId: string, input: UpdateBusinessRuleInput): Promise<BusinessRule> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await updateBusinessRuleMutation({
          variables: { ruleId, input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            updateBusinessRule: {
              __typename: 'BusinessRuleType',
              id: ruleId,
              ...input,
              // These fields won't change, but need to be included
              organizationId: '',
              ruleName: input.ruleName || '',
              transactionType: input.transactionType || '',
              basedOn: input.basedOn || '',
              thresholdValue: input.thresholdValue || 0,
              appliesToLevel: input.appliesToLevel || '',
              approverLevel: input.approverLevel || '',
              priority: input.priority || 0,
              isActive: input.isActive !== undefined ? input.isActive : true,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.updateBusinessRule) {
          throw new Error('No data returned from updateBusinessRule mutation');
        }

        return data.updateBusinessRule;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [updateBusinessRuleMutation]
  );

  /**
   * Refetch business rules list
   * Requirements: 3.6
   */
  const refetchBusinessRules = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetchBusinessRulesList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchBusinessRulesList]);

  // Combine loading states
  const loading = operationLoading || businessRulesLoading;

  // Handle query errors
  if (businessRulesError && !error) {
    setError(errorHandler.handle(businessRulesError));
  }

  return {
    // Data
    businessRules: businessRulesData?.getBusinessRules?.rules,
    
    // Loading states
    loading,
    businessRulesLoading,
    
    // Error state
    error,
    
    // Operations
    createBusinessRule,
    updateBusinessRule,
    refetchBusinessRules,
  };
}
