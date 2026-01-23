/**
 * Tenant Switcher Component
 * Simple dropdown for switching between available tenants
 * Requirements: 4.1, 4.3
 */

import React, { useState } from 'react';
import { 
  useTenantSwitching, 
  useCurrentTenant,
  TenantLogo,
} from '@/lib/tenant';
import { BusinessTier } from '@/types/core';

interface TenantSwitcherProps {
  className?: string;
  showLogo?: boolean;
  showTier?: boolean;
  compact?: boolean;
}

/**
 * Tenant Switcher Component
 * Dropdown component for switching between available tenants
 */
export function TenantSwitcher({ 
  className = '', 
  showLogo = true,
  showTier = true,
  compact = false,
}: TenantSwitcherProps) {
  const { tenant: currentTenant } = useCurrentTenant();
  const {
    availableTenants,
    switchTenant,
    canSwitchTo,
    isSwitching,
    isSwitchingTo,
  } = useTenantSwitching();

  const [isOpen, setIsOpen] = useState(false);

  const handleTenantSwitch = async (tenantId: string) => {
    if (!canSwitchTo(tenantId) || isSwitching) {
      return;
    }

    setIsOpen(false);
    await switchTenant(tenantId);
  };

  const getTierColor = (tier: BusinessTier): string => {
    const colors = {
      MICRO: 'text-gray-600',
      SMALL: 'text-blue-600',
      MEDIUM: 'text-green-600',
      ENTERPRISE: 'text-purple-600',
    };
    return colors[tier] || 'text-gray-600';
  };

  const getTierBadge = (tier: BusinessTier): string => {
    const badges = {
      MICRO: 'bg-gray-100 text-gray-800',
      SMALL: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-green-100 text-green-800',
      ENTERPRISE: 'bg-purple-100 text-purple-800',
    };
    return badges[tier] || 'bg-gray-100 text-gray-800';
  };

  if (!currentTenant) {
    return (
      <div className={`tenant-switcher no-tenant ${className}`}>
        <span className="text-gray-500">No tenant selected</span>
      </div>
    );
  }

  if (availableTenants.length <= 1) {
    return (
      <div className={`tenant-switcher single-tenant ${className}`}>
        <div className="current-tenant">
          {showLogo && (
            <TenantLogo 
              className="tenant-logo-sm" 
              fallback={
                <div className="tenant-avatar">
                  {currentTenant.name.charAt(0).toUpperCase()}
                </div>
              }
            />
          )}
          <div className="tenant-info">
            <span className="tenant-name">{currentTenant.name}</span>
            {showTier && !compact && (
              <span className={`tenant-tier ${getTierColor(currentTenant.businessTier)}`}>
                {currentTenant.businessTier}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tenant-switcher dropdown ${className} ${isOpen ? 'open' : ''}`}>
      <button
        className="tenant-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="current-tenant">
          {showLogo && (
            <TenantLogo 
              className="tenant-logo-sm" 
              fallback={
                <div className="tenant-avatar">
                  {currentTenant.name.charAt(0).toUpperCase()}
                </div>
              }
            />
          )}
          <div className="tenant-info">
            <span className="tenant-name">
              {isSwitching ? 'Switching...' : currentTenant.name}
            </span>
            {showTier && !compact && (
              <span className={`tenant-tier ${getTierColor(currentTenant.businessTier)}`}>
                {currentTenant.businessTier}
              </span>
            )}
          </div>
        </div>
        <div className="dropdown-arrow">
          <svg 
            className={`arrow-icon ${isOpen ? 'rotated' : ''}`} 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <path 
              fill="currentColor" 
              d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708z"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="tenant-dropdown-menu" role="listbox">
          <div className="dropdown-header">
            <span>Switch Tenant</span>
          </div>
          
          <div className="tenant-list">
            {availableTenants
              .filter(tenant => tenant.id !== currentTenant.id)
              .map(tenant => (
                <button
                  key={tenant.id}
                  className={`tenant-option ${!canSwitchTo(tenant.id) ? 'disabled' : ''} ${
                    isSwitchingTo === tenant.id ? 'switching' : ''
                  }`}
                  onClick={() => handleTenantSwitch(tenant.id)}
                  disabled={!canSwitchTo(tenant.id) || isSwitching}
                  role="option"
                  aria-selected={false}
                >
                  <div className="tenant-option-content">
                    {showLogo && (
                      <div className="tenant-avatar-sm">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="tenant-details">
                      <span className="tenant-name">{tenant.name}</span>
                      <span className="tenant-slug">@{tenant.slug}</span>
                      {showTier && (
                        <span className={`tenant-tier-badge ${getTierBadge(tenant.businessTier)}`}>
                          {tenant.businessTier}
                        </span>
                      )}
                    </div>
                    {isSwitchingTo === tenant.id && (
                      <div className="switching-indicator">
                        <div className="spinner-sm" />
                      </div>
                    )}
                  </div>
                  {!tenant.isActive && (
                    <div className="tenant-status inactive">
                      Inactive
                    </div>
                  )}
                </button>
              ))
            }
          </div>

          {availableTenants.filter(t => t.id !== currentTenant.id).length === 0 && (
            <div className="no-other-tenants">
              <span>No other tenants available</span>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="dropdown-backdrop" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Compact Tenant Switcher
 * Minimal version for navigation bars
 */
export function CompactTenantSwitcher(props: Omit<TenantSwitcherProps, 'compact'>) {
  return <TenantSwitcher {...props} compact={true} />;
}

/**
 * Tenant Switcher with Logo Only
 * Logo-only version for minimal UI
 */
export function LogoTenantSwitcher(props: Omit<TenantSwitcherProps, 'showLogo' | 'showTier'>) {
  return <TenantSwitcher {...props} showLogo={true} showTier={false} />;
}