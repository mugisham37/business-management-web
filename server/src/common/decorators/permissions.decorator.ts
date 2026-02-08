import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for permissions decorator
 * This key is used by PermissionsGuard to extract required permissions
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Decorator
 * 
 * Sets metadata for PermissionsGuard to enforce permission-based access control.
 * This decorator should be used in combination with JwtAuthGuard and PermissionsGuard.
 * 
 * Requirements:
 * - 7.3: WHEN evaluating permissions, THE Permission_Engine SHALL check direct 
 *   permission grants first, then role-based permissions
 * 
 * Usage in controllers:
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('users:create:user', 'users:read:user')
 * @Post('/users')
 * async createUser(@Body() dto: CreateUserDto) {
 *   return this.usersService.create(dto);
 * }
 * ```
 * 
 * @param permissions - One or more permission strings in format 'module:action:resource'
 * @returns Method decorator that sets permissions metadata
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
