"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeTierUpdates, useTierChangeAnimations } from "@/hooks/useRealtimeTierUpdates";
import { BusinessTier } from "@/hooks/useTierAccess";
import { useUpgradeFlow } from "@/hooks/useUpgradeFlow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  Zap,
  Home,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// Tier configuration for animations
const TIER_CONFIG = {
  [BusinessTier.MICRO]: {
    name: "Free",
    icon: Home,
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  [BusinessTier.SMALL]: {
    name: "Growth",
    icon: Zap,
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-800",
  },
  [BusinessTier.MEDIUM]: {
    name: "Business",
    icon: Crown,
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-800",
  },
  [BusinessTier.ENTERPRISE]: {
    name: "Industry",
    icon: Crown,
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-800",
  },
};

interface RealtimeDashboardWrapperProps {
  children: React.ReactNode;
  currentTier: BusinessTier;
  onTierChange: (newTier: BusinessTier) => void;
}

export function RealtimeDashboardWrapper({
  children,
  currentTier,
  onTierChange,
}: RealtimeDashboardWrapperProps) {
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [lastTierChange, setLastTierChange] = useState<{
    from: BusinessTier;
    to: BusinessTier;
    timestamp: Date;
  } | null>(null);

  const { isAnimating, animationType, animateTierChange } = useTierChangeAnimations();
  const { openUpgradeModal } = useUpgradeFlow();

  // Handle tier change events
  const handleTierChange = useCallback((event: any) => {
    const { previousTier, newTier } = event;
    
    // Animate the tier change
    if (previousTier && previousTier !== newTier) {
      animateTierChange(previousTier, newTier);
      setLastTierChange({
        from: previousTier,
        to: newTier,
        timestamp: new Date(),
      });
    }

    // Update the tier
    onTierChange(newTier);

    // Show upgrade notification for upgrades
    if (previousTier && newTier > previousTier) {
      setShowUpgradeNotification(true);
      setTimeout(() => setShowUpgradeNotification(false), 5000);
    }
  }, [animateTierChange, onTierChange]);

  // Handle feature access updates
  const handleFeatureAccessUpdate = useCallback((event: any) => {
    // Trigger a refresh of feature flags or permissions
    console.log("Feature access updated:", event);
    
    // In a real implementation, this would refresh the user's permissions
    // and update the UI to show newly available features
  }, []);

  // Handle subscription updates
  const handleSubscriptionUpdate = useCallback((event: any) => {
    console.log("Subscription updated:", event);
    
    // Handle different subscription events
    switch (event.type) {
      case "PAYMENT_SUCCESS":
        // Show success message
        break;
      case "PAYMENT_FAILED":
        // Show payment failure warning
        break;
      case "SUBSCRIPTION_CANCELLED":
        // Show cancellation notice
        break;
    }
  }, []);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    if (!connected) {
      setShowConnectionStatus(true);
    } else {
      setShowConnectionStatus(false);
    }
  }, []);

  // Set up real-time updates
  const { isConnected, connectionError, reconnect } = useRealtimeTierUpdates({
    onTierChange: handleTierChange,
    onFeatureAccessUpdate: handleFeatureAccessUpdate,
    onSubscriptionUpdate: handleSubscriptionUpdate,
    onConnectionChange: handleConnectionChange,
  });

  // Auto-hide connection status after successful reconnection
  useEffect(() => {
    if (isConnected && showConnectionStatus) {
      const timer = setTimeout(() => {
        setShowConnectionStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, showConnectionStatus]);

  return (
    <div className="relative">
      {/* Connection Status Indicator */}
      <AnimatePresence>
        {showConnectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert className={`w-80 ${isConnected ? "border-green-500" : "border-red-500"}`}>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {isConnected ? (
                    "Connected to real-time updates"
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span>Connection lost</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={reconnect}
                        className="ml-2"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Upgrade Notification */}
      <AnimatePresence>
        {showUpgradeNotification && lastTierChange && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="border-green-500 bg-green-50 dark:bg-green-950">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Plan Upgraded Successfully!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Welcome to {TIER_CONFIG[lastTierChange.to].name}! New features are now available.
                  </p>
                </div>
                <Badge className={`${TIER_CONFIG[lastTierChange.to].bgColor} text-green-800`}>
                  <TIER_CONFIG[lastTierChange.to].icon className="h-3 w-3 mr-1" />
                  {TIER_CONFIG[lastTierChange.to].name}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Change Animation Overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                }}
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${TIER_CONFIG[currentTier].color}`}
              >
                <TIER_CONFIG[currentTier].icon className="h-8 w-8 text-white" />
              </motion.div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold">
                  {animationType === "upgrade" ? "Upgrading" : "Updating"} Your Plan
                </h3>
                <p className="text-muted-foreground">
                  {animationType === "upgrade" 
                    ? "Unlocking new features..." 
                    : "Updating your access..."
                  }
                </p>
              </div>

              <motion.div
                animate={{ width: ["0%", "100%"] }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full"
                style={{ width: "200px" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Content */}
      <motion.div
        key={currentTier}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={isAnimating ? "pointer-events-none" : ""}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Component for showing real-time feature updates
interface FeatureUpdateNotificationProps {
  features: string[];
  tier: BusinessTier;
  onDismiss: () => void;
}

export function FeatureUpdateNotification({
  features,
  tier,
  onDismiss,
}: FeatureUpdateNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="w-80 border-blue-500 bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                New Features Available!
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your {TIER_CONFIG[tier].name} plan now includes:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                {features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    {feature}
                  </li>
                ))}
                {features.length > 3 && (
                  <li className="text-xs">+{features.length - 3} more features</li>
                )}
              </ul>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-blue-600 hover:text-blue-800"
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}