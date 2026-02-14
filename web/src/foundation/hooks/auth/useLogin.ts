/**
 * useLogin Hook
 * 
 * Provides login functionality with email/password authentication.
 * Handles token storage, user state updates, and MFA flow.
 * 
 * Features:
 * - Login with email and password
 * - Automatic token storage on success
 * - MFA flow handling
 * - User-friendly error messages
 * - Loading state management
 * 
 * Requirements: 2.1, 2.2
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/foundation/providers/AuthProvider';
import { formatError, AppError } from '@/foundation/utils/errors';
import { LoginResult } from '@/foundation/lib/auth/auth-manager';

/**
 * Return type for useLogin hook
 */
export interface UseLoginReturn {
  /**
   * Login function
   * @param email - User email
   * @param password - User password
   * @param organizationId - Organization ID
   * @returns Login result with requiresMFA flag and optional user
   */
  login: (email: string, password: string, organizationId: string) => Promise<LoginResult>;
  
  /**
   * Loading state - true while login is in progress
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if login fails
   */
  error: AppError | null;
}

/**
 * Hook for user login with email and password
 * 
 * Wraps the AuthProvider's login function with loading and error state management.
 * Automatically formats errors for user-friendly display.
 * 
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, loading, error } = useLogin();
 *   
 *   const handleSubmit = async (email: string, password: string, orgId: string) => {
 *     const result = await login(email, password, orgId);
 *     
 *     if (result.requiresMFA) {
 *       // Show MFA verification form
 *       navigate('/verify-mfa');
 *     } else {
 *       // Login successful, redirect to dashboard
 *       navigate('/dashboard');
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input type="email" />
 *       <input type="password" />
 *       <button disabled={loading}>
 *         {loading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useLogin(): UseLoginReturn {
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const login = useCallback(
    async (email: string, password: string, organizationId: string): Promise<LoginResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await authLogin(email, password, organizationId);
        return result;
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [authLogin]
  );

  return {
    login,
    loading,
    error,
  };
}
