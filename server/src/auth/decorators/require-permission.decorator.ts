import { SetMetadata } from '@nestjs/common';

/**
 * RequirePermission Decorator
 * 
 * Marks a route or resolver with required permissions.
 * Used in conjunction with PermissionGuard to enforce permission-based access control.
 * 
 * @param permissions - Array of permission strings in dot-notation format (module.resource.action)
 * 
 * @example
 * ```typescript
 * @RequirePermission('inventory.stock.view', 'inventory.stock.edit')
 * @Query(() => [Stock])
 * async getStock() {
 *   // Only users with both permissions can access this
 * }
 * ```
 * 
 * Note: Owners automatically bypass permission checks
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
