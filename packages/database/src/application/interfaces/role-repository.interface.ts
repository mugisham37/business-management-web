import type { Permission } from '../../domain/entities/permission';
import type {
  CreateRoleInput,
  Role,
  RoleWithRelations,
  UpdateRoleInput,
} from '../../domain/entities/role';
import type { User } from '../../domain/entities/user';

// Role repository interface
export interface IRoleRepository {
  // Basic CRUD operations
  create(roleData: CreateRoleInput): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  update(id: string, roleData: UpdateRoleInput): Promise<Role>;
  delete(id: string): Promise<void>;

  // Advanced queries
  findMany(options?: FindManyRoleOptions): Promise<Role[]>;
  findWithRelations(id: string): Promise<RoleWithRelations | null>;
  findByIds(ids: string[]): Promise<Role[]>;

  // Permission management
  assignPermission(roleId: string, permissionId: string): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  getRolePermissions(roleId: string): Promise<Permission[]>;
  hasPermission(roleId: string, resource: string, action: string): Promise<boolean>;

  // User management
  getRoleUsers(roleId: string): Promise<User[]>;
  getUsersCount(roleId: string): Promise<number>;

  // Hierarchy management
  getChildren(roleId: string): Promise<Role[]>;
  getParent(roleId: string): Promise<Role | null>;
  getAncestors(roleId: string): Promise<Role[]>;
  getDescendants(roleId: string): Promise<Role[]>;

  // System roles
  getSystemRoles(): Promise<Role[]>;
  getCustomRoles(): Promise<Role[]>;

  // Status management
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;

  // Soft delete
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;

  // Statistics
  count(options?: CountRoleOptions): Promise<number>;

  // Bulk operations
  createMany(roles: CreateRoleInput[]): Promise<Role[]>;
  updateMany(ids: string[], roleData: Partial<UpdateRoleInput>): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}

// Query options interfaces
export interface FindManyRoleOptions {
  where?: RoleWhereInput;
  orderBy?: RoleOrderByInput;
  skip?: number;
  take?: number;
  include?: RoleIncludeInput;
}

export interface CountRoleOptions {
  where?: RoleWhereInput;
}

export interface RoleWhereInput {
  id?: string | string[];
  name?: string | StringFilter;
  type?: string | string[];
  isActive?: boolean;
  parentId?: string | null;
  level?: number | NumberFilter;
  createdAt?: DateFilter;
  updatedAt?: DateFilter;
  deletedAt?: DateFilter | null;
  AND?: RoleWhereInput[];
  OR?: RoleWhereInput[];
  NOT?: RoleWhereInput;
}

export interface RoleOrderByInput {
  id?: 'asc' | 'desc';
  name?: 'asc' | 'desc';
  type?: 'asc' | 'desc';
  level?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
}

export interface RoleIncludeInput {
  permissions?: boolean;
  users?: boolean;
  parent?: boolean;
  children?: boolean;
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
