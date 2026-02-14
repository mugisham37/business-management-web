/**
 * Permission System
 * 
 * Provides permission checking functionality with support for:
 * - Exact permission matching
 * - Wildcard permission matching (e.g., "users.*" matches "users.create")
 * - OWNER role bypass (OWNER has all permissions)
 * - Route-based permission checking
 */

import { UserRole } from '../types/generated/graphql';

/**
 * Minimal user interface required for permission checking
 * Only requires role and permissions fields
 */
export interface PermissionUser {
  role: UserRole;
  permissions: string[];
}

/**
 * Interface for permission checking operations
 */
export interface PermissionChecker {
  /**
   * Check if the user has a specific permission
   * @param permission - The permission string to check (e.g., "users.create")
   * @returns true if user has the permission, false otherwise
   */
  hasPermission(permission: string): boolean;

  /**
   * Check if the user has any of the specified permissions
   * @param permissions - Array of permission strings
   * @returns true if user has at least one permission, false otherwise
   */
  hasAnyPermission(permissions: string[]): boolean;

  /**
   * Check if the user has all of the specified permissions
   * @param permissions - Array of permission strings
   * @returns true if user has all permissions, false otherwise
   */
  hasAllPermissions(permissions: string[]): boolean;

  /**
   * Check if the user can access a specific route
   * @param route - The route path to check
   * @returns true if user can access the route, false otherwise
   */
  canAccessRoute(route: string): boolean;
}

/**
 * Configuration for the permission system
 */
export interface PermissionSystemConfig {
  user: PermissionUser | null;
  routePermissions: Record<string, string[]>;
}

/**
 * Implementation of the PermissionChecker interface
 * 
 * Permission checking logic:
 * 1. OWNER role bypasses all permission checks (always returns true)
 * 2. Exact match: Check if user has the exact permission string
 * 3. Wildcard match: Check if user has a wildcard permission that matches
 *    - Example: "users.*" matches "users.create", "users.read", etc.
 *    - Example: "users.*.read" matches "users.profile.read", "users.settings.read"
 *    - Example: "*" matches all permissions (super admin)
 */
export class PermissionCheckerImpl implements PermissionChecker {
  constructor(
    private user: PermissionUser | null,
    private routePermissions: Record<string, string[]>
  ) {}

  /**
   * Check if the user has a specific permission
   * 
   * Algorithm:
   * 1. Return false if no user
   * 2. Return true if user is OWNER (bypasses all checks)
   * 3. Check for exact permission match
   * 4. Check for wildcard permission match by iterating through permission parts
   */
  hasPermission(permission: string): boolean {
    // No user means no permissions
    if (!this.user) return false;

    // OWNER role bypasses all permission checks
    if (this.user.role === UserRole.Owner) return true;

    const userPermissions = this.user.permissions;

    // Check exact match
    if (userPermissions.includes(permission)) return true;

    // Check wildcard match
    // Split permission into parts (e.g., "users.create" -> ["users", "create"])
    const parts = permission.split('.');

    // Try wildcard patterns from most specific to least specific
    // Example: "users.profile.read" checks:
    //   - "users.profile.*"
    //   - "users.*"
    //   - "*"
    for (let i = parts.length - 1; i >= 0; i--) {
      const wildcardPermission = [...parts.slice(0, i), '*'].join('.');
      if (userPermissions.includes(wildcardPermission)) return true;
    }

    // Check for super admin wildcard
    if (userPermissions.includes('*')) return true;

    return false;
  }

  /**
   * Check if the user has any of the specified permissions
   * Returns true if at least one permission matches
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  /**
   * Check if the user has all of the specified permissions
   * Returns true only if all permissions match
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  /**
   * Check if the user can access a specific route
   * 
   * Logic:
   * 1. If route has no permission requirements, allow access
   * 2. If route has permission requirements, check if user has any of them
   */
  canAccessRoute(route: string): boolean {
    const requiredPermissions = this.routePermissions[route];

    // No permission requirements means public route
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Check if user has any of the required permissions
    return this.hasAnyPermission(requiredPermissions);
  }
}

/**
 * Factory function to create a PermissionChecker instance
 * @param config - Configuration containing user and route permissions
 * @returns PermissionChecker instance
 */
export function createPermissionChecker(
  config: PermissionSystemConfig
): PermissionChecker {
  return new PermissionCheckerImpl(config.user, config.routePermissions);
}
