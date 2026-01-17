import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

/**
 * Decorator to specify required permissions for a route
 * @param permissions - Permission(s) required to access this route
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);

/**
 * Alias for permission specification
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

