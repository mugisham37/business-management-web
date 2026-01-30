"use client";

import { useState, useEffect } from "react";
import { TierAwareSidebar } from "./tier-aware-sidebar";
import { Navbar } from "./navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/authentication/useAuth";
import { useTierAccess, BusinessTier } from "@/hooks/utilities-infrastructure/useTierAccess";
import { UpgradePromptModal } from "../upgrade/upgrade-prompt-modal";
import { RealtimeDashboardWrapper } from "../dashboard/realtime-dashboard-wrapper";
import { motion, AnimatePresence } from "framer-motion";

interface TierAwareDashboardLayoutProps {
  children: React.ReactNode;
}

export function TierAwareDashboardLayout({ children }: TierAwareDashboardLayoutProps) {
  const { user } = useAuth();
  const { isLoading, refetch } = useTierAccess();
  const [currentTier, setCurrentTier] = useState<BusinessTier>(BusinessTier.MICRO);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetTier, setUpgradeTargetTier] = useState<BusinessTier>(BusinessTier.SMALL);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize current tier from user data or context
  useEffect(() => {
    if (user && !isLoading && !isInitialized) {
      // In a real implementation, this would come from the user's subscription data
      // Using a type assertion to access businessTier which may be added via extension
      type UserWithTier = typeof user & { businessTier?: BusinessTier };
      const userTier = (user as UserWithTier).businessTier ?? BusinessTier.MICRO;
      setCurrentTier(userTier);
      setIsInitialized(true);
    }
  }, [user, isLoading, isInitialized]);

  // Handle upgrade click from sidebar
  const handleUpgradeClick = (requiredTier: BusinessTier) => {
    setUpgradeTargetTier(requiredTier);
    setShowUpgradeModal(true);
  };

  // Handle successful upgrade
  const handleUpgradeSuccess = (newTier: BusinessTier) => {
    setCurrentTier(newTier);
    setShowUpgradeModal(false);
    
    // Refresh tier access data to get updated permissions
    refetch();
  };

  // Handle real-time tier changes
  const handleTierChange = (newTier: BusinessTier) => {
    setCurrentTier(newTier);
    
    // Refresh tier access data to get updated permissions
    refetch();
  };

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <TierAwareSidebar 
          currentTier={currentTier}
          onUpgradeClick={handleUpgradeClick}
        />
        
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          
          <main className="flex flex-1 flex-col overflow-auto">
            <RealtimeDashboardWrapper
              currentTier={currentTier}
              onTierChange={handleTierChange}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTier} // Re-animate when tier changes
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </RealtimeDashboardWrapper>
          </main>
        </SidebarInset>
      </div>

      {/* Upgrade Modal */}
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        targetTier={upgradeTargetTier}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </SidebarProvider>
  );
}