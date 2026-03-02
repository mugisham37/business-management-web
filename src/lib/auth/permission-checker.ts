import { tokenManager, TokenPayload } from './token-manager';

/**
 * Permission Module Types
 * Represents different modules in the system
 */
export type PermissionModule = 
  | 'users' 
  | 'permissions' 
  | 'organizations' 
  | 'branches' 
  | 'departments' 
  | 'business_rules' 
  | 'audit_logs' 
  | 'reports';

/**
 * Permission Action Types
 * Represents actions that can be performed on modules
 */
export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage';

/**
 * Permission Checker
 * 
 * Provides permission checking utilities with caching for performance:
 * - Decodes permissions from JWT token
 * - Checks single, any, or all permissions
 * - Validates permission fingerprint
 * - Caches permission checks for 1 minute
 * 
 * Requirements: 4.3
 */
class PermissionChecker {
  private permissionCache: Map<string, boolean> = new Map();
  private cacheTimeout = 60000; // 1 minute

  /**
   * Check if user has a specific permission
   * Results are cached for 1 minute for performance
   * 
   * @param module - The module to check permission for
   * @param action - The action to check permission for
   * @returns true if user has the permission, false otherwise
   */
  hasPermission(module: PermissionModule, action: PermissionAction): boolean {
    const cacheKey = `${module}:${action}`;
    
    // Check cache first
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    // Get token payload
    const payload = tokenManager.decodeToken();
    if (!payload) return false;

    // Check if permission exists in token
    const permissionString = `${module}:${action}`;
    const hasPermission = payload.permissions.includes(permissionString);

    // Cache the result
    this.permissionCache.set(cacheKey, hasPermission);
    setTimeout(() => this.permissionCache.delete(cacheKey), this.cacheTimeout);

    return hasPermission;
  }

  /**
   * Check if user has any of the specified permissions
   * 
   * @param permissions - Array of [module, action] tuples to check
   * @returns true if user has at least one of the permissions
   */
  hasAnyPermission(permissions: Array<[PermissionModule, PermissionAction]>): boolean {
    return permissions.some(([module, action]) => this.hasPermission(module, action));
  }

  /**
   * Check if user has all of the specified permissions
   * 
   * @param permissions - Array of [module, action] tuples to check
   * @returns true if user has all of the permissions
   */
  hasAllPermissions(permissions: Array<[PermissionModule, PermissionAction]>): boolean {
    return permissions.every(([module, action]) => this.hasPermission(module, action));
  }

  /**
   * Get user's hierarchy level from token
   * 
   * @returns Hierarchy level (0 = lowest), or 0 if no token
   */
  getHierarchyLevel(): number {
    const payload = tokenManager.decodeToken();
    return payload?.hierarchyLevel ?? 0;
  }

  /**
   * Validate permission fingerprint against token
   * Used to detect permission changes that require re-authentication
   * 
   * @param expectedFingerprint - The fingerprint to validate against
   * @returns true if fingerprint matches, false otherwise
   */
  validateFingerprint(expectedFingerprint: string): boolean {
    const payload = tokenManager.decodeToken();
    if (!payload) return false;

    return payload.fingerprint === expectedFingerprint;
  }

  /**
   * Clear permission cache
   * Should be called when permissions change
   */
  clearCache(): void {
    this.permissionCache.clear();
  }
}

/**
 * Singleton instance of PermissionChecker
 * Use this instance throughout the application
 */
export const permissionChecker = new PermissionChecker();
