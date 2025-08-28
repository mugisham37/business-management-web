/**
 * Shared Enums
 */

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted',
}

// Account Type
export enum AccountType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

// Authentication Method
export enum AuthMethod {
  EMAIL_PASSWORD = 'email_password',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
  SAML = 'saml',
  LDAP = 'ldap',
}

// Permission Action
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

// Resource Type
export enum ResourceType {
  USER = 'user',
  ACCOUNT = 'account',
  ROLE = 'role',
  PERMISSION = 'permission',
  SESSION = 'session',
  WEBHOOK = 'webhook',
  AUDIT_LOG = 'audit_log',
}

// Event Type
export enum EventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  ACCOUNT_CREATED = 'account.created',
  ACCOUNT_UPDATED = 'account.updated',
  ROLE_ASSIGNED = 'role.assigned',
  ROLE_REVOKED = 'role.revoked',
  PERMISSION_GRANTED = 'permission.granted',
  PERMISSION_REVOKED = 'permission.revoked',
}

// Log Level
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

// Environment
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

// HTTP Method
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

// Content Type
export enum ContentType {
  JSON = 'application/json',
  XML = 'application/xml',
  TEXT = 'text/plain',
  HTML = 'text/html',
  FORM_DATA = 'multipart/form-data',
  URL_ENCODED = 'application/x-www-form-urlencoded',
}

// Cache Strategy
export enum CacheStrategy {
  NO_CACHE = 'no-cache',
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  CACHE_ONLY = 'cache-only',
  NETWORK_ONLY = 'network-only',
}
