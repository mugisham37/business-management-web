import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to require specific permissions for a route
 * @param permissions Permission strings required (user must have ALL of these permissions)
 */
export const Permissions = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);
