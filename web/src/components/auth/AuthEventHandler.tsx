'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { AuthEventEmitter } from '@/lib/auth/auth-events';
import { useRouter } from 'next/navigation';

/**
 * Global Auth Event Handler
 * Handles authentication events and provides user feedback
 */
export function AuthEventHandler() {
  const router = useRouter();

  useEffect(() => {
    // Authentication events
    const handleLogin = (user: { id: string; email: string; displayName?: string }) => {
      toast.success(`Welcome back, ${user.displayName || user.email}!`);
    };

    const handleLogout = (data?: { reason?: string }) => {
      const messages = {
        manual: 'You have been signed out',
        token_expired: 'Your session has expired. Please sign in again.',
        unauthorized: 'Authentication required. Please sign in.',
        multi_tab_logout: 'You have been signed out from another tab',
      };
      
      const message = data?.reason ? messages[data.reason as keyof typeof messages] : messages.manual;
      toast.info(message || 'You have been signed out');
    };

    const handleRegister = (user: { id: string; email: string; displayName?: string }) => {
      toast.success(`Account created successfully! Welcome, ${user.displayName || user.email}!`);
    };

    const handleSessionExpired = () => {
      toast.error('Your session has expired. Please sign in again.');
    };

    const handlePermissionDenied = (data: { operation?: string; error: string }) => {
      toast.error(`Access denied: ${data.error}`);
    };

    // MFA events
    const handleMfaRequired = () => {
      toast.info('Multi-factor authentication required');
    };

    const handleMfaEnabled = () => {
      toast.success('Multi-factor authentication has been enabled');
    };

    const handleMfaDisabled = () => {
      toast.info('Multi-factor authentication has been disabled');
    };

    const handleMfaVerified = () => {
      toast.success('Multi-factor authentication verified');
    };

    // Security events
    const handleRiskScoreChanged = (data: { score: number; level: string }) => {
      if (data.level === 'high' || data.level === 'critical') {
        toast.warning(`Security alert: ${data.level} risk level detected`);
      }
    };

    const handleDeviceTrustChanged = (data: { trusted: boolean; score: number }) => {
      if (!data.trusted) {
        toast.warning('Device trust level changed. Additional verification may be required.');
      }
    };

    const handleSuspiciousActivity = () => {
      toast.error('Suspicious activity detected. Please verify your account.');
    };

    const handleAccountLocked = () => {
      toast.error('Your account has been locked due to security concerns. Please contact support.');
    };

    const handleAccountUnlocked = () => {
      toast.success('Your account has been unlocked');
    };

    // Permission events
    const handlePermissionsUpdated = () => {
      toast.info('Your permissions have been updated');
    };

    const handlePermissionGranted = (permission: string) => {
      toast.success(`Permission granted: ${permission}`);
    };

    const handlePermissionRevoked = (permission: string) => {
      toast.warning(`Permission revoked: ${permission}`);
    };

    const handleRoleAssigned = (role: string) => {
      toast.success(`Role assigned: ${role}`);
    };

    // Social auth events
    const handleProviderLinked = (provider: string) => {
      toast.success(`${provider} account linked successfully`);
    };

    const handleProviderUnlinked = (provider: string) => {
      toast.info(`${provider} account unlinked`);
    };

    // Tier events
    const handleTierUpgraded = (newTier: string) => {
      toast.success(`Congratulations! You've been upgraded to ${newTier}`);
    };

    const handleTierDowngraded = (newTier: string) => {
      toast.info(`Your plan has been changed to ${newTier}`);
    };

    const handleFeatureLocked = (feature: string) => {
      toast.warning(`Feature "${feature}" requires a higher tier plan`);
    };

    // Network events
    const handleNetworkOffline = () => {
      toast.error('You are currently offline. Some features may not be available.');
    };

    const handleNetworkOnline = () => {
      toast.success('Connection restored');
    };

    const handleNetworkReconnected = () => {
      toast.success('Reconnected to server');
    };

    // Token events
    const handleTokenRefreshFailed = () => {
      toast.error('Session refresh failed. Please sign in again.');
      router.push('/auth');
    };

    // Register all event listeners
    AuthEventEmitter.on('auth:login', handleLogin);
    AuthEventEmitter.on('auth:logout', handleLogout);
    AuthEventEmitter.on('auth:register', handleRegister);
    AuthEventEmitter.on('auth:session_expired', handleSessionExpired);
    AuthEventEmitter.on('auth:permission_denied', handlePermissionDenied);

    AuthEventEmitter.on('auth:mfa_required', handleMfaRequired);
    AuthEventEmitter.on('auth:mfa_enabled', handleMfaEnabled);
    AuthEventEmitter.on('auth:mfa_disabled', handleMfaDisabled);
    AuthEventEmitter.on('auth:mfa_verified', handleMfaVerified);

    AuthEventEmitter.on('security:risk_score_changed', handleRiskScoreChanged);
    AuthEventEmitter.on('security:device_trust_changed', handleDeviceTrustChanged);
    AuthEventEmitter.on('security:suspicious_activity', handleSuspiciousActivity);
    AuthEventEmitter.on('security:account_locked', handleAccountLocked);
    AuthEventEmitter.on('security:account_unlocked', handleAccountUnlocked);

    AuthEventEmitter.on('permissions:updated', handlePermissionsUpdated);
    AuthEventEmitter.on('permissions:granted', handlePermissionGranted);
    AuthEventEmitter.on('permissions:revoked', handlePermissionRevoked);
    AuthEventEmitter.on('role:assigned', handleRoleAssigned);

    AuthEventEmitter.on('social:provider_linked', handleProviderLinked);
    AuthEventEmitter.on('social:provider_unlinked', handleProviderUnlinked);

    AuthEventEmitter.on('tier:upgraded', handleTierUpgraded);
    AuthEventEmitter.on('tier:downgraded', handleTierDowngraded);
    AuthEventEmitter.on('tier:feature_locked', handleFeatureLocked);

    AuthEventEmitter.on('network:offline', handleNetworkOffline);
    AuthEventEmitter.on('network:online', handleNetworkOnline);
    AuthEventEmitter.on('network:reconnected', handleNetworkReconnected);

    AuthEventEmitter.on('tokens:refresh_failed', handleTokenRefreshFailed);

    // Cleanup function
    return () => {
      AuthEventEmitter.off('auth:login', handleLogin);
      AuthEventEmitter.off('auth:logout', handleLogout);
      AuthEventEmitter.off('auth:register', handleRegister);
      AuthEventEmitter.off('auth:session_expired', handleSessionExpired);
      AuthEventEmitter.off('auth:permission_denied', handlePermissionDenied);

      AuthEventEmitter.off('auth:mfa_required', handleMfaRequired);
      AuthEventEmitter.off('auth:mfa_enabled', handleMfaEnabled);
      AuthEventEmitter.off('auth:mfa_disabled', handleMfaDisabled);
      AuthEventEmitter.off('auth:mfa_verified', handleMfaVerified);

      AuthEventEmitter.off('security:risk_score_changed', handleRiskScoreChanged);
      AuthEventEmitter.off('security:device_trust_changed', handleDeviceTrustChanged);
      AuthEventEmitter.off('security:suspicious_activity', handleSuspiciousActivity);
      AuthEventEmitter.off('security:account_locked', handleAccountLocked);
      AuthEventEmitter.off('security:account_unlocked', handleAccountUnlocked);

      AuthEventEmitter.off('permissions:updated', handlePermissionsUpdated);
      AuthEventEmitter.off('permissions:granted', handlePermissionGranted);
      AuthEventEmitter.off('permissions:revoked', handlePermissionRevoked);
      AuthEventEmitter.off('role:assigned', handleRoleAssigned);

      AuthEventEmitter.off('social:provider_linked', handleProviderLinked);
      AuthEventEmitter.off('social:provider_unlinked', handleProviderUnlinked);

      AuthEventEmitter.off('tier:upgraded', handleTierUpgraded);
      AuthEventEmitter.off('tier:downgraded', handleTierDowngraded);
      AuthEventEmitter.off('tier:feature_locked', handleFeatureLocked);

      AuthEventEmitter.off('network:offline', handleNetworkOffline);
      AuthEventEmitter.off('network:online', handleNetworkOnline);
      AuthEventEmitter.off('network:reconnected', handleNetworkReconnected);

      AuthEventEmitter.off('tokens:refresh_failed', handleTokenRefreshFailed);
    };
  }, [router]);

  return null;
}

export default AuthEventHandler;