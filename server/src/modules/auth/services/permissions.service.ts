import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { users, userPermissions } from '../../database/schema';
import { AuthEventsService } from './auth-events.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { eq, and, inArray, isNull } from 'drizzle-orm';

export interface Permission {
  id: string;
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  grantedBy?: string;
  grantedAt: Date;
  expiresAt?: Date;
  conditions?: Record<string, any>;
  isInherited: boolean;
}

export interface RolePermissions {
  role: string;
  permissions: string[];
}

@Injectable()
export class PermissionsService {
  // Define role-based permissions hierarchy
  private readonly rolePermissions: Record<string, string[]> = {
    super_admin: [
      // Platform-wide permissions
      'platform:*',
      'tenants:*',
      'users:*',
      'system:*',
    ],
    tenant_admin: [
      // Tenant-wide permissions
      'tenant:manage',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'roles:manage',
      'permissions:manage',
      'settings:manage',
      'reports:read',
      'analytics:read',
      'pos:*',
      'inventory:*',
      'customers:*',
      'employees:*',
      'financial:*',
      'suppliers:*',
    ],
    manager: [
      // Management permissions
      'users:read',
      'users:update',
      'employees:manage',
      'reports:read',
      'analytics:read',
      'pos:*',
      'inventory:manage',
      'customers:manage',
      'financial:read',
      'suppliers:read',
    ],
    employee: [
      // Basic employee permissions
      'pos:create',
      'pos:read',
      'inventory:read',
      'customers:read',
      'customers:create',
      'customers:update',
      'profile:read',
      'profile:update',
    ],
    customer: [
      // Customer permissions
      'profile:read',
      'profile:update',
      'orders:read',
      'loyalty:read',
    ],
    readonly: [
      // Read-only permissions
      'pos:read',
      'inventory:read',
      'customers:read',
      'reports:read',
    ],
  };

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly authEventsService: AuthEventsService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('PermissionsService');
  }

  /**
   * Get all permissions for a user (role-based + custom permissions)
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const db = this.drizzleService.getDb();

    try {
      // Get user with role
      const [user] = await db
        .select({
          role: users.role,
        })
        .from(users)
        .where(and(
          eq(users.id, userId),
          eq(users.tenantId, tenantId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (!user) {
        return [];
      }

      // Get role-based permissions
      const rolePermissions = this.rolePermissions[user.role] || [];

      // Get custom permissions
      const customPermissions = await db
        .select({
          permission: userPermissions.permission,
          resource: userPermissions.resource,
          resourceId: userPermissions.resourceId,
          expiresAt: userPermissions.expiresAt,
        })
        .from(userPermissions)
        .where(and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.tenantId, tenantId),
          eq(userPermissions.isActive, true),
          // Only include non-expired permissions
          isNull(userPermissions.expiresAt) // No expiration
        ));

      // Filter out expired permissions
      const validCustomPermissions = customPermissions.filter(perm => 
        !perm.expiresAt || perm.expiresAt > new Date()
      );

      // Combine role and custom permissions
      const allPermissions = [
        ...rolePermissions,
        ...validCustomPermissions.map(perm => {
          if (perm.resource && perm.resourceId) {
            return `${perm.permission}:${perm.resource}:${perm.resourceId}`;
          } else if (perm.resource) {
            return `${perm.permission}:${perm.resource}`;
          }
          return perm.permission;
        })
      ];

      // Remove duplicates and return
      return [...new Set(allPermissions)];
    } catch (error) {
      this.logger.error('Failed to get user permissions', { userId, tenantId, error: error.message });
      return [];
    }
  }

  /**
   * Check if user has a specific permission (supports wildcards)
   */
  hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Direct match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for wildcard permissions
    for (const permission of userPermissions) {
      if (this.matchesWildcard(permission, requiredPermission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match wildcard permissions
   */
  private matchesWildcard(wildcardPermission: string, specificPermission: string): boolean {
    // Convert wildcard to regex pattern
    const pattern = wildcardPermission
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(specificPermission);
  }

  /**
   * Check if user has a specific permission (async - fetches from DB)
   */
  async checkUserPermission(
    userId: string,
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string
  ): Promise<boolean> {
    const userPermissionsList = await this.getUserPermissions(userId, tenantId);

    // Check for exact permission match
    const permissionToCheck = this.formatPermission(permission, resource, resourceId);
    if (userPermissionsList.includes(permissionToCheck)) {
      return true;
    }

    // Check for wildcard permissions using the sync hasPermission
    return this.hasPermission(userPermissionsList, permission);
  }

  /**
   * Format permission string
   */
  private formatPermission(permission: string, resource?: string, resourceId?: string): string {
    if (resource && resourceId) {
      return `${permission}:${resource}:${resourceId}`;
    } else if (resource) {
      return `${permission}:${resource}`;
    }
    return permission;
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string,
    expiresAt?: Date,
    grantedBy?: string,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    try {
      // Check if permission already exists
      const existing = await db
        .select()
        .from(userPermissions)
        .where(and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.tenantId, tenantId),
          eq(userPermissions.permission, permission),
          resource ? eq(userPermissions.resource, resource) : isNull(userPermissions.resource),
          resourceId ? eq(userPermissions.resourceId, resourceId) : isNull(userPermissions.resourceId)
        ))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        // Update existing permission
        await db
          .update(userPermissions)
          .set({
            expiresAt,
            grantedBy,
            isActive: true,
            updatedAt: new Date(),
            updatedBy: grantedBy,
          })
          .where(eq(userPermissions.id, existing[0].id));
      } else {
        // Create new permission
        await db
          .insert(userPermissions)
          .values({
            userId,
            tenantId,
            permission,
            resource,
            resourceId,
            expiresAt,
            grantedBy,
            grantedAt: new Date(),
            isActive: true,
            createdBy: grantedBy,
            updatedBy: grantedBy,
          });
      }

      // Publish permission granted event
      await this.authEventsService.publishPermissionGranted(
        userId,
        tenantId,
        permission,
        grantedBy || 'system',
        resource,
        resourceId,
      );

      this.logger.log('Permission granted', { userId, tenantId, permission, resource, resourceId });
    } catch (error) {
      this.logger.error('Failed to grant permission', { userId, tenantId, permission, error: error.message });
      throw error;
    }
  }

  /**
   * Revoke permission from user
   */
  async revokePermission(
    userId: string,
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    try {
      await db
        .update(userPermissions)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.tenantId, tenantId),
          eq(userPermissions.permission, permission),
          resource ? eq(userPermissions.resource, resource) : isNull(userPermissions.resource),
          resourceId ? eq(userPermissions.resourceId, resourceId) : isNull(userPermissions.resourceId)
        ));

      // Publish permission revoked event
      await this.authEventsService.publishPermissionRevoked(
        userId,
        tenantId,
        permission,
        'system', // We don't have revokedBy parameter, could be added
        resource,
        resourceId,
      );

      this.logger.log('Permission revoked', { userId, tenantId, permission, resource, resourceId });
    } catch (error) {
      this.logger.error('Failed to revoke permission', { userId, tenantId, permission, error: error.message });
      throw error;
    }
  }

  /**
   * Get role-based permissions
   */
  getRolePermissions(role: string): string[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): string[] {
    const allPermissions = new Set<string>();
    
    Object.values(this.rolePermissions).forEach(permissions => {
      permissions.forEach(permission => allPermissions.add(permission));
    });

    return Array.from(allPermissions);
  }

  /**
   * Get all available permissions in the system (with resources and actions)
   */
  getAllAvailablePermissions(): string[] {
    const allPermissions = new Set<string>();

    // Add role-based permissions
    Object.values(this.rolePermissions).forEach(permissions => {
      permissions.forEach(permission => allPermissions.add(permission));
    });

    // Add common granular permissions
    const resources = ['users', 'pos', 'inventory', 'customers', 'employees', 'financial', 'suppliers', 'reports', 'analytics', 'settings'];
    const actions = ['create', 'read', 'update', 'delete', 'manage'];

    resources.forEach(resource => {
      actions.forEach(action => {
        allPermissions.add(`${resource}:${action}`);
      });
    });

    return Array.from(allPermissions).sort();
  }

  /**
   * Check if a role has higher privileges than another role
   */
  isRoleHigherThan(role1: string, role2: string): boolean {
    const roleHierarchy = {
      super_admin: 6,
      tenant_admin: 5,
      manager: 4,
      employee: 3,
      customer: 2,
      readonly: 1,
    };

    return (roleHierarchy[role1] || 0) > (roleHierarchy[role2] || 0);
  }

  /**
   * Get users with a specific permission
   */
  async getUsersWithPermission(
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string
  ): Promise<string[]> {
    const db = this.drizzleService.getDb();

    try {
      // Get users with the permission directly granted
      const directPermissions = await db
        .select({ userId: userPermissions.userId })
        .from(userPermissions)
        .where(and(
          eq(userPermissions.tenantId, tenantId),
          eq(userPermissions.permission, permission),
          resource ? eq(userPermissions.resource, resource) : isNull(userPermissions.resource),
          resourceId ? eq(userPermissions.resourceId, resourceId) : isNull(userPermissions.resourceId)
        ));

      // Get users with roles that include this permission
      const rolesWithPermission = Object.entries(this.rolePermissions)
        .filter(([_, permissions]) => 
          permissions.includes(permission) || 
          permissions.includes(`${permission}:*`) ||
          permissions.includes('*')
        )
        .map(([role]) => role);

      const roleBasedUsers = rolesWithPermission.length > 0 
        ? await db
            .select({ userId: users.id })
            .from(users)
            .where(and(
              eq(users.tenantId, tenantId),
              eq(users.isActive, true),
              inArray(users.role, rolesWithPermission as any)
            ))
        : [];

      // Combine and deduplicate
      const allUserIds = [
        ...directPermissions.map(p => p.userId),
        ...roleBasedUsers.map(u => u.userId),
      ];

      return [...new Set(allUserIds)];
    } catch (error) {
      this.logger.error('Failed to get users with permission', { tenantId, permission, error: error.message });
      return [];
    }
  }

  /**
   * Get detailed user permissions with metadata
   */
  async getDetailedUserPermissions(userId: string, tenantId: string): Promise<Permission[]> {
    const db = this.drizzleService.getDb();

    try {
      const permissions = await db
        .select()
        .from(userPermissions)
        .where(and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.tenantId, tenantId),
          eq(userPermissions.isActive, true)
        ));

      return permissions.map(perm => {
        const result: Permission = {
          id: perm.id,
          userId: perm.userId,
          permission: perm.permission,
          grantedAt: perm.grantedAt ?? new Date(),
          isInherited: false,
        };
        if (perm.resource) result.resource = perm.resource;
        if (perm.resourceId) result.resourceId = perm.resourceId;
        if (perm.grantedBy) result.grantedBy = perm.grantedBy;
        if (perm.expiresAt) result.expiresAt = perm.expiresAt;
        if (perm.conditions) result.conditions = perm.conditions;
        return result;
      });
    } catch (error) {
      this.logger.error('Failed to get detailed user permissions', { userId, tenantId, error: error.message });
      return [];
    }
  }

  /**
   * Get user role
   */
  async getUserRole(userId: string, tenantId: string): Promise<string> {
    const db = this.drizzleService.getDb();

    try {
      const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(and(
          eq(users.id, userId),
          eq(users.tenantId, tenantId),
          eq(users.isActive, true)
        ))
        .limit(1);

      return user?.role || 'readonly';
    } catch (error) {
      this.logger.error('Failed to get user role', { userId, tenantId, error: error.message });
      return 'readonly';
    }
  }
}