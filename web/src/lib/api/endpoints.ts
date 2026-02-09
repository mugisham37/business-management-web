/**
 * API Endpoint Constants
 * 
 * Centralized definition of all 34 REST API endpoint paths.
 * Organized by domain: Auth (12), MFA (5), Users (9), Roles (6), Sessions (2)
 */

export const API_ENDPOINTS = {
  // Authentication endpoints (13 total)
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    LOGIN: '/auth/login',
    LOGIN_TEAM_MEMBER: '/auth/login/team-member',
    LOGIN_MFA: '/auth/login/mfa',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
    CHANGE_PASSWORD: '/auth/password/change',
    ME: '/auth/me', // Get current authenticated user
  },

  // MFA endpoints (5 total)
  MFA: {
    SETUP: '/mfa/setup',
    ENABLE: '/mfa/enable',
    DISABLE: '/mfa/disable',
    STATUS: '/mfa/status',
    REGENERATE_BACKUP_CODES: '/mfa/regenerate-backup-codes',
  },

  // User management endpoints (9 total)
  USERS: {
    INVITE: '/users/invite',
    REGISTER_INVITATION: '/users/register-invitation',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    SUSPEND: (id: string) => `/users/${id}/suspend`,
    REACTIVATE: (id: string) => `/users/${id}/reactivate`,
    HIERARCHY: (id: string) => `/users/${id}/hierarchy`,
    CREATED_USERS: (id: string) => `/users/${id}/created-users`,
  },

  // Role management endpoints (6 total)
  ROLES: {
    CREATE: '/roles',
    GET_BY_ID: (id: string) => `/roles/${id}`,
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
    ASSIGN_ROLE: (id: string) => `/roles/${id}/assign`,
  },

  // Session management endpoints (2 total)
  SESSIONS: {
    GET_ALL: '/sessions',
    DELETE: (id: string) => `/sessions/${id}`,
  },

  // Onboarding endpoints (5 total)
  ONBOARDING: {
    SAVE_PROGRESS: '/onboarding/progress',
    GET_PROGRESS: '/onboarding/progress',
    COMPLETE: '/onboarding/complete',
    RECOMMEND_PLAN: '/onboarding/recommend-plan',
    SELECT_PLAN: '/onboarding/select-plan',
  },
} as const;
