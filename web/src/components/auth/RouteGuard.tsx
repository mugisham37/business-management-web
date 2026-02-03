/**
 * Route Guard Component
 * Implements consistent permission enforcement during navigation
 * Uses foundation layer hooks: useAuth, usePermissions, useTier
 */

'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { usePermissions } from '@/lib/hooks/auth/usePermissions';
import { useTier } from '@/lib/hooks/auth/useTier';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export interface RouteGuardProps {
  children: ReactNode;
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean;
  requiredPermissions?: string[];
  allowedRoles?: string[];
  tierRestrictions?: string[];
  /** Path to redirect to when access is denied (alias for redirectTo) */
  fallbackPath?: string;
  /** @deprecated Use fallbackPath instead */
  redirectTo?: string;
  fallback?: ReactNode;
  showError?: boolean;
}

/**
 * Custom hook for navigation guard logic
 */
function useNavigationGuardLogic(config: {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  allowedRoles?: string[];
  tierRestrictions?: string[];
  redirectTo?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, hasRole } = useAuth();
  const { hasAllPermissions, isLoading: permLoading } = usePermissions();
  const { hasFeature, isLoading: tierLoading } = useTier();

  const requireAuth = config.requireAuth !== false; // Default to true
  const isLoading = authLoading || permLoading || tierLoading;

  // Compute error state synchronously (not in effect)
  const error = useMemo(() => {
    if (isLoading) return null;

    // Check authentication (only if requireAuth is true)
    if (requireAuth && !isAuthenticated) {
      return 'Authentication required';
    }

    // Check permissions
    if (config.requiredPermissions && config.requiredPermissions.length > 0) {
      if (!hasAllPermissions(config.requiredPermissions)) {
        return 'Insufficient permissions';
      }
    }

    // Check roles
    if (config.allowedRoles && config.allowedRoles.length > 0) {
      const hasAllowedRole = config.allowedRoles.some(role => hasRole(role));
      if (!hasAllowedRole) {
        return 'Role not authorized';
      }
    }

    // Check tier restrictions
    if (config.tierRestrictions && config.tierRestrictions.length > 0) {
      const hasTierAccess = config.tierRestrictions.some(feature => hasFeature(feature));
      if (!hasTierAccess) {
        return 'Tier upgrade required';
      }
    }

    return null;
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    config.requiredPermissions,
    config.allowedRoles,
    config.tierRestrictions,
    hasAllPermissions,
    hasRole,
    hasFeature,
  ]);

  // Handle redirect as a side effect (only when error changes)
  useEffect(() => {
    if (!isLoading && error && config.redirectTo) {
      router.push(config.redirectTo);
    }
  }, [isLoading, error, config.redirectTo, router]);

  const hasAccess = (requireAuth ? isAuthenticated : true) && !error;

  const revalidate = () => {
    // Trigger a re-render by forcing a refresh of auth state
    // This is a no-op for now since error is computed
  };

  return { isLoading, hasAccess, error, revalidate };
}

/**
 * Route Guard Component
 * Protects routes based on authentication and permission requirements
 */
export function RouteGuard({
  children,
  requireAuth = true,
  requiredPermissions = [],
  allowedRoles = [],
  tierRestrictions = [],
  fallbackPath,
  redirectTo = '/auth',
  fallback,
  showError = true,
}: RouteGuardProps) {
  // Support both fallbackPath and redirectTo (fallbackPath takes precedence)
  const redirectPath = fallbackPath || redirectTo;
  
  const { isLoading, hasAccess, error, revalidate } = useNavigationGuardLogic({
    requireAuth,
    requiredPermissions,
    allowedRoles,
    tierRestrictions,
    redirectTo: redirectPath,
  });

  // Show loading state while checking access
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if access is denied and showError is true
  if (!hasAccess && error && showError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mb-4">
              {error}
            </AlertDescription>
            <Button onClick={revalidate} variant="outline" size="sm">
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // Render children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Return null while redirecting or if access is denied without error display
  return null;
}

/**
 * Dashboard Route Guard
 * Specific guard for dashboard routes with common requirements
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard
      requiredPermissions={['dashboard:read']}
      redirectTo="/auth"
    >
      {children}
    </RouteGuard>
  );
}

/**
 * Admin Route Guard
 * Guard for admin-only routes
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <RouteGuard
      requiredPermissions={['admin:*']}
      allowedRoles={['admin', 'super_admin']}
      redirectTo="/dashboard?error=admin_required"
    >
      {children}
    </RouteGuard>
  );
}

/**
 * Permission-based Route Guard
 * Flexible guard for specific permission requirements
 */
export function PermissionRouteGuard({ 
  children, 
  permissions 
}: { 
  children: ReactNode;
  permissions: string[];
}) {
  return (
    <RouteGuard
      requiredPermissions={permissions}
      redirectTo="/dashboard?error=insufficient_permissions"
    >
      {children}
    </RouteGuard>
  );
}

/**
 * Tier-based Route Guard
 * Guard for tier-restricted features
 */
export function TierGuard({ 
  children, 
  requiredTiers 
}: { 
  children: ReactNode;
  requiredTiers: string[];
}) {
  return (
    <RouteGuard
      tierRestrictions={requiredTiers}
      redirectTo="/pricing?upgrade_required=true"
    >
      {children}
    </RouteGuard>
  );
}

export default RouteGuard;
