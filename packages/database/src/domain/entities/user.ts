import { z } from 'zod';

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// User entity schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  emailVerified: z.boolean().default(false),
  emailVerifiedAt: z.date().nullable().optional(),
  passwordHash: z.string().nullable().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.PENDING_VERIFICATION),

  // MFA fields
  mfaEnabled: z.boolean().default(false),
  totpSecret: z.string().nullable().optional(),
  backupCodes: z.array(z.string()).default([]),

  // Security fields
  failedLoginAttempts: z.number().default(0),
  lockedUntil: z.date().nullable().optional(),
  lastLoginAt: z.date().nullable().optional(),
  lastLoginIP: z.string().nullable().optional(),
  riskScore: z.number().min(0).max(100).default(0),

  // Profile fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().url().nullable().optional(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en'),

  // Metadata
  metadata: z.record(z.any()).default({}),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

// User creation input
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial({
  status: true,
  mfaEnabled: true,
  failedLoginAttempts: true,
  riskScore: true,
  metadata: true,
  timezone: true,
  locale: true,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// User update input
export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// User with relations type
export interface UserWithRelations extends User {
  roles?: Role[];
  permissions?: Permission[];
  sessions?: Session[];
  accounts?: Account[];
}

// Import types that will be defined in other files
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  ipAddress?: string | null;
  deviceFingerprint?: string | null;
  userAgent?: string | null;
  riskScore?: number;
  isActive?: boolean;
  lastActivity?: Date;
  createdAt?: Date;
}

export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  type: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  sessionState?: string;
  createdAt: Date;
  updatedAt: Date;
}
