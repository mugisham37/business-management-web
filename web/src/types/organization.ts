// Organization Domain Types

/**
 * Organization domain model
 * Represents a tenant entity that groups users and resources
 */
export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Organization creation data
 */
export interface CreateOrganizationData {
  name: string;
  ownerId: string;
}

/**
 * Organization update data
 */
export interface UpdateOrganizationData {
  name?: string;
}
