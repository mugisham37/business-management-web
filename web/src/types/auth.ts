// Authentication and User Types
// Comprehensive type definitions for the auth system

export type AccountType = "PRIMARY_OWNER" | "MANAGER" | "WORKER" | "VIEWER"

export type AccountStatus =
  | "ANONYMOUS"
  | "AUTHENTICATED_PENDING_VERIFICATION"
  | "AUTHENTICATED_PENDING_ONBOARDING"
  | "AUTHENTICATED_ACTIVE"
  | "AUTHENTICATED_SUSPENDED"
  | "AUTHENTICATED_TRIAL"
  | "AUTHENTICATED_EXPIRED"

export type AuthProvider = "EMAIL" | "GOOGLE" | "GITHUB"

export interface User {
  id: string
  email: string
  username?: string
  fullName?: string
  accountType: AccountType
  accountStatus: AccountStatus
  organizationId: string
  createdBy?: string
  mfaEnabled: boolean
  emailVerified: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: Date
  deviceInfo?: string
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
  rememberMe?: boolean
}

export interface SignupData {
  email: string
  password: string
  businessName: string
  fullName?: string
}

export interface MFASetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  newPassword: string
}
