import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark a route or resolver method as public (no authentication required)
 * Used in conjunction with JwtAuthGuard to bypass authentication for specific endpoints
 * 
 * @example
 * @Public()
 * @Query()
 * async publicQuery() {
 *   return 'accessible without authentication';
 * }
 */
export const Public = () => SetMetadata('isPublic', true);
