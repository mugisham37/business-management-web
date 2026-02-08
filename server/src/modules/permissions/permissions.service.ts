import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

export interface PermissionContext {
  organizationId: string;
  locationId?: string;
  departmentId?: string;
  resourceOwnerId?: string;
}

export interface ScopedPermission {
  permission: string;
  scope: 'global' | 'location' | 'department';
  locationId?: string;
  departmentId?: string;
  source: 'direct' | 'role';
}

/**
 * Permissions Service for permission evaluation
 * 
 * Features:
 * - Permission evaluation with multi-layered caching (L1/L2)
 * - Direct permission grants/denials with precedence
 * - Role-based permission evaluation
 * - Location and department scoped permissions
 * - Cache invalidation on permission changes
 * 
 * Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5
 */
@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private readonly CACHE_INVALIDATION_CHANNEL = 'permission:invalidate';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {
    // Subscribe to cache invalidation events
    this.setupCacheInvalidation();
  }

  /**
   * Check if user has a specific permission
   * 
   * Algorithm:
   * 1. Check cache (L1 → L2)
   * 2. Check direct permission denials (highest precedence)
   * 3. Check direct permission grants
   * 4. Check role-based permissions
   * 5. Default deny
   * 
   * Requirements:
   * - 7.3: Permission evaluation with caching
   * - 7.4: Direct permission denial precedence
   * - 7.5: Direct permission grant precedence
   * - 7.6: Location-scoped permission enforcement
   * - 7.7: Organization boundary enforcement
   * 
   * @param userId - User ID
   * @param permission - Permission code (e.g., 'users:create:user')
   * @param context - Permission context (organization, location, department)
   * @returns true if user has permission, false otherwise
   */
  async hasPermission(
    userId: string,
    permission: string,
    context: PermissionContext,
  ): Promise<boolean> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(userId, permission, context);

      // Check cache (L1 → L2)
      const cached = await this.cache.get<boolean>(cacheKey);
      if (cached !== null) {
        this.logger.debug(`Permission check (cached): ${userId} - ${permission} = ${cached}`);
        return cached;
      }

      // Evaluate permission
      const result = await this.evaluatePermission(userId, permission, context);

      // Cache result
      await this.cache.set(cacheKey, result);

      this.logger.debug(`Permission check (evaluated): ${userId} - ${permission} = ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Error checking permission for user ${userId}:`, error);
      // Fail secure: deny access on error
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   * 
   * @param userId - User ID
   * @param permissions - Array of permission codes
   * @param context - Permission context
   * @returns true if user has at least one permission, false otherwise
   */
  async hasAnyPermission(
    userId: string,
    permissions: string[],
    context: PermissionContext,
  ): Promise<boolean> {
    try {
      for (const permission of permissions) {
        const has = await this.hasPermission(userId, permission, context);
        if (has) {
          return true;
        }
      }
      return false;
    } catch (error) {
      this.logger.error(`Error checking any permission for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has all of the specified permissions
   * 
   * @param userId - User ID
   * @param permissions - Array of permission codes
   * @param context - Permission context
   * @returns true if user has all permissions, false otherwise
   */
  async hasAllPermissions(
    userId: string,
    permissions: string[],
    context: PermissionContext,
  ): Promise<boolean> {
    try {
      for (const permission of permissions) {
        const has = await this.hasPermission(userId, permission, context);
        if (!has) {
          return false;
        }
      }
      return true;
    } catch (error) {
      this.logger.error(`Error checking all permissions for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Core permission evaluation algorithm
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @param context - Permission context
   * @returns true if permission granted, false otherwise
   */
  private async evaluatePermission(
    userId: string,
    permissionCode: string,
    context: PermissionContext,
  ): Promise<boolean> {
    // Get permission ID from code
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) {
      this.logger.warn(`Permission not found: ${permissionCode}`);
      return false;
    }

    // 1. Check direct permission denials (highest precedence)
    const directDenial = await this.checkDirectPermission(
      userId,
      permission.id,
      'deny',
      context,
    );

    if (directDenial) {
      this.logger.debug(`Direct denial for ${userId} - ${permissionCode}`);
      return false;
    }

    // 2. Check direct permission grants
    const directGrant = await this.checkDirectPermission(
      userId,
      permission.id,
      'allow',
      context,
    );

    if (directGrant) {
      this.logger.debug(`Direct grant for ${userId} - ${permissionCode}`);
      return true;
    }

    // 3. Check role-based permissions
    const roleGrant = await this.checkRolePermissions(
      userId,
      permission.id,
      context,
    );

    if (roleGrant) {
      this.logger.debug(`Role grant for ${userId} - ${permissionCode}`);
      return true;
    }

    // 4. Default deny
    this.logger.debug(`Default deny for ${userId} - ${permissionCode}`);
    return false;
  }

  /**
   * Check direct permission grants or denials
   * 
   * @param userId - User ID
   * @param permissionId - Permission ID
   * @param effect - 'allow' or 'deny'
   * @param context - Permission context
   * @returns true if direct permission exists with matching scope
   */
  private async checkDirectPermission(
    userId: string,
    permissionId: string,
    effect: 'allow' | 'deny',
    context: PermissionContext,
  ): Promise<boolean> {
    // Query direct permissions with scope matching
    const directPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        permissionId,
        effect,
        user: {
          organizationId: context.organizationId,
        },
        OR: [
          // Global scope
          { scopeType: 'global' },
          // Location scope (if context has location)
          context.locationId
            ? {
                scopeType: 'location',
                locationId: context.locationId,
              }
            : {},
          // Department scope (if context has department)
          context.departmentId
            ? {
                scopeType: 'department',
                departmentId: context.departmentId,
              }
            : {},
        ],
      },
    });

    return directPermissions.length > 0;
  }

  /**
   * Check role-based permissions
   * 
   * @param userId - User ID
   * @param permissionId - Permission ID
   * @param context - Permission context
   * @returns true if user has permission through roles
   */
  private async checkRolePermissions(
    userId: string,
    permissionId: string,
    context: PermissionContext,
  ): Promise<boolean> {
    // Get user roles with scope matching
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        user: {
          organizationId: context.organizationId,
        },
        role: {
          isActive: true,
        },
        OR: [
          // Global scope
          { scopeType: 'global' },
          // Location scope (if context has location)
          context.locationId
            ? {
                scopeType: 'location',
                locationId: context.locationId,
              }
            : {},
          // Department scope (if context has department)
          context.departmentId
            ? {
                scopeType: 'department',
                departmentId: context.departmentId,
              }
            : {},
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                permissionId,
              },
            },
          },
        },
      },
    });

    // Check if any role has the permission
    for (const userRole of userRoles) {
      if (userRole.role.permissions.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate cache key for permission check
   * 
   * @param userId - User ID
   * @param permission - Permission code
   * @param context - Permission context
   * @returns Cache key
   */
  private generateCacheKey(
    userId: string,
    permission: string,
    context: PermissionContext,
  ): string {
    const parts = [
      'perm',
      userId,
      permission,
      context.organizationId,
      context.locationId || 'null',
      context.departmentId || 'null',
    ];
    return parts.join(':');
  }

  /**
   * Get all permissions for a user (flattened list)
   * 
   * Requirement 7.3: Permission evaluation with role-based permissions
   * 
   * @param userId - User ID
   * @returns Array of permission codes
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (!user) {
        return [];
      }

      const permissions = new Set<string>();

      // Get direct permissions (only 'allow' effect)
      const directPermissions = await this.prisma.userPermission.findMany({
        where: {
          userId,
          effect: 'allow',
        },
        include: {
          permission: true,
        },
      });

      for (const up of directPermissions) {
        permissions.add(up.permission.code);
      }

      // Get role-based permissions
      const userRoles = await this.prisma.userRole.findMany({
        where: {
          userId,
          role: {
            isActive: true,
          },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      for (const userRole of userRoles) {
        for (const rolePermission of userRole.role.permissions) {
          permissions.add(rolePermission.permission.code);
        }
      }

      return Array.from(permissions);
    } catch (error) {
      this.logger.error(`Error getting user permissions for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all permissions for a user with scope information
   * 
   * Requirement 7.3: Permission evaluation with scope details
   * 
   * @param userId - User ID
   * @returns Array of scoped permissions
   */
  async getUserPermissionsWithScope(userId: string): Promise<ScopedPermission[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (!user) {
        return [];
      }

      const scopedPermissions: ScopedPermission[] = [];

      // Get direct permissions
      const directPermissions = await this.prisma.userPermission.findMany({
        where: {
          userId,
          effect: 'allow',
        },
        include: {
          permission: true,
        },
      });

      for (const up of directPermissions) {
        scopedPermissions.push({
          permission: up.permission.code,
          scope: up.scopeType as 'global' | 'location' | 'department',
          locationId: up.locationId || undefined,
          departmentId: up.departmentId || undefined,
          source: 'direct',
        });
      }

      // Get role-based permissions
      const userRoles = await this.prisma.userRole.findMany({
        where: {
          userId,
          role: {
            isActive: true,
          },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      for (const userRole of userRoles) {
        for (const rolePermission of userRole.role.permissions) {
          scopedPermissions.push({
            permission: rolePermission.permission.code,
            scope: userRole.scopeType as 'global' | 'location' | 'department',
            locationId: userRole.locationId || undefined,
            departmentId: userRole.departmentId || undefined,
            source: 'role',
          });
        }
      }

      return scopedPermissions;
    } catch (error) {
      this.logger.error(`Error getting user permissions with scope for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Grant a permission to a user
   * 
   * Requirements:
   * - 7.5: Direct permission grant precedence
   * - 8.4: Cache invalidation on permission changes
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @param actorId - ID of user granting the permission
   * @param scope - Optional scope (location or department)
   */
  async grantPermission(
    userId: string,
    permissionCode: string,
    actorId: string,
    scope?: {
      type: 'global' | 'location' | 'department';
      locationId?: string;
      departmentId?: string;
    },
  ): Promise<void> {
    try {
      // Get permission by code
      const permission = await this.prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      // Get user to verify organization
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Create or update user permission
      await this.prisma.userPermission.upsert({
        where: {
          userId_permissionId_effect_scopeType_locationId_departmentId: {
            userId,
            permissionId: permission.id,
            effect: 'allow',
            scopeType: scope?.type || 'global',
            locationId: (scope?.locationId ?? null) as any,
            departmentId: (scope?.departmentId ?? null) as any,
          },
        },
        create: {
          userId,
          permissionId: permission.id,
          effect: 'allow',
          scopeType: scope?.type || 'global',
          locationId: scope?.locationId,
          departmentId: scope?.departmentId,
          grantedById: actorId,
        },
        update: {
          grantedById: actorId,
          grantedAt: new Date(),
        },
      });

      // Invalidate user cache
      await this.invalidateUserCache(userId);

      this.logger.log(
        `Permission granted: ${permissionCode} to user ${userId} by ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Error granting permission:`, error);
      throw error;
    }
  }

  /**
   * Deny a permission to a user
   * 
   * Requirements:
   * - 7.4: Direct permission denial precedence
   * - 8.4: Cache invalidation on permission changes
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @param actorId - ID of user denying the permission
   */
  async denyPermission(
    userId: string,
    permissionCode: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Get permission by code
      const permission = await this.prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      // Get user to verify organization
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Create or update user permission with deny effect
      await this.prisma.userPermission.upsert({
        where: {
          userId_permissionId_effect_scopeType_locationId_departmentId: {
            userId,
            permissionId: permission.id,
            effect: 'deny',
            scopeType: 'global',
            locationId: null as any,
            departmentId: null as any,
          },
        },
        create: {
          userId,
          permissionId: permission.id,
          effect: 'deny',
          scopeType: 'global',
          grantedById: actorId,
        },
        update: {
          grantedById: actorId,
          grantedAt: new Date(),
        },
      });

      // Invalidate user cache
      await this.invalidateUserCache(userId);

      this.logger.log(
        `Permission denied: ${permissionCode} to user ${userId} by ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Error denying permission:`, error);
      throw error;
    }
  }

  /**
   * Revoke a permission from a user
   * 
   * Requirements:
   * - 8.4: Cache invalidation on permission changes
   * 
   * @param userId - User ID
   * @param permissionCode - Permission code
   * @param actorId - ID of user revoking the permission
   */
  async revokePermission(
    userId: string,
    permissionCode: string,
    actorId: string,
  ): Promise<void> {
    try {
      // Get permission by code
      const permission = await this.prisma.permission.findUnique({
        where: { code: permissionCode },
      });

      if (!permission) {
        throw new Error(`Permission not found: ${permissionCode}`);
      }

      // Delete all user permissions for this permission (both allow and deny)
      await this.prisma.userPermission.deleteMany({
        where: {
          userId,
          permissionId: permission.id,
        },
      });

      // Invalidate user cache
      await this.invalidateUserCache(userId);

      this.logger.log(
        `Permission revoked: ${permissionCode} from user ${userId} by ${actorId}`,
      );
    } catch (error) {
      this.logger.error(`Error revoking permission:`, error);
      throw error;
    }
  }

  /**
   * Validate that a creator has all permissions being delegated
   * 
   * Requirements:
   * - 4.1: Creator must possess all permissions being delegated
   * - 4.4: Delegation validation
   * - 9.1: Hierarchical permission delegation
   * - 9.2: Role-based delegation validation
   * 
   * @param creatorId - ID of user attempting to delegate
   * @param permissionCodes - Array of permission codes to delegate
   * @returns true if creator has all permissions, false otherwise
   */
  async validateDelegation(
    creatorId: string,
    permissionCodes: string[],
  ): Promise<boolean> {
    try {
      // Get creator's organization
      const creator = await this.prisma.user.findUnique({
        where: { id: creatorId },
        select: { organizationId: true },
      });

      if (!creator) {
        this.logger.warn(`Creator not found: ${creatorId}`);
        return false;
      }

      // Check if creator has all permissions
      for (const permissionCode of permissionCodes) {
        const hasPermission = await this.hasPermission(
          creatorId,
          permissionCode,
          { organizationId: creator.organizationId },
        );

        if (!hasPermission) {
          this.logger.warn(
            `Creator ${creatorId} does not have permission: ${permissionCode}`,
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validating delegation:`, error);
      return false;
    }
  }

  /**
   * Check if a creator can delegate a specific permission
   * 
   * Requirements:
   * - 4.1: Creator must possess permission to delegate it
   * - 9.1: Hierarchical permission delegation
   * 
   * @param creatorId - ID of user attempting to delegate
   * @param permissionCode - Permission code to delegate
   * @returns true if creator can delegate, false otherwise
   */
  async canDelegate(
    creatorId: string,
    permissionCode: string,
  ): Promise<boolean> {
    try {
      // Get creator's organization
      const creator = await this.prisma.user.findUnique({
        where: { id: creatorId },
        select: { organizationId: true },
      });

      if (!creator) {
        return false;
      }

      // Check if creator has the permission
      return await this.hasPermission(
        creatorId,
        permissionCode,
        { organizationId: creator.organizationId },
      );
    } catch (error) {
      this.logger.error(`Error checking delegation capability:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache for a specific user
   * 
   * Requirements:
   * - 8.4: User permission change invalidation
   * 
   * @param userId - User ID
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      // Publish invalidation event
      await this.cache.publish(this.CACHE_INVALIDATION_CHANNEL, {
        type: 'user',
        userId,
      });

      // Also clear L1 cache locally
      await this.cache.delPattern(`perm:${userId}:*`);

      this.logger.debug(`Cache invalidated for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error invalidating user cache:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache for all users with a specific role
   * 
   * Requirements:
   * - 8.5: Role permission change invalidation
   * 
   * @param roleId - Role ID
   */
  async invalidateRoleCache(roleId: string): Promise<void> {
    try {
      // Publish invalidation event
      await this.cache.publish(this.CACHE_INVALIDATION_CHANNEL, {
        type: 'role',
        roleId,
      });

      // Get all users with this role and clear their cache
      const userRoles = await this.prisma.userRole.findMany({
        where: { roleId },
        select: { userId: true },
      });

      for (const userRole of userRoles) {
        await this.cache.delPattern(`perm:${userRole.userId}:*`);
      }

      this.logger.debug(
        `Cache invalidated for ${userRoles.length} users with role: ${roleId}`,
      );
    } catch (error) {
      this.logger.error(`Error invalidating role cache:`, error);
      throw error;
    }
  }

  /**
   * Setup cache invalidation subscription
   */
  private setupCacheInvalidation(): void {
    this.cache.subscribe(
      this.CACHE_INVALIDATION_CHANNEL,
      async (message: any) => {
        try {
          if (message.type === 'user') {
            await this.cache.delPattern(`perm:${message.userId}:*`);
            this.logger.debug(`Invalidated cache for user: ${message.userId}`);
          } else if (message.type === 'role') {
            // For role changes, we need to invalidate cache for all users with that role
            const userRoles = await this.prisma.userRole.findMany({
              where: { roleId: message.roleId },
              select: { userId: true },
            });

            for (const userRole of userRoles) {
              await this.cache.delPattern(`perm:${userRole.userId}:*`);
            }

            this.logger.debug(
              `Invalidated cache for ${userRoles.length} users with role: ${message.roleId}`,
            );
          }
        } catch (error) {
          this.logger.error('Error handling cache invalidation:', error);
        }
      },
    );
  }
}
