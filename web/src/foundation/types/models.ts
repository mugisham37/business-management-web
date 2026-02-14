/**
 * Domain Model Types
 * 
 * Core domain models representing entities in the system.
 * These types define the structure of data used throughout the application.
 */

/**
 * User role hierarchy: OWNER > MANAGER > WORKER
 */
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
}

/**
 * User model representing a user in the system
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  mfaEnabled: boolean;
  organizationId: string;
  branches: Branch[];
  departments: Department[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Branch model representing an organizational branch
 */
export interface Branch {
  id: string;
  name: string;
  address?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Department model representing an organizational department
 */
export interface Department {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission model representing a single permission
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

/**
 * Permission module grouping related permissions
 */
export interface PermissionModule {
  name: string;
  permissions: Permission[];
}

/**
 * Session model representing an active user session
 */
export interface Session {
  id: string;
  userId: string;
  deviceType: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

/**
 * Audit log model representing a logged action
 */
export interface AuditLog {
  id: string;
  userId: string;
  user: User;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}
