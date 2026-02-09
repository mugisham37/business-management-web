// Role and Permission Domain Types

/**
 * Permission domain model
 * Represents a granular access right
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

/**
 * Role domain model
 * Represents a collection of permissions assigned to users
 */
export interface Role {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role creation data
 */
export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Role update data
 */
export interface UpdateRoleData {
  name?: string;
  description?: string;
}

/**
 * Permission assignment data
 */
export interface AssignPermissionsData {
  permissions: string[];
}
