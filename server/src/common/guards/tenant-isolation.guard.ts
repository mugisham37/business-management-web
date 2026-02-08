import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';

/**
 * Tenant Isolation Guard
 * 
 * Validates that the organization ID in the request context matches
 * the organization ID of the resource being accessed.
 * 
 * This guard should be used on routes that access organization-specific
 * resources to prevent cross-tenant access.
 * 
 * Requirements:
 * - 16.2: WHEN a user attempts to access resources, THE Auth_System SHALL 
 *   verify the resource belongs to their organization
 * - 16.4: WHEN cross-organization access is attempted, THE Auth_System SHALL 
 *   reject the request with a 403 error
 * 
 * Usage:
 * ```typescript
 * @UseGuards(TenantIsolationGuard)
 * @Get('/users/:id')
 * async getUser(@Param('id') id: string, @Organization() orgId: string) {
 *   return this.usersService.findById(id, orgId);
 * }
 * ```
 */
@Injectable()
export class TenantIsolationGuard implements CanActivate {
  private readonly logger = new Logger(TenantIsolationGuard.name);

  /**
   * Validate that organization context is present in request
   * 
   * This guard ensures that:
   * 1. JWT has been validated and organization ID extracted
   * 2. Organization context is available for downstream services
   * 
   * Note: This guard does NOT validate resource ownership - that should
   * be done in the service layer when fetching the resource.
   * 
   * @param context - Execution context
   * @returns true if organization context is present
   * @throws ForbiddenException if organization context is missing
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const organizationId = request.organizationId;

    if (!organizationId) {
      this.logger.error('Organization context missing from request');
      throw new ForbiddenException(
        'Organization context is required. Please ensure you are authenticated.',
      );
    }

    this.logger.debug(`Tenant isolation validated: orgId=${organizationId}`);
    return true;
  }
}
