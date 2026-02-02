// Auth Components Index
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { AuthPage } from './AuthPage';
export { SocialLoginButtons } from './SocialLoginButtons';
export { AuthErrorDisplay } from './AuthErrorDisplay';

// Re-export social auth utilities
export { socialAuthManager } from '@/lib/auth/social-auth';
export { useSocialAuth } from '@/hooks/authentication/useSocialAuth';

// Re-export error handling utilities
export { authErrorHandler, networkChecker } from '@/lib/auth/auth-errors';
export { useAuthWithRetry } from '@/hooks/authentication/useAuthWithRetry';
export { useNetworkStatus } from '@/hooks/utilities-infrastructure/useNetworkStatus';
