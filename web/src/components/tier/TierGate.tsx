/**
 * TierGate Component
 * 
 * Conditionally renders content based on user's tier and feature access
 * Implements feature hiding/disabling based on tier restrictions
 * 
 * Requirements: 2.5
 */

'use client';

import React, { ReactNode } from 'react';
import { BusinessTier } from '@/types/onboarding';
import { useBusinessTier, useTierGate, useFeatureGate } from '@/hooks/useTenant';
import { TierUpgradePrompt } from './TierUpgradePrompt';
import { FeatureLockedOverlay } from './FeatureLockedOverlay';

export interface TierGateProps {
  children: ReactNode;
  requiredTier?: BusinessTier;
  requiredFeature?: string;
  fallback?: ReactNode;
  mode?: 'hide' | 'disable' | 'overlay' | 'prompt';
  showUpgradePrompt?: boolean;
  upgradePromptTitle?: string;
  upgradePromptDescription?: string;
  className?: string;
}

/**
 * TierGate component that controls access to features based on user's tier
 */
export function TierGate({
  children,
  requiredTier,
  requiredFeature,
  fallback,
  mode = 'hide',
  showUpgradePrompt = true,
  upgradePromptTitle,
  upgradePromptDescription,
  className
}: TierGateProps) {
  const { businessTier, isLoading } = useBusinessTier();
  const tierGate = useTierGate(requiredTier || BusinessTier.MICRO);
  const featureGate = useFeatureGate(requiredFeature || '');

  // Show loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
        <div className="h-8 w-full"></div>
      </div>
    );
  }

  // Check tier access
  const hasTierAccess = requiredTier ? tierGate.hasAccess : true;
  
  // Check feature access
  const hasFeatureAccess = requiredFeature ? featureGate.isEnabled : true;
  
  // Overall access check
  const hasAccess = hasTierAccess && hasFeatureAccess;

  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // Handle different modes when access is denied
  switch (mode) {
    case 'hide':
      return fallback ? <>{fallback}</> : null;

    case 'disable':
      return (
        <div className={`opacity-50 pointer-events-none ${className}`}>
          {children}
        </div>
      );

    case 'overlay':
      return (
        <div className={`relative ${className}`}>
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
          <FeatureLockedOverlay
            {...(requiredTier !== undefined && { requiredTier })}
            {...(requiredFeature !== undefined && { requiredFeature })}
            currentTier={businessTier}
            showUpgradePrompt={showUpgradePrompt}
            {...(upgradePromptTitle !== undefined && { title: upgradePromptTitle })}
            {...(upgradePromptDescription !== undefined && { description: upgradePromptDescription })}
          />
        </div>
      );

    case 'prompt':
      return (
        <TierUpgradePrompt
          {...(requiredTier !== undefined && { requiredTier })}
          {...(requiredFeature !== undefined && { requiredFeature })}
          currentTier={businessTier}
          {...(upgradePromptTitle !== undefined && { title: upgradePromptTitle })}
          {...(upgradePromptDescription !== undefined && { description: upgradePromptDescription })}
          {...(className !== undefined && { className })}
        />
      );

    default:
      return fallback ? <>{fallback}</> : null;
  }
}

export default TierGate;