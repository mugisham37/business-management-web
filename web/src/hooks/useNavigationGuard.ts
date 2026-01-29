/**
 * Navigation Guard Hook
 * Implements consistent permission enforcement during navigation
 * Requirements 7.4, 7.5 - Navigation guards with permission validation and transparent session renewal
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthGateway } from '@/lib/auth/auth-gateway';
import { useSessionRenewal } from '@/lib/auth/session-renewal';
import { usePermissions } from '@/hooks/useAuth';

export interface NavigationGuardConfig {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  redirectTo?: string;
  allowedRoles?: string[];
  tierRestrictions?: string[];
}

export interface NavigationGuardState {
  isLoading: boolean;
  hasAccess: boolean;
  error: string | null;
  user: any;
  permissions: string[];
}

/**
 * Navigation Guard Hook
 * Provides comprehensive navigation protection with permission validation
 */
export function useNavigationGuard(config: NavigationGuardConfig = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { getCurrentSession } = useAuthGateway();
  const { startMonitoring, stopMonitoring, isValid, forceRenewal } = useSessionRenewal();
  const { hasPermission, hasAllPermissions } = usePermissions();

  const [state, setState] = useState<NavigationGuardState>({
    isLoading: true,
    hasAccess: false,
    error: null,
    user: null,
    permissions: []
  });

  const {
    requireAuth = true,
    requiredPermissions = [],
    redirectTo = '/auth',
    allowedRoles = [],
    tierRestrictions = []
  } = config;

  /**
   * Check user permissions against requirements
   */
  const checkPermissions = useCallback(async (user: any): Promise<boolean> => {
    if (requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    try {
      // Check if user has all required permissions
      const hasAllRequired = await hasAllPermissions(user.id, requiredPermissions);
      return hasAllRequired;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, [requiredPermissions, hasAllPermissions]);

  /**
   * Check user role against allowed roles
   */
  const checkRoles = useCallback((user: any): boolean => {
    if (allowedRoles.length === 0) {
      return true; // No specific roles required
    }

    const userRoles = user.roles || [];
    return allowedRoles.some(role => userRoles.includes(role));
  }, [allowedRoles]);

  /**
   * Check user tier against tier restrictions
   */
  const checkTierRestrictions = useCallback((user: any): boolean => {
    if (tierRestrictions.length === 0) {
      return true; // No tier restrictions
    }

    const userTier = user.tier || 'micro';
    return tierRestrictions.includes(userTier);
  }, [tierRestrictions]);

  /**
   * Validate access based on all requirements
   */
  const validateAccess = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check session validity first
      if (!isValid()) {
        console.log('Session invalid, attempting renewal...');
        const renewed = await forceRenewal();
        
        if (!renewed) {
          if (requireAuth) {
            sessionStorage.setItem('intended_destination', pathname);
            router.push(redirectTo);
            return;
          }
        }
      }

      // Get current session
      const session = await getCurrentSession();

      if (requireAuth && !session.isAuthenticated) {
        sessionStorage.setItem('intended_destination', pathname);
        router.push(redirectTo);
        return;
      }

      if (!session.isAuthenticated) {
        setState({
          isLoading: false,
          hasAccess: true,
          error: null,
          user: null,
          permissions: []
        });
        return;
      }

      const user = session.user;

      // Check if user needs to complete onboarding
      if (session.requiresOnboarding && pathname !== '/onboarding') {
        router.push('/onboarding');
        return;
      }

      // Check permissions
      const hasRequiredPermissions = await checkPermissions(user);
      if (!hasRequiredPermissions) {
        setState({
          isLoading: false,
          hasAccess: false,
          error: 'Insufficient permissions',
          user,
          permissions: user.permissions || []
        });
        router.push('/dashboard?error=insufficient_permissions');
        return;
      }

      // Check roles
      const hasRequiredRoles = checkRoles(user);
      if (!hasRequiredRoles) {
        setState({
          isLoading: false,
          hasAccess: false,
          error: 'Insufficient role privileges',
          user,
          permissions: user.permissions || []
        });
        router.push('/dashboard?error=insufficient_role');
        return;
      }

      // Check tier restrictions
      const meetsTierRequirements = checkTierRestrictions(user);
      if (!meetsTierRequirements) {
        setState({
          isLoading: false,
          hasAccess: false,
          error: 'Tier upgrade required',
          user,
          permissions: user.permissions || []
        });
        router.push('/pricing?upgrade_required=true');
        return;
      }

      // All checks passed
      setState({
        isLoading: false,
        hasAccess: true,
        error: null,
        user,
        permissions: user.permissions || []
      });

    } catch (error) {
      console.error('Access validation failed:', error);
      setState({
        isLoading: false,
        hasAccess: false,
        error: error instanceof Error ? error.message : 'Access validation failed',
        user: null,
        permissions: []
      });

      if (requireAuth) {
        router.push(redirectTo);
      }
    }
  }, [
    pathname,
    requireAuth,
    redirectTo,
    router,
    getCurrentSession,
    isValid,
    forceRenewal,
    checkPermissions,
    checkRoles,
    checkTierRestrictions
  ]);

  /**
   * Handle navigation events
   */
  useEffect(() => {
    validateAccess();
  }, [validateAccess]);

  /**
   * Start session monitoring when component mounts
   */
  useEffect(() => {
    if (requireAuth) {
      startMonitoring();
    }

    return () => {
      if (requireAuth) {
        stopMonitoring();
      }
    };
  }, [requireAuth, startMonitoring, stopMonitoring]);

  /**
   * Listen for session renewal events
   */
  useEffect(() => {
    const handleSessionRenewal = () => {
      console.log('Session renewed, revalidating access...');
      validateAccess();
    };

    window.addEventListener('sessionRenewed', handleSessionRenewal);
    return () => {
      window.removeEventListener('sessionRenewed', handleSessionRenewal);
    };
  }, [validateAccess]);

  /**
   * Revalidate access manually
   */
  const revalidate = useCallback(() => {
    validateAccess();
  }, [validateAccess]);

  return {
    ...state,
    revalidate
  };
}

/**
 * Route-specific navigation guard hooks
 */

/**
 * Dashboard Navigation Guard
 */
export function useDashboardGuard() {
  return useNavigationGuard({
    requireAuth: true,
    requiredPermissions: ['dashboard:read'],
    redirectTo: '/auth'
  });
}

/**
 * Admin Navigation Guard
 */
export function useAdminGuard() {
  return useNavigationGuard({
    requireAuth: true,
    requiredPermissions: ['admin:*'],
    allowedRoles: ['admin', 'super_admin'],
    redirectTo: '/dashboard?error=admin_required'
  });
}

/**
 * Tier-based Navigation Guard
 */
export function useTierGuard(requiredTiers: string[]) {
  return useNavigationGuard({
    requireAuth: true,
    tierRestrictions: requiredTiers,
    redirectTo: '/pricing?upgrade_required=true'
  });
}

/**
 * Permission-based Navigation Guard
 */
export function usePermissionGuard(permissions: string[]) {
  return useNavigationGuard({
    requireAuth: true,
    requiredPermissions: permissions,
    redirectTo: '/dashboard?error=insufficient_permissions'
  });
}

export default useNavigationGuard;