/**
 * Permission Constants
 * 
 * Centralized definition of all permission codes used in the application.
 * Format: 'module:action:resource'
 * 
 * These permissions must match the backend permission definitions.
 */

export const PERMISSIONS = {
  // User Management Permissions
  USERS: {
    CREATE_USER: 'users:create:user',
    READ_USER: 'users:read:user',
    UPDATE_USER: 'users:update:user',
    DELETE_USER: 'users:delete:user',
    SUSPEND_USER: 'users:suspend:user',
    REACTIVATE_USER: 'users:reactivate:user',
    CREATE_INVITATION: 'users:create:invitation',
    READ_HIERARCHY: 'users:read:hierarchy',
  },

  // Role Management Permissions
  ROLES: {
    CREATE_ROLE: 'roles:create:role',
    READ_ROLE: 'roles:read:role',
    UPDATE_ROLE: 'roles:update:role',
    DELETE_ROLE: 'roles:delete:role',
    ASSIGN_ROLE: 'roles:assign:role',
    MANAGE_PERMISSIONS: 'roles:update:role', // Same as update for permission assignment
  },

  // Session Management Permissions
  SESSIONS: {
    READ_SESSION: 'sessions:read:session',
    DELETE_SESSION: 'sessions:delete:session',
  },

  // MFA Permissions
  MFA: {
    SETUP_MFA: 'mfa:setup:mfa',
    ENABLE_MFA: 'mfa:enable:mfa',
    DISABLE_MFA: 'mfa:disable:mfa',
    READ_MFA_STATUS: 'mfa:read:mfa',
    REGENERATE_BACKUP_CODES: 'mfa:regenerate:backup-codes',
  },

  // Organization Permissions
  ORGANIZATION: {
    READ_ORGANIZATION: 'organization:read:organization',
    UPDATE_ORGANIZATION: 'organization:update:organization',
    MANAGE_SETTINGS: 'organization:manage:settings',
  },

  // Location Permissions
  LOCATIONS: {
    CREATE_LOCATION: 'locations:create:location',
    READ_LOCATION: 'locations:read:location',
    UPDATE_LOCATION: 'locations:update:location',
    DELETE_LOCATION: 'locations:delete:location',
  },

  // Department Permissions
  DEPARTMENTS: {
    CREATE_DEPARTMENT: 'departments:create:department',
    READ_DEPARTMENT: 'departments:read:department',
    UPDATE_DEPARTMENT: 'departments:update:department',
    DELETE_DEPARTMENT: 'departments:delete:department',
  },

  // Audit Log Permissions
  AUDIT: {
    READ_AUDIT_LOG: 'audit:read:log',
  },
} as const;

/**
 * Helper type to extract all permission values
 */
export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

/**
 * Flattened array of all permission codes for easy iteration
 */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(module =>
  Object.values(module)
);
