/**
 * Tenant Context Provider
 * React Context Provider for tenant management
 * Requirements: 4.1, 4.3
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  TenantContextManager, 
  TenantContextState, 
  TenantContextConfig,
  createTenantContextManager,
  FeatureConfig,
} from './tenant-context';
import { BusinessTier } from '@/types/core';

interface TenantProviderProps {
  children: ReactNode;
  config?: TenantContextConfig;
  manager?: TenantContextManager;
}

interface TenantContextValue extends TenantContextState {
  manager: TenantContextManager;
  switchTenant: (tenantId: string) => Promise<boolean>;
  refreshContext: () => Promise<void>;
  hasFeature: (featureKey: string) => boolean;
  getFeatureConfig: (featureKey: string) => FeatureConfig | null;
  validateTenantAccess: (tenantId: string) => boolean;
  isTierSufficient: (requiredTier: BusinessTier) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * Tenant Context Provider Component
 * Provides tenant context to the entire application
 */
export function TenantProvider({ children, config, manager }: TenantProviderProps) {
  const [tenantManager] = useState(() => 
    manager || createTenantContextManager(config)
  );
  
  const [state, setState] = useState<TenantContextState>(tenantManager.getState());

  useEffect(() => {
    const unsubscribe = tenantManager.onStateChange(setState);
    return unsubscribe;
  }, [tenantManager]);

  const contextValue: TenantContextValue = {
    ...state,
    manager: tenantManager,
    switchTenant: (tenantId: string) => tenantManager.switchTenant(tenantId),
    refreshContext: () => tenantManager.refreshTenantContext(),
    hasFeature: (featureKey: string) => tenantManager.hasFeature(featureKey),
    getFeatureConfig: (featureKey: string) => tenantManager.getFeatureConfig(featureKey),
    validateTenantAccess: (tenantId: string) => tenantManager.validateTenantAccess(tenantId),
    isTierSufficient: (requiredTier: BusinessTier) => tenantManager.isTierSufficient(requiredTier),
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 * Must be used within TenantProvider
 */
export function useTenantProvider(): TenantContextValue {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error('useTenantProvider must be used within a TenantProvider');
  }
  
  return context;
}

/**
 * Higher-Order Component for tenant context
 */
export function withTenantContext<P extends object>(
  Component: React.ComponentType<P & { tenantContext: TenantContextValue }>
) {
  return function TenantContextWrapper(props: P) {
    const tenantContext = useTenantProvider();
    
    return <Component {...props} tenantContext={tenantContext} />;
  };
}

/**
 * Component for conditional rendering based on features
 */
interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  requiredTier?: BusinessTier;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback = null, 
  requiredTier 
}: FeatureGateProps) {
  const { hasFeature, isTierSufficient, getFeatureConfig } = useTenantProvider();
  
  const featureConfig = getFeatureConfig(feature);
  const tierToCheck = requiredTier || featureConfig?.requiredTier || 'MICRO';
  
  const isAvailable = hasFeature(feature) && isTierSufficient(tierToCheck);
  
  return <>{isAvailable ? children : fallback}</>;
}

/**
 * Component for conditional rendering based on business tier
 */
interface TierGateProps {
  requiredTier: BusinessTier;
  children: ReactNode;
  fallback?: ReactNode;
}

export function TierGate({ requiredTier, children, fallback = null }: TierGateProps) {
  const { isTierSufficient } = useTenantProvider();
  
  const hasAccess = isTierSufficient(requiredTier);
  
  return <>{hasAccess ? children : fallback}</>;
}

/**
 * Component for tenant-specific conditional rendering
 */
interface TenantGateProps {
  tenantIds?: string[];
  excludeTenantIds?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function TenantGate({ 
  tenantIds, 
  excludeTenantIds, 
  children, 
  fallback = null 
}: TenantGateProps) {
  const { currentTenant } = useTenantProvider();
  
  if (!currentTenant) {
    return <>{fallback}</>;
  }
  
  // Check inclusion list
  if (tenantIds && !tenantIds.includes(currentTenant.id)) {
    return <>{fallback}</>;
  }
  
  // Check exclusion list
  if (excludeTenantIds && excludeTenantIds.includes(currentTenant.id)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Component for loading state during tenant operations
 */
interface TenantLoadingProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function TenantLoading({ children, fallback }: TenantLoadingProps) {
  const { isLoading } = useTenantProvider();
  
  if (isLoading && fallback) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Component for error state in tenant operations
 */
interface TenantErrorProps {
  children: ReactNode;
  fallback?: (error: string) => ReactNode;
}

export function TenantError({ children, fallback }: TenantErrorProps) {
  const { error } = useTenantProvider();
  
  if (error && fallback) {
    return <>{fallback(error)}</>;
  }
  
  return <>{children}</>;
}