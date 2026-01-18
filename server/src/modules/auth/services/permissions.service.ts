import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';
import { users, userPermissions } from '../../database/schema/user.schema';
import { userRoleEnum } from '../../database/schema/enums';
import { AuthEventsService } from './auth-events.service';
import { eq, and, inArray, isNull, gt } from 'drizzle-orm';

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
  role: typeof userRoleEnum.enumValues[number];
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
  ) {}

  /**
   * Get all permissions for a user (role-based + custom permissions)
   */
  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const db = this.drizzleService.getDb();

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

    if (existing.length > 0) {
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
  }
      ));
  }

  /**
   * Get all available permissions in the system
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
   * Get role permissions
   */
  getRolePermissions(role: string): string[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Get all roles with their permissions
   */
  getAllRoles(): RolePermissions[] {
    return Object.entries(this.rolePermissions).map(([role, permissions]) => ({
      role: role as any,
      permissions,
    }));
  }

  /**
   * Check if role is higher than another role
   */
  isRoleHigherThan(userRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      super_admin: 6,
      tenant_admin: 5,
      manager: 4,
      employee: 3,
      customer: 2,
      readonly: 1,
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

    return userLevel > targetLevel;
  }

  /**
   * Get users with specific permission
   */
  async getUsersWithPermission(
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string,
  ): Promise<string[]> {
    const db = this.drizzleService.getDb();

    // Get users with direct permission
    const directPermissions = await db
      .select({ userId: userPermissions.userId })
      .from(userPermissions)
      .where(and(
        eq(userPermissions.tenantId, tenantId),
        eq(userPermissions.permission, permission),
        resource ? eq(userPermissions.resource, resource) : isNull(userPermissions.resource),
        resourceId ? eq(userPermissions.resourceId, resourceId) : isNull(userPermissions.resourceId),
        eq(userPermissions.isActive, true),
        // Only include non-expired permissions
        isNull(userPermissions.expiresAt)
      ));

    // Get users with role-based permission
    const rolesWithPermission = Object.entries(this.rolePermissions)
      .filter(([_, permissions]) => permissions.includes(permission))
      .map(([role]) => role);

    const roleBasedUsers = rolesWithPermission.length > 0 ? await db
      .select({ userId: users.id })
      .from(users)
      .where(and(
        eq(users.tenantId, tenantId),
        eq(users.isActive, true),
        inArray(users.role, rolesWithPermission)
      )) : [];

    // Combine and deduplicate
    const allUserIds = [
      ...directPermissions.map(p => p.userId),
      ...roleBasedUsers.map(u => u.userId),
    ];

    return [...new Set(allUserIds)];
  }

  /**
   * Clean up expired permissions
   */
  async cleanupExpiredPermissions(): Promise<number> {
    const db = this.drizzleService.getDb();

    const result = await db
      .update(userPermissions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(
        eq(userPermissions.isActive, true),
        gt(new Date(), userPermissions.expiresAt!)
      ));

    return result.rowCount || 0;
  }

  /**
   * Get detailed user permissions with metadata
   */
  async getDetailedUserPermissions(userId: string, tenantId: string): Promise<Permission[]> {
    const db = this.drizzleService.getDb();

    const permissions = await db
      .select()
      .from(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.tenantId, tenantId),
        eq(userPermissions.isActive, true)
      ));

    return permissions.map(perm => ({
      id: perm.id,
      userId: perm.userId,
      permission: perm.permission,
      resource: perm.resource || undefined,
      resourceId: perm.resourceId || undefined,
      grantedBy: perm.grantedBy || undefined,
      grantedAt: perm.grantedAt,
      expiresAt: perm.expiresAt || undefined,
      isInherited: false,
    }));
  }

  /**
   * Get user role
   */
  async getUserRole(userId: string, tenantId: string): Promise<string> {
    const db = this.drizzleService.getDb();

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
  }

  /**
   * Create custom role
   */
  async createCustomRole(
    roleName: string,
    permissions: string[],
    tenantId: string,
    createdBy: string,
  ): Promise<void> {
    // For now, we'll store custom roles in a separate table or extend the enum
    // This is a placeholder for custom role functionality
    throw new Error('Custom roles not yet implemented - use predefined roles');
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(
    roleName: string,
    permissions: string[],
    tenantId: string,
    updatedBy: string,
  ): Promise<void> {
    // For now, role permissions are hardcoded in the service
    // This would require a custom roles table to implement
    throw new Error('Role permission updates not yet implemented - use predefined roles');
  }

  /**
   * Invalidate cache for all users with a specific role
   */
  async invalidateCacheForRole(
    roleName: string,
    tenantId: string,
    cacheService: any,
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    const usersWithRole = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.role, roleName as any),
        eq(users.tenantId, tenantId),
        eq(users.isActive, true)
      ));

    await Promise.all(
      usersWithRole.map(user => {
        const cacheKey = `permissions:${tenantId}:${user.id}`;
        return cacheService.del(cacheKey);
      })
    );
  }

  /**
   * Get all permissions (alias for getAllAvailablePermissions)
   */
  getAllPermissions(): string[] {
    return this.getAllAvailablePermissions();
  }
    const db = this.drizzleService.getDb();

    // Get user with role
    const [user] = await db
      .select({
        role: users.role,
        permissions: users.permissions,
        customPermissions: users.customPermissions,
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
    const rolePermissions = this.getRolePermissions(user.role);

    // Get custom permissions from user record
    const userCustomPermissions = Array.isArray(user.permissions) ? user.permissions : [];

    // Get granular permissions from userPermissions table
    const granularPermissions = await db
      .select({
        permission: userPermissions.permission,
        resource: userPermissions.resource,
        resourceId: userPermissions.resourceId,
        expiresAt: userPermissions.expiresAt,
      })
      .from(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.tenantId, tenantId)
      ));

    // Filter out expired permissions and format granular permissions
    const validGranularPermissions = granularPermissions
      .filter(p => !p.expiresAt || p.expiresAt > new Date())
      .map(p => {
        if (p.resource && p.resourceId) {
          return `${p.permission}:${p.resource}:${p.resourceId}`;
        } else if (p.resource) {
          return `${p.permission}:${p.resource}`;
        }
        return p.permission;
      });

    // Combine all permissions and remove duplicates
    const allPermissions = [
      ...rolePermissions,
      ...userCustomPermissions,
      ...validGranularPermissions,
    ];

    return [...new Set(allPermissions)];
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string,
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId);

    // Check for exact permission match
    const permissionToCheck = this.formatPermission(permission, resource, resourceId);
    if (userPermissions.includes(permissionToCheck)) {
      return true;
    }

    // Check for wildcard permissions
    const wildcardChecks = [
      `${permission}:*`,
      resource ? `${permission}:${resource}:*` : null,
      `*:${resource}:${resourceId}`,
      `*:${resource}:*`,
      '*',
    ].filter(Boolean);

    return wildcardChecks.some(wildcard => userPermissions.includes(wildcard!));
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    tenantId: string,
    permissions: string[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, tenantId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    tenantId: string,
    permissions: string[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, tenantId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Grant a permission to a user
   */
  async grantPermission(
    userId: string,
    tenantId: string,
    permission: string,
    grantedBy: string,
    options?: {
      resource?: string;
      resourceId?: string;
      expiresAt?: Date;
      conditions?: Record<string, any>;
    }
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    await db
      .insert(userPermissions)
      .values({
        tenantId,
        userId,
        permission,
        resource: options?.resource,
        resourceId: options?.resourceId,
        grantedBy,
        expiresAt: options?.expiresAt,
        conditions: options?.conditions || {},
        isInherited: false,
        createdBy: grantedBy,
        updatedBy: grantedBy,
      })
      .onConflictDoUpdate({
        target: [
          userPermissions.userId,
          userPermissions.permission,
          userPermissions.resource,
          userPermissions.resourceId,
        ],
        set: {
          grantedBy,
          grantedAt: new Date(),
          expiresAt: options?.expiresAt,
          conditions: options?.conditions || {},
          updatedAt: new Date(),
          updatedBy: grantedBy,
        },
      });
  }

  /**
   * Revoke a permission from a user
   */
  async revokePermission(
    userId: string,
    tenantId: string,
    permission: string,
    resource?: string,
    resourceId?: string
  ): Promise<void> {
    const db = this.drizzleService.getDb();

    await db
      .delete(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.tenantId, tenantId),
        eq(userPermissions.permission, permission),
        resource ? eq(userPermissions.resource, resource) : isNull(userPermissions.resource),
        resourceId ? eq(userPermissions.resourceId, resourceId) : isNull(userPermissions.resourceId)
      ));
  }

  /**
   * Get role-based permissions
   */
  getRolePermissions(role: typeof userRoleEnum.enumValues[number]): string[] {
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
   * Check if a role has higher privileges than another role
   */
  isRoleHigherThan(
    role1: typeof userRoleEnum.enumValues[number],
    role2: typeof userRoleEnum.enumValues[number]
  ): boolean {
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
}