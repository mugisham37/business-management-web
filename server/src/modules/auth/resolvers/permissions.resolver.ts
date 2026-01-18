import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { CacheService } from '../../cache/cache.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permission.decorator';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import {
  GrantPermissionInput,
  RevokePermissionInput,
  AssignRoleInput,
  CreateRoleInput,
  UpdateRolePermissionsInput,
  CheckPermissionInput,
  BulkPermissionInput,
  PermissionFilterInput,
} from '../inputs/permissions.input';
import {
  Permission,
  Role,
  UserPermissionsResponse,
  PermissionCheckResponse,
  BulkPermissionResponse,
  AvailablePermissionsResponse,
} from '../types/permissions.types';

/**
 * Permissions resolver for permission and role management
 * Handles permission queries, role assignment, and permission grants/revokes
 * Implements caching for user permissions with 15-minute TTL
 * All mutations require admin or tenant_admin role
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class PermissionsResolver extends BaseResolver {
  private readonly PERMISSIONS_CACHE_TTL = 15 * 60; // 15 minutes in seconds

  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly permissionsService: PermissionsService,
    private readonly cacheService: CacheService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Get permissions for a user
   * Returns all permissions (role-based + custom)
   * Cached for 15 minutes
   */
  @Query(() => [String], {
    description: 'Get all permissions for a user',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:read')
  async getPermissions(
    @Args('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<string[]> {
    try {
      // Check cache first
      const cacheKey = `permissions:${currentUser.tenantId}:${userId}`;
      const cached = await this.cacheService.get<string[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get from service
      const permissions = await this.permissionsService.getUserPermissions(
        userId,
        currentUser.tenantId,
      );

      // Cache the result
      await this.cacheService.set(cacheKey, permissions, {
        ttl: this.PERMISSIONS_CACHE_TTL,
      });

      return permissions;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get permissions');
    }
  }

  /**
   * Get current user's permissions
   * Returns all permissions for the authenticated user
   * Cached for 15 minutes
   */
  @Query(() => [String], {
    description: 'Get permissions for current user',
  })
  async myPermissions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string[]> {
    try {
      // Check cache first
      const cacheKey = `permissions:${user.tenantId}:${user.id}`;
      const cached = await this.cacheService.get<string[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get from service
      const permissions = await this.permissionsService.getUserPermissions(
        user.id,
        user.tenantId,
      );

      // Cache the result
      await this.cacheService.set(cacheKey, permissions, {
        ttl: this.PERMISSIONS_CACHE_TTL,
      });

      return permissions;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get permissions');
    }
  }

  /**
   * Get all available roles
   * Returns list of roles with their permissions
   */
  @Query(() => [Role], {
    description: 'Get all available roles',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('roles:read')
  async getRoles(): Promise<Role[]> {
    try {
      // Get all role names from the enum
      const roles = ['super_admin', 'tenant_admin', 'manager', 'employee', 'customer', 'readonly'];
      
      return roles.map(role => ({
        name: role,
        permissions: this.permissionsService.getRolePermissions(role as any),
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get roles');
    }
  }

  /**
   * Get permissions for a specific role
   * Returns the permissions associated with a role
   */
  @Query(() => [String], {
    description: 'Get permissions for a specific role',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('roles:read')
  async getRolePermissions(
    @Args('role') role: string,
  ): Promise<string[]> {
    try {
      return this.permissionsService.getRolePermissions(role as any);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get role permissions');
    }
  }

  /**
   * Grant a permission to a user
   * Requires permissions:manage permission
   * Invalidates permission cache
   */
  @Mutation(() => MutationResponse, {
    description: 'Grant a permission to a user',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:manage')
  async grantPermission(
    @Args('input') input: GrantPermissionInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.permissionsService.grantPermission(
        input.userId,
        currentUser.tenantId,
        input.permission,
        currentUser.id,
        {
          ...(input.resource && { resource: input.resource }),
          ...(input.resourceId && { resourceId: input.resourceId }),
          ...(input.expiresAt && { expiresAt: new Date(input.expiresAt) }),
        },
      );

      // Invalidate cache
      const cacheKey = `permissions:${currentUser.tenantId}:${input.userId}`;
      await this.cacheService.del(cacheKey);

      return {
        success: true,
        message: 'Permission granted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to grant permission',
        errors: [
          {
            message: error.message || 'Failed to grant permission',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Revoke a permission from a user
   * Requires permissions:manage permission
   * Invalidates permission cache
   */
  @Mutation(() => MutationResponse, {
    description: 'Revoke a permission from a user',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:manage')
  async revokePermission(
    @Args('input') input: RevokePermissionInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.permissionsService.revokePermission(
        input.userId,
        currentUser.tenantId,
        input.permission,
        input.resource,
        input.resourceId,
      );

      // Invalidate cache
      const cacheKey = `permissions:${currentUser.tenantId}:${input.userId}`;
      await this.cacheService.del(cacheKey);

      return {
        success: true,
        message: 'Permission revoked successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to revoke permission',
        errors: [
          {
            message: error.message || 'Failed to revoke permission',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Assign a role to a user
   * Requires roles:manage permission AND admin/tenant_admin role
   * Invalidates permission cache
   */
  @Mutation(() => MutationResponse, {
    description: 'Assign a role to a user',
  })
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('super_admin', 'tenant_admin')
  @Permissions('roles:manage')
  async assignRole(
    @Args('input') input: AssignRoleInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      // Update user role in database
      const db = this.permissionsService['drizzleService'].getDb();
      const { users } = await import('../../database/schema/user.schema');
      const { eq, and } = await import('drizzle-orm');

      await db
        .update(users)
        .set({
          role: input.role as any,
          updatedAt: new Date(),
          updatedBy: currentUser.id,
        })
        .where(and(
          eq(users.id, input.userId),
          eq(users.tenantId, currentUser.tenantId)
        ));

      // Invalidate cache
      const cacheKey = `permissions:${currentUser.tenantId}:${input.userId}`;
      await this.cacheService.del(cacheKey);

      return {
        success: true,
        message: 'Role assigned successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to assign role',
        errors: [
          {
            message: error.message || 'Failed to assign role',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Check if user has a specific permission
   * Useful for UI permission checks
   */
  @Query(() => Boolean, {
    description: 'Check if user has a specific permission',
  })
  async hasPermission(
    @Args('userId') userId: string,
    @Args('permission') permission: string,
    @Args('resource', { nullable: true }) resource?: string,
    @Args('resourceId', { nullable: true }) resourceId?: string,
    @CurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<boolean> {
    try {
      const tenantId = currentUser?.tenantId || '';
      return await this.permissionsService.hasPermission(
        userId,
        tenantId,
        permission,
        resource,
        resourceId,
      );
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get all available permissions
   * Returns list of all permission strings in the system
   */
  @Query(() => [String], {
    description: 'Get all available permissions',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:read')
  async getAllPermissions(): Promise<string[]> {
    try {
      return this.permissionsService.getAllPermissions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get all permissions');
    }
  }

  /**
   * Get detailed permissions for a user
   * Returns permissions with metadata (source, expiration, etc.)
   */
  @Query(() => UserPermissionsResponse, {
    description: 'Get detailed permissions for a user with metadata',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:read')
  async getDetailedPermissions(
    @Args('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserPermissionsResponse> {
    try {
      const permissions = await this.permissionsService.getUserPermissions(
        userId,
        currentUser.tenantId,
      );

      // Get detailed permission objects
      const detailedPermissions = await this.permissionsService.getDetailedUserPermissions(
        userId,
        currentUser.tenantId,
      );

      // Get user role
      const userRole = await this.permissionsService.getUserRole(userId, currentUser.tenantId);

      return {
        permissions,
        role: userRole,
        detailedPermissions,
        includesInherited: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get detailed permissions');
    }
  }

  /**
   * Check if user has specific permission
   * Returns detailed information about permission source
   */
  @Query(() => PermissionCheckResponse, {
    description: 'Check if user has specific permission with details',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:read')
  async checkPermission(
    @Args('input') input: CheckPermissionInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<PermissionCheckResponse> {
    try {
      const userPermissions = await this.permissionsService.getUserPermissions(
        input.userId,
        currentUser.tenantId,
      );

      const hasPermission = this.permissionsService.hasPermission(
        userPermissions,
        input.permission,
      );

      // Determine source of permission
      let source: string | undefined;
      if (hasPermission) {
        const rolePermissions = this.permissionsService.getRolePermissions(
          await this.permissionsService.getUserRole(input.userId, currentUser.tenantId)
        );
        
        if (rolePermissions.includes(input.permission)) {
          source = 'role';
        } else {
          source = 'direct';
        }
      }

      return {
        hasPermission,
        source,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check permission');
    }
  }

  /**
   * Get all available permissions in the system
   */
  @Query(() => AvailablePermissionsResponse, {
    description: 'Get all available permissions, resources, and actions',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('permissions:read')
  async getAvailablePermissions(): Promise<AvailablePermissionsResponse> {
    try {
      const permissions = this.permissionsService.getAllAvailablePermissions();
      
      // Extract resources and actions from permissions
      const resources = new Set<string>();
      const actions = new Set<string>();

      permissions.forEach(permission => {
        const parts = permission.split(':');
        if (parts.length >= 2) {
          resources.add(parts[0]);
          actions.add(parts[1]);
        }
      });

      return {
        permissions,
        resources: Array.from(resources).sort(),
        actions: Array.from(actions).sort(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get available permissions');
    }
  }

  /**
   * Bulk grant permissions to multiple users
   */
  @Mutation(() => BulkPermissionResponse, {
    description: 'Grant permissions to multiple users at once',
  })
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('tenant_admin', 'super_admin')
  @Permissions('permissions:manage')
  async bulkGrantPermissions(
    @Args('input') input: BulkPermissionInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<BulkPermissionResponse> {
    try {
      const results = await Promise.allSettled(
        input.userIds.map(async (userId) => {
          await Promise.all(
            input.permissions.map(permission =>
              this.permissionsService.grantPermission(
                userId,
                currentUser.tenantId,
                permission,
                input.resource,
                undefined,
                input.expiresAt ? new Date(input.expiresAt) : undefined,
                currentUser.id,
              )
            )
          );
          return userId;
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      // Invalidate cache for affected users
      await Promise.all(
        successful.map(async (result) => {
          if (result.status === 'fulfilled') {
            const cacheKey = `permissions:${currentUser.tenantId}:${result.value}`;
            await this.cacheService.del(cacheKey);
          }
        })
      );

      return {
        affectedUsers: successful.length,
        processedPermissions: successful.length * input.permissions.length,
        failedUsers: failed.map((_, index) => input.userIds[index]),
        errors: failed.map(f => f.status === 'rejected' ? f.reason.message : 'Unknown error'),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to bulk grant permissions');
    }
  }

  /**
   * Bulk revoke permissions from multiple users
   */
  @Mutation(() => BulkPermissionResponse, {
    description: 'Revoke permissions from multiple users at once',
  })
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('tenant_admin', 'super_admin')
  @Permissions('permissions:manage')
  async bulkRevokePermissions(
    @Args('input') input: BulkPermissionInput,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<BulkPermissionResponse> {
    try {
      const results = await Promise.allSettled(
        input.userIds.map(async (userId) => {
          await Promise.all(
            input.permissions.map(permission =>
              this.permissionsService.revokePermission(
                userId,
                currentUser.tenantId,
                permission,
                input.resource,
              )
            )
          );
          return userId;
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      // Invalidate cache for affected users
      await Promise.all(
        successful.map(async (result) => {
          if (result.status === 'fulfilled') {
            const cacheKey = `permissions:${currentUser.tenantId}:${result.value}`;
            await this.cacheService.del(cacheKey);
          }
        })
      );

      return {
        affectedUsers: successful.length,
        processedPermissions: successful.length * input.permissions.length,
        failedUsers: failed.map((_, index) => input.userIds[index]),
        errors: failed.map(f => f.status === 'rejected' ? f.reason.message : 'Unknown error'),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to bulk revoke permissions');
    }
  }
}
}
