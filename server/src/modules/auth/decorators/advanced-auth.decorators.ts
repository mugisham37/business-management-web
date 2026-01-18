import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from './permission.decorator';
import { Roles } from './roles.decorator';

/**
 * Resource-based authorization decorator
 * Combines role and permission checks with resource-level access
 */
export function ResourceAuth(
  resource: string,
  action: string,
  roles?: string[],
  allowOwner: boolean = true,
) {
  const permission = `${resource}:${action}`;
  
  const decorators = [
    UseGuards(JwtAuthGuard, PermissionsGuard),
    Permissions(permission),
    SetMetadata('resource', resource),
    SetMetadata('action', action),
    SetMetadata('allowOwner', allowOwner),
  ];

  if (roles && roles.length > 0) {
    decorators.push(UseGuards(RolesGuard), Roles(...roles));
  }

  return applyDecorators(...decorators);
}

/**
 * Tenant-scoped authorization decorator
 * Ensures user can only access resources within their tenant
 */
export function TenantScoped(permission?: string) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('tenantScoped', true),
  ];

  if (permission) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(permission));
  }

  return applyDecorators(...decorators);
}

/**
 * Admin-only decorator
 * Restricts access to admin roles only
 */
export function AdminOnly(permissions?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('super_admin', 'tenant_admin'),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * Manager or above decorator
 * Restricts access to manager level and above
 */
export function ManagerOrAbove(permissions?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles('super_admin', 'tenant_admin', 'manager'),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * Self or admin decorator
 * Allows access if user is accessing their own data or is an admin
 */
export function SelfOrAdmin(userIdParam: string = 'userId') {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('selfOrAdmin', true),
    SetMetadata('userIdParam', userIdParam),
  );
}

/**
 * Conditional auth decorator
 * Applies different auth rules based on conditions
 */
export function ConditionalAuth(
  condition: string,
  trueAuth: any[],
  falseAuth: any[],
) {
  return applyDecorators(
    SetMetadata('conditionalAuth', true),
    SetMetadata('condition', condition),
    SetMetadata('trueAuth', trueAuth),
    SetMetadata('falseAuth', falseAuth),
  );
}

/**
 * Rate limited auth decorator
 * Combines authentication with rate limiting
 */
export function RateLimitedAuth(
  limit: number,
  windowMs: number,
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('rateLimit', { limit, windowMs }),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * MFA required decorator
 * Requires multi-factor authentication for sensitive operations
 */
export function MfaRequired(permissions?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('mfaRequired', true),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * Time-based auth decorator
 * Restricts access to specific time windows
 */
export function TimeBasedAuth(
  allowedHours: number[],
  timezone: string = 'UTC',
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('timeBasedAuth', true),
    SetMetadata('allowedHours', allowedHours),
    SetMetadata('timezone', timezone),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * IP-restricted auth decorator
 * Restricts access to specific IP addresses or ranges
 */
export function IpRestrictedAuth(
  allowedIps: string[],
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('ipRestricted', true),
    SetMetadata('allowedIps', allowedIps),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * Audit logged auth decorator
 * Automatically logs access attempts for compliance
 */
export function AuditLoggedAuth(
  action: string,
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('auditLogged', true),
    SetMetadata('auditAction', action),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * Feature flag auth decorator
 * Restricts access based on feature flags
 */
export function FeatureFlagAuth(
  featureFlag: string,
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('featureFlag', featureFlag),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}

/**
 * Hierarchical auth decorator
 * Allows access based on organizational hierarchy
 */
export function HierarchicalAuth(
  level: number,
  permissions?: string[],
) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('hierarchicalAuth', true),
    SetMetadata('requiredLevel', level),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard), Permissions(...permissions));
  }

  return applyDecorators(...decorators);
}