import { z } from 'zod';

// Session status enum
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  INVALID = 'invalid',
}

// Device type enum
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',
}

// Session entity schema
export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  refreshToken: z.string(),

  // Expiration
  expiresAt: z.date(),
  refreshExpiresAt: z.date(),

  // Device and location info
  ipAddress: z.string().nullable().optional(),
  deviceFingerprint: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  deviceType: z.nativeEnum(DeviceType).default(DeviceType.UNKNOWN),

  // Security
  riskScore: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),

  // Activity tracking
  lastActivity: z.date().optional(),
  activityCount: z.number().default(0),

  // Metadata
  metadata: z.record(z.any()).default({}),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

// Session creation input
export const CreateSessionSchema = SessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  deviceType: true,
  riskScore: true,
  isActive: true,
  activityCount: true,
  metadata: true,
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

// Session update input
export const UpdateSessionSchema = SessionSchema.omit({
  id: true,
  userId: true,
  token: true,
  refreshToken: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;

// Session with relations
export interface SessionWithRelations extends Session {
  user?: User;
  loginAttempts?: LoginAttempt[];
}

// Login attempt entity
export const LoginAttemptSchema = z.object({
  id: z.number().optional(),
  userId: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  ipAddress: z.string(),
  userAgent: z.string().nullable().optional(),
  success: z.boolean(),
  failureReason: z.string().nullable().optional(),
  deviceFingerprint: z.string().nullable().optional(),
  riskScore: z.number().min(0).max(100).default(0),
  timestamp: z.date().optional(),
});

export type LoginAttempt = z.infer<typeof LoginAttemptSchema>;

// Import types from other entities
import type { User } from './user';
