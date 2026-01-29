"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessTier } from "@/hooks/useTierAccess";
import { motion } from "framer-motion";
import {
  Lock,
  Crown,
  Zap,
  Home,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

// Tier configuration
const TIER_CONFIG = {
  [BusinessTier.MICRO]: {
    name: "Free",
    icon: Home,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  [BusinessTier.SMALL]: {
    name: "Growth",
    icon: Zap,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  [BusinessTier.MEDIUM]: {
    name: "Business",
    icon: Crown,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  [BusinessTier.ENTERPRISE]: {
    name: "Industry",
    icon: Crown,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
};

interface InlineUpgradePromptProps {
  requiredTier: BusinessTier;
  featureName: string;
  description?: string;
  onUpgradeClick: (tier: BusinessTier) => void;
  onDismiss?: () => void;
  variant?: "card" | "banner" | "compact";
  showDismiss?: boolean;
}

export function InlineUpgradePrompt({
  requiredTier,
  featureName,
  description,
  onUpgradeClick,
  onDismiss,
  variant = "card",
  showDismiss = false,
}: InlineUpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const tierConfig = TIER_CONFIG[requiredTier];
  const TierIcon = tierConfig.icon;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  // Compact variant for small spaces
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-dashed"
      >
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground flex-1">
          Requires {tierConfig.name}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpgradeClick(requiredTier)}
          className="h-7 px-2 text-xs"
        >
          Upgrade
        </Button>
      </motion.div>
    );
  }

  // Banner variant for full-width notifications
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
      >
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">
              {featureName} requires {tierConfig.name} plan
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={tierConfig.color}>
            <TierIcon className="h-3 w-3 mr-1" />
            {tierConfig.name}
          </Badge>
          <Button
            onClick={() => onUpgradeClick(requiredTier)}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative border-dashed border-2 border-muted-foreground/20">
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4"
          >
            <Lock className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          
          <h3 className="text-lg font-semibold mb-2">
            {featureName} is locked
          </h3>
          
          <p className="text-muted-foreground mb-4 max-w-sm">
            {description || `This feature requires the ${tierConfig.name} plan or higher to access.`}
          </p>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-muted-foreground">
              Available in:
            </span>
            <Badge className={tierConfig.color}>
              <TierIcon className="h-3 w-3 mr-1" />
              {tierConfig.name} Plan
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onUpgradeClick(requiredTier)}
              className="flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              Upgrade to {tierConfig.name}
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            30-day free trial • No setup fees • Cancel anytime
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Higher-order component to wrap locked content
interface LockedFeatureWrapperProps {
  children: React.ReactNode;
  requiredTier: BusinessTier;
  currentTier: BusinessTier;
  featureName: string;
  description?: string;
  onUpgradeClick: (tier: BusinessTier) => void;
  fallbackVariant?: "card" | "banner" | "compact";
}

export function LockedFeatureWrapper({
  children,
  requiredTier,
  currentTier,
  featureName,
  description,
  onUpgradeClick,
  fallbackVariant = "card",
}: LockedFeatureWrapperProps) {
  // Helper to check if user has access
  const hasAccess = () => {
    const tierLevels = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 1,
      [BusinessTier.MEDIUM]: 2,
      [BusinessTier.ENTERPRISE]: 3,
    };
    
    return tierLevels[currentTier] >= tierLevels[requiredTier];
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  return (
    <InlineUpgradePrompt
      requiredTier={requiredTier}
      featureName={featureName}
      description={description}
      onUpgradeClick={onUpgradeClick}
      variant={fallbackVariant}
    />
  );
}