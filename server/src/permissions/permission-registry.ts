import { Injectable, BadRequestException } from '@nestjs/common';

export interface PermissionDefinition {
  key: string; // e.g., "inventory.stock.view"
  module: string; // e.g., "inventory"
  resource: string; // e.g., "stock"
  action: string; // e.g., "view"
  description: string;
}

@Injectable()
export class PermissionRegistry {
  private permissions: Map<string, PermissionDefinition> = new Map();

  /**
   * Register permissions for a module
   * @param module - Module name
   * @param permissions - Array of permission definitions
   */
  registerModulePermissions(
    module: string,
    permissions: PermissionDefinition[],
  ): void {
    for (const permission of permissions) {
      // Validate dot-notation format
      this.validatePermissionFormat(permission.key);

      // Ensure the permission key matches the module
      if (!permission.key.startsWith(`${module}.`)) {
        throw new BadRequestException(
          `Permission key "${permission.key}" must start with module name "${module}"`,
        );
      }

      // Store the permission
      this.permissions.set(permission.key, permission);
    }
  }

  /**
   * Get all available permissions
   * @returns Array of all registered permission definitions
   */
  getAvailablePermissions(): PermissionDefinition[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Get permissions for a specific module
   * @param module - Module name
   * @returns Array of permission definitions for the module
   */
  getModulePermissions(module: string): PermissionDefinition[] {
    return Array.from(this.permissions.values()).filter(
      (p) => p.module === module,
    );
  }

  /**
   * Check if a permission exists in the registry
   * @param permissionKey - Permission key to check
   * @returns True if permission exists
   */
  hasPermission(permissionKey: string): boolean {
    // Handle wildcard patterns
    if (permissionKey.includes('*')) {
      return this.resolveWildcard(permissionKey).length > 0;
    }
    return this.permissions.has(permissionKey);
  }

  /**
   * Resolve wildcard patterns to concrete permissions
   * @param pattern - Wildcard pattern (e.g., "inventory.*")
   * @returns Array of matching permission keys
   */
  resolveWildcard(pattern: string): string[] {
    // Validate pattern format
    this.validatePermissionFormat(pattern);

    const parts = pattern.split('.');
    const matchedPermissions: string[] = [];

    for (const [key] of this.permissions) {
      const keyParts = key.split('.');

      // Check if the pattern matches
      let matches = true;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '*') {
          // Wildcard matches anything at this position and beyond
          break;
        }
        if (parts[i] !== keyParts[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        matchedPermissions.push(key);
      }
    }

    return matchedPermissions;
  }

  /**
   * Validate permission format (module.resource.action)
   * @param permissionKey - Permission key to validate
   * @throws BadRequestException if format is invalid
   */
  private validatePermissionFormat(permissionKey: string): void {
    // Must have at least 2 dots (3 parts) or end with wildcard
    const parts = permissionKey.split('.');

    if (parts.length < 2) {
      throw new BadRequestException(
        `Invalid permission format: "${permissionKey}". Expected format: module.resource.action or module.*`,
      );
    }

    // Each part must be non-empty (except wildcard)
    for (const part of parts) {
      if (part !== '*' && part.trim() === '') {
        throw new BadRequestException(
          `Invalid permission format: "${permissionKey}". Parts cannot be empty`,
        );
      }
    }

    // Wildcard can only be at the end
    const wildcardIndex = parts.indexOf('*');
    if (wildcardIndex !== -1 && wildcardIndex !== parts.length - 1) {
      throw new BadRequestException(
        `Invalid permission format: "${permissionKey}". Wildcard (*) can only be at the end`,
      );
    }
  }

  /**
   * Get permission definition by key
   * @param permissionKey - Permission key
   * @returns Permission definition or undefined
   */
  getPermission(permissionKey: string): PermissionDefinition | undefined {
    return this.permissions.get(permissionKey);
  }

  /**
   * Clear all registered permissions (useful for testing)
   */
  clear(): void {
    this.permissions.clear();
  }
}
