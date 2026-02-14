/**
 * Password Management Hooks
 * 
 * Provides hooks for password-related operations including change password,
 * request password reset, and reset password with token.
 * 
 * Features:
 * - Change password with current password verification
 * - Request password reset email
 * - Reset password with token from email
 * - Password strength validation before submission
 * - User-friendly error messages
 * - Loading state management
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/foundation/providers/AuthProvider';
import { formatError, AppError } from '@/foundation/utils/errors';
import { passwordSchema } from '@/foundation/lib/validation/schemas';

/**
 * Return type for useChangePassword hook
 */
export interface UseChangePasswordReturn {
  /**
   * Change password function
   * @param currentPassword - Current user password
   * @param newPassword - New password (must meet strength requirements)
   * @throws Error if password doesn't meet strength requirements
   */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  /**
   * Loading state - true while changing password
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Return type for useRequestPasswordReset hook
 */
export interface UseRequestPasswordResetReturn {
  /**
   * Request password reset function
   * @param email - User email address
   * @param organizationId - Optional organization ID
   */
  requestPasswordReset: (email: string, organizationId?: string) => Promise<void>;
  
  /**
   * Loading state - true while requesting reset
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Return type for useResetPassword hook
 */
export interface UseResetPasswordReturn {
  /**
   * Reset password function
   * @param token - Reset token from email
   * @param newPassword - New password (must meet strength requirements)
   * @throws Error if password doesn't meet strength requirements
   */
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  /**
   * Loading state - true while resetting password
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Hook for changing password
 * 
 * Allows authenticated users to change their password.
 * Validates password strength before submission.
 * Requires current password for security verification.
 * 
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @example
 * ```tsx
 * function ChangePasswordForm() {
 *   const { changePassword, loading, error } = useChangePassword();
 *   const [currentPassword, setCurrentPassword] = useState('');
 *   const [newPassword, setNewPassword] = useState('');
 *   const [confirmPassword, setConfirmPassword] = useState('');
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     
 *     if (newPassword !== confirmPassword) {
 *       alert('Passwords do not match');
 *       return;
 *     }
 *     
 *     try {
 *       await changePassword(currentPassword, newPassword);
 *       alert('Password changed successfully');
 *     } catch (err) {
 *       // Error is already set in hook state
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input
 *         type="password"
 *         placeholder="Current Password"
 *         value={currentPassword}
 *         onChange={(e) => setCurrentPassword(e.target.value)}
 *       />
 *       <input
 *         type="password"
 *         placeholder="New Password"
 *         value={newPassword}
 *         onChange={(e) => setNewPassword(e.target.value)}
 *       />
 *       <input
 *         type="password"
 *         placeholder="Confirm Password"
 *         value={confirmPassword}
 *         onChange={(e) => setConfirmPassword(e.target.value)}
 *       />
 *       <button disabled={loading}>
 *         {loading ? 'Changing...' : 'Change Password'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useChangePassword(): UseChangePasswordReturn {
  const { changePassword: authChangePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Validate password strength before submission
        const validationResult = passwordSchema.safeParse(newPassword);
        if (!validationResult.success) {
          const validationError = validationResult.error.issues[0];
          throw new Error(validationError.message);
        }

        await authChangePassword(currentPassword, newPassword);
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [authChangePassword]
  );

  return {
    changePassword,
    loading,
    error,
  };
}

/**
 * Hook for requesting password reset
 * 
 * Sends a password reset email to the specified email address.
 * The email contains a token that can be used to reset the password.
 * 
 * @example
 * ```tsx
 * function ForgotPasswordForm() {
 *   const { requestPasswordReset, loading, error } = useRequestPasswordReset();
 *   const [email, setEmail] = useState('');
 *   const [success, setSuccess] = useState(false);
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     
 *     try {
 *       await requestPasswordReset(email);
 *       setSuccess(true);
 *     } catch (err) {
 *       // Error is already set in hook state
 *     }
 *   };
 *   
 *   if (success) {
 *     return (
 *       <div>
 *         <p>Password reset email sent!</p>
 *         <p>Please check your inbox for instructions.</p>
 *       </div>
 *     );
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input
 *         type="email"
 *         placeholder="Email Address"
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *       />
 *       <button disabled={loading}>
 *         {loading ? 'Sending...' : 'Send Reset Email'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useRequestPasswordReset(): UseRequestPasswordResetReturn {
  const { requestPasswordReset: authRequestPasswordReset } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const requestPasswordReset = useCallback(
    async (email: string, organizationId?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await authRequestPasswordReset(email, organizationId);
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [authRequestPasswordReset]
  );

  return {
    requestPasswordReset,
    loading,
    error,
  };
}

/**
 * Hook for resetting password with token
 * 
 * Resets the password using a token received via email.
 * Validates password strength before submission.
 * 
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @example
 * ```tsx
 * function ResetPasswordForm({ token }: { token: string }) {
 *   const { resetPassword, loading, error } = useResetPassword();
 *   const [newPassword, setNewPassword] = useState('');
 *   const [confirmPassword, setConfirmPassword] = useState('');
 *   const [success, setSuccess] = useState(false);
 *   
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     
 *     if (newPassword !== confirmPassword) {
 *       alert('Passwords do not match');
 *       return;
 *     }
 *     
 *     try {
 *       await resetPassword(token, newPassword);
 *       setSuccess(true);
 *     } catch (err) {
 *       // Error is already set in hook state
 *     }
 *   };
 *   
 *   if (success) {
 *     return (
 *       <div>
 *         <p>Password reset successfully!</p>
 *         <a href="/login">Go to Login</a>
 *       </div>
 *     );
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input
 *         type="password"
 *         placeholder="New Password"
 *         value={newPassword}
 *         onChange={(e) => setNewPassword(e.target.value)}
 *       />
 *       <input
 *         type="password"
 *         placeholder="Confirm Password"
 *         value={confirmPassword}
 *         onChange={(e) => setConfirmPassword(e.target.value)}
 *       />
 *       <button disabled={loading}>
 *         {loading ? 'Resetting...' : 'Reset Password'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useResetPassword(): UseResetPasswordReturn {
  const { resetPassword: authResetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Validate password strength before submission
        const validationResult = passwordSchema.safeParse(newPassword);
        if (!validationResult.success) {
          const validationError = validationResult.error.issues[0];
          throw new Error(validationError.message);
        }

        await authResetPassword(token, newPassword);
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [authResetPassword]
  );

  return {
    resetPassword,
    loading,
    error,
  };
}
