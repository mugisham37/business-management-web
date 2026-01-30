"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { BusinessTier } from "@/hooks/utilities-infrastructure/useTierAccess";
import { useUpgradeFlow } from "@/hooks/utilities-infrastructure/useUpgradeFlow";
import { InlineUpgradePrompt, LockedFeatureWrapper } from "../upgrade/inline-upgrade-prompt";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Crown,
  Lock,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface TierAwareDashboardExampleProps {
  currentTier: BusinessTier;
}

export function TierAwareDashboardExample({ currentTier }: TierAwareDashboardExampleProps) {
  const { openUpgradeModal } = useUpgradeFlow();

  // Mock data
  const totalRevenue = 198000;
  const totalOrders = 398;
  const avgOrderValue = totalRevenue / totalOrders;
  const activeCustomers = 1245;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your business"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Cards - Always visible but some features locked */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`${(totalRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true, label: "from last month" }}
          className="border-green-200 dark:border-green-800"
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true, label: "from last month" }}
        />
        
        {/* Advanced metrics locked for lower tiers */}
        <LockedFeatureWrapper
          requiredTier={BusinessTier.SMALL}
          currentTier={currentTier}
          featureName="Advanced Analytics"
          onUpgradeClick={openUpgradeModal}
          fallbackVariant="compact"
        >
          <MetricCard
            title="Avg. Order Value"
            value={`$${avgOrderValue.toFixed(0)}`}
            icon={TrendingUp}
            trend={{ value: 4.1, isPositive: true, label: "from last month" }}
          />
        </LockedFeatureWrapper>

        <LockedFeatureWrapper
          requiredTier={BusinessTier.SMALL}
          currentTier={currentTier}
          featureName="Customer Analytics"
          onUpgradeClick={openUpgradeModal}
          fallbackVariant="compact"
        >
          <MetricCard
            title="Active Customers"
            value={activeCustomers.toLocaleString()}
            icon={Users}
            trend={{ value: 15.3, isPositive: true, label: "new this month" }}
          />
        </LockedFeatureWrapper>
      </div>

      {/* Advanced Analytics Section - Locked for MICRO tier */}
      {currentTier === BusinessTier.MICRO ? (
        <InlineUpgradePrompt
          requiredTier={BusinessTier.SMALL}
          featureName="Advanced Analytics Dashboard"
          description="Get detailed insights into your business performance with advanced charts, trends, and forecasting."
          onUpgradeClick={openUpgradeModal}
          variant="banner"
          showDismiss={true}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trend
                  <Badge variant="secondary" className="ml-auto">
                    Growth Plan
                  </Badge>
                </CardTitle>
                <CardDescription>Monthly revenue and orders over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Advanced analytics chart would be here
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Customer behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Returning Customers</span>
                  <span className="font-semibold">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="font-semibold">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg. Session Duration</span>
                  <span className="font-semibold">8m 32s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* B2B Features - Locked for tiers below MEDIUM */}
      <LockedFeatureWrapper
        requiredTier={BusinessTier.MEDIUM}
        currentTier={currentTier}
        featureName="B2B Management Dashboard"
        description="Manage wholesale customers, bulk orders, and custom pricing with our B2B tools."
        onUpgradeClick={openUpgradeModal}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              B2B Dashboard
              <Badge variant="secondary" className="ml-auto">
                Business Plan
              </Badge>
            </CardTitle>
            <CardDescription>Wholesale and B2B customer management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">B2B Customers</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">$45K</div>
                <div className="text-sm text-muted-foreground">Wholesale Revenue</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Pending Quotes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </LockedFeatureWrapper>

      {/* Enterprise Features - Locked for tiers below ENTERPRISE */}
      <LockedFeatureWrapper
        requiredTier={BusinessTier.ENTERPRISE}
        currentTier={currentTier}
        featureName="Enterprise Analytics Suite"
        description="Advanced reporting, custom dashboards, and AI-powered insights for enterprise operations."
        onUpgradeClick={openUpgradeModal}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Predictive Analytics
                <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800">
                  Industry Plan
                </Badge>
              </CardTitle>
              <CardDescription>AI-powered business forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Revenue Forecast (Next Quarter)</span>
                  <span className="font-semibold text-green-600">+18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventory Optimization</span>
                  <span className="font-semibold">$12K Savings</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Churn Risk</span>
                  <span className="font-semibold text-red-600">3 Customers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>Tailored business intelligence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Executive Summary Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Performance Benchmarking
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Supply Chain Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </LockedFeatureWrapper>

      {/* Recent Activity - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-muted">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New order #12456 received</p>
                <p className="text-xs text-muted-foreground">2 min ago</p>
              </div>
              <span className="font-semibold text-green-600">+$234.50</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payment received for #12453</p>
                <p className="text-xs text-muted-foreground">15 min ago</p>
              </div>
              <span className="font-semibold text-green-600">+$567.00</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2 bg-muted">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New customer registration</p>
                <p className="text-xs text-muted-foreground">32 min ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}