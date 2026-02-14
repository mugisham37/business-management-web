/**
 * useRegister Hook
 * 
 * Provides organization registration functionality.
 * Handles token storage, user state updates, and auto-login after registration.
 * 
 * Features:
 * - Register new organization with complete form data
 * - Automatic token storage on success
 * - Auto-login after successful registration
 * - User-friendly error messages
 * - Loading state management
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/foundation/providers/AuthProvider';
import { formatError, AppError } from '@/foundation/utils/errors';
import { 
  useRegisterOrganizationMutation,
  RegisterOrganizationInput 
} from '@/foundation/types/generated/graphql';

/**
 * Return type for useRegister hook
 */
export interface UseRegisterReturn {
  /**
   * Register function
   * @param input - Complete registration form data
   * @returns Promise that resolves when registration is complete
   */
  register: (input: RegisterOrganizationInput) => Promise<void>;
  
  /**
   * Loading state - true while registration is in progress
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if registration fails
   */
  error: AppError | null;
}

/**
 * Hook for organization registration
 * 
 * Wraps the RegisterOrganization mutation with loading and error state management.
 * Automatically logs in the user after successful registration by setting auth state.
 * 
 * @example
 * ```tsx
 * function SignupForm() {
 *   const { register, loading, error } = useRegister();
 *   
 *   const handleSubmit = async (formData: RegisterOrganizationInput) => {
 *     await register(formData);
 *     // User is now authenticated and can be redirected to dashboard
 *     navigate('/dashboard/overview');
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input type="text" name="businessName" />
 *       <input type="email" name="email" />
 *       <input type="password" name="password" />
 *       <button disabled={loading}>
 *         {loading ? 'Creating account...' : 'Sign Up'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useRegister(): UseRegisterReturn {
  const { refreshSession } = useAuth();
  const [registerMutation] = useRegisterOrganizationMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const register = useCallback(
    async (input: RegisterOrganizationInput): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await registerMutation({
          variables: { input },
        });

        if (!result.data?.registerOrganization) {
          throw new Error('Registration failed: No data returned');
        }

        // Auto-login: refresh session to set user state from stored tokens
        // The mutation automatically stores tokens via Apollo middleware
        await refreshSession();
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [registerMutation, refreshSession]
  );

  return {
    register,
    loading,
    error,
  };
}
