/**
 * MFA Hooks
 * 
 * Provides hooks for Multi-Factor Authentication (MFA) operations.
 * Includes enabling MFA, disabling MFA, and verifying MFA codes.
 * 
 * Features:
 * - Enable MFA with QR code and secret
 * - Disable MFA with password verification
 * - Verify MFA code during login
 * - User-friendly error messages
 * - Loading state management
 * 
 * Requirements: 13.1, 13.4, 13.6
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/foundation/providers/AuthProvider';
import { formatError, AppError } from '@/foundation/utils/errors';
import { MFASetup, AuthUser } from '@/foundation/lib/auth/auth-manager';

/**
 * Return type for useEnableMFA hook
 */
export interface UseEnableMFAReturn {
  /**
   * Enable MFA function
   * @returns MFA setup data with QR code, secret, and backup codes
   */
  enableMFA: () => Promise<MFASetup>;
  
  /**
   * Loading state - true while enabling MFA
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Return type for useDisableMFA hook
 */
export interface UseDisableMFAReturn {
  /**
   * Disable MFA function
   * @param password - Current user password for verification
   * @param totpToken - Current TOTP token from authenticator app
   */
  disableMFA: (password: string, totpToken: string) => Promise<void>;
  
  /**
   * Loading state - true while disabling MFA
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Return type for useVerifyMFA hook
 */
export interface UseVerifyMFAReturn {
  /**
   * Verify MFA function
   * @param userId - User ID from login response
   * @param token - TOTP token from authenticator app
   * @param organizationId - Organization ID
   * @returns Authenticated user data
   */
  verifyMFA: (userId: string, token: string, organizationId: string) => Promise<AuthUser>;
  
  /**
   * Loading state - true while verifying MFA
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if verification fails
   */
  error: AppError | null;
}

/**
 * Hook for enabling MFA
 * 
 * Enables Multi-Factor Authentication for the current user.
 * Returns QR code for scanning with authenticator app, secret for manual entry,
 * and backup codes for account recovery.
 * 
 * @example
 * ```tsx
 * function EnableMFAForm() {
 *   const { enableMFA, loading, error } = useEnableMFA();
 *   const [mfaSetup, setMfaSetup] = useState<MFASetup | null>(null);
 *   
 *   const handleEnable = async () => {
 *     const setup = await enableMFA();
 *     setMfaSetup(setup);
 *   };
 *   
 *   return (
 *     <div>
 *       {error && <div className="error">{error.message}</div>}
 *       {!mfaSetup ? (
 *         <button onClick={handleEnable} disabled={loading}>
 *           Enable MFA
 *         </button>
 *       ) : (
 *         <div>
 *           <img src={mfaSetup.qrCode} alt="QR Code" />
 *           <p>Secret: {mfaSetup.secret}</p>
 *           <p>Backup Codes: {mfaSetup.backupCodes.join(', ')}</p>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnableMFA(): UseEnableMFAReturn {
  const { enableMFA: authEnableMFA } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const enableMFA = useCallback(async (): Promise<MFASetup> => {
    setLoading(true);
    setError(null);

    try {
      const setup = await authEnableMFA();
      return setup;
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError);
      throw formattedError;
    } finally {
      setLoading(false);
    }
  }, [authEnableMFA]);

  return {
    enableMFA,
    loading,
    error,
  };
}

/**
 * Hook for disabling MFA
 * 
 * Disables Multi-Factor Authentication for the current user.
 * Requires current password and a valid TOTP token for security verification.
 * 
 * @example
 * ```tsx
 * function DisableMFAForm() {
 *   const { disableMFA, loading, error } = useDisableMFA();
 *   const [password, setPassword] = useState('');
 *   const [totpToken, setTotpToken] = useState('');
 *   
 *   const handleDisable = async () => {
 *     await disableMFA(password, totpToken);
 *     // MFA disabled successfully
 *   };
 *   
 *   return (
 *     <form onSubmit={handleDisable}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input
 *         type="password"
 *         placeholder="Current Password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *       <input
 *         type="text"
 *         placeholder="TOTP Token"
 *         value={totpToken}
 *         onChange={(e) => setTotpToken(e.target.value)}
 *       />
 *       <button disabled={loading}>
 *         {loading ? 'Disabling...' : 'Disable MFA'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useDisableMFA(): UseDisableMFAReturn {
  const { disableMFA: authDisableMFA } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const disableMFA = useCallback(
    async (password: string, totpToken: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await authDisableMFA(password, totpToken);
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [authDisableMFA]
  );

  return {
    disableMFA,
    loading,
    error,
  };
}

/**
 * Hook for verifying MFA code
 * 
 * Verifies the TOTP code during login when MFA is required.
 * Completes the authentication flow and stores tokens.
 * 
 * @example
 * ```tsx
 * function VerifyMFAForm({ userId, organizationId }: { userId: string; organizationId: string }) {
 *   const { verifyMFA, loading, error } = useVerifyMFA();
 *   const [token, setToken] = useState('');
 *   
 *   const handleVerify = async () => {
 *     const user = await verifyMFA(userId, token, organizationId);
 *     // MFA verified, user is now authenticated
 *     navigate('/dashboard');
 *   };
 *   
 *   return (
 *     <form onSubmit={handleVerify}>
 *       {error && <div className="error">{error.message}</div>}
 *       <input
 *         type="text"
 *         placeholder="Enter 6-digit code"
 *         value={token}
 *         onChange={(e) => setToken(e.target.value)}
 *         maxLength={6}
 *       />
 *       <button disabled={loading}>
 *         {loading ? 'Verifying...' : 'Verify'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useVerifyMFA(): UseVerifyMFAReturn {
  const { verifyMFA: authVerifyMFA } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const verifyMFA = useCallback(
    async (userId: string, token: string, organizationId: string): Promise<AuthUser> => {
      setLoading(true);
      setError(null);

      try {
        const user = await authVerifyMFA(userId, token, organizationId);
        return user;
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [authVerifyMFA]
  );

  return {
    verifyMFA,
    loading,
    error,
  };
}
