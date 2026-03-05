/**
 * OrganizationService
 * 
 * Handles all organization, branch, and department management operations.
 * 
 * Features:
 * - Organization CRUD operations
 * - Branch CRUD and manager assignment
 * - Department CRUD and manager assignment
 * - Request/response transformation
 * - Centralized error handling
 * - Cache updates after mutations
 * 
 * Requirements: 4.4, 4.8, 4.9, 4.10
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  UPDATE_ORGANIZATION,
} from '@/graphql/mutations/organizations';
import {
  CREATE_BRANCH,
  UPDATE_BRANCH,
  ASSIGN_BRANCH_MANAGER,
} from '@/graphql/mutations/branches';
import {
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  ASSIGN_DEPARTMENT_MANAGER,
} from '@/graphql/mutations/departments';
import {
  GET_ORGANIZATION,
} from '@/graphql/queries/organizations';
import {
  GET_BRANCHES,
} from '@/graphql/queries/branches';
import {
  GET_DEPARTMENTS,
} from '@/graphql/queries/departments';
import { errorHandler } from '@/lib/errors/error-handler';
import {
  updateBranchesCache,
  updateDepartmentsCache,
  Branch,
  Department,
  Organization,
} from '@/lib/cache/cache-updaters';

/**
 * Input types for organization operations
 */
export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  settings?: unknown;
}

export interface CreateBranchInput {
  name: string;
  description?: string;
  address?: string;
}

export interface UpdateBranchInput {
  name?: string;
  description?: string;
  address?: string;
  isActive?: boolean;
}

export interface CreateDepartmentInput {
  name: string;
  branchId?: string;
  description?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  branchId?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Response types for organization operations
 */
export interface BranchesListResponse {
  branches: Branch[];
  total: number;
}

export interface DepartmentsListResponse {
  departments: Department[];
  total: number;
}

/**
 * OrganizationService class
 * Provides methods for organization, branch, and department management
 */
export class OrganizationService {
  constructor(
    private apolloClient: ApolloClient<NormalizedCacheObject>
  ) {}

  /**
   * Update organization details
   * Updates the current organization's information
   * 
   * @param input - Updated organization data
   * @returns Updated organization
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.8, 4.9, 4.10
   */
  async updateOrganization(input: UpdateOrganizationInput): Promise<Organization> {
    try {
      // Transform input (Requirements: 4.8)
      const transformedInput = this.transformUpdateOrganizationInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: UPDATE_ORGANIZATION,
        variables: { input: transformedInput },
        // Refetch organization after update
        refetchQueries: [{ query: GET_ORGANIZATION }],
      });


      if (!data?.updateOrganization) {
        throw new Error('No data returned from updateOrganization mutation');
      }

      // Transform response (Requirements: 4.9)
      return this.transformOrganizationResponse(data.updateOrganization);
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get organization details
   * Fetches the current organization's information
   * 
   * @returns Organization data
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.9, 4.10
   */
  async getOrganization(): Promise<Organization> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_ORGANIZATION,
        fetchPolicy: 'cache-first',
      });


      if (!data?.getOrganization) {
        throw new Error('No organization data returned');
      }

      return this.transformOrganizationResponse(data.getOrganization);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Create a new branch
   * Creates a branch within the organization
   * 
   * @param input - Branch creation data
   * @returns Created branch
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.8, 4.9, 4.10
   */
  async createBranch(input: CreateBranchInput): Promise<Branch> {
    try {
      const transformedInput = this.transformCreateBranchInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: CREATE_BRANCH,
        variables: { input: transformedInput },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (data?.createBranch) {
            updateBranchesCache(cache, data.createBranch, true);
          }
        },
      });


      if (!data?.createBranch) {
        throw new Error('No data returned from createBranch mutation');
      }

      return this.transformBranchResponse(data.createBranch);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Update an existing branch
   * Updates branch information
   * 
   * @param branchId - ID of branch to update
   * @param input - Updated branch data
   * @returns Updated branch
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.8, 4.9, 4.10
   */
  async updateBranch(branchId: string, input: UpdateBranchInput): Promise<Branch> {
    try {
      const transformedInput = this.transformUpdateBranchInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: UPDATE_BRANCH,
        variables: { branchId, input: transformedInput },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (data?.updateBranch) {
            updateBranchesCache(cache, data.updateBranch, false);
          }
        },
      });


      if (!data?.updateBranch) {
        throw new Error('No data returned from updateBranch mutation');
      }

      return this.transformBranchResponse(data.updateBranch);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Assign a manager to a branch
   * Sets the branch manager
   * 
   * @param branchId - ID of branch
   * @param managerId - ID of manager user
   * @returns Success boolean
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.10
   */
  async assignBranchManager(branchId: string, managerId: string): Promise<boolean> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: ASSIGN_BRANCH_MANAGER,
        variables: { branchId, managerId },
        // Refetch branches after assignment
        refetchQueries: [{ query: GET_BRANCHES }],
      });


      return data?.assignBranchManager ?? false;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get all branches
   * Fetches list of branches in the organization
   * 
   * @returns List of branches with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.9, 4.10
   */
  async getBranches(): Promise<BranchesListResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_BRANCHES,
        fetchPolicy: 'cache-first',
      });


      if (!data?.getBranches) {
        throw new Error('No branches data returned');
      }

      return this.transformBranchesListResponse(data.getBranches);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Create a new department
   * Creates a department within the organization
   * 
   * @param input - Department creation data
   * @returns Created department
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.8, 4.9, 4.10
   */
  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    try {
      const transformedInput = this.transformCreateDepartmentInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: CREATE_DEPARTMENT,
        variables: { input: transformedInput },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (data?.createDepartment) {
            updateDepartmentsCache(cache, data.createDepartment, true);
          }
        },
      });


      if (!data?.createDepartment) {
        throw new Error('No data returned from createDepartment mutation');
      }

      return this.transformDepartmentResponse(data.createDepartment);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Update an existing department
   * Updates department information
   * 
   * @param departmentId - ID of department to update
   * @param input - Updated department data
   * @returns Updated department
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.8, 4.9, 4.10
   */
  async updateDepartment(departmentId: string, input: UpdateDepartmentInput): Promise<Department> {
    try {
      const transformedInput = this.transformUpdateDepartmentInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: UPDATE_DEPARTMENT,
        variables: { departmentId, input: transformedInput },
        // Update cache after mutation
        update: (cache, { data }) => {
          if (data?.updateDepartment) {
            updateDepartmentsCache(cache, data.updateDepartment, false);
          }
        },
      });


      if (!data?.updateDepartment) {
        throw new Error('No data returned from updateDepartment mutation');
      }

      return this.transformDepartmentResponse(data.updateDepartment);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Assign a manager to a department
   * Sets the department manager
   * 
   * @param departmentId - ID of department
   * @param managerId - ID of manager user
   * @returns Success boolean
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.10
   */
  async assignDepartmentManager(departmentId: string, managerId: string): Promise<boolean> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: ASSIGN_DEPARTMENT_MANAGER,
        variables: { departmentId, managerId },
        // Refetch departments after assignment
        refetchQueries: [{ query: GET_DEPARTMENTS }],
      });


      return data?.assignDepartmentManager ?? false;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get all departments
   * Fetches list of departments in the organization
   * 
   * @returns List of departments with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.4, 4.9, 4.10
   */
  async getDepartments(): Promise<DepartmentsListResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_DEPARTMENTS,
        fetchPolicy: 'cache-first',
      });


      if (!data?.getDepartments) {
        throw new Error('No departments data returned');
      }

      return this.transformDepartmentsListResponse(data.getDepartments);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Transform update organization input to GraphQL format
   * Requirements: 4.8
   */
  private transformUpdateOrganizationInput(input: UpdateOrganizationInput): UpdateOrganizationInput {
    const transformed: UpdateOrganizationInput = {};

    if (input.name !== undefined) {
      transformed.name = input.name.trim();
    }
    if (input.description !== undefined) {
      transformed.description = input.description.trim();
    }
    if (input.settings !== undefined) {
      transformed.settings = input.settings;
    }

    return transformed;
  }

  /**
   * Transform create branch input to GraphQL format
   * Requirements: 4.8
   */
  private transformCreateBranchInput(input: CreateBranchInput): CreateBranchInput {
    return {
      name: input.name.trim(),
      description: input.description?.trim(),
      address: input.address?.trim(),
    };
  }

  /**
   * Transform update branch input to GraphQL format
   * Requirements: 4.8
   */
  private transformUpdateBranchInput(input: UpdateBranchInput): UpdateBranchInput {
    const transformed: UpdateBranchInput = {};

    if (input.name !== undefined) {
      transformed.name = input.name.trim();
    }
    if (input.description !== undefined) {
      transformed.description = input.description.trim();
    }
    if (input.address !== undefined) {
      transformed.address = input.address.trim();
    }
    if (input.isActive !== undefined) {
      transformed.isActive = input.isActive;
    }

    return transformed;
  }

  /**
   * Transform create department input to GraphQL format
   * Requirements: 4.8
   */
  private transformCreateDepartmentInput(input: CreateDepartmentInput): CreateDepartmentInput {
    return {
      name: input.name.trim(),
      branchId: input.branchId,
      description: input.description?.trim(),
    };
  }

  /**
   * Transform update department input to GraphQL format
   * Requirements: 4.8
   */
  private transformUpdateDepartmentInput(input: UpdateDepartmentInput): UpdateDepartmentInput {
    const transformed: UpdateDepartmentInput = {};

    if (input.name !== undefined) {
      transformed.name = input.name.trim();
    }
    if (input.branchId !== undefined) {
      transformed.branchId = input.branchId;
    }
    if (input.description !== undefined) {
      transformed.description = input.description.trim();
    }
    if (input.isActive !== undefined) {
      transformed.isActive = input.isActive;
    }

    return transformed;
  }

  /**
   * Transform organization response to application format
   * Requirements: 4.9
   */
  private transformOrganizationResponse(data: Record<string, unknown>): Organization {
    return {
      __typename: 'OrganizationType' as const,
      id: data.id as string,
      name: data.name as string,
      status: (data.status as string) || 'ACTIVE',
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
    };
  }

  /**
   * Transform branch response to application format
   * Requirements: 4.9
   */
  private transformBranchResponse(data: Record<string, unknown>): Branch {
    return {
      __typename: 'BranchType' as const,
      id: data.id as string,
      name: data.name as string,
      organizationId: data.organizationId as string,
      code: (data.code as string) || '',
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
    };
  }

  /**
   * Transform branches list response to application format
   * Requirements: 4.9
   */
  private transformBranchesListResponse(data: Record<string, unknown>): BranchesListResponse {
    return {
      branches: (data.branches as Record<string, unknown>[]).map((branch: Record<string, unknown>) => this.transformBranchResponse(branch)),
      total: data.total as number,
    };
  }

  /**
   * Transform department response to application format
   * Requirements: 4.9
   */
  private transformDepartmentResponse(data: Record<string, unknown>): Department {
    return {
      __typename: 'DepartmentType' as const,
      id: data.id as string,
      name: data.name as string,
      branchId: (data.branchId as string) ?? null,
      code: (data.code as string) || '',
      createdAt: data.createdAt as string,
      updatedAt: data.updatedAt as string,
    };
  }

  /**
   * Transform departments list response to application format
   * Requirements: 4.9
   */
  private transformDepartmentsListResponse(data: Record<string, unknown>): DepartmentsListResponse {
    return {
      departments: (data.departments as Record<string, unknown>[]).map((dept: Record<string, unknown>) => this.transformDepartmentResponse(dept)),
      total: data.total as number,
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let organizationServiceInstance: OrganizationService | null = null;

export const getOrganizationService = async (): Promise<OrganizationService> => {
  if (!organizationServiceInstance) {
    const { apolloClient } = await import('@/lib/api/apollo-client');
    organizationServiceInstance = new OrganizationService(apolloClient);
  }
  return organizationServiceInstance;
};
