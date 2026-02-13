export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
}

export interface TenantContext {
  organizationId: string;
  userId: string;
  role: UserRole;
  branches?: string[];
  departments?: string[];
}
