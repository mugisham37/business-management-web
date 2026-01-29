"use client";

import { useState, useCallback, useEffect } from "react";
import { BusinessTier } from "./useTierAccess";
import { useAuth } from "./useAuth";

interface UpgradeFlowState {
  isModalOpen: boolean;
  targetTier: BusinessTier;
  featureName?: string | undefined;
  source?: string | undefined; // Track where the upgrade was initiated from
}

interface UpgradeFlowOptions {
  onUpgradeSuccess?: (newTier: BusinessTier) => void;
  onUpgradeError?: (error: Error) => void;
  trackAnalytics?: boolean;
}

export function useUpgradeFlow(options: UpgradeFlowOptions = {}) {
  const { user } = useAuth();
  const [upgradeState, setUpgradeState] = useState<UpgradeFlowState>({
    isModalOpen: false,
    targetTier: BusinessTier.SMALL,
  });
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [currentTier, setCurrentTier] = useState<BusinessTier>(BusinessTier.MICRO);

  // Initialize current tier from user data
  useEffect(() => {
    if (user) {
      const userTier = (user as any)?.businessTier || BusinessTier.MICRO;
      setCurrentTier(userTier);
    }
  }, [user]);

  // Open upgrade modal
  const openUpgradeModal = useCallback((
    targetTier: BusinessTier,
    featureName?: string,
    source?: string
  ) => {
    setUpgradeState({
      isModalOpen: true,
      targetTier,
      featureName: featureName || undefined,
      source: source || undefined,
    });

    // Track analytics if enabled
    if (options.trackAnalytics) {
      // In a real implementation, this would send analytics events
      console.log("Upgrade modal opened", {
        targetTier,
        featureName,
        source,
        currentTier,
      });
    }
  }, [currentTier, options.trackAnalytics]);

  // Close upgrade modal
  const closeUpgradeModal = useCallback(() => {
    setUpgradeState(prev => ({
      ...prev,
      isModalOpen: false,
    }));
  }, []);

  // Process upgrade
  const processUpgrade = useCallback(async (
    targetTier: BusinessTier,
    billingCycle: "monthly" | "yearly" = "monthly"
  ) => {
    setIsUpgrading(true);

    try {
      // In a real implementation, this would:
      // 1. Call the pricing engine to calculate costs
      // 2. Process payment if required
      // 3. Update subscription in the backend
      // 4. Update user's tier and permissions
      // 5. Refresh feature flags

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setCurrentTier(targetTier);
      
      // Close modal
      closeUpgradeModal();

      // Call success callback
      options.onUpgradeSuccess?.(targetTier);

      // Track success analytics
      if (options.trackAnalytics) {
        console.log("Upgrade successful", {
          fromTier: currentTier,
          toTier: targetTier,
          billingCycle,
          source: upgradeState.source,
        });
      }

      return { success: true };
    } catch (error) {
      const upgradeError = error instanceof Error ? error : new Error("Upgrade failed");
      
      // Call error callback
      options.onUpgradeError?.(upgradeError);

      // Track error analytics
      if (options.trackAnalytics) {
        console.log("Upgrade failed", {
          error: upgradeError.message,
          targetTier,
          source: upgradeState.source,
        });
      }

      return { success: false, error: upgradeError };
    } finally {
      setIsUpgrading(false);
    }
  }, [currentTier, upgradeState.source, options, closeUpgradeModal]);

  // Check if user can access a feature
  const canAccessFeature = useCallback((requiredTier: BusinessTier) => {
    const tierLevels = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 1,
      [BusinessTier.MEDIUM]: 2,
      [BusinessTier.ENTERPRISE]: 3,
    };

    return tierLevels[currentTier] >= tierLevels[requiredTier];
  }, [currentTier]);

  // Get next tier for upgrade suggestions
  const getNextTier = useCallback(() => {
    switch (currentTier) {
      case BusinessTier.MICRO:
        return BusinessTier.SMALL;
      case BusinessTier.SMALL:
        return BusinessTier.MEDIUM;
      case BusinessTier.MEDIUM:
        return BusinessTier.ENTERPRISE;
      default:
        return BusinessTier.ENTERPRISE;
    }
  }, [currentTier]);

  // Get upgrade benefits for a target tier
  const getUpgradeBenefits = useCallback((targetTier: BusinessTier) => {
    const benefits: Record<BusinessTier, string[]> = {
      [BusinessTier.MICRO]: [],
      [BusinessTier.SMALL]: [
        "Advanced analytics and reporting",
        "CRM functionality",
        "Up to 1,000 products",
        "3 locations",
        "Priority support",
      ],
      [BusinessTier.MEDIUM]: [
        "Warehouse management",
        "B2B functionality",
        "Employee management",
        "10 locations",
        "Advanced integrations",
      ],
      [BusinessTier.ENTERPRISE]: [
        "Unlimited everything",
        "Franchise management",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
      ],
    };

    return benefits[targetTier] || [];
  }, []);

  // Calculate upgrade pricing
  const calculateUpgradePrice = useCallback((
    targetTier: BusinessTier,
    billingCycle: "monthly" | "yearly" = "monthly"
  ) => {
    const pricing = {
      [BusinessTier.MICRO]: { monthly: 0, yearly: 0 },
      [BusinessTier.SMALL]: { monthly: 29, yearly: 290 },
      [BusinessTier.MEDIUM]: { monthly: 79, yearly: 790 },
      [BusinessTier.ENTERPRISE]: { monthly: 199, yearly: 1990 },
    };

    const currentPrice = pricing[currentTier][billingCycle];
    const targetPrice = pricing[targetTier][billingCycle];
    
    return {
      currentPrice,
      targetPrice,
      difference: targetPrice - currentPrice,
      savings: billingCycle === "yearly" ? (targetPrice * 12 - pricing[targetTier].yearly) : 0,
    };
  }, [currentTier]);

  return {
    // State
    currentTier,
    upgradeState,
    isUpgrading,

    // Actions
    openUpgradeModal,
    closeUpgradeModal,
    processUpgrade,

    // Utilities
    canAccessFeature,
    getNextTier,
    getUpgradeBenefits,
    calculateUpgradePrice,
  };
}