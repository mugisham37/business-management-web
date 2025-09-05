import { z } from 'zod';

// Role type enum
export enum RoleType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

// Role entity schema
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  type: z.nativeEnum(RoleType).default(RoleType.CUSTOM),
  isActive: z.boolean().default(true),

  // Hierarchy
  parentId: z.string().nullable().optional(),
  level: z.number().default(0),

  // Metadata
  metadata: z.record(z.any()).default({}),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

// Role creation input
export const CreateRoleSchema = RoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial({
  type: true,
  isActive: true,
  level: true,
  metadata: true,
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;

// Role update input
export const UpdateRoleSchema = RoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;

// Role with relations
export interface RoleWithRelations extends Role {
  permissions?: Permission[];
  users?: User[];
  parent?: Role;
  children?: Role[];
}

// Import types from other entities
import type { Permission } from './permission';
import type { User } from './user';
