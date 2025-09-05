import { z } from 'zod';

// Permission actions enum
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage',
}

// Permission resources enum
export enum PermissionResource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  SESSION = 'session',
  WEBHOOK = 'webhook',
  SYSTEM = 'system',
}

// Permission entity schema
export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
  description: z.string().nullable().optional(),

  // Conditions and constraints
  conditions: z.record(z.any()).default({}),
  constraints: z.record(z.any()).default({}),

  // Hierarchy and grouping
  category: z.string().default('general'),
  priority: z.number().default(0),

  // Status
  isActive: z.boolean().default(true),

  // Metadata
  metadata: z.record(z.any()).default({}),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

// Permission creation input
export const CreatePermissionSchema = PermissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial({
  conditions: true,
  constraints: true,
  category: true,
  priority: true,
  isActive: true,
  metadata: true,
});

export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;

// Permission update input
export const UpdatePermissionSchema = PermissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>;

// Permission with relations
export interface PermissionWithRelations extends Permission {
  roles?: Role[];
  users?: User[];
}

// Import types from other entities
import type { Role } from './role';
import type { User } from './user';
