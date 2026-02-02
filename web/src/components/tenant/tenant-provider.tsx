'use client';

/**
 * Tenant Provider
 * Provides multi-tenant context and functionality to the application
 * Integrates with the tenant store (Zustand) for state management
 */

import React, { ReactNode, createContext, useContext } from 'react';
import { useTenantStore } from '@/lib/stores';
import type { Tenant, BusinessTier } from '@/types/core';

/**
 * Tenant Context Interface
 */
export interface TenantContextType {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  businessTier: BusinessTier;
  isLoading: boolean;
  isSwitching: boolean;
  error: string | null;
  switchError: string | null;
  switchTenant: (tenantId: string) => Promise<boolean>;
  initializeTenant: (tenant: Tenant, availableTenants: Tenant[]) => void;
  clearTenantData: () => void;
}

/**
 * Tenant Context
 */
const TenantContext = createContext<TenantContextType | undefined>(undefined);

/**
 * Tenant Provider Props
 */
export interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Tenant Provider Component
 * Provides tenant context and manages multi-tenant state
 */
export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const {
    currentTenant,
    availableTenants,
    businessTier,
    isLoading,
    isSwitching,
    error,
    switchError,
    switchTenant,
    initializeTenant,
    clearTenantData,
  } = useTenantStore();

  const contextValue: TenantContextType = {
    currentTenant,
    availableTenants,
    businessTier,
    isLoading,
    isSwitching,
    error,
    switchError,
    switchTenant,
    initializeTenant,
    clearTenantData,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

TenantProvider.displayName = 'TenantProvider';

/**
 * Hook to use tenant context
 */
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}
