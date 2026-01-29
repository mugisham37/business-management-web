/**
 * TierUpgradePrompt Component
 * 
 * Displays upgrade prompts and guidance when users encounter tier restrictions
 * 
 * Requirements: 2.5
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiLockLine, 
  RiArrowUpLine, 
  RiStarLine, 
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine
} from '@remixicon/react';
import { BusinessTier } from '@/types/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { getTierManager } from '@/lib/services/tier-manager.service';
import { useApolloClient } from '@apollo/client';

export interface TierUpgradePromptProps {
  requiredTier?: BusinessTier;
  requiredFeature?: string;
  currentTier: BusinessTier;
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const tierNames = {
  [BusinessTier.MICRO]: 'Micro (Free)',
  [BusinessTier.SMALL]: 'Small Business',
  [BusinessTier.MEDIUM]: 'Medium Business',
  [BusinessTier.ENTERPRISE]: 'Enterprise'
};

const tierColors = {
  [BusinessTier.MICRO]: 'bg-gray-100 text-gray-800 border-gray-300',
  [BusinessTier.SMALL]: 'bg-blue-100 text-blue-800 border-blue-300',
  [BusinessTier.MEDIUM]: 'bg-purple-100 text-purple-800 border-purple-300',
  [BusinessTier.ENTERPRISE]: 'bg-gold-100 text-gold-800 border-gold-300'
};

const tierPricing = {
  [BusinessTier.MICRO]: { monthly: 0, annually: 0 },
  [BusinessTier.SMALL]: { monthly: 49, annually: 39 },
  [BusinessTier.MEDIUM]: { monthly: 99, annually: 79 },
  [BusinessTier.ENTERPRISE]: { monthly: 299, annually: 249 }
};

/**
 * TierUpgradePrompt component for displaying upgrade guidance
 */
export function TierUpgradePrompt({
  requiredTier,
  requiredFeature,
  currentTier,
  title,
  description,
  className = '',
  compact = false,
  dismissible = false,
  onDismiss
}: TierUpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { openSubscriptionModal } = useSubscription();
  const apolloClient = useApolloClient();

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = (tier: BusinessTier) => {
    openSubscriptionModal(tier);
  };

  // Get upgrade options
  const tierManager = getTierManager(apolloClient);
  const upgradeOptions = tierManager.getUpgradeOptions(currentTier);
  const targetTier = requiredTier || upgradeOptions[0];

  // Get tier comparison data
  const tierComparison = tierManager.getTierComparison();
  const currentTierData = tierComparison.find(t => t.tier === currentTier);
  const targetTierData = tierComparison.find(t => t.tier === targetTier);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg ${className}`}
      >
        <RiLockLine className="w-4 h-4 text-indigo-600" />
        <span className="text-sm text-indigo-800">
          {requiredFeature ? `${requiredFeature} requires` : 'Requires'} {tierNames[targetTier]}
        </span>
        <Button
          size="sm"
          onClick={() => handleUpgrade(targetTier)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs"
        >
          Upgrade
        </Button>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-indigo-400 hover:text-indigo-600 p-1"
          >
            <RiCloseLine className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <RiLockLine className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  {title || 'Feature Locked'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {description || `This feature requires ${tierNames[targetTier]} or higher`}
                </p>
              </div>
            </div>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current vs Required Tier */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Current Plan</p>
                <Badge className={tierColors[currentTier]}>
                  {tierNames[currentTier]}
                </Badge>
              </div>
            </div>
            <RiArrowUpLine className="w-5 h-5 text-gray-400" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Required Plan</p>
                <Badge className={tierColors[targetTier]}>
                  {tierNames[targetTier]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Benefits of upgrading */}
          {targetTierData && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <RiSparklingLine className="w-4 h-4 text-indigo-600" />
                What you'll get with {tierNames[targetTier]}:
              </h4>
              <div className="grid gap-2">
                {targetTierData.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <RiCheckLine className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {targetTierData.features.length > 4 && (
                  <p className="text-sm text-gray-500 ml-6">
                    +{targetTierData.features.length - 4} more features
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Pricing</h4>
              <Badge className="bg-green-100 text-green-800">
                Save with annual billing
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  ${tierPricing[targetTier].monthly}
                </p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  ${tierPricing[targetTier].annually}
                </p>
                <p className="text-sm text-gray-600">per month (billed annually)</p>
                <p className="text-xs text-green-600 mt-1">
                  Save ${(tierPricing[targetTier].monthly - tierPricing[targetTier].annually) * 12}/year
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleUpgrade(targetTier)}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <RiStarLine className="w-4 h-4 mr-2" />
              Upgrade to {tierNames[targetTier]}
            </Button>
            {upgradeOptions.length > 1 && (
              <Button
                variant="outline"
                onClick={() => handleUpgrade(upgradeOptions[upgradeOptions.length - 1])}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                View All Plans
              </Button>
            )}
          </div>

          {/* Additional info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              30-day money-back guarantee • Cancel anytime • Secure payment
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TierUpgradePrompt;