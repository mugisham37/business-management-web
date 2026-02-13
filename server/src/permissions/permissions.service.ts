import {
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { PermissionRegistry } from './permission-registry';
import { UserRole } from '@prisma/client';

export interface ValidationResult {
  valid: boolean;
  missingPermissions: string[];
}

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly tenantContextService: TenantContextService,
    private readonly permissionRegistry: PermissionRegistry,
  ) {}

  /**
   * Assign permissions to a user with hierarchical validation
   * @param grantorId - ID of the user granting permissions
   * @param granteeId - ID of the user receiving permissions
   * @param permissions - Array of permission keys to assign
   */
  async assignPermissions(
    grantorId: string,
    granteeId: string,
    permissions: string[],
  ): Promise<void> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Get grantor user to check role
    const grantor = await this.prisma.user.findUnique({
      where: { id: grantorId },
      select: { id: true, role: true, organizationId: true },
    });

    if (!grantor) {
      throw new NotFoundException('Grantor user not found');
    }

    // Get grantee user
    const grantee = await this.prisma.user.findUnique({
      where: { id: granteeId },
      select: { id: true, organizationId: true },
    });

    if (!grantee) {
      throw new NotFoundException('Grantee user not found');
    }

    // Ensure both users are in the same organization
    if (grantor.organizationId !== grantee.organizationId) {
      throw new ForbiddenException('Cannot assign permissions across organizations');
    }

    // Resolve wildcards to concrete permissions
    const concretePermissions = this.resolvePermissions(permissions);

    // Validate permissions exist in registry
    for (const permission of concretePermissions) {
      if (!this.permissionRegistry.hasPermission(permission)) {
        throw new BadRequestException(
          `Permission "${permission}" does not exist in registry`,
        );
      }
    }

    // If grantor is not an Owner, validate they have all permissions they're trying to grant
    if (grantor.role !== UserRole.OWNER) {
      const validation = await this.validatePermissionGrant(
        grantorId,
        concretePermissions,
      );

      if (!validation.valid) {
        throw new ForbiddenException(
          `Cannot grant permissions you don't possess: ${validation.missingPermissions.join(', ')}`,
        );
      }
    }

    // Create UserPermission records
    const permissionRecords = concretePermissions.map((permission) => ({
      userId: granteeId,
      organizationId: context.organizationId,
      permission,
      grantedById: grantorId,
    }));

    // Use createMany with skipDuplicates to avoid errors on existing permissions
    await this.prisma.userPermission.createMany({
      data: permissionRecords,
      skipDuplicates: true,
    });

    // Invalidate grantee's permission cache
    await this.invalidateUserPermissions(granteeId);

    this.logger.log(
      `User ${grantorId} assigned ${concretePermissions.length} permissions to user ${granteeId}`,
    );
  }

  /**
   * Revoke permissions from a user
   * @param grantorId - ID of the user revoking permissions
   * @param granteeId - ID of the user losing permissions
   * @param permissions - Array of permission keys to revoke
   */
  async revokePermissions(
    grantorId: string,
    granteeId: string,
    permissions: string[],
  ): Promise<void> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Get grantor user to check role
    const grantor = await this.prisma.user.findUnique({
      where: { id: grantorId },
      select: { id: true, role: true, organizationId: true },
    });

    if (!grantor) {
      throw new NotFoundException('Grantor user not found');
    }

    // Resolve wildcards to concrete permissions
    const concretePermissions = this.resolvePermissions(permissions);

    // Delete UserPermission records
    await this.prisma.userPermission.deleteMany({
      where: {
        userId: granteeId,
        organizationId: context.organizationId,
        permission: { in: concretePermissions },
      },
    });

    // Invalidate grantee's permission cache
    await this.invalidateUserPermissions(granteeId);

    // If grantor is a Manager, check if subordinates need cache invalidation
    if (grantor.role === UserRole.MANAGER) {
      await this.invalidateSubordinatePermissions(grantorId);
    }

    this.logger.log(
      `User ${grantorId} revoked ${concretePermissions.length} permissions from user ${granteeId}`,
    );
  }

  /**
   * Get all permissions for a user with caching
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Array of permission keys
   */
  async getUserPermissions(
    userId: string,
    organizationId: string,
  ): Promise<string[]> {
    // Get user to check role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Owners have all permissions without DB lookup
    if (user.role === UserRole.OWNER) {
      return this.permissionRegistry
        .getAvailablePermissions()
        .map((p) => p.key);
    }

    // Try to get from cache first
    const cachedPermissions = await this.cacheService.getCachedPermissions(
      userId,
      organizationId,
    );

    if (cachedPermissions) {
      return cachedPermissions;
    }

    // Load from database
    const userPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        organizationId,
      },
      select: { permission: true },
    });

    const permissions = userPermissions.map((up) => up.permission);

    // Cache for 1 hour
    await this.cacheService.cacheUserPermissions(
      userId,
      organizationId,
      permissions,
    );

    return permissions;
  }

  /**
   * Check if user has a specific permission
   * @param userId - User ID
   * @param permission - Permission key to check
   * @returns True if user has the permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    const userPermissions = await this.getUserPermissions(
      userId,
      context.organizationId,
    );

    // Check for exact match or wildcard match
    return (
      userPermissions.includes(permission) ||
      this.hasWildcardMatch(permission, userPermissions)
    );
  }

  /**
   * Check if user has all specified permissions
   * @param userId - User ID
   * @param permissions - Array of permission keys to check
   * @returns True if user has all permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    const userPermissions = await this.getUserPermissions(
      userId,
      context.organizationId,
    );

    for (const permission of permissions) {
      const hasIt =
        userPermissions.includes(permission) ||
        this.hasWildcardMatch(permission, userPermissions);

      if (!hasIt) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user has any of the specified permissions
   * @param userId - User ID
   * @param permissions - Array of permission keys to check
   * @returns True if user has at least one permission
   */
  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    const userPermissions = await this.getUserPermissions(
      userId,
      context.organizationId,
    );

    for (const permission of permissions) {
      const hasIt =
        userPermissions.includes(permission) ||
        this.hasWildcardMatch(permission, userPermissions);

      if (hasIt) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate if a Manager can grant specific permissions
   * @param grantorId - ID of the Manager
   * @param permissions - Permissions to validate
   * @returns Validation result with missing permissions
   */
  async validatePermissionGrant(
    grantorId: string,
    permissions: string[],
  ): Promise<ValidationResult> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    const grantorPermissions = await this.getUserPermissions(
      grantorId,
      context.organizationId,
    );

    const missingPermissions: string[] = [];

    for (const permission of permissions) {
      const hasIt =
        grantorPermissions.includes(permission) ||
        this.hasWildcardMatch(permission, grantorPermissions);

      if (!hasIt) {
        missingPermissions.push(permission);
      }
    }

    return {
      valid: missingPermissions.length === 0,
      missingPermissions,
    };
  }

  /**
   * Invalidate a user's permission cache
   * @param userId - User ID
   */
  async invalidateUserPermissions(userId: string): Promise<void> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    await this.cacheService.invalidatePermissions(
      userId,
      context.organizationId,
    );
  }

  /**
   * Invalidate permission cache for all subordinates of a Manager
   * @param managerId - Manager's user ID
   */
  async invalidateSubordinatePermissions(managerId: string): Promise<void> {
    const context = this.tenantContextService.getTenantContext();
    if (!context) {
      throw new Error('Tenant context not set');
    }

    // Get all subordinates (users created by this manager)
    const subordinates = await this.prisma.user.findMany({
      where: {
        createdById: managerId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    // Invalidate cache for each subordinate
    for (const subordinate of subordinates) {
      await this.cacheService.invalidatePermissions(
        subordinate.id,
        context.organizationId,
      );
    }

    this.logger.log(
      `Invalidated permission cache for ${subordinates.length} subordinates of manager ${managerId}`,
    );
  }

  /**
   * Resolve wildcard patterns to concrete permissions
   * @param permissions - Array of permission keys (may include wildcards)
   * @returns Array of concrete permission keys
   */
  private resolvePermissions(permissions: string[]): string[] {
    const resolved = new Set<string>();

    for (const permission of permissions) {
      if (permission.includes('*')) {
        // Resolve wildcard
        const concretePerms = this.permissionRegistry.resolveWildcard(permission);
        concretePerms.forEach((p) => resolved.add(p));
      } else {
        resolved.add(permission);
      }
    }

    return Array.from(resolved);
  }

  /**
   * Check if a permission matches any wildcard patterns in user's permissions
   * @param permission - Permission to check
   * @param userPermissions - User's permission list
   * @returns True if there's a wildcard match
   */
  private hasWildcardMatch(
    permission: string,
    userPermissions: string[],
  ): boolean {
    for (const userPerm of userPermissions) {
      if (userPerm.includes('*')) {
        // Check if permission matches the wildcard pattern
        const pattern = userPerm.replace('*', '');
        if (permission.startsWith(pattern)) {
          return true;
        }
      }
    }

    return false;
  }
}
