/**
 * Social Authentication Hook
 * 
 * Handles Google, Facebook, and GitHub OAuth flows for mobile devices
 * with proper error handling and retry mechanisms.
 * 
 * Updated to use MobileAuthBridge for complete OAuth integration.
 */
import { useState, useCallback } from 'react';
import { mobileAuthBridge, AuthResult } from '@/lib/auth/MobileAuthBridge';

export function useSocialAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performOAuthLogin = useCallback(async (provider: 'google' | 'facebook' | 'github'): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);

      let result: AuthResult;
      
      switch (provider) {
        case 'google':
          result = await mobileAuthBridge.authenticateWithGoogle();
          break;
        case 'facebook':
          result = await mobileAuthBridge.authenticateWithFacebook();
          break;
        case 'github':
          result = await mobileAuthBridge.authenticateWithGitHub();
          break;
        default:
          throw new Error(`Unsupported OAuth provider: ${provider}`);
      }

      if (!result.success) {
        setError(result.error || `${provider} authentication failed`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `${provider} login failed`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const googleLogin = useCallback((): Promise<AuthResult> => {
    return performOAuthLogin('google');
  }, [performOAuthLogin]);

  const facebookLogin = useCallback((): Promise<AuthResult> => {
    return performOAuthLogin('facebook');
  }, [performOAuthLogin]);

  const githubLogin = useCallback((): Promise<AuthResult> => {
    return performOAuthLogin('github');
  }, [performOAuthLogin]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    googleLogin,
    facebookLogin,
    githubLogin,
    isLoading,
    error,
    clearError,
    // Get available providers
    availableProviders: mobileAuthBridge.getAvailableProviders(),
  };
}