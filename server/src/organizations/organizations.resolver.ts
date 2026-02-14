import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { UpdateOrganizationDto } from './dto';
import { TenantContextService } from '../tenant/tenant-context.service';

/**
 * OrganizationsResolver
 * 
 * GraphQL resolver for organization management operations.
 * All operations require authentication and appropriate permissions.
 */
@Resolver('Organization')
export class OrganizationsResolver {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Get current organization
   * Requires authentication
   * @returns Current organization
   */
  @Query('organization')
  @UseGuards(JwtAuthGuard)
  async organization() {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }
    return this.organizationsService.getOrganization(context.organizationId);
  }

  /**
   * Update organization
   * Requires 'organization.edit' permission (typically OWNER only)
   * @param input - Organization update data
   * @returns Updated organization
   */
  @Mutation('updateOrganization')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('organization.edit')
  async updateOrganization(@Args('input') input: UpdateOrganizationDto) {
    const context = this.tenantContext.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }
    return this.organizationsService.updateOrganization(
      context.organizationId,
      input,
    );
  }
}
