/**
 * TierBadge Component
 * 
 * Displays user's current tier with visual styling
 * 
 * Requirements: 2.5
 */

'use client';

import React from 'react';
import { BusinessTier } from '@/types/core';
import { Badge } from '@/components/ui/badge';
import { 
  RiVipCrownLine, 
  RiStarLine, 
  RiShieldLine,
  RiSparklingLine
} from '@remixicon/react';

export interface TierBadgeProps {
  tier: BusinessTier;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierConfig = {
  [BusinessTier.MICRO]: {
    name: 'Micro',
    fullName: 'Micro (Free)',
    icon: RiShieldLine,
    className: 'bg-gray-100 text-gray-800 border-gray-300',
    gradient: 'from-gray-100 to-gray-200'
  },
  [BusinessTier.SMALL]: {
    name: 'Small',
    fullName: 'Small Business',
    icon: RiStarLine,
    className: 'bg-blue-100 text-blue-800 border-blue-300',
    gradient: 'from-blue-100 to-blue-200'
  },
  [BusinessTier.MEDIUM]: {
    name: 'Medium',
    fullName: 'Medium Business',
    icon: RiSparklingLine,
    className: 'bg-purple-100 text-purple-800 border-purple-300',
    gradient: 'from-purple-100 to-purple-200'
  },
  [BusinessTier.ENTERPRISE]: {
    name: 'Enterprise',
    fullName: 'Enterprise',
    icon: RiVipCrownLine,
    className: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300',
    gradient: 'from-yellow-100 to-orange-200'
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2'
};

/**
 * TierBadge component for displaying tier information
 */
export function TierBadge({
  tier,
  showIcon = true,
  variant = 'default',
  size = 'md',
  className = ''
}: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  if (!config) {
    return null;
  }

  const badgeClassName = `
    ${config.className}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <Badge 
      variant={variant}
      className={badgeClassName}
    >
      {showIcon && (
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-1`} />
      )}
      {config.name}
    </Badge>
  );
}

export default TierBadge;