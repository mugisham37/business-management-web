import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { PermissionsService } from '../services/permissions.service';

/**
 * Advanced Auth Guard
 * Handles complex authorization scenarios with multiple conditions
 */
@Injectable()
export class AdvancedAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req.user as AuthenticatedUser;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check tenant scoped access
    if (await this.checkTenantScoped(context, user)) {
      return true;
    }

    // Check self or admin access
    if (await this.checkSelfOrAdmin(context, user, gqlContext)) {
      return true;
    }

    // Check resource-based access
    if (await this.checkResourceAccess(context, user, gqlContext)) {
      return true;
    }

    // Check MFA requirement
    if (await this.checkMfaRequired(context, user)) {
      return true;
    }

    // Check time-based access
    if (await this.checkTimeBasedAuth(context)) {
      return true;
    }

    // Check IP restrictions
    if (await this.checkIpRestricted(context, gqlContext)) {
      return true;
    }

    // Check hierarchical access
    if (await this.checkHierarchicalAuth(context, user)) {
      return true;
    }

    return true;
  }

  private async checkTenantScoped(
    context: ExecutionContext,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    const isTenantScoped = this.reflector.get<boolean>('tenantScoped', context.getHandler());
    
    if (!isTenantScoped) {
      return false;
    }

    // Tenant scoping is automatically handled by the user context
    // Additional validation could be added here if needed
    return true;
  }

  private async checkSelfOrAdmin(
    context: ExecutionContext,
    user: AuthenticatedUser,
    gqlContext: GqlExecutionContext,
  ): Promise<boolean> {
    const isSelfOrAdmin = this.reflector.get<boolean>('selfOrAdmin', context.getHandler());
    
    if (!isSelfOrAdmin) {
      return false;
    }

    const userIdParam = this.reflector.get<string>('userIdParam', context.getHandler()) || 'userId';
    const args = gqlContext.getArgs();
    const targetUserId = args[userIdParam] || args.input?.[userIdParam];

    // Allow if accessing own data
    if (targetUserId === user.id) {
      return true;
    }

    // Allow if user is admin
    const adminRoles = ['super_admin', 'tenant_admin'];
    if (adminRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('Access denied: can only access own data or requires admin role');
  }

  private async checkResourceAccess(
    context: ExecutionContext,
    user: AuthenticatedUser,
    gqlContext: GqlExecutionContext,
  ): Promise<boolean> {
    const resource = this.reflector.get<string>('resource', context.getHandler());
    const action = this.reflector.get<string>('action', context.getHandler());
    const allowOwner = this.reflector.get<boolean>('allowOwner', context.getHandler());

    if (!resource || !action) {
      return false;
    }

    const permission = `${resource}:${action}`;
    const userPermissions = await this.permissionsService.getUserPermissions(
      user.id,
      user.tenantId,
    );

    // Check if user has the required permission
    if (this.permissionsService.hasPermission(userPermissions, permission)) {
      return true;
    }

    // Check if user is the owner of the resource (if allowed)
    if (allowOwner) {
      const args = gqlContext.getArgs();
      const resourceId = args.id || args.input?.id;
      
      if (resourceId && await this.isResourceOwner(user.id, resource, resourceId)) {
        return true;
      }
    }

    throw new ForbiddenException(`Access denied: missing permission ${permission}`);
  }

  private async checkMfaRequired(
    context: ExecutionContext,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    const mfaRequired = this.reflector.get<boolean>('mfaRequired', context.getHandler());
    
    if (!mfaRequired) {
      return false;
    }

    // Check if user has MFA enabled and verified in current session
    // This would require additional session metadata
    const hasMfaVerified = user.sessionId && await this.isMfaVerifiedInSession(user.sessionId);
    
    if (!hasMfaVerified) {
      throw new UnauthorizedException('MFA verification required for this operation');
    }

    return true;
  }

  private async checkTimeBasedAuth(context: ExecutionContext): Promise<boolean> {
    const isTimeBasedAuth = this.reflector.get<boolean>('timeBasedAuth', context.getHandler());
    
    if (!isTimeBasedAuth) {
      return false;
    }

    const allowedHours = this.reflector.get<number[]>('allowedHours', context.getHandler());
    const timezone = this.reflector.get<string>('timezone', context.getHandler()) || 'UTC';

    const now = new Date();
    const currentHour = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now);

    if (!allowedHours.includes(parseInt(currentHour))) {
      throw new ForbiddenException(`Access denied: operation not allowed at this time (${currentHour}:00 ${timezone})`);
    }

    return true;
  }

  private async checkIpRestricted(
    context: ExecutionContext,
    gqlContext: GqlExecutionContext,
  ): Promise<boolean> {
    const isIpRestricted = this.reflector.get<boolean>('ipRestricted', context.getHandler());
    
    if (!isIpRestricted) {
      return false;
    }

    const allowedIps = this.reflector.get<string[]>('allowedIps', context.getHandler());
    const clientIp = gqlContext.getContext().req.ip;

    if (!allowedIps.includes(clientIp)) {
      throw new ForbiddenException(`Access denied: IP address ${clientIp} not allowed`);
    }

    return true;
  }

  private async checkHierarchicalAuth(
    context: ExecutionContext,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    const isHierarchicalAuth = this.reflector.get<boolean>('hierarchicalAuth', context.getHandler());
    
    if (!isHierarchicalAuth) {
      return false;
    }

    const requiredLevel = this.reflector.get<number>('requiredLevel', context.getHandler());
    const userLevel = this.getUserHierarchyLevel(user.role);

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(`Access denied: insufficient hierarchy level (required: ${requiredLevel}, current: ${userLevel})`);
    }

    return true;
  }

  private getUserHierarchyLevel(role: string): number {
    const hierarchy = {
      super_admin: 6,
      tenant_admin: 5,
      manager: 4,
      employee: 3,
      customer: 2,
      readonly: 1,
    };

    return hierarchy[role as keyof typeof hierarchy] || 0;
  }

  private async isResourceOwner(
    userId: string,
    resource: string,
    resourceId: string,
  ): Promise<boolean> {
    // This would need to be implemented based on your data model
    // For now, return false as a placeholder
    return false;
  }

  private async isMfaVerifiedInSession(sessionId: string): Promise<boolean> {
    // This would need to check session metadata for MFA verification
    // For now, return false as a placeholder
    return false;
  }
}