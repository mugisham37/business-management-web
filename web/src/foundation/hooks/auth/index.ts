/**
 * Authentication Hooks
 * 
 * Exports all authentication-related hooks for easy importing.
 */

// Login hooks
export { useLogin } from './useLogin';
export type { UseLoginReturn } from './useLogin';

// Registration hooks
export { useRegister } from './useRegister';
export type { UseRegisterReturn } from './useRegister';

// MFA hooks
export { useEnableMFA, useDisableMFA, useVerifyMFA } from './useMFA';
export type {
  UseEnableMFAReturn,
  UseDisableMFAReturn,
  UseVerifyMFAReturn,
} from './useMFA';

// Password management hooks
export {
  useChangePassword,
  useRequestPasswordReset,
  useResetPassword,
} from './usePasswordManagement';
export type {
  UseChangePasswordReturn,
  UseRequestPasswordResetReturn,
  UseResetPasswordReturn,
} from './usePasswordManagement';

// Session management hooks
export {
  useActiveSessions,
  useRevokeSession,
  useLogoutAllDevices,
} from './useSessionManagement';
export type {
  UseActiveSessionsReturn,
  UseRevokeSessionReturn,
  UseLogoutAllDevicesReturn,
} from './useSessionManagement';
