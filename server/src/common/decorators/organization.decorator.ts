import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Organization Decorator
 * 
 * Extracts organization ID from request context that was injected by
 * TenantIsolationMiddleware.
 * 
 * Usage in controllers:
 * ```typescript
 * @Get('/users')
 * async getUsers(@Organization() organizationId: string) {
 *   return this.usersService.findAll(organizationId);
 * }
 * ```
 * 
 * Requirements:
 * - 16.3: WHEN a JWT is validated, THE Auth_System SHALL extract and enforce 
 *   the organization context
 */
export const Organization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.organizationId;
  },
);
