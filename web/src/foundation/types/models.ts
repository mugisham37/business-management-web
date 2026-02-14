/**
 * Domain Model Types
 * 
 * Core domain models representing entities in the system.
 * These types are supplementary to the generated GraphQL types.
 * For GraphQL-generated types, import from './generated/graphql-types'
 */

/**
 * Permission module grouping related permissions
 * This is a frontend-specific type for organizing permissions
 */
export interface PermissionModule {
  name: string;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    module: string;
  }>;
}

/**
 * Session model representing an active user session
 * This is a frontend-specific type that extends SessionInfo from GraphQL
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
