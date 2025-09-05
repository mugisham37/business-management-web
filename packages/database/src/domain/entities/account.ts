import { z } from 'zod';

// Account type enum
export enum AccountType {
  OAUTH = 'oauth',
  EMAIL = 'email',
  CREDENTIALS = 'credentials',
}

// OAuth provider enum
export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  MICROSOFT = 'microsoft',
}

// Account entity schema
export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  type: z.nativeEnum(AccountType),

  // OAuth tokens
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
  tokenType: z.string().nullable().optional(),
  scope: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  sessionState: z.string().nullable().optional(),

  // Profile information from provider
  providerData: z.record(z.any()).default({}),

  // Status
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),

  // Metadata
  metadata: z.record(z.any()).default({}),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export type Account = z.infer<typeof AccountSchema>;

// Account creation input
export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial({
  providerData: true,
  isActive: true,
  isVerified: true,
  metadata: true,
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

// Account update input
export const UpdateAccountSchema = AccountSchema.omit({
  id: true,
  userId: true,
  provider: true,
  providerAccountId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;

// Account with relations
export interface AccountWithRelations extends Account {
  user?: User;
}

// Import types from other entities
import type { User } from './user';
