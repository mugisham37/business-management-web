// Session Domain Types

/**
 * Session domain model
 * Represents an authenticated user's active connection
 */
export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

/**
 * Session list item
 * Used for displaying sessions in UI
 */
export interface SessionListItem {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}
