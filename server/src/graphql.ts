
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum UserRole {
    OWNER = "OWNER",
    MANAGER = "MANAGER",
    WORKER = "WORKER"
}

export class RegisterOrganizationInput {
    businessName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: Nullable<string>;
    acceptedTerms: boolean;
    businessType?: Nullable<string>;
    employeeCount?: Nullable<string>;
    industry?: Nullable<string>;
    country?: Nullable<string>;
    selectedModules?: Nullable<string[]>;
    primaryGoal?: Nullable<string>;
    cloudProvider?: Nullable<string>;
    region?: Nullable<string>;
    storageVolume?: Nullable<number>;
    compression?: Nullable<boolean>;
    activeHours?: Nullable<number>;
    integrations?: Nullable<string[]>;
    selectedPlan?: Nullable<string>;
    billingCycle?: Nullable<string>;
}

export class CreateManagerInput {
    email: string;
    firstName: string;
    lastName: string;
    phone?: Nullable<string>;
    branchIds?: Nullable<string[]>;
    departmentIds?: Nullable<string[]>;
    permissions?: Nullable<string[]>;
}

export class CreateWorkerInput {
    email: string;
    firstName: string;
    lastName: string;
    phone?: Nullable<string>;
    permissions?: Nullable<string[]>;
}

export class UpdateUserInput {
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    phone?: Nullable<string>;
}

export class CreateBranchInput {
    name: string;
    location?: Nullable<string>;
}

export class UpdateBranchInput {
    name?: Nullable<string>;
    location?: Nullable<string>;
}

export class CreateDepartmentInput {
    name: string;
    description?: Nullable<string>;
}

export class UpdateDepartmentInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export class UpdateOrganizationInput {
    businessName?: Nullable<string>;
    businessType?: Nullable<string>;
    employeeCount?: Nullable<string>;
    industry?: Nullable<string>;
    country?: Nullable<string>;
    selectedModules?: Nullable<string[]>;
    primaryGoal?: Nullable<string>;
    cloudProvider?: Nullable<string>;
    region?: Nullable<string>;
    storageVolume?: Nullable<number>;
    compression?: Nullable<boolean>;
    activeHours?: Nullable<number>;
    integrations?: Nullable<string[]>;
    selectedPlan?: Nullable<string>;
    billingCycle?: Nullable<string>;
}

export class UserFilters {
    role?: Nullable<UserRole>;
    branchId?: Nullable<string>;
    departmentId?: Nullable<string>;
}

export class AuditLogFilters {
    userId?: Nullable<string>;
    action?: Nullable<string>;
    startDate?: Nullable<DateTime>;
    endDate?: Nullable<DateTime>;
    limit?: Nullable<number>;
    offset?: Nullable<number>;
}

export class Organization {
    id: string;
    businessName: string;
    businessType?: Nullable<string>;
    employeeCount?: Nullable<string>;
    industry?: Nullable<string>;
    country?: Nullable<string>;
    selectedModules: string[];
    primaryGoal?: Nullable<string>;
    cloudProvider?: Nullable<string>;
    region?: Nullable<string>;
    storageVolume?: Nullable<number>;
    compression: boolean;
    activeHours?: Nullable<number>;
    integrations: string[];
    selectedPlan?: Nullable<string>;
    billingCycle?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export class User {
    id: string;
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: Nullable<string>;
    role: UserRole;
    emailVerified: boolean;
    mfaEnabled: boolean;
    accountLocked: boolean;
    createdAt: DateTime;
    updatedAt: DateTime;
    lastLoginAt?: Nullable<DateTime>;
    organization: Organization;
    creator?: Nullable<User>;
    subordinates: User[];
    branches: Branch[];
    departments: Department[];
    permissions: string[];
}

export class Branch {
    id: string;
    organizationId: string;
    name: string;
    location?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export class Department {
    id: string;
    organizationId: string;
    name: string;
    description?: Nullable<string>;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export class AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    requiresMFA: boolean;
}

export class MFASetupResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}

export class SessionInfo {
    sessionId: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: DateTime;
    createdAt: DateTime;
}

export class AuditLog {
    id: string;
    organizationId: string;
    userId?: Nullable<string>;
    action: string;
    entityType?: Nullable<string>;
    entityId?: Nullable<string>;
    metadata: JSON;
    ipAddress?: Nullable<string>;
    userAgent?: Nullable<string>;
    createdAt: DateTime;
}

export class PermissionDefinition {
    key: string;
    module: string;
    resource: string;
    action: string;
    description: string;
}

export class ModuleInfo {
    name: string;
    enabled: boolean;
    permissions: PermissionDefinition[];
}

export class PermissionsByModule {
    module: string;
    permissions: PermissionDefinition[];
}

export abstract class IQuery {
    abstract me(): User | Promise<User>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract users(filters?: Nullable<UserFilters>): User[] | Promise<User[]>;

