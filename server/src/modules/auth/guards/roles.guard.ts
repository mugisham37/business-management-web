import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Roles Guard
 * Validates that user has required role(s)
 * Used with @Roles() decorator to protect endpoints
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Handle both REST and GraphQL contexts
    const ctx = context.getType<string>();
    let user: any;

    if (ctx === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      user = gqlContext.getContext().req.user;
    } else {
      // For REST
      const request = context.switchToHttp().getRequest();
      user = request.user;
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `User role '${user.role}' does not have required role(s): ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
