"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessTier } from "@/hooks/utilities-infrastructure/useTierAccess";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Crown,
  Zap,
  Home,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  BarChart3,
  X,
} from "lucide-react";

// Tier configuration with features and pricing
const TIER_CONFIG = {
  [BusinessTier.MICRO]: {
    name: "Free",
    displayName: "Free Plan",
    price: 0,
    yearlyPrice: 0,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: Home,
    features: [
      "Basic POS functionality",
      "Up to 100 products",
      "1 location",
      "Basic inventory tracking",
      "Email support",
    ],
    limits: {
      products: 100,
      locations: 1,
      employees: 2,
      transactions: 1000,
    },
  },
  [BusinessTier.SMALL]: {
    name: "Growth",
    displayName: "Growth Plan",
    price: 29,
    yearlyPrice: 290,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: Zap,
    features: [
      "Everything in Free",
      "Up to 1,000 products",
      "3 locations",
      "Advanced analytics",
      "CRM functionality",
      "Financial reporting",
      "Priority support",
    ],
    limits: {
      products: 1000,
      locations: 3,
      employees: 10,
      transactions: 10000,
    },
  },
  [BusinessTier.MEDIUM]: {
    name: "Business",
    displayName: "Business Plan",
    price: 79,
    yearlyPrice: 790,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Crown,
    features: [
      "Everything in Growth",
      "Unlimited products",
      "10 locations",
      "Warehouse management",
      "B2B functionality",
      "Employee management",
      "Advanced integrations",
      "Phone support",
    ],
    limits: {
      products: "Unlimited",
      locations: 10,
      employees: 50,
      transactions: 50000,
    },
  },
  [BusinessTier.ENTERPRISE]: {
    name: "Industry",
    displayName: "Industry Plan",
    price: 199,
    yearlyPrice: 1990,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: Crown,
    features: [
      "Everything in Business",
      "Unlimited everything",
      "Advanced warehouse zones",
      "Franchise management",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    limits: {
      products: "Unlimited",
      locations: "Unlimited",
      employees: "Unlimited",
      transactions: "Unlimited",
    },
  },
};

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: BusinessTier;
  targetTier: BusinessTier;
  onUpgradeSuccess: (newTier: BusinessTier) => void;
  featureName?: string;
}

export function UpgradePromptModal({
  isOpen,
  onClose,
  currentTier,
  targetTier,
  onUpgradeSuccess,
  featureName,
}: UpgradePromptModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("monthly");

  const currentConfig = TIER_CONFIG[currentTier];
  const targetConfig = TIER_CONFIG[targetTier];

  // Calculate savings for yearly billing
  const yearlySavings = targetConfig.price * 12 - targetConfig.yearlyPrice;
  const savingsPercentage = Math.round((yearlySavings / (targetConfig.price * 12)) * 100);

  // Handle upgrade process
  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    try {
      // Simulate API call for upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Call the pricing engine to calculate prorated pricing
      // 2. Process payment if required
      // 3. Update user's subscription tier
      // 4. Refresh user permissions and feature flags
      
      onUpgradeSuccess(targetTier);
    } catch (error) {
      console.error("Upgrade failed:", error);
      // Handle error - show error message
    } finally {
      setIsUpgrading(false);
    }
  };

  // Get features that will be unlocked
  const newFeatures = targetConfig.features.filter(
    feature => !currentConfig.features.includes(feature)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade to {targetConfig.displayName}
          </DialogTitle>
          <DialogDescription>
            {featureName 
              ? `Unlock ${featureName} and more advanced features`
              : `Get access to more powerful features for your growing business`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current vs Target Tier Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Tier */}
            <Card className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const CurrentIcon = currentConfig.icon;
                    return <CurrentIcon className="h-4 w-4" />;
                  })()}
                  <CardTitle className="text-sm">Current Plan</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={currentConfig.color}>
                    {currentConfig.name}
                  </Badge>
                  <span className="text-lg font-bold">
                    ${currentConfig.price}/mo
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {currentConfig.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {currentConfig.features.length > 3 && (
                    <li className="text-xs">
                      +{currentConfig.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Target Tier */}
            <Card className="relative border-primary">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const TargetIcon = targetConfig.icon;
                    return <TargetIcon className="h-4 w-4" />;
                  })()}
                  <CardTitle className="text-sm">Upgrade To</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={targetConfig.color}>
                    {targetConfig.name}
                  </Badge>
                  <span className="text-lg font-bold">
                    ${selectedBilling === "monthly" ? targetConfig.price : Math.round(targetConfig.yearlyPrice / 12)}/mo
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {targetConfig.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span className={newFeatures.includes(feature) ? "font-medium text-primary" : "text-muted-foreground"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                  {targetConfig.features.length > 4 && (
                    <li className="text-xs text-muted-foreground">
                      +{targetConfig.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Billing Toggle */}
          <div className="space-y-3">
            <h4 className="font-medium">Choose billing cycle</h4>
            <div className="flex items-center gap-4">
              <Button
                variant={selectedBilling === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBilling("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={selectedBilling === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBilling("yearly")}
                className="relative"
              >
                Yearly
                {savingsPercentage > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                    Save {savingsPercentage}%
                  </Badge>
                )}
              </Button>
            </div>
            
            {selectedBilling === "yearly" && yearlySavings > 0 && (
              <p className="text-sm text-green-600">
                Save ${yearlySavings} per year with yearly billing
              </p>
            )}
          </div>

          {/* New Features Highlight */}
          {newFeatures.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What you&apos;ll unlock
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {newFeatures.slice(0, 3).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {targetConfig.displayName} - {selectedBilling === "monthly" ? "Monthly" : "Yearly"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBilling === "monthly" 
                      ? "Billed monthly, cancel anytime"
                      : `Billed yearly (${targetConfig.yearlyPrice}), cancel anytime`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${selectedBilling === "monthly" ? targetConfig.price : Math.round(targetConfig.yearlyPrice / 12)}
                  </p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="flex-1"
              size="lg"
            >
              <AnimatePresence mode="wait">
                {isUpgrading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Upgrading...
                  </motion.div>
                ) : (
                  <motion.div
                    key="upgrade"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade Now
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpgrading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure payment
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              24/7 support
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              No setup fees
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}