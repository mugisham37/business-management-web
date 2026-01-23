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
          <div className="error-message">
            <h3>Error Loading Tenant Information</h3>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className={`tenant-manager ${className}`}>
        <div className="no-tenant-state">
          <h3>No Tenant Selected</h3>
          <p>Please select a tenant to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`tenant-manager ${className}`}>
      <div className="tenant-manager-header">
        <h2>Tenant Management</h2>
        <div className="tenant-info">
          <span className="tenant-name">{currentTenant.name}</span>
          <span className="tenant-tier">{businessTier}</span>
        </div>
      </div>

      <div className="tenant-manager-content">
        {/* Tenant Switching Section */}
        <div className="section tenant-switching">
          <h3>Switch Tenant</h3>
          <div className="tenant-switch-controls">
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              disabled={isSwitching}
              className="tenant-select"
            >
              <option value="">Select a tenant...</option>
              {availableTenants
                .filter(t => t.id !== currentTenant.id)
                .map(tenant => (
                  <option 
                    key={tenant.id} 
                    value={tenant.id}
                    disabled={!canSwitchTo(tenant.id)}
                  >
                    {tenant.name} ({tenant.businessTier})
                  </option>
                ))
              }
            </select>
            <button
              onClick={handleTenantSwitch}
              disabled={!selectedTenantId || isSwitching || !canSwitchTo(selectedTenantId)}
              className="switch-button"
            >
              {isSwitching ? 'Switching...' : 'Switch Tenant'}
            </button>
          </div>
          {isSwitchingTo && (
            <div className="switching-indicator">
              Switching to {availableTenants.find(t => t.id === isSwitchingTo)?.name}...
            </div>
          )}
        </div>

        {/* Business Tier Section */}
        <div className="section business-tier">
          <h3>Business Tier: {businessTier}</h3>
          <div className="tier-info">
            <div className="tier-limits">
              <h4>Current Limits</h4>
              <ul>
                <li>Max Employees: {tierLimits.maxEmployees === Infinity ? 'Unlimited' : tierLimits.maxEmployees}</li>
                <li>Max Locations: {tierLimits.maxLocations === Infinity ? 'Unlimited' : tierLimits.maxLocations}</li>
                <li>Max Transactions: {tierLimits.maxTransactions === Infinity ? 'Unlimited' : tierLimits.maxTransactions}</li>
                <li>Max Revenue: {tierLimits.maxRevenue === Infinity ? 'Unlimited' : `$${tierLimits.maxRevenue.toLocaleString()}`}</li>
              </ul>
            </div>
            <div className="tier-progress">
              <h4>Tier Progress</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `50%` }}
                />
              </div>
              <span>50% to Next Tier</span>
            </div>
          </div>
        </div>

        {/* Feature Management Section */}
        <div className="section feature-management">
          <h3>Available Features ({enabledFeatures.length})</h3>
          <div className="features-grid">
            {availableFeatures.map((featureName: string) => (
              <div key={featureName} className="feature-card">
                <div className="feature-name">{featureName}</div>
                <div className="feature-status enabled">Enabled</div>
              </div>
            ))}
          </div>
          
          {enabledFeatures.length !== availableFeatures.length && (
            <div className="disabled-features">
              <h4>Disabled Features</h4>
              <div className="features-grid">
                {enabledFeatures
                  .filter(f => f.featureName && !availableFeatures.includes(f.featureName))
                  .map(feature => (
                    <div key={feature.featureName || feature.key} className="feature-card disabled">
                      <div className="feature-name">{feature.featureName || feature.key}</div>
                      <div className="feature-status disabled">
                        {isTierSufficient('SMALL' as BusinessTier) ? 'Disabled' : 'Upgrade Required'}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Tenant Information Section */}
        <div className="section tenant-info-section">
          <h3>Tenant Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{currentTenant.name}</span>
            </div>
            <div className="info-item">
              <label>ID:</label>
              <span>{currentTenant.id}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className="status active">Active</span>
            </div>
            <div className="info-item">
              <label>Health:</label>
              <span className="health healthy">Healthy</span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{currentTenant.createdAt ? new Date(currentTenant.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Updated:</label>
              <span>{currentTenant.updatedAt ? new Date(currentTenant.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Feature Gates Demo */}
        <div className="section feature-gates-demo">
          <h3>Feature Gates Demo</h3>
          
          <FeatureGate 
            feature="advanced-analytics" 
            fallback={<div className="feature-locked">Advanced Analytics requires upgrade</div>}
          >
            <div className="feature-enabled">✅ Advanced Analytics Available</div>
          </FeatureGate>

          <TierGate 
            requiredTier={'MEDIUM' as BusinessTier}
            fallback={<div className="feature-locked">Medium tier required for this feature</div>}
          >
            <div className="feature-enabled">✅ Medium Tier Feature Available</div>
          </TierGate>

          <FeatureGate 
            feature="api-access"
            fallback={<div className="feature-locked">API Access not available</div>}
          >
            <TierGate 
              requiredTier={'SMALL' as BusinessTier}
              fallback={<div className="feature-locked">Small tier required for API access</div>}
            >
              <div className="feature-enabled">✅ API Access Available</div>
            </TierGate>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
}