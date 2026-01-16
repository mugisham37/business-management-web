/**
 * Central export file for auth decorators
 * Provides a unified import path for all authentication-related decorators
 * Used primarily in GraphQL resolvers
 */
export { CurrentUser } from './current-user.decorator';
export { Permission, Permissions } from './permission.decorator';
export { Roles } from './roles.decorator';
