/**
 * TierProgressIndicator Component
 * 
 * Shows user's progress towards tier limits and upgrade suggestions
 * 
 * Requirements: 2.5
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiArrowUpLine, 
  RiAlertLine,
  RiCheckLine,
  RiInformationLine
} from '@remixicon/react';
import { BusinessTier } from '@/types/onboarding';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { getTierManager } from '@/lib/services/tier-manager.service';
import { useApolloClient, NormalizedCacheObject, ApolloClient } from '@apollo/client';

export interface TierProgressIndicatorProps {
  currentTier: BusinessTier;
  usage: {
    employees: number;
    locations: number;
    transactions: number;
    storage: number; // in GB
    apiCalls: number;
  };
  className?: string;
  showUpgradeButton?: boolean;
}

const tierNames = {
  [BusinessTier.MICRO]: 'Micro (Free)',
  [BusinessTier.SMALL]: 'Small Business',
  [BusinessTier.MEDIUM]: 'Medium Business',
  [BusinessTier.ENTERPRISE]: 'Enterprise'
};

/**
 * TierProgressIndicator component for showing tier usage and limits
 */
export function TierProgressIndicator({
  currentTier,
  usage,
  className = '',
  showUpgradeButton = true
}: TierProgressIndicatorProps) {
  const { openSubscriptionModal } = useSubscription();
  const apolloClient = useApolloClient();
  const tierManager = getTierManager(apolloClient as ApolloClient<NormalizedCacheObject>);

  // Get current tier limits (synchronous for immediate rendering)
  const tierFeatures = tierManager.getTierFeaturesSync(currentTier);
  const limits = tierFeatures.limits;
  
  // Get upgrade options
  const upgradeOptions = tierManager.getUpgradeOptions(currentTier);
  const nextTier = upgradeOptions[0];

  // Calculate usage percentages
  const usageMetrics = [
    {
      name: 'Employees',
      current: usage.employees,
      limit: limits.employees,
      icon: '👥',
      color: 'blue'
    },
    {
      name: 'Locations',
      current: usage.locations,
      limit: limits.locations,
      icon: '📍',
      color: 'green'
    },
    {
      name: 'Monthly Transactions',
      current: usage.transactions,
      limit: limits.transactions,
      icon: '💳',
      color: 'purple'
    },
    {
      name: 'Storage',
      current: usage.storage,
      limit: limits.storage,
      unit: 'GB',
      icon: '💾',
      color: 'orange'
    },
    {
      name: 'API Calls',
      current: usage.apiCalls,
      limit: limits.apiCalls,
      unit: '/month',
      icon: '🔌',
      color: 'indigo'
    }
  ].filter(metric => metric.limit !== -1); // Filter out unlimited metrics

  // Calculate overall usage status
  const criticalMetrics = usageMetrics.filter(metric => (metric.current / metric.limit) >= 0.9);
  const warningMetrics = usageMetrics.filter(metric => (metric.current / metric.limit) >= 0.8 && (metric.current / metric.limit) < 0.9);
  
  const overallStatus = criticalMetrics.length > 0 ? 'critical' : 
                       warningMetrics.length > 0 ? 'warning' : 'good';

  const handleUpgrade = () => {
    if (nextTier) {
      openSubscriptionModal(nextTier);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tier Usage</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Current plan: {tierNames[currentTier]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overallStatus === 'critical' && (
              <Badge className="bg-red-100 text-red-800">
                <RiAlertLine className="w-3 h-3 mr-1" />
                Limits Reached
              </Badge>
            )}
            {overallStatus === 'warning' && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <RiInformationLine className="w-3 h-3 mr-1" />
                Approaching Limits
              </Badge>
            )}
            {overallStatus === 'good' && (
              <Badge className="bg-green-100 text-green-800">
                <RiCheckLine className="w-3 h-3 mr-1" />
                Within Limits
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage metrics */}
        <div className="space-y-3">
          {usageMetrics.map((metric, index) => {
            const percentage = Math.min((metric.current / metric.limit) * 100, 100);
            const isOverLimit = metric.current > metric.limit;
            
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{metric.icon}</span>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(percentage)}`}>
                    {metric.current.toLocaleString()}{metric.unit && ` ${metric.unit}`} / {metric.limit.toLocaleString()}{metric.unit && ` ${metric.unit}`}
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                  {isOverLimit && (
                    <div className="absolute top-0 right-0 h-2 w-1 bg-red-600 rounded-r-full" />
                  )}
                </div>
                
                {percentage >= 80 && (
                  <p className="text-xs text-gray-600">
                    {percentage >= 90 
                      ? `⚠️ You've reached ${percentage.toFixed(0)}% of your ${metric.name.toLowerCase()} limit`
                      : `📊 You're using ${percentage.toFixed(0)}% of your ${metric.name.toLowerCase()} limit`
                    }
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade suggestion */}
        {(overallStatus === 'critical' || overallStatus === 'warning') && nextTier && showUpgradeButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <RiArrowUpLine className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {overallStatus === 'critical' ? 'Upgrade Required' : 'Consider Upgrading'}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {overallStatus === 'critical' 
                    ? 'You\'ve reached your plan limits. Upgrade to continue using all features.'
                    : `You're approaching your limits. Upgrade to ${tierNames[nextTier]} for more capacity.`
                  }
                </p>
                <Button
                  onClick={handleUpgrade}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Upgrade to {tierNames[nextTier]}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enterprise unlimited message */}
        {currentTier === BusinessTier.ENTERPRISE && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <span className="text-2xl">👑</span>
              <div className="text-left">
                <p className="font-medium text-yellow-800">Enterprise Plan</p>
                <p className="text-sm text-yellow-700">Unlimited usage across all metrics</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TierProgressIndicator;