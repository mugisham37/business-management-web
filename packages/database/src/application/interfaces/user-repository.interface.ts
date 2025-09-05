import type { Permission } from '../../domain/entities/permission';
import type { Role } from '../../domain/entities/role';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserWithRelations,
} from '../../domain/entities/user';

// User repository interface
export interface IUserRepository {
  // Basic CRUD operations
  create(userData: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, userData: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;

  // Advanced queries
  findMany(options?: FindManyOptions): Promise<User[]>;
  findWithRelations(id: string): Promise<UserWithRelations | null>;
  findByIds(ids: string[]): Promise<User[]>;

  // Authentication related
  findByEmailWithPassword(email: string): Promise<User | null>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateLastLogin(id: string, ipAddress?: string): Promise<void>;

  // Security related
  incrementFailedLoginAttempts(id: string): Promise<void>;
  resetFailedLoginAttempts(id: string): Promise<void>;
  lockUser(id: string, until: Date): Promise<void>;
  unlockUser(id: string): Promise<void>;
  updateRiskScore(id: string, riskScore: number): Promise<void>;

  // MFA related
  enableMFA(id: string, totpSecret: string): Promise<void>;
  disableMFA(id: string): Promise<void>;
  updateBackupCodes(id: string, backupCodes: string[]): Promise<void>;

  // Role and permission management
  assignRole(userId: string, roleId: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  hasPermission(userId: string, resource: string, action: string): Promise<boolean>;

  // Email verification
  markEmailAsVerified(id: string): Promise<void>;

  // Soft delete
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;

  // Statistics and analytics
  count(options?: CountOptions): Promise<number>;
  getActiveUsersCount(): Promise<number>;
  getUsersByStatus(status: string): Promise<User[]>;

  // Bulk operations
  createMany(users: CreateUserInput[]): Promise<User[]>;
  updateMany(ids: string[], userData: Partial<UpdateUserInput>): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}

// Query options interfaces
export interface FindManyOptions {
  where?: UserWhereInput;
  orderBy?: UserOrderByInput;
  skip?: number;
  take?: number;
  include?: UserIncludeInput;
}

export interface CountOptions {
  where?: UserWhereInput;
}

export interface UserWhereInput {
  id?: string | string[];
  email?: string | StringFilter;
  name?: string | StringFilter;
  status?: string | string[];
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: DateFilter;
  updatedAt?: DateFilter;
  deletedAt?: DateFilter | null;
  AND?: UserWhereInput[];
  OR?: UserWhereInput[];
  NOT?: UserWhereInput;
}

export interface UserOrderByInput {
  id?: 'asc' | 'desc';
  email?: 'asc' | 'desc';
  name?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  lastLoginAt?: 'asc' | 'desc';
}

export interface UserIncludeInput {
  roles?: boolean;
  permissions?: boolean;
  sessions?: boolean;
  accounts?: boolean;
}

export interface StringFilter {
  equals?: string;
  in?: string[];
  notIn?: string[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'default' | 'insensitive';
}

export interface DateFilter {
  equals?: Date;
  in?: Date[];
  notIn?: Date[];
  lt?: Date;
  lte?: Date;
  gt?: Date;
  gte?: Date;
}
