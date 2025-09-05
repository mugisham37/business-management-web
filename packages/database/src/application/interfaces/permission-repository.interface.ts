import type {
  CreatePermissionInput,
  Permission,
  PermissionWithRelations,
  UpdatePermissionInput,
} from '../../domain/entities/permission';
import type { Role } from '../../domain/entities/role';
import type { User } from '../../domain/entities/user';

// Permission repository interface
export interface IPermissionRepository {
  // Basic CRUD operations
  create(permissionData: CreatePermissionInput): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
  update(id: string, permissionData: UpdatePermissionInput): Promise<Permission>;
  delete(id: string): Promise<void>;

  // Advanced queries
  findMany(options?: FindManyPermissionOptions): Promise<Permission[]>;
  findWithRelations(id: string): Promise<PermissionWithRelations | null>;
  findByIds(ids: string[]): Promise<Permission[]>;

  // Resource and action queries
  findByResource(resource: string): Promise<Permission[]>;
  findByAction(action: string): Promise<Permission[]>;
  findByCategory(category: string): Promise<Permission[]>;

  // Role and user associations
  getPermissionRoles(permissionId: string): Promise<Role[]>;
  getPermissionUsers(permissionId: string): Promise<User[]>;

  // Validation
  exists(resource: string, action: string): Promise<boolean>;

  // Status management
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;

  // Soft delete
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;

  // Statistics
  count(options?: CountPermissionOptions): Promise<number>;
  getPermissionsByCategory(): Promise<Record<string, Permission[]>>;

  // Bulk operations
  createMany(permissions: CreatePermissionInput[]): Promise<Permission[]>;
  updateMany(ids: string[], permissionData: Partial<UpdatePermissionInput>): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}

// Query options interfaces
export interface FindManyPermissionOptions {
  where?: PermissionWhereInput;
  orderBy?: PermissionOrderByInput;
  skip?: number;
  take?: number;
  include?: PermissionIncludeInput;
}

export interface CountPermissionOptions {
  where?: PermissionWhereInput;
}

export interface PermissionWhereInput {
  id?: string | string[];
  name?: string | StringFilter;
  resource?: string | string[] | StringFilter;
  action?: string | string[] | StringFilter;
  category?: string | string[] | StringFilter;
  isActive?: boolean;
  priority?: number | NumberFilter;
  createdAt?: DateFilter;
  updatedAt?: DateFilter;
  deletedAt?: DateFilter | null;
  AND?: PermissionWhereInput[];
  OR?: PermissionWhereInput[];
  NOT?: PermissionWhereInput;
}

export interface PermissionOrderByInput {
  id?: 'asc' | 'desc';
  name?: 'asc' | 'desc';
  resource?: 'asc' | 'desc';
  action?: 'asc' | 'desc';
  category?: 'asc' | 'desc';
  priority?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
}

export interface PermissionIncludeInput {
  roles?: boolean;
  users?: boolean;
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

export interface NumberFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
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
