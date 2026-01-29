/**
 * Permission Validation Hooks
 * React hooks for comprehensive permission validation with tier hierarchy
 * Requirements: 10.3, 10.4, 10.5
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  permissionValidationService, 
  PermissionValidationResult,
  FeaturePermissionConfig,
  GraphQLOperationConfig 
} from '@/lib/auth/PermissionValidationService';
import { BusinessTier } from './useTierAccess';
import { useAuth } from './useAuth';

/**
 * Hook for validating feature access before rendering
 * Requirement 10.3: Permission checking before feature rendering
 */
export function useFeatureAccess(featureId: string, userId?: string) {
  const [validationResult, setValidationResult] = useState<PermissionValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    let isMounted = true;

    const validateAccess = async () => {
      setIsLoading(true);
      try {
        const result = await permissionValidationService.validateFeatureAccess(featureId, effectiveUserId);
        if (isMounted) {
          setValidationResult(result);
        }
      } catch (error) {
        console.error('Feature access validation failed:', error);
        if (isMounted) {
          setValidationResult({
            hasAccess: false,
            reason: 'Validation error occurred',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateAccess();

    return () => {
      isMounted = false;
    };
  }, [featureId, effectiveUserId]);

  const revalidate = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await permissionValidationService.validateFeatureAccess(featureId, effectiveUserId);
      setValidationResult(result);
    } catch (error) {
      console.error('Feature access revalidation failed:', error);
      setValidationResult({
        hasAccess: false,
        reason: 'Validation error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  }, [featureId, effectiveUserId]);

  return {
    hasAccess: validationResult?.hasAccess ?? false,
    isLoading,
    reason: validationResult?.reason,
    requiredTier: validationResult?.requiredTier,
    requiredPermissions: validationResult?.requiredPermissions,
    conflictResolution: validationResult?.conflictResolution,
    revalidate,
  };
}

/**
 * Hook for validating GraphQL operation access
 * Requirement 10.4: GraphQL operation permission validation
 */
export function useGraphQLOperationAccess(operationName: string, variables?: any, userId?: string) {
  const [validationResult, setValidationResult] = useState<PermissionValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    let isMounted = true;

    const validateOperation = async () => {
      setIsLoading(true);
      try {
        const result = await permissionValidationService.validateGraphQLOperation(
          operationName, 
          effectiveUserId, 
          variables
        );
        if (isMounted) {
          setValidationResult(result);
        }
      } catch (error) {
        console.error('GraphQL operation validation failed:', error);
        if (isMounted) {
          setValidationResult({
            hasAccess: false,
            reason: 'Validation error occurred',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateOperation();

    return () => {
      isMounted = false;
    };
  }, [operationName, effectiveUserId, JSON.stringify(variables)]);

  return {
    hasAccess: validationResult?.hasAccess ?? false,
    isLoading,
    reason: validationResult?.reason,
    requiredTier: validationResult?.requiredTier,
    requiredPermissions: validationResult?.requiredPermissions,
    conflictResolution: validationResult?.conflictResolution,
  };
}

/**
 * Hook for resolving permission conflicts
 * Requirement 10.5: Permission conflict resolution with tier hierarchy
 */
export function usePermissionConflictResolution() {
  const [isResolving, setIsResolving] = useState(false);
  const { user } = useAuth();

  const resolveConflict = useCallback(async (
    conflictingPermissions: string[],
    requestedAction: string,
    userId?: string
  ): Promise<PermissionValidationResult> => {
    if (!user?.id && !userId) {
      return {
        hasAccess: false,
        reason: 'User not authenticated',
      };
    }

    setIsResolving(true);
    try {
      const result = await permissionValidationService.resolvePermissionConflict(
        userId || user!.id,
        conflictingPermissions,
        requestedAction
      );
      return result;
    } catch (error) {
      console.error('Permission conflict resolution failed:', error);
      return {
        hasAccess: false,
        reason: 'Conflict resolution error occurred',
      };
    } finally {
      setIsResolving(false);
    }
  }, [user?.id]);

  return {
    resolveConflict,
    isResolving,
  };
}

/**
 * Hook for batch feature access validation
 */
export function useBatchFeatureAccess(featureIds: string[], userId?: string) {
  const [validationResults, setValidationResults] = useState<Record<string, PermissionValidationResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    let isMounted = true;

    const validateFeatures = async () => {
      setIsLoading(true);
      try {
        const results: Record<string, PermissionValidationResult> = {};
        
        await Promise.all(
          featureIds.map(async (featureId) => {
            try {
              const result = await permissionValidationService.validateFeatureAccess(featureId, effectiveUserId);
              results[featureId] = result;
            } catch (error) {
              console.error(`Feature validation failed for ${featureId}:`, error);
              results[featureId] = {
                hasAccess: false,
                reason: 'Validation error occurred',
              };
            }
          })
        );

        if (isMounted) {
          setValidationResults(results);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (featureIds.length > 0) {
      validateFeatures();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [featureIds.join(','), effectiveUserId]);

  const accessibleFeatures = useMemo(() => 
    Object.entries(validationResults)
      .filter(([, result]) => result.hasAccess)
      .map(([featureId]) => featureId),
    [validationResults]
  );

  const restrictedFeatures = useMemo(() => 
    Object.entries(validationResults)
      .filter(([, result]) => !result.hasAccess)
      .map(([featureId]) => featureId),
    [validationResults]
  );

  return {
    validationResults,
    accessibleFeatures,
    restrictedFeatures,
    isLoading,
    hasAccess: (featureId: string) => validationResults[featureId]?.hasAccess ?? false,
    getValidationResult: (featureId: string) => validationResults[featureId],
  };
}

/**
 * Hook for permission-aware component rendering
 */
export function usePermissionGuard(
  requiredPermissions: string | string[],
  options: {
    featureId?: string;
    fallbackComponent?: React.ComponentType;
    loadingComponent?: React.ComponentType;
    userId?: string;
    requireAll?: boolean;
  } = {}
) {
  const { user } = useAuth();
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  const effectiveUserId = options.userId || user?.id;

  const featureAccess = useFeatureAccess(options.featureId || 'default', effectiveUserId);
  const [permissionCheck, setPermissionCheck] = useState<PermissionValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkPermissions = async () => {
      if (!effectiveUserId) {
        if (isMounted) {
          setPermissionCheck({
            hasAccess: false,
            reason: 'User not authenticated',
          });
          setIsLoading(false);
        }
        return;
      }

      try {
        // If we have a feature ID, use feature access validation
        if (options.featureId) {
          if (isMounted) {
            setPermissionCheck({
              hasAccess: featureAccess.hasAccess,
              reason: featureAccess.reason,
              requiredTier: featureAccess.requiredTier,
              requiredPermissions: featureAccess.requiredPermissions,
            });
            setIsLoading(featureAccess.isLoading);
          }
          return;
        }

        // Otherwise, use direct permission checking
        const { permissionsManager } = await import('@/lib/auth/permissions-manager');
        const userPermissions = await permissionsManager.getPermissions(effectiveUserId);
        
        const hasAccess = options.requireAll
          ? permissions.every(perm => 
              userPermissions.some(userPerm => {
                if (userPerm === perm) return true;
                if (userPerm.endsWith(':*')) {
                  const prefix = userPerm.slice(0, -1);
                  return perm.startsWith(prefix);
                }
                return false;
              })
            )
          : permissions.some(perm => 
              userPermissions.some(userPerm => {
                if (userPerm === perm) return true;
                if (userPerm.endsWith(':*')) {
                  const prefix = userPerm.slice(0, -1);
                  return perm.startsWith(prefix);
                }
                return false;
              })
            );

        if (isMounted) {
          setPermissionCheck({
            hasAccess,
            reason: hasAccess ? undefined : `Missing required permissions: ${permissions.join(', ')}`,
            requiredPermissions: hasAccess ? undefined : permissions,
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        if (isMounted) {
          setPermissionCheck({
            hasAccess: false,
            reason: 'Permission check error occurred',
          });
          setIsLoading(false);
        }
      }
    };

    checkPermissions();

    return () => {
      isMounted = false;
    };
  }, [effectiveUserId, permissions.join(','), options.featureId, options.requireAll, featureAccess.hasAccess, featureAccess.isLoading]);

  const shouldRender = permissionCheck?.hasAccess ?? false;
  const LoadingComponent = options.loadingComponent;
  const FallbackComponent = options.fallbackComponent;

  return {
    hasAccess: shouldRender,
    isLoading,
    reason: permissionCheck?.reason,
    requiredPermissions: permissionCheck?.requiredPermissions,
    requiredTier: permissionCheck?.requiredTier,
    shouldRender,
    LoadingComponent,
    FallbackComponent,
  };
}

/**
 * Hook for managing permission validation service configuration
 */
export function usePermissionValidationConfig() {
  const addFeaturePermission = useCallback((config: FeaturePermissionConfig) => {
    permissionValidationService.addFeaturePermission(config);
  }, []);

  const addOperationPermission = useCallback((config: GraphQLOperationConfig) => {
    permissionValidationService.addOperationPermission(config);
  }, []);

  const clearCache = useCallback(() => {
    permissionValidationService.clearCache();
  }, []);

  const getFeatureConfig = useCallback((featureId: string) => {
    return permissionValidationService.getFeatureConfig(featureId);
  }, []);

  const getOperationConfig = useCallback((operationName: string) => {
    return permissionValidationService.getOperationConfig(operationName);
  }, []);

  return {
    addFeaturePermission,
    addOperationPermission,
    clearCache,
    getFeatureConfig,
    getOperationConfig,
  };
}