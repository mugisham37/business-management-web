// Authentication Components
export { AuthPage } from './AuthPage';
export { LoginForm } from './LoginForm';
export { RegisterForm } from './RegisterForm';
export { SocialLoginButtons } from './SocialLoginButtons';
export { AuthErrorDisplay } from './AuthErrorDisplay';
export { MFAVerificationModal } from './MFAVerificationModal';

// Authentication Guards and Protection
export { RouteGuard } from './RouteGuard';
export { PermissionGuard } from './PermissionGuard';

// Session and Event Management
export { SessionManager } from './SessionManager';
export { AuthEventHandler } from './AuthEventHandler';

// Security Components


// Foundation Layer Hooks (re-exported for convenience)
export { useAuth } from '@/lib/hooks/auth/useAuth';
export { useMFA } from '@/lib/hooks/auth/useMFA';
export { usePermissions } from '@/lib/hooks/auth/usePermissions';
export { useSecurity } from '@/lib/hooks/auth/useSecurity';
export { useSocialAuth } from '@/lib/hooks/auth/useSocialAuth';
export { useTier } from '@/lib/hooks/auth/useTier';

// Foundation Layer Utilities (re-exported for convenience)
export { AuthEventEmitter } from '@/lib/auth/auth-events';
export { TokenManager } from '@/lib/auth/token-manager';
