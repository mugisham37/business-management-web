import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RiskBasedAuthGuard, RiskBasedAuthOptions } from '../guards/risk-based-auth.guard';

/**
 * Resource-based authorization decorator
 * Combines authentication, role, and permission checks
 */
export function ResourceAuth(resource: string, action: string, roles?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('resource', resource),
    SetMetadata('action', action),
  ];

  if (roles && roles.length > 0) {
    decorators.push(
      UseGuards(RolesGuard),
      SetMetadata('roles', roles)
    );
  }

  decorators.push(
    UseGuards(PermissionsGuard),
    SetMetadata('permissions', [`${resource}:${action}`])
  );

  return applyDecorators(...decorators);
}

/**
 * Tenant-scoped authorization
 * Ensures user can only access resources within their tenant
 */
export function TenantScoped(permissions?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard),
    SetMetadata('tenantScoped', true),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata('permissions', permissions)
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Admin-only access decorator
 * Requires super_admin or tenant_admin role plus optional permissions
 */
export function AdminOnly(permissions?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    SetMetadata('roles', ['super_admin', 'tenant_admin']),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata('permissions', permissions)
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Manager or above access decorator
 * Requires manager, tenant_admin, or super_admin role
 */
export function ManagerOrAbove(permissions?: string[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    SetMetadata('roles', ['manager', 'tenant_admin', 'super_admin']),
  ];

  if (permissions && permissions.length > 0) {
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata('permissions', permissions)
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Self or admin access decorator
 * Allows access if user is accessing their own data or is an admin
 */
export function SelfOrAdmin(userIdParam: string = 'userId') {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('selfOrAdmin', true),
    SetMetadata('userIdParam', userIdParam)
  );
}

/**
 * Conditional authorization decorator
 * Applies different rules based on conditions
 */
export function ConditionalAuth(conditions: Record<string, any>) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('conditionalAuth', conditions)
  );
}

/**
 * Rate-limited authentication decorator
 * Applies rate limiting to authenticated endpoints
 */
export function RateLimitedAuth(maxRequests: number = 100, windowMs: number = 60000) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('rateLimit', { maxRequests, windowMs })
  );
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
    decorators.push(
      UseGuards(PermissionsGuard),
      SetMetadata('permissions', permissions)
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Time-based access decorator
 * Restricts access to specific hours and timezone
 */
export function TimeBasedAuth(allowedHours: number[], timezone: string = 'UTC') {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('timeBasedAuth', { allowedHours, timezone })
  );
}

/**
 * IP-restricted access decorator
 * Restricts access to specific IP addresses or ranges
 */
export function IpRestrictedAuth(allowedIPs: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('ipRestricted', allowedIPs)
  );
}

/**
 * Audit logged decorator
 * Ensures all access is logged for compliance
 */
export function AuditLoggedAuth(auditLevel: 'basic' | 'detailed' = 'basic') {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('auditLogged', auditLevel)
  );
}

/**
 * Feature flag authorization decorator
 * Requires specific feature flags to be enabled
 */
export function FeatureFlagAuth(requiredFeatures: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('requiredFeatures', requiredFeatures)
  );
}

/**
 * Hierarchical authorization decorator
 * Allows access based on organizational hierarchy
 */
export function HierarchicalAuth(level: 'self' | 'team' | 'department' | 'organization' = 'self') {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('hierarchicalAuth', level)
  );
}

/**
 * Risk-based authentication decorator
 * Applies risk assessment and blocks high-risk access
 */
export function RiskBasedAuth(options: RiskBasedAuthOptions = {}) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RiskBasedAuthGuard),
    SetMetadata('riskBasedAuth', options)
  );
}

/**
 * Device trust authentication decorator
 * Requires trusted device for access
 */
export function DeviceTrustAuth(minTrustScore: number = 70) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('deviceTrust', { minTrustScore })
  );
}

/**
 * Network-based authentication decorator
 * Restricts access to trusted networks
 */
export function NetworkBasedAuth(allowedNetworks: string[] = ['office', 'vpn']) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    SetMetadata('networkBased', allowedNetworks)
  );
}