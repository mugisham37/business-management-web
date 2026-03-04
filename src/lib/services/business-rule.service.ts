/**
 * BusinessRuleService
 * 
 * Handles all business rule management operations including creating, updating,
 * and fetching business rules.
 * 
 * Features:
 * - Request/response transformation
 * - Centralized error handling
 * - Cache updates after mutations
 * - Transaction type filtering
 * 
 * Requirements: 4.5, 4.8, 4.9, 4.10
 */

import { ApolloClient } from '@apollo/client';
import {
  CREATE_BUSINESS_RULE,
  UPDATE_BUSINESS_RULE,
} from '@/graphql/mutations/business-rules';
import {
  GET_BUSINESS_RULES,
} from '@/graphql/queries/business-rules';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';
import {
  updateBusinessRulesCache,
  BusinessRule,
} from '@/lib/cache/cache-updaters';

/**
 * Input types for business rule operations
 */
export interface CreateBusinessRuleInput {
  name: string;
  ruleType: string;
  conditions?: any;
  actions?: any;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateBusinessRuleInput {
  name?: string;
  conditions?: any;
  actions?: any;
  priority?: number;
  isActive?: boolean;
}

/**
 * Response types for business rule operations
 */
export interface BusinessRulesListResponse {
  rules: BusinessRule[];
  total: number;
}

/**
 * BusinessRuleService class
 * Provides methods for all business rule management operations
 */
export class BusinessRuleService {
  constructor(
    private apolloClient: ApolloClient
  ) {}

  /**
   * Create a new business rule
   * Creates a rule that defines automated business logic
   * 
   * @param input - Business rule creation data
   * @returns Created business rule
   * @throws AppError on failure
   * 
   * Requirements: 4.5, 4.8, 4.9, 4.10
   */
  async createBusinessRule(input: CreateBusinessRuleInput): Promise<BusinessRule> {
    try {
      // Transform input (Requirements: 4.8)
      const transformedInput = this.transformCreateBusinessRuleInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: CREATE_BUSINESS_RULE,
        variables: { input: transformedInput },
        // Update cache after mutation
        update: (cache: any, { data }: any) => {
          if (data?.createBusinessRule) {
            updateBusinessRulesCache(cache, data.createBusinessRule, true);
          }
        },
      });


      if (!data?.createBusinessRule) {
        throw new Error('No data returned from createBusinessRule mutation');
      }

      // Transform response (Requirements: 4.9)
      return this.transformBusinessRuleResponse(data.createBusinessRule);
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Update an existing business rule
   * Updates rule configuration and settings
   * 
   * @param ruleId - ID of rule to update
   * @param input - Updated business rule data
   * @returns Updated business rule
   * @throws AppError on failure
   * 
   * Requirements: 4.5, 4.8, 4.9, 4.10
   */
  async updateBusinessRule(ruleId: string, input: UpdateBusinessRuleInput): Promise<BusinessRule> {
    try {
      const transformedInput = this.transformUpdateBusinessRuleInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: UPDATE_BUSINESS_RULE,
        variables: { ruleId, input: transformedInput },
        // Update cache after mutation
        update: (cache: any, { data }: any) => {
          if (data?.updateBusinessRule) {
            updateBusinessRulesCache(cache, data.updateBusinessRule, false);
          }
        },
      });


      if (!data?.updateBusinessRule) {
        throw new Error('No data returned from updateBusinessRule mutation');
      }

      return this.transformBusinessRuleResponse(data.updateBusinessRule);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get business rules
   * Fetches list of business rules, optionally filtered by transaction type
   * 
   * @param transactionType - Optional filter by transaction type
   * @returns List of business rules with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.5, 4.9, 4.10
   */
  async getBusinessRules(transactionType?: string): Promise<BusinessRulesListResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_BUSINESS_RULES,
        variables: transactionType ? { transactionType } : undefined,
        fetchPolicy: 'cache-first',
      });


      if (!data?.getBusinessRules) {
        throw new Error('No business rules data returned');
      }

      return this.transformBusinessRulesListResponse(data.getBusinessRules);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Transform create business rule input to GraphQL format
   * Requirements: 4.8
   */
  private transformCreateBusinessRuleInput(input: CreateBusinessRuleInput): CreateBusinessRuleInput {
    return {
      name: input.name.trim(),
      ruleType: input.ruleType.trim().toUpperCase(),
      conditions: input.conditions,
      actions: input.actions,
      priority: input.priority ?? 0,
      isActive: input.isActive ?? true,
    };
  }

  /**
   * Transform update business rule input to GraphQL format
   * Requirements: 4.8
   */
  private transformUpdateBusinessRuleInput(input: UpdateBusinessRuleInput): UpdateBusinessRuleInput {
    const transformed: UpdateBusinessRuleInput = {};

    if (input.name !== undefined) {
      transformed.name = input.name.trim();
    }
    if (input.conditions !== undefined) {
      transformed.conditions = input.conditions;
    }
    if (input.actions !== undefined) {
      transformed.actions = input.actions;
    }
    if (input.priority !== undefined) {
      transformed.priority = input.priority;
    }
    if (input.isActive !== undefined) {
      transformed.isActive = input.isActive;
    }

    return transformed;
  }

  /**
   * Transform business rule response to application format
   * Requirements: 4.9
   */
  private transformBusinessRuleResponse(data: any): BusinessRule {
    return {
      __typename: data.__typename || 'BusinessRule',
      id: data.id,
      name: data.name,
      organizationId: data.organizationId,
      ruleType: data.ruleType,
      conditions: data.conditions,
      actions: data.actions,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Transform business rules list response to application format
   * Requirements: 4.9
   */
  private transformBusinessRulesListResponse(data: any): BusinessRulesListResponse {
    return {
      rules: data.rules.map((rule: any) => this.transformBusinessRuleResponse(rule)),
      total: data.total,
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let businessRuleServiceInstance: BusinessRuleService | null = null;

export const getBusinessRuleService = (): BusinessRuleService => {
  if (!businessRuleServiceInstance) {
    const { apolloClient } = require('@/lib/api/apollo-client');
    businessRuleServiceInstance = new BusinessRuleService(apolloClient);
  }
  return businessRuleServiceInstance;
};

export const businessRuleService = getBusinessRuleService();
