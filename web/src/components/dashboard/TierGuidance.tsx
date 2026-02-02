/**
 * Tier-Appropriate Dashboard Guidance Component
 * Provides tier-specific guidance and feature recommendations
 * Implements Requirement 7.3 - Tier-appropriate dashboard guidance
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  ArrowRight,
  Sparkles,
  Info,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';

interface TierFeature {
  name: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  route?: string;
  comingSoon?: boolean;
}

interface TierGuidanceProps {
  userTier: 'micro' | 'small' | 'medium' | 'enterprise';
  isNewUser?: boolean;
  onUpgrade?: () => void;
}

const tierFeatures: Record<string, TierFeature[]> = {
  micro: [
    {
      name: 'Basic POS',
      description: 'Simple point of sale for single location',
      icon: Package,
      available: true,
      route: '/pos'
    },
    {
      name: 'Inventory Tracking',
      description: 'Track up to 100 products',
      icon: BarChart3,
      available: true,
      route: '/inventory'
    },
    {
      name: 'Customer Management',
      description: 'Basic customer database',
      icon: Users,
      available: true,
      route: '/crm'
    }
  ],
  small: [
    {
      name: 'Advanced POS',
      description: 'Multi-location POS with advanced features',
      icon: Package,
      available: true,
      route: '/pos'
    },
    {
      name: 'Full Inventory',
      description: 'Unlimited products with low stock alerts',
      icon: BarChart3,
      available: true,
      route: '/inventory'
    },
    {
      name: 'CRM & Analytics',
      description: 'Customer insights and sales analytics',
      icon: TrendingUp,
      available: true,
      route: '/analytics'
    },
    {
      name: 'Employee Management',
      description: 'Staff scheduling and time tracking',
      icon: Users,
      available: true,
      route: '/employees'
    }
  ],
  medium: [
    {
      name: 'Multi-Location Management',
      description: 'Manage multiple store locations',
      icon: Settings,
      available: true,
      route: '/locations'
    },
    {
      name: 'Advanced Analytics',
      description: 'Detailed reporting and forecasting',
      icon: TrendingUp,
      available: true,
      route: '/analytics'
    },
    {
      name: 'Supplier Management',
      description: 'Vendor relationships and procurement',
      icon: Package,
      available: true,
      route: '/suppliers'
    },
    {
      name: 'Financial Management',
      description: 'Accounting and financial reporting',
      icon: BarChart3,
      available: true,
      route: '/financial'
    }
  ],
  enterprise: [
    {
      name: 'Enterprise Analytics',
      description: 'AI-powered insights and predictions',
      icon: TrendingUp,
      available: true,
      route: '/analytics'
    },
    {
      name: 'Warehouse Management',
      description: 'Advanced inventory and fulfillment',
      icon: Package,
      available: true,
      route: '/warehouse'
    },
    {
      name: 'B2B Portal',
      description: 'Wholesale and B2B customer management',
      icon: Users,
      available: true,
      route: '/b2b'
    },
    {
      name: 'API & Integrations',
      description: 'Custom integrations and API access',
      icon: Settings,
      available: true,
      route: '/settings'
    }
  ]
};

const tierInfo = {
  micro: {
    name: 'Micro',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Perfect for solo entrepreneurs and small startups',
    nextTier: 'small'
  },
  small: {
    name: 'Small Business',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Ideal for growing businesses with multiple employees',
    nextTier: 'medium'
  },
  medium: {
    name: 'Medium Business',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Built for established businesses with multiple locations',
    nextTier: 'enterprise'
  },
  enterprise: {
    name: 'Enterprise',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    description: 'Complete solution for large organizations',
    nextTier: null
  }
};

export function TierGuidance({ userTier, isNewUser = false, onUpgrade }: TierGuidanceProps) {
  // Initialize showGuidance based on isNewUser. We use the prop directly for initial state.
  // If isNewUser changes, we rely on React re-rendering with the new prop value.
  const [showGuidance, setShowGuidance] = useState(isNewUser);
  const currentTierInfo = tierInfo[userTier];
  const features = tierFeatures[userTier] || [];

  if (!showGuidance) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message for New Users */}
      {isNewUser && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Welcome to BizManager! You&apos;re on the <strong>{currentTierInfo.name}</strong> plan. 
            Here&apos;s what you can do to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Tier Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  Your Plan: 
                  <Badge className={currentTierInfo.color}>
                    {currentTierInfo.name}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentTierInfo.description}
                </CardDescription>
              </div>
            </div>
            {currentTierInfo.nextTier && (
              <Button variant="outline" onClick={onUpgrade}>
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Available Features */}
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>
            Features included in your {currentTierInfo.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.name}
                  className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{feature.name}</h4>
                      {feature.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {feature.description}
                    </p>
                    {feature.available && feature.route && !feature.comingSoon && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={feature.route}>
                          Get Started <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Suggestion */}
      {currentTierInfo.nextTier && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ready to Grow?
            </CardTitle>
            <CardDescription>
              Unlock more features with the {tierInfo[currentTierInfo.nextTier as keyof typeof tierInfo].name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Get access to advanced features like multi-location management, 
                  detailed analytics, and priority support.
                </p>
              </div>
              <Button onClick={onUpgrade}>
                View Upgrade Options
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to help you get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/inventory">
                <Package className="mr-2 h-4 w-4" />
                Add Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/crm">
                <Users className="mr-2 h-4 w-4" />
                Add Customers
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/pos">
                <BarChart3 className="mr-2 h-4 w-4" />
                Make First Sale
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dismiss Button */}
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowGuidance(false)}
        >
          <Info className="mr-2 h-4 w-4" />
          Hide Guidance
        </Button>
      </div>
    </div>
  );
}

export default TierGuidance;