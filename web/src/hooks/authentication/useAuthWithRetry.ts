/**
 * Authentication Hook with Retry Logic
 * Enhanced authentication hook with comprehensive error handling and retry mechanisms
 */

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authErrorHandler, AuthError } from '@/lib/auth/auth-errors';
import { useNetworkStatus } from '@/hooks/utilities-infrastructure/useNetworkStatus';

export interface AuthAttempt {
  timestamp: Date;
  error?: AuthError;
  success: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface UseAuthWithRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: AuthError) => void;
  onSuccess?: () => void;
  onRetry?: (attempt: number) => void;
}

export interface UseAuthWithRetryReturn {
  isLoading: boolean;
  error: AuthError | null;
  attempts: AuthAttempt[];
  canRetry: boolean;
  retryCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  retry: () => Promise<void>;
  clearError: () => void;
  resetAttempts: () => void;
}

export function useAuthWithRetry(options: UseAuthWithRetryOptions = {}): UseAuthWithRetryReturn {
  const router = useRouter();
  const networkStatus = useNetworkStatus();
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    onRetry,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [attempts, setAttempts] = useState<AuthAttempt[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  const lastAttemptRef = useRef<{ action: string; data: Record<string, unknown> } | null>(null);

  const recordAttempt = useCallback((success: boolean, error?: AuthError) => {
    const attempt: AuthAttempt = {
      timestamp: new Date(),
      success,
      ...(error && { error }),
    };

    setAttempts(prev => [attempt, ...prev.slice(0, 9)]); // Keep last 10 attempts
  }, []);

  const executeWithRetry = useCallback(async (
    action: () => Promise<void>,
    actionName: string,
    actionData?: Record<string, unknown>
  ) => {
    // Store last attempt for retry
    lastAttemptRef.current = { action: actionName, data: actionData ?? {} };

    setIsLoading(true);
    setError(null);

    try {
      // Check network connectivity first
      if (!networkStatus.isOnline) {
        throw new Error('No internet connection');
      }

      const isConnected = await networkStatus.checkConnectivity();
      if (!isConnected) {
        throw new Error('Unable to connect to server');
      }

      // Execute the action with retry logic
      await authErrorHandler.withRetry(action, actionName, {
        maxAttempts: maxRetries + 1,
      });

      // Success
      recordAttempt(true);
      setRetryCount(0);
      onSuccess?.();

    } catch (err) {
      const authError = err instanceof Error && 'code' in err && 'retryable' in err && 'userMessage' in err
        ? err as AuthError 
        : authErrorHandler.classifyError(err, actionName);

      recordAttempt(false, authError);
      setError(authError);
      onError?.(authError);

      // Increment retry count for retryable errors
      if (authErrorHandler.isRetryable(authError)) {
        setRetryCount(prev => prev + 1);
      }

      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [networkStatus, maxRetries, onSuccess, onError, recordAttempt]);

  const login = useCallback(async (email: string, password: string) => {
    const loginAction = async () => {
      // TODO: Replace with actual login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: Error & { status?: number; body?: unknown } = new Error(errorData.message || 'Login failed');
        error.status = response.status;
        error.body = errorData;
        throw error;
      }

      const data = await response.json();
      
      // Store tokens and redirect
      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      router.push('/dashboard');
    };

    await executeWithRetry(loginAction, 'login', { email });
  }, [executeWithRetry, router]);

  const register = useCallback(async (registrationData: RegistrationData) => {
    const registerAction = async () => {
      // TODO: Replace with actual registration API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: Error & { status?: number; body?: unknown } = new Error(errorData.message || 'Registration failed');
        error.status = response.status;
        error.body = errorData;
        throw error;
      }

      // Redirect to onboarding for new users
      router.push('/onboarding');
    };

    await executeWithRetry(registerAction, 'register', registrationData as Record<string, unknown>);
  }, [executeWithRetry, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetAttempts = useCallback(() => {
    setAttempts([]);
    setRetryCount(0);
    setError(null);
    lastAttemptRef.current = null;
  }, []);

  // Define canRetry before using it in retry callback
  const canRetry = Boolean(
    error && 
    authErrorHandler.isRetryable(error) && 
    retryCount < maxRetries &&
    lastAttemptRef.current
  );

  const retry = useCallback(async () => {
    const lastAttempt = lastAttemptRef.current;
    if (!lastAttempt || !canRetry) {
      return;
    }

    const { action, data } = lastAttempt;
    onRetry?.(retryCount + 1);

    // Add delay before retry
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount - 1)));
    }

    switch (action) {
      case 'login':
        await login(data.email as string, (data.password as string) || '');
        break;
      case 'register':
        await register(data as RegistrationData);
        break;
    }
  }, [canRetry, retryCount, retryDelay, login, register, onRetry]);

  return {
    isLoading,
    error,
    attempts,
    canRetry,
    retryCount,
    login,
    register,
    retry,
    clearError,
    resetAttempts,
  };
}