import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Roles Guard
 * 
 * Validates that the authenticated user has one of the required roles
 * to access a specific resource or perform an action.
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'manager')
 * async getUsers() { ... }
 * 
 * Features:
 * - Supports multiple role requirements (OR logic)
 * - Role hierarchy support (higher roles can access lower role resources)
 * - Works with both HTTP and GraphQL contexts
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Define role hierarchy (higher number = higher privilege)
  private readonly roleHierarchy: Record<string, number> = {
    super_admin: 6,
    tenant_admin: 5,
    manager: 4,
    employee: 3,
    customer: 2,
    readonly: 1,
  };

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from context
    const user = this.getUserFromContext(context);
    if (!user || !user.role) {
      return false;
    }

    // Check if user has any of the required roles (OR logic)
    for (const requiredRole of requiredRoles) {
      if (this.hasRole(user.role, requiredRole)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if user role satisfies the required role
   * Supports role hierarchy (higher roles can access lower role resources)
   */
  private hasRole(userRole: string, requiredRole: string): boolean {
    // Direct role match
    if (userRole === requiredRole) {
      return true;
    }

    // Check role hierarchy
    const userRoleLevel = this.roleHierarchy[userRole] || 0;
    const requiredRoleLevel = this.roleHierarchy[requiredRole] || 0;

    // User role must be equal or higher than required role
    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Extract user from execution context (supports both HTTP and GraphQL)
   */
  private getUserFromContext(context: ExecutionContext): AuthenticatedUser | null {
    try {
      // Try GraphQL context first
      const gqlContext = GqlExecutionContext.create(context);
      const gqlUser = gqlContext.getContext()?.req?.user;
      if (gqlUser) {
        return gqlUser;
      }

      // Fallback to HTTP context
      const request = context.switchToHttp().getRequest();
      return request?.user || null;
    } catch (error) {
      return null;
    }
  }
}