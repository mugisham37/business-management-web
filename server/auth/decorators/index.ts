export { CurrentUser } from './current-user.decorator';
export { Permission, Permissions } from './permission.decorator';
export { Roles } from './roles.decorator';
export { RequirePermission, Permissions as RequirePermissions } from './require-permission.decorator';

// Advanced auth decorators
export {
  ResourceAuth,
  TenantScoped,
  AdminOnly,
  ManagerOrAbove,
  SelfOrAdmin,
  ConditionalAuth,
  RateLimitedAuth,
  MfaRequired,
  TimeBasedAuth,
  IpRestrictedAuth,
  AuditLoggedAuth,
  FeatureFlagAuth,
  HierarchicalAuth,
} from './advanced-auth.decorators';
