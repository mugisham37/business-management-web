/**
 * TierDemoPage Component
 * 
 * Demonstrates usage of all tier-based UI components
 * Shows different modes and configurations
 * 
 * Requirements: 2.5
 */

'use client';

import React, { useState } from 'react';
import { BusinessTier } from '@/types/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TierGate, 
  TierUpgradePrompt, 
  FeatureLockedOverlay, 
  TierBadge, 
  TierProgressIndicator 
} from './index';
import { 
  RiDashboardLine, 
  RiBarChartLine, 
  RiTeamLine,
  RiSettingsLine,
  RiShieldLine
} from '@remixicon/react';

/**
 * Demo page showing tier-based UI components in action
 */
export function TierDemoPage() {
  const [currentTier, setCurrentTier] = useState<BusinessTier>(BusinessTier.MICRO);
  const [selectedMode, setSelectedMode] = useState<'hide' | 'disable' | 'overlay' | 'prompt'>('hide');

  // Mock usage data
  const mockUsage = {
    employees: currentTier === BusinessTier.MICRO ? 4 : 
               currentTier === BusinessTier.SMALL ? 18 : 
               currentTier === BusinessTier.MEDIUM ? 75 : 150,
    locations: currentTier === BusinessTier.MICRO ? 1 : 
               currentTier === BusinessTier.SMALL ? 3 : 
               currentTier === BusinessTier.MEDIUM ? 8 : 25,
    transactions: currentTier === BusinessTier.MICRO ? 850 : 
                  currentTier === BusinessTier.SMALL ? 7500 : 
                  currentTier === BusinessTier.MEDIUM ? 35000 : 75000,
    storage: currentTier === BusinessTier.MICRO ? 0.8 : 
             currentTier === BusinessTier.SMALL ? 7.2 : 
             currentTier === BusinessTier.MEDIUM ? 65 : 250,
    apiCalls: currentTier === BusinessTier.MICRO ? 750 : 
              currentTier === BusinessTier.SMALL ? 8200 : 
              currentTier === BusinessTier.MEDIUM ? 78000 : 180000
  };

  const features = [
    {
      id: 'basic-dashboard',
      name: 'Basic Dashboard',
      icon: RiDashboardLine,
      requiredTier: BusinessTier.MICRO,
      description: 'View basic sales and inventory data'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      icon: RiBarChartLine,
      requiredTier: BusinessTier.SMALL,
      description: 'Detailed reports and predictive insights'
    },
    {
      id: 'team-management',
      name: 'Team Management',
      icon: RiTeamLine,
      requiredTier: BusinessTier.MEDIUM,
      description: 'Manage employees, roles, and permissions'
    },
    {
      id: 'enterprise-settings',
      name: 'Enterprise Settings',
      icon: RiSettingsLine,
      requiredTier: BusinessTier.ENTERPRISE,
      description: 'Advanced configuration and customization'
    },
    {
      id: 'security-center',
      name: 'Security Center',
      icon: RiShieldLine,
      requiredTier: BusinessTier.ENTERPRISE,
      description: 'Advanced security monitoring and controls'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Tier-Based UI Components Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This page demonstrates how tier-based UI components work with different user tiers and access modes.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Tier
              </label>
              <Select value={currentTier} onValueChange={(value) => setCurrentTier(value as BusinessTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BusinessTier.MICRO}>Micro (Free)</SelectItem>
                  <SelectItem value={BusinessTier.SMALL}>Small Business</SelectItem>
                  <SelectItem value={BusinessTier.MEDIUM}>Medium Business</SelectItem>
                  <SelectItem value={BusinessTier.ENTERPRISE}>Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Mode
              </label>
              <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hide">Hide (Default)</SelectItem>
                  <SelectItem value="disable">Disable</SelectItem>
                  <SelectItem value="overlay">Overlay</SelectItem>
                  <SelectItem value="prompt">Prompt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current tier:</span>
            <TierBadge tier={currentTier} />
          </div>
        </CardContent>
      </Card>

      {/* Tier Progress Indicator */}
      <TierProgressIndicator
        currentTier={currentTier}
        usage={mockUsage}
      />

      {/* Feature Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Access Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const hasAccess = currentTier >= feature.requiredTier;
            
            return (
              <TierGate
                key={feature.id}
                requiredTier={feature.requiredTier}
                mode={selectedMode}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                          {hasAccess && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Available
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <TierBadge tier={feature.requiredTier} size="sm" />
                          <Button size="sm" variant="outline">
                            Open Feature
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TierGate>
            );
          })}
        </div>
      </div>

      {/* Upgrade Prompt Examples */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade Prompt Examples</h2>
        <div className="space-y-6">
          {/* Compact prompt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Compact Prompt</h3>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Advanced Analytics requires:</span>
              <TierUpgradePrompt
                requiredTier={BusinessTier.SMALL}
                currentTier={currentTier}
                compact
                dismissible
              />
            </div>
          </div>

          {/* Full prompt */}
          {currentTier < BusinessTier.MEDIUM && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Upgrade Prompt</h3>
              <TierUpgradePrompt
                requiredTier={BusinessTier.MEDIUM}
                currentTier={currentTier}
                title="Unlock Team Management"
                description="Manage your team with advanced role-based permissions and employee tracking."
                dismissible
              />
            </div>
          )}
        </div>
      </div>

      {/* Overlay Example */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Overlay Example</h2>
        <div className="relative">
          <Card className="opacity-30">
            <CardHeader>
              <CardTitle>Enterprise Security Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-100 h-20 rounded"></div>
                  <div className="bg-gray-100 h-20 rounded"></div>
                  <div className="bg-gray-100 h-20 rounded"></div>
                </div>
                <div className="bg-gray-100 h-32 rounded"></div>
              </div>
            </CardContent>
          </Card>
          <FeatureLockedOverlay
            requiredTier={BusinessTier.ENTERPRISE}
            currentTier={currentTier}
            title="Enterprise Security Center"
            description="Advanced security monitoring and threat detection"
          />
        </div>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Basic Usage</h4>
            <pre className="text-sm text-gray-600 overflow-x-auto">
{`<TierGate requiredTier={BusinessTier.SMALL}>
  <AdvancedAnalytics />
</TierGate>`}
            </pre>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">With Overlay Mode</h4>
            <pre className="text-sm text-gray-600 overflow-x-auto">
{`<TierGate 
  requiredTier={BusinessTier.MEDIUM}
  mode="overlay"
  upgradePromptTitle="Unlock Team Features"
>
  <TeamManagement />
</TierGate>`}
            </pre>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Feature-Based Gating</h4>
            <pre className="text-sm text-gray-600 overflow-x-auto">
{`<TierGate 
  requiredFeature="advanced-reporting"
  mode="prompt"
>
  <ReportingDashboard />
</TierGate>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TierDemoPage;