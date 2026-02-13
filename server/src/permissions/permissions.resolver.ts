import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionRegistry } from './permission-registry';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

/**
 * PermissionsResolver
 * Implements requirements 16.3, 16.4
 * 
 * GraphQL resolver for permission management operations.
 * All mutations require authentication and appropriate permissions.
 */
@Resolver('Permission')
export class PermissionsResolver {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly permissionRegistry: PermissionRegistry,
  ) {}

  /**
   * Get all available permissions in the system
   * Requires 'permissions.view' permission
   * @returns Array of permission definitions
   */
  @Query('availablePermissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('permissions.view')
  async availablePermissions() {
    return this.permissionRegistry.getAvailablePermissions();
  }

  /**
   * Assign permissions to a user
   * Requires 'permissions.assign' permission
   * Validates hierarchical permission rules (Manager can only grant permissions they have)
   * @param userId - ID of user to grant permissions to
   * @param permissions - Array of permission strings to grant
   * @returns Success boolean
   */
  @Mutation('assignPermissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('permissions.assign')
  async assignPermissions(
    @Args('userId') userId: string,
    @Args('permissions') permissions: string[],
    @CurrentUser() user: any,
  ) {
    await this.permissionsService.assignPermissions(
      user.userId,
      userId,
      permissions,
    );
    return true;
  }

  /**
   * Revoke permissions from a user
   * Requires 'permissions.revoke' permission
   * @param userId - ID of user to revoke permissions from
   * @param permissions - Array of permission strings to revoke
   * @returns Success boolean
   */
  @Mutation('revokePermissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('permissions.revoke')
  async revokePermissions(
    @Args('userId') userId: string,
    @Args('permissions') permissions: string[],
    @CurrentUser() user: any,
  ) {
    await this.permissionsService.revokePermissions(
      user.userId,
      userId,
      permissions,
    );
    return true;
  }

  /**
   * Get all registered modules with their enabled status
   * Requires 'permissions.view' permission
   * @returns Array of module definitions
   */
  @Query('modules')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('permissions.view')
  async modules() {
    return this.permissionRegistry.getModules();
  }

  /**
   * Get permissions grouped by module
   * Requires 'permissions.view' permission
   * @returns Map of module name to permissions
   */
  @Query('permissionsByModule')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('permissions.view')
  async permissionsByModule() {
    const grouped = this.permissionRegistry.getPermissionsByModule();
    // Convert Map to array of objects for GraphQL
    return Array.from(grouped.entries()).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  }
}
