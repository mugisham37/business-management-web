// Generated Prisma types and client exports
// This file serves as a placeholder for Prisma generated types

export interface PrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
  $executeRaw(query: string, ...values: any[]): Promise<number>;
  $queryRaw<T = any>(query: string, ...values: any[]): Promise<T>;
}

// User model types
export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  passwordHash: string | null;
  status: string;
  mfaEnabled: boolean;
  totpSecret: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  lastLoginIP: string | null;
  riskScore: number;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  timezone: string;
  locale: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Role model types
export interface Role {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
  parentId: string | null;
  level: number;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Permission model types
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
  conditions: any;
  constraints: any;
  category: string;
  priority: number;
  isActive: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Account model types
export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  type: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  tokenType: string | null;
  scope: string | null;
  idToken: string | null;
  sessionState: string | null;
  providerData: any;
  isActive: boolean;
  isVerified: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Webhook model types
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string | null;
  status: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: any;
  description: string | null;
  metadata: any;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  lastDeliveryAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Relations types
export interface UserWithRelations extends User {
  roles?: Role[];
  permissions?: Permission[];
  accounts?: Account[];
}

export interface RoleWithRelations extends Role {
  permissions?: Permission[];
  users?: User[];
  parent?: Role | null;
  children?: Role[];
}

export interface PermissionWithRelations extends Permission {
  roles?: Role[];
  users?: User[];
}

// Export placeholder for actual PrismaClient
export const PrismaClient = class {
  async $connect() {}
  async $disconnect() {}
  async $transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return fn(this);
  }
  async $executeRaw(query: string, ...values: any[]): Promise<number> {
    return 0;
  }
  async $queryRaw<T = any>(query: string, ...values: any[]): Promise<T> {
    return [] as any;
  }
};
