/**
 * Route Guard Component
 * Implements consistent permission enforcement during navigation
 * Requirements 7.4, 7.5 - Navigation guards with permission validation and transparent session renewal
 */

'use client';

import { ReactNode } from 'react';
import { useNavigationGuard, NavigationGuardConfig } from '@/hooks/useNavigationGuard';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RouteGuardProps extends NavigationGuardConfig {
  children: ReactNode;
  fallback?: ReactNode;
  showError?: boolean;
}

/**
 * Route Guard Component
 * Protects routes based on authentication and permission requirements
 */
export function RouteGuard({
  children,
  fallback,
  showError = true,
  ...guardConfig
}: RouteGuardProps) {
  const { isLoading, hasAccess, error, revalidate } = useNavigationGuard(guardConfig);

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
      requireAuth={true}
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
      requireAuth={true}
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
export function PermissionGuard({ 
  children, 
  permissions 
}: { 
  children: ReactNode;
  permissions: string[];
}) {
  return (
    <RouteGuard
      requireAuth={true}
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
      requireAuth={true}
      tierRestrictions={requiredTiers}
      redirectTo="/pricing?upgrade_required=true"
    >
      {children}
    </RouteGuard>
  );
}

export default RouteGuard;