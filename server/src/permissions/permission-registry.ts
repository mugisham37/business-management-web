import { Injectable, BadRequestException } from '@nestjs/common';

export interface PermissionDefinition {
  key: string; // e.g., "inventory.stock.view"
  module: string; // e.g., "inventory"
  resource: string; // e.g., "stock"
  action: string; // e.g., "view"
  description: string;
  deprecated?: boolean; // Mark permission as deprecated
  deprecationMessage?: string; // Warning message for deprecated permissions
}

export interface ModuleDefinition {
  name: string;
  enabled: boolean;
  permissions: PermissionDefinition[];
}

@Injectable()
export class PermissionRegistry {
  private permissions: Map<string, PermissionDefinition> = new Map();
  private modules: Map<string, ModuleDefinition> = new Map();
  private readonly logger = new (require('@nestjs/common').Logger)(PermissionRegistry.name);

  /**
   * Register permissions for a module
   * @param module - Module name
   * @param permissions - Array of permission definitions
   * @param enabled - Whether the module is enabled (default: true)
   */
  registerModulePermissions(
    module: string,
    permissions: PermissionDefinition[],
    enabled: boolean = true,
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

    // Store module definition
    this.modules.set(module, {
      name: module,
      enabled,
      permissions,
    });
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
    this.modules.clear();
  }

  /**
   * Enable a module
   * @param moduleName - Module name to enable
   */
  enableModule(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (module) {
      module.enabled = true;
      this.logger.log(`Module "${moduleName}" enabled`);
    }
  }

  /**
   * Disable a module
   * @param moduleName - Module name to disable
   */
  disableModule(moduleName: string): void {
    const module = this.modules.get(moduleName);
    if (module) {
      module.enabled = false;
      this.logger.log(`Module "${moduleName}" disabled`);
    }
  }

  /**
   * Check if a module is enabled
   * @param moduleName - Module name to check
   * @returns True if module is enabled
   */
  isModuleEnabled(moduleName: string): boolean {
    const module = this.modules.get(moduleName);
    return module ? module.enabled : false;
  }

  /**
   * Check if a permission is from a disabled module
   * @param permissionKey - Permission key to check
   * @returns True if permission is from a disabled module
   */
  isPermissionDisabled(permissionKey: string): boolean {
    const parts = permissionKey.split('.');
    if (parts.length < 2) return false;
    
    const moduleName = parts[0];
    return !this.isModuleEnabled(moduleName);
  }

  /**
   * Check if a permission is deprecated
   * @param permissionKey - Permission key to check
   * @returns Deprecation info or null
   */
  getDeprecationInfo(permissionKey: string): { deprecated: boolean; message?: string } {
    const permission = this.permissions.get(permissionKey);
    if (!permission) {
      return { deprecated: false };
    }
    
    return {
      deprecated: permission.deprecated || false,
      message: permission.deprecationMessage,
    };
  }

  /**
   * Get all permissions grouped by module
   * @returns Map of module name to permissions
   */
  getPermissionsByModule(): Map<string, PermissionDefinition[]> {
    const grouped = new Map<string, PermissionDefinition[]>();
    
    for (const permission of this.permissions.values()) {
      const existing = grouped.get(permission.module) || [];
      existing.push(permission);
      grouped.set(permission.module, existing);
    }
    
    return grouped;
  }

  /**
   * Get all registered modules
   * @returns Array of module definitions
   */
  getModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get permissions for selected modules
   * @param moduleNames - Array of module names
   * @returns Array of permission keys for the selected modules
   */
  getPermissionsForModules(moduleNames: string[]): string[] {
    const permissions: string[] = [];
    
    for (const moduleName of moduleNames) {
      const module = this.modules.get(moduleName);
      if (module && module.enabled) {
        permissions.push(...module.permissions.map(p => p.key));
      }
    }
    
    return permissions;
  }
}
