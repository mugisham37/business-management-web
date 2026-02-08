import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current User Decorator
 * 
 * Extracts user information from request context that was injected by
 * TenantIsolationMiddleware.
 * 
 * Usage in controllers:
 * ```typescript
 * @Get('/profile')
 * async getProfile(@CurrentUser() user: CurrentUserInfo) {
 *   return this.usersService.findById(user.id, user.organizationId);
 * }
 * ```
 * 
 * Requirements:
 * - 3.4: WHEN authentication succeeds, THE Auth_System SHALL return a JWT 
 *   containing user ID, organization ID, and embedded permissions
 */
export interface CurrentUserInfo {
  id: string;
  email: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return {
      id: request.userId,
      email: request.userEmail,
      organizationId: request.organizationId,
      roles: request.userRoles || [],
      permissions: request.userPermissions || [],
    };
  },
);
