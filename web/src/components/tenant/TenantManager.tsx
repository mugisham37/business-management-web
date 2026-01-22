/**
 * Tenant Manager Component
 * Comprehensive tenant management interface
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7
 */

import React, { useState } from 'react';
import {
  useTenantProvider,
  useTenantSwitching,
  useFeatureFlags,
  useBusinessTier,
  FeatureGate,
  TierGate,
} from '@/lib/tenant';
import { BusinessTier } from '@/types/core';

interface TenantManagerProps {
  className?: string;
}

/**
 * Tenant Manager Component
 * Provides UI for tenant switching, feature management, and tier information
 */
export function TenantManager({ className = '' }: TenantManagerProps) {
  const {
    currentTenant,
    businessTier,
    isLoading,
    error,
  } = useTenantProvider();

  const {
    availableTenants,
    switchTenant,
    canSwitchTo,
    isSwitching,
    isSwitchingTo,
  } = useTenantSwitching();

  const {
    enabledFeatures,
    availableFeatures,
    hasFeature,
  } = useFeatureFlags();

  const {
    tierLimits,
    isTierSufficient,
  } = useBusinessTier();

  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  const handleTenantSwitch = async () => {
    if (!selectedTenantId || !canSwitchTo(selectedTenantId)) {
      return;
    }

    const success = await switchTenant(selectedTenantId);
    if (success) {
      setSelectedTenantId('');
    }
  };

  if (isLoading) {
    return (
      <div className={`tenant-manager ${className}`}>
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading tenant information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`tenant-manager ${className}`}>
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`tenant-manager ${className}`}>
      {/* Current Tenant Information */}
      <div className="current-tenant-section">
        <h3>Current Tenant</h3>
        {currentTenant ? (
          <div className="tenant-info">
            <div className="tenant-header">
              <h4>{currentTenant.name}</h4>
              <span className={`tier-badge tier-${businessTier.toLowerCase()}`}>
                {businessTier}
              </span>
            </div>
            <div className="tenant-details">
              <p><strong>Subdomain:</strong> {currentTenant.subdomain}</p>
              <p><strong>Timezone:</strong> {currentTenant.settings?.timezone}</p>
              <p><strong>Currency:</strong> {currentTenant.settings?.currency}</p>
            </div>
          </div>
        ) : (
          <p>No tenant selected</p>
        )}
      </div>

      {/* Tenant Switching */}
      <TierGate requiredTier="SMALL">
        <div className="tenant-switching-section">
          <h3>Switch Tenant</h3>
          <div className="tenant-switch-form">
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              disabled={isSwitching}
            >
              <option value="">Select a tenant...</option>
              {availableTenants.map((tenant) => (
                <option 
                  key={tenant.id} 
                  value={tenant.id}
                  disabled={tenant.id === currentTenant?.id}
                >
                  {tenant.name} ({tenant.businessTier})
                </option>
              ))}
            </select>
            <button
              onClick={handleTenantSwitch}
              disabled={!selectedTenantId || isSwitching || !canSwitchTo(selectedTenantId)}
              className="switch-button"
            >
              {isSwitchingTo(selectedTenantId) ? 'Switching...' : 'Switch Tenant'}
            </button>
          </div>
        </div>
      </TierGate>

      {/* Feature Flags */}
      <div className="features-section">
        <h3>Available Features</h3>
        <div className="features-grid">
          {availableFeatures.map((feature) => (
            <div 
              key={feature.key} 
              className={`feature-card ${feature.enabled ? 'enabled' : 'disabled'}`}
            >
              <div className="feature-header">
                <span className="feature-name">{feature.key}</span>
                <span className={`feature-status ${feature.enabled ? 'enabled' : 'disabled'}`}>
                  {feature.enabled ? '✓' : '✗'}
                </span>
              </div>
              <div className="feature-tier">
                Required Tier: {feature.requiredTier}
              </div>
              {!isTierSufficient(feature.requiredTier) && (
                <div className="upgrade-notice">
                  Upgrade to {feature.requiredTier} tier to access this feature
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier Information */}
      <div className="tier-section">
        <h3>Business Tier Information</h3>
        <div className="tier-info">
          <div className="current-tier">
            <span className="tier-label">Current Tier:</span>
            <span className={`tier-value tier-${businessTier.toLowerCase()}`}>
              {businessTier}
            </span>
          </div>
          
          {tierLimits && (
            <div className="tier-limits">
              <h4>Tier Limits</h4>
              <ul>
                <li>Max Users: {tierLimits.maxUsers}</li>
                <li>Max Storage: {tierLimits.maxStorage} GB</li>
                <li>Max API Calls: {tierLimits.maxApiCalls}/month</li>
                <li>Max Integrations: {tierLimits.maxIntegrations}</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Feature-Gated Content Examples */}
      <div className="feature-examples-section">
        <h3>Feature-Gated Content Examples</h3>
        
        <FeatureGate feature="advanced-analytics">
          <div className="feature-example">
            <h4>Advanced Analytics</h4>
            <p>This content is only visible when advanced analytics feature is enabled.</p>
          </div>
        </FeatureGate>

        <FeatureGate feature="custom-branding">
          <div className="feature-example">
            <h4>Custom Branding</h4>
            <p>This content is only visible when custom branding feature is enabled.</p>
          </div>
        </FeatureGate>

        <TierGate requiredTier="ENTERPRISE">
          <div className="feature-example">
            <h4>Enterprise Features</h4>
            <p>This content is only visible for Enterprise tier tenants.</p>
          </div>
        </TierGate>
      </div>
    </div>
  );
}

/**
 * Tenant Switcher Component
 * Simplified tenant switching dropdown
 */
export function TenantSwitcher({ className = '' }: { className?: string }) {
  const { currentTenant } = useTenantProvider();
  const { availableTenants, switchTenant, isSwitching } = useTenantSwitching();

  const handleSwitch = async (tenantId: string) => {
    if (tenantId !== currentTenant?.id) {
      await switchTenant(tenantId);
    }
  };

  return (
    <div className={`tenant-switcher ${className}`}>
      <select
        value={currentTenant?.id || ''}
        onChange={(e) => handleSwitch(e.target.value)}
        disabled={isSwitching}
        className="tenant-select"
      >
        {availableTenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      {isSwitching && <span className="switching-indicator">Switching...</span>}
    </div>
  );
}

/**
 * Feature Status Indicator Component
 */
interface FeatureStatusProps {
  featureKey: string;
  className?: string;
}

export function FeatureStatus({ featureKey, className = '' }: FeatureStatusProps) {
  const { hasFeature, getFeatureConfig } = useFeatureFlags();
  const isEnabled = hasFeature(featureKey);
  const config = getFeatureConfig(featureKey);

  return (
    <div className={`feature-status ${className} ${isEnabled ? 'enabled' : 'disabled'}`}>
      <span className="feature-name">{featureKey}</span>
      <span className={`status-indicator ${isEnabled ? 'enabled' : 'disabled'}`}>
        {isEnabled ? '✓ Enabled' : '✗ Disabled'}
      </span>
      {config && (
        <span className="required-tier">
          (Requires: {config.requiredTier})
        </span>
      )}
    </div>
  );
}