/**
 * Feature Status Component
 * Displays feature availability and status indicators
 * Requirements: 4.5, 4.6
 */

import React from 'react';
import { 
  useFeatureFlags, 
  useBusinessTier, 
  useFeatureGate,
  useTierGate,
} from '@/lib/tenant';
import { BusinessTier } from '@/types/core';

interface FeatureStatusProps {
  featureName: string;
  className?: string;
  showDescription?: boolean;
  showRequiredTier?: boolean;
  showUpgradePrompt?: boolean;
}

/**
 * Feature Status Component
 * Shows the current status of a specific feature
 */
export function FeatureStatus({ 
  featureName, 
  className = '',
  showDescription = true,
  showRequiredTier = true,
  showUpgradePrompt = true,
}: FeatureStatusProps) {
  const { features } = useFeatureFlags();
  const { businessTier } = useBusinessTier();
  const { isEnabled, config } = useFeatureGate(featureName);

  const feature = features.find(f => f.featureName === featureName);

  if (!feature) {
    return (
      <div className={`feature-status unknown ${className}`}>
        <div className="status-indicator unknown">
          <span className="status-dot" />
          <span className="status-text">Unknown Feature</span>
        </div>
        <div className="feature-name">{featureName}</div>
      </div>
    );
  }

  const getStatusInfo = () => {
    if (isEnabled) {
      return {
        status: 'enabled',
        text: 'Enabled',
        color: 'green',
        icon: '✓',
      };
    }

    if (!feature.isEnabled) {
      return {
        status: 'disabled',
        text: 'Disabled',
        color: 'gray',
        icon: '○',
      };
    }

    // Feature is enabled but tier insufficient
    return {
      status: 'upgrade-required',
      text: 'Upgrade Required',
      color: 'orange',
      icon: '↑',
    };
  };

  const statusInfo = getStatusInfo();

  const getTierColor = (tier: BusinessTier): string => {
    const colors = {
      MICRO: 'text-gray-600',
      SMALL: 'text-blue-600',
      MEDIUM: 'text-green-600',
      ENTERPRISE: 'text-purple-600',
    };
    return colors[tier] || 'text-gray-600';
  };

  return (
    <div className={`feature-status ${statusInfo.status} ${className}`}>
      <div className="feature-header">
        <div className={`status-indicator ${statusInfo.status}`}>
          <span className={`status-icon ${statusInfo.color}`}>
            {statusInfo.icon}
          </span>
          <span className="status-text">{statusInfo.text}</span>
        </div>
        
        <div className="feature-info">
          <span className="feature-name">{feature.displayName || featureName}</span>
          {showRequiredTier && feature.requiredTier && (
            <span className={`required-tier ${getTierColor(feature.requiredTier)}`}>
              {feature.requiredTier}+ Required
            </span>
          )}
        </div>
      </div>

      {showDescription && feature.description && (
        <div className="feature-description">
          {feature.description}
        </div>
      )}

      {feature.rolloutPercentage !== undefined && feature.rolloutPercentage < 100 && (
        <div className="rollout-info">
          <div className="rollout-label">Rollout Progress:</div>
          <div className="rollout-bar">
            <div 
              className="rollout-progress" 
              style={{ width: `${feature.rolloutPercentage}%` }}
            />
          </div>
          <span className="rollout-percentage">{feature.rolloutPercentage}%</span>
        </div>
      )}

      {statusInfo.status === 'upgrade-required' && showUpgradePrompt && (
        <div className="upgrade-prompt">
          <span>Upgrade to {feature.requiredTier} tier to access this feature</span>
          <button className="upgrade-button">
            Upgrade Now
          </button>
        </div>
      )}

      {config && Object.keys(config.config).length > 0 && (
        <div className="feature-config">
          <details>
            <summary>Configuration</summary>
            <pre>{JSON.stringify(config.config, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

/**
 * Feature Status List Component
 * Shows status for multiple features
 */
interface FeatureStatusListProps {
  features: string[];
  className?: string;
  groupByCategory?: boolean;
  showOnlyEnabled?: boolean;
  showOnlyDisabled?: boolean;
}

export function FeatureStatusList({ 
  features, 
  className = '',
  groupByCategory = false,
  showOnlyEnabled = false,
  showOnlyDisabled = false,
}: FeatureStatusListProps) {
  const { features: allFeatures } = useFeatureFlags();

  const filteredFeatures = features.filter(featureName => {
    const feature = allFeatures.find(f => f.featureName === featureName);
    if (!feature) return false;

    if (showOnlyEnabled && !feature.isEnabled) return false;
    if (showOnlyDisabled && feature.isEnabled) return false;

    return true;
  });

  if (groupByCategory) {
    const featuresByCategory = filteredFeatures.reduce((acc, featureName) => {
      const feature = allFeatures.find(f => f.featureName === featureName);
      const category = feature?.category || 'Other';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(featureName);
      
      return acc;
    }, {} as Record<string, string[]>);

    return (
      <div className={`feature-status-list grouped ${className}`}>
        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
          <div key={category} className="feature-category">
            <h3 className="category-title">{category}</h3>
            <div className="category-features">
              {categoryFeatures.map(featureName => (
                <FeatureStatus 
                  key={featureName} 
                  featureName={featureName}
                  showRequiredTier={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`feature-status-list ${className}`}>
      {filteredFeatures.map(featureName => (
        <FeatureStatus 
          key={featureName} 
          featureName={featureName}
        />
      ))}
    </div>
  );
}

/**
 * Feature Status Badge Component
 * Compact status indicator for inline use
 */
interface FeatureStatusBadgeProps {
  featureName: string;
  className?: string;
}

export function FeatureStatusBadge({ featureName, className = '' }: FeatureStatusBadgeProps) {
  const { isEnabled } = useFeatureGate(featureName);

  return (
    <span className={`feature-status-badge ${isEnabled ? 'enabled' : 'disabled'} ${className}`}>
      <span className="badge-icon">{isEnabled ? '✓' : '○'}</span>
      <span className="badge-text">{isEnabled ? 'Enabled' : 'Disabled'}</span>
    </span>
  );
}

/**
 * Tier Status Component
 * Shows current tier and progression
 */
interface TierStatusProps {
  className?: string;
  showProgress?: boolean;
  showLimits?: boolean;
}

export function TierStatus({ 
  className = '', 
  showProgress = true,
  showLimits = false,
}: TierStatusProps) {
  const { businessTier, tierLimits } = useBusinessTier();

  const getTierInfo = (tier: BusinessTier) => {
    const info = {
      MICRO: { color: 'gray', label: 'Micro', description: 'Getting started' },
      SMALL: { color: 'blue', label: 'Small', description: 'Growing business' },
      MEDIUM: { color: 'green', label: 'Medium', description: 'Established business' },
      ENTERPRISE: { color: 'purple', label: 'Enterprise', description: 'Large organization' },
    };
    return info[tier] || info.MICRO;
  };

  const tierInfo = getTierInfo(businessTier);

  return (
    <div className={`tier-status ${className}`}>
      <div className="tier-header">
        <div className={`tier-badge ${tierInfo.color}`}>
          <span className="tier-label">{tierInfo.label}</span>
        </div>
        <div className="tier-description">{tierInfo.description}</div>
      </div>

      {showLimits && (
        <div className="tier-limits">
          <h4>Current Limits</h4>
          <ul>
            <li>Max Employees: {tierLimits.maxEmployees === Infinity ? 'Unlimited' : tierLimits.maxEmployees}</li>
            <li>Max Locations: {tierLimits.maxLocations === Infinity ? 'Unlimited' : tierLimits.maxLocations}</li>
            <li>Max Transactions: {tierLimits.maxTransactions === Infinity ? 'Unlimited' : tierLimits.maxTransactions}</li>
            <li>Max Revenue: {tierLimits.maxRevenue === Infinity ? 'Unlimited' : `$${tierLimits.maxRevenue.toLocaleString()}`}</li>
          </ul>
        </div>
      )}
    </div>
  );
}