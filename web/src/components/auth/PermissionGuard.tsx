/**
 * Permission Guard Component
 * React component for permission-aware rendering with tier hierarchy support
 * Uses foundation layer hooks: useAuth, usePermissions, useTier
 */

'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { usePermissions } from '@/lib/hooks/auth/usePermissions';
import { useTier } from '@/lib/hooks/auth/useTier';
import { BusinessTier } from '@/lib/graphql/generated/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Zap } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string | string[];
  featureId?: string;
  requireAll?: boolean;
  fallback?: React.ComponentType<PermissionGuardFallbackProps>;
  loading?: React.ComponentType;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

interface PermissionGuardFallbackProps {
  reason?: string;
  requiredPermissions?: string[];
  requiredTier?: BusinessTier;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

/**
 * Default loading component
 */
const DefaultLoading: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Checking permissions...</span>
  </div>
);

/**
 * Default fallback component for permission denied
 */
const DefaultFallback: React.FC<PermissionGuardFallbackProps> = ({
  reason,
  requiredPermissions,
  requiredTier,
  showUpgradePrompt,
  onUpgrade,
}) => {
  const isUpgradeRequired = requiredTier && requiredTier !== BusinessTier.FREE;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-800">Access Restricted</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-red-700 mb-4">
          {reason || 'You do not have permission to access this feature.'}
        </CardDescription>
        
        {requiredPermissions && requiredPermissions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-red-800 mb-2">Required Permissions:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {requiredPermissions.map((permission, index) => (
                <li key={index} className="font-mono">{permission}</li>
              ))}
            </ul>
          </div>
        )}

        {isUpgradeRequired && (
          <div className="mb-4">
            <Alert className="border-amber-200 bg-amber-50">
              <Zap className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This feature requires <strong>{requiredTier}</strong> tier or higher.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {showUpgradePrompt && onUpgrade && isUpgradeRequired && (
          <Button 
            onClick={onUpgrade}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to {requiredTier}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Custom hook for permission guard logic
 */
function usePermissionGuardHook(
  requiredPermissions: string[],
  options: {
    featureId?: string;
    requireAll?: boolean;
  } = {}
): {
  hasAccess: boolean;
  isLoading: boolean;
  reason?: string;
  requiredPermissions?: string[];
  requiredTier?: BusinessTier;
} {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading: permLoading } = usePermissions();
  const { hasFeature, tierInfo, isLoading: tierLoading } = useTier();

  const isLoading = authLoading || permLoading || tierLoading;

  if (!isAuthenticated) {
    return {
      hasAccess: false,
      isLoading,
      reason: 'Authentication required',
    };
  }

  // Check feature access if featureId is provided
  if (options.featureId) {
    const featureAccess = hasFeature(options.featureId);
    if (!featureAccess) {
      return {
        hasAccess: false,
        isLoading,
        reason: `Feature "${options.featureId}" requires a higher tier plan`,
        // Only include requiredTier if it's defined
        ...(tierInfo?.currentTier && { requiredTier: tierInfo.currentTier }),
      };
    }
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = options.requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      const missingPermissions = requiredPermissions.filter(p => !hasPermission(p));
      return {
        hasAccess: false,
        isLoading,
        reason: 'Insufficient permissions',
        requiredPermissions: missingPermissions,
      };
    }
  }

  return { hasAccess: true, isLoading };
}

/**
 * Permission Guard Component
 * Renders children only if user has required permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions,
  featureId,
  requireAll = false,
  fallback: FallbackComponent = DefaultFallback,
  loading: LoadingComponent = DefaultLoading,
  showUpgradePrompt = true,
  onUpgrade,
}) => {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : requiredPermissions
    ? [requiredPermissions]
    : [];

  const {
    hasAccess,
    isLoading,
    reason,
    requiredPermissions: missingPermissions,
    requiredTier,
  } = usePermissionGuardHook(permissions, featureId ? { featureId, requireAll } : { requireAll });

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!hasAccess) {
    // Build props conditionally to satisfy exactOptionalPropertyTypes
    const fallbackProps: PermissionGuardFallbackProps = {
      showUpgradePrompt,
      ...(reason && { reason }),
      ...(missingPermissions && { requiredPermissions: missingPermissions }),
      ...(requiredTier && { requiredTier }),
      ...(onUpgrade && { onUpgrade }),
    };
    return <FallbackComponent {...fallbackProps} />;
  }

  return <>{children}</>;
};

/**
 * Feature Guard Component
 * Specialized guard for feature-based access control
 */
interface FeatureGuardProps {
  children: React.ReactNode;
  featureId: string;
  fallback?: React.ComponentType<PermissionGuardFallbackProps>;
  loading?: React.ComponentType;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  featureId,
  fallback: FallbackComponent = DefaultFallback,
  loading: LoadingComponent = DefaultLoading,
  showUpgradePrompt = true,
  onUpgrade,
}) => {
  const { hasFeature, tierInfo, isLoading } = useTier();

  if (isLoading) {
    return <LoadingComponent />;
  }

  const featureAccess = hasFeature(featureId);
  if (!featureAccess) {
    // Build props conditionally to satisfy exactOptionalPropertyTypes
    const fallbackProps: PermissionGuardFallbackProps = {
      reason: `Feature "${featureId}" requires a higher tier plan`,
      showUpgradePrompt,
      ...(tierInfo?.currentTier && { requiredTier: tierInfo.currentTier }),
      ...(onUpgrade && { onUpgrade }),
    };
    return <FallbackComponent {...fallbackProps} />;
  }

  return <>{children}</>;
};

/**
 * Conditional Render Component
 * Renders different content based on permission status
 */
interface ConditionalRenderProps {
  hasPermission: React.ReactNode;
  noPermission: React.ReactNode;
  loading?: React.ReactNode;
  requiredPermissions?: string | string[];
  featureId?: string;
  requireAll?: boolean;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  hasPermission: permissionContent,
  noPermission: noPermissionContent,
  loading,
  requiredPermissions,
  featureId,
  requireAll = false,
}) => {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : requiredPermissions
    ? [requiredPermissions]
    : [];

  const { hasAccess, isLoading } = usePermissionGuardHook(permissions, featureId ? { featureId, requireAll } : { requireAll });

  if (isLoading) {
    return <>{loading || <DefaultLoading />}</>;
  }

  return <>{hasAccess ? permissionContent : noPermissionContent}</>;
};

/**
 * Permission Status Indicator
 * Shows visual indicator of permission status
 */
interface PermissionStatusProps {
  requiredPermissions?: string | string[];
  featureId?: string;
  requireAll?: boolean;
  showDetails?: boolean;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({
  requiredPermissions,
  featureId,
  requireAll = false,
  showDetails = false,
}) => {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : requiredPermissions
    ? [requiredPermissions]
    : [];

  const {
    hasAccess,
    isLoading,
    reason,
    requiredPermissions: missingPermissions,
    requiredTier,
  } = usePermissionGuardHook(permissions, featureId ? { featureId, requireAll } : { requireAll });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span className="text-sm text-gray-500">Checking...</span>
      </div>
    );
  }

  const statusColor = hasAccess ? 'text-green-600' : 'text-red-600';
  const statusIcon = hasAccess ? '✓' : '✗';
  const statusText = hasAccess ? 'Granted' : 'Denied';

  return (
    <div className="space-y-2">
      <div className={`flex items-center space-x-2 ${statusColor}`}>
        <span className="font-mono text-sm">{statusIcon}</span>
        <span className="text-sm font-medium">{statusText}</span>
      </div>
      
      {showDetails && !hasAccess && (
        <div className="text-xs text-gray-600 space-y-1">
          {reason && <p>Reason: {reason}</p>}
          {missingPermissions && missingPermissions.length > 0 && (
            <p>Missing: {missingPermissions.join(', ')}</p>
          )}
          {requiredTier && <p>Required Tier: {requiredTier}</p>}
        </div>
      )}
    </div>
  );
};

/**
 * Upgrade Prompt Component
 * Shows upgrade prompt when tier upgrade is needed
 */
interface UpgradePromptProps {
  requiredTier: BusinessTier;
  currentTier?: BusinessTier;
  onUpgrade?: () => void;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  requiredTier,
  currentTier,
  onUpgrade,
  className = '',
}) => {
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <Zap className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Upgrade Required</p>
            <p className="text-sm">
              This feature requires <strong>{requiredTier}</strong> tier
              {currentTier && ` (currently on ${currentTier})`}.
            </p>
          </div>
          {onUpgrade && (
            <Button 
              onClick={onUpgrade}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
            >
              Upgrade Now
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PermissionGuard;
