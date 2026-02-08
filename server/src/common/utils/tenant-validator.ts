import { ForbiddenException, Logger } from '@nestjs/common';

/**
 * Tenant Validator Utility
 * 
 * Provides utility functions to validate tenant isolation in service methods.
 * 
 * Requirements:
 * - 16.2: WHEN a user attempts to access resources, THE Auth_System SHALL 
 *   verify the resource belongs to their organization
 * - 16.4: WHEN cross-organization access is attempted, THE Auth_System SHALL 
 *   reject the request with a 403 error
 */
export class TenantValidator {
  private static readonly logger = new Logger(TenantValidator.name);

  /**
   * Validate that a resource belongs to the user's organization
   * 
   * This should be called in service methods after fetching a resource
   * to ensure cross-tenant access is prevented.
   * 
   * @param resourceOrgId - Organization ID of the resource
   * @param userOrgId - Organization ID of the user making the request
   * @param resourceType - Type of resource (for error message)
   * @param resourceId - ID of resource (for logging)
   * @throws ForbiddenException if organization IDs don't match
   */
  static validateResourceAccess(
    resourceOrgId: string,
    userOrgId: string,
    resourceType: string,
    resourceId?: string,
  ): void {
    if (resourceOrgId !== userOrgId) {
      this.logger.warn(
        `Cross-tenant access attempt: user org=${userOrgId}, resource org=${resourceOrgId}, ` +
        `type=${resourceType}, id=${resourceId || 'unknown'}`,
      );

      throw new ForbiddenException(
        `Access denied: ${resourceType} does not belong to your organization`,
      );
    }
  }

  /**
   * Validate that multiple resources belong to the user's organization
   * 
   * @param resources - Array of resources with organizationId property
   * @param userOrgId - Organization ID of the user making the request
   * @param resourceType - Type of resources (for error message)
   * @throws ForbiddenException if any resource doesn't match user's org
   */
  static validateMultipleResourcesAccess<T extends { organizationId: string }>(
    resources: T[],
    userOrgId: string,
    resourceType: string,
  ): void {
    const invalidResources = resources.filter(r => r.organizationId !== userOrgId);

    if (invalidResources.length > 0) {
      this.logger.warn(
        `Cross-tenant access attempt for multiple resources: user org=${userOrgId}, ` +
        `type=${resourceType}, count=${invalidResources.length}`,
      );

      throw new ForbiddenException(
        `Access denied: Some ${resourceType} resources do not belong to your organization`,
      );
    }
  }

  /**
   * Ensure organization ID is included in query filters
   * 
   * This is a helper to ensure all Prisma queries include organization filter.
   * 
   * @param filters - Query filters object
   * @param organizationId - Organization ID to enforce
   * @returns Filters with organization ID added
   */
  static enforceOrganizationFilter<T extends Record<string, any>>(
    filters: T,
    organizationId: string,
  ): T & { organizationId: string } {
    return {
      ...filters,
      organizationId,
    };
  }

  /**
   * Log cross-tenant access attempt for security monitoring
   * 
   * @param userOrgId - Organization ID of the user
   * @param resourceOrgId - Organization ID of the resource
   * @param resourceType - Type of resource
   * @param action - Action attempted
   * @param userId - User ID (optional)
   */
  static logCrossTenantAttempt(
    userOrgId: string,
    resourceOrgId: string,
    resourceType: string,
    action: string,
    userId?: string,
  ): void {
    this.logger.error(
      `SECURITY: Cross-tenant access attempt - ` +
      `user org=${userOrgId}, resource org=${resourceOrgId}, ` +
      `type=${resourceType}, action=${action}, userId=${userId || 'unknown'}`,
    );
  }
}
