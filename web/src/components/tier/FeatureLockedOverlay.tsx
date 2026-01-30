/**
 * FeatureLockedOverlay Component
 * 
 * Overlay component that appears over locked features
 * Provides contextual upgrade information
 * 
 * Requirements: 2.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiLockLine, 
  RiArrowUpLine, 
  RiStarLine,
  RiSparklingLine
} from '@remixicon/react';
import { BusinessTier } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export interface FeatureLockedOverlayProps {
  requiredTier?: BusinessTier;
  requiredFeature?: string;
  currentTier: BusinessTier;
  title?: string;
  description?: string;
  showUpgradePrompt?: boolean;
  className?: string;
}

const tierNames = {
  [BusinessTier.MICRO]: 'Micro (Free)',
  [BusinessTier.SMALL]: 'Small Business',
  [BusinessTier.MEDIUM]: 'Medium Business',
  [BusinessTier.ENTERPRISE]: 'Enterprise'
};

const tierColors = {
  [BusinessTier.MICRO]: 'bg-gray-100 text-gray-800',
  [BusinessTier.SMALL]: 'bg-blue-100 text-blue-800',
  [BusinessTier.MEDIUM]: 'bg-purple-100 text-purple-800',
  [BusinessTier.ENTERPRISE]: 'bg-gold-100 text-gold-800'
};

/**
 * FeatureLockedOverlay component for displaying feature restrictions
 */
export function FeatureLockedOverlay({
  requiredTier = BusinessTier.SMALL,
  requiredFeature,
  currentTier,
  title,
  description,
  showUpgradePrompt = true,
  className = ''
}: FeatureLockedOverlayProps) {
  const { openSubscriptionModal } = useSubscription();

  const handleUpgrade = () => {
    openSubscriptionModal(requiredTier);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 bg-white/95 backdrop-blur-sm border-2 border-dashed border-indigo-200 rounded-lg flex items-center justify-center ${className}`}
    >
      <div className="text-center p-6 max-w-sm">
        {/* Lock icon with animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-auto w-16 h-16 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4"
        >
          <RiLockLine className="w-8 h-8 text-indigo-600" />
        </motion.div>

        {/* Title and description */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title || 'Premium Feature'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {description || `${requiredFeature ? `${requiredFeature} is` : 'This feature is'} available with ${tierNames[requiredTier]} or higher`}
          </p>
        </motion.div>

        {/* Tier badges */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Badge className={tierColors[currentTier]} variant="outline">
            Current: {tierNames[currentTier]}
          </Badge>
          <RiArrowUpLine className="w-4 h-4 text-gray-400" />
          <Badge className={tierColors[requiredTier]}>
            Required: {tierNames[requiredTier]}
          </Badge>
        </motion.div>

        {/* Upgrade button */}
        {showUpgradePrompt && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Button
              onClick={handleUpgrade}
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2"
            >
              <RiStarLine className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
            <p className="text-xs text-gray-500">
              Unlock this feature and more
            </p>
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 opacity-20">
          <RiSparklingLine className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="absolute bottom-2 left-2 opacity-20">
          <RiSparklingLine className="w-4 h-4 text-purple-600" />
        </div>
      </div>
    </motion.div>
  );
}

export default FeatureLockedOverlay;