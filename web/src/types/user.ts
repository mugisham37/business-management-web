// User Domain Types

import type { Organization } from './organization';
import type { Role } from './role';

/**
 * User domain model
 * Represents an authenticated user in the system
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // computed: firstName + lastName
  organizationId: string;
  organization?: Organization;
  roleId: string;
  role: Role;
  isActive: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation data
 */
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  roleId?: string;
}

/**
 * User update data
 */
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}