    abstract organization(): Organization | Promise<Organization>;

    abstract branches(): Branch[] | Promise<Branch[]>;

    abstract departments(): Department[] | Promise<Department[]>;

    abstract auditLogs(filters?: Nullable<AuditLogFilters>): AuditLog[] | Promise<AuditLog[]>;

    abstract availablePermissions(): PermissionDefinition[] | Promise<PermissionDefinition[]>;

    abstract modules(): ModuleInfo[] | Promise<ModuleInfo[]>;

    abstract permissionsByModule(): PermissionsByModule[] | Promise<PermissionsByModule[]>;
}

export abstract class IMutation {
    abstract registerOrganization(input: RegisterOrganizationInput): AuthResponse | Promise<AuthResponse>;

    abstract login(email: string, password: string, organizationId: string): AuthResponse | Promise<AuthResponse>;

    abstract loginWithGoogle(code: string, organizationId?: Nullable<string>): AuthResponse | Promise<AuthResponse>;

    abstract verifyMFA(userId: string, token: string, organizationId: string): AuthResponse | Promise<AuthResponse>;

    abstract refreshTokens(refreshToken: string): AuthResponse | Promise<AuthResponse>;

    abstract logout(): boolean | Promise<boolean>;

    abstract logoutAllDevices(): boolean | Promise<boolean>;

    abstract requestPasswordReset(email: string, organizationId?: Nullable<string>): boolean | Promise<boolean>;

    abstract resetPassword(token: string, newPassword: string): boolean | Promise<boolean>;

    abstract changePassword(currentPassword: string, newPassword: string): boolean | Promise<boolean>;

    abstract enableMFA(): MFASetupResponse | Promise<MFASetupResponse>;

    abstract disableMFA(totpToken: string, currentPassword: string): boolean | Promise<boolean>;

    abstract listActiveSessions(): SessionInfo[] | Promise<SessionInfo[]>;

    abstract revokeSession(sessionId: string): boolean | Promise<boolean>;

    abstract createManager(input: CreateManagerInput): User | Promise<User>;

    abstract createWorker(input: CreateWorkerInput): User | Promise<User>;

    abstract updateUser(id: string, input: UpdateUserInput): User | Promise<User>;

    abstract deleteUser(id: string): boolean | Promise<boolean>;

    abstract transferOwnership(newOwnerId: string): boolean | Promise<boolean>;

    abstract assignPermissions(userId: string, permissions: string[]): boolean | Promise<boolean>;

    abstract revokePermissions(userId: string, permissions: string[]): boolean | Promise<boolean>;

    abstract updateOrganization(input: UpdateOrganizationInput): Organization | Promise<Organization>;

    abstract createBranch(input: CreateBranchInput): Branch | Promise<Branch>;

    abstract updateBranch(id: string, input: UpdateBranchInput): Branch | Promise<Branch>;

    abstract deleteBranch(id: string): boolean | Promise<boolean>;

    abstract createDepartment(input: CreateDepartmentInput): Department | Promise<Department>;

    abstract updateDepartment(id: string, input: UpdateDepartmentInput): Department | Promise<Department>;

    abstract deleteDepartment(id: string): boolean | Promise<boolean>;

    abstract assignBranches(userId: string, branchIds: string[]): boolean | Promise<boolean>;

    abstract assignDepartments(userId: string, departmentIds: string[]): boolean | Promise<boolean>;
}

export type DateTime = any;
export type JSON = any;
type Nullable<T> = T | null;
