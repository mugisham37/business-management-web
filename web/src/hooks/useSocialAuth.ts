/**
 * Social Authentication Hook
 * Provides social login functionality with error handling and loading states
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { socialAuthManager, SocialAuthResult, SocialAuthError } from '@/lib/auth/social-auth';
import { useAuth } from '@/components/providers/auth-provider';

export interface UseSocialAuthOptions {
  onSuccess?: (result: SocialAuthResult) => void;
  onError?: (error: SocialAuthError) => void;
  redirectTo?: string;
  usePopup?: boolean;
}

export interface UseSocialAuthReturn {
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  clearError: () => void;
  isProviderAvailable: (provider: string) => boolean;
}

export function useSocialAuth(options: UseSocialAuthOptions = {}): UseSocialAuthReturn {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    redirectTo = '/dashboard',
    usePopup = true,
  } = options;

  const handleSocialLogin = useCallback(async (provider: 'google' | 'facebook' | 'github') => {
    if (!socialAuthManager.isProviderConfigured(provider)) {
      const errorMsg = `${provider} authentication is not configured`;
      setError(errorMsg);
      onError?.({
        code: 'PROVIDER_NOT_CONFIGURED',
        message: errorMsg,
        provider,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result: SocialAuthResult;

      if (usePopup) {
        // Use popup flow
        result = await socialAuthManager.authenticateWithPopup(provider);
      } else {
        // Use redirect flow
        await socialAuthManager.authenticateWithRedirect(provider);
        return; // Function ends here for redirect flow
      }

      // Handle successful authentication
      if (result) {
        // Update auth context with user data
        // Note: This would typically involve calling your backend API
        // to create/update the user and get proper JWT tokens
        
        // For now, we'll simulate the login process
        // In a real implementation, you'd call your backend API here
        console.log('Social auth result:', result);

        // Call success callback
        onSuccess?.(result);

        // Navigate to appropriate page
        if (result.user.email && !result.user.firstName) {
          // New user - redirect to onboarding
          router.push('/onboarding');
        } else {
          // Existing user - redirect to dashboard
          router.push(redirectTo);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      
      const socialError: SocialAuthError = {
        code: 'AUTH_FAILED',
        message: errorMessage,
        provider,
      };
      
      onError?.(socialError);
      console.error(`${provider} authentication failed:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [usePopup, onSuccess, onError, redirectTo, router, login]);

  const loginWithGoogle = useCallback(() => handleSocialLogin('google'), [handleSocialLogin]);
  const loginWithFacebook = useCallback(() => handleSocialLogin('facebook'), [handleSocialLogin]);
  const loginWithGithub = useCallback(() => handleSocialLogin('github'), [handleSocialLogin]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isProviderAvailable = useCallback((provider: string) => {
    return socialAuthManager.isProviderConfigured(provider);
  }, []);

  return {
    isLoading,
    error,
    loginWithGoogle,
    loginWithFacebook,
    loginWithGithub,
    clearError,
    isProviderAvailable,
  };
}

/**
 * Hook for handling OAuth callbacks
 * Used in callback pages to process OAuth responses
 */
export function useOAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SocialAuthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCallback = useCallback(async (
    provider: 'google' | 'facebook' | 'github',
    code: string,
    state: string
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const authResult = await socialAuthManager.handleCallback(provider, code, state);
      setResult(authResult);
      return authResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Callback processing failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    result,
    error,
    handleCallback,
  };
}