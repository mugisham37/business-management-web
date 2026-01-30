'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiCloseLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiShieldCheckLine,
  RiArrowRightLine
} from '@remixicon/react';
import { Button } from '@/components/landing/Button';
import { Badge } from '@/components/landing/Badge';
import { BusinessTier } from '@/types/pricing';
import { getTierConfig, getTierDisplayName } from '@/lib/config/pricing-config';
import { SubscriptionService, SubscriptionPlan } from '@/lib/services/subscription-service';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: BusinessTier;
  billingCycle: 'monthly' | 'annually';
  onSubscriptionComplete?: (subscriptionId: string) => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  tier,
  billingCycle,
  onSubscriptionComplete,
}: SubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plan-review' | 'payment' | 'processing' | 'success'>('plan-review');
  const [subscriptionResult, setSubscriptionResult] = useState<{ subscriptionId: string; trialEndsAt?: Date } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tierConfig = getTierConfig(tier);
  if (!tierConfig) return null;

  const price = billingCycle === 'monthly' ? tierConfig.monthlyPrice : tierConfig.yearlyPrice;
  const savings = billingCycle === 'annually' ? tierConfig.monthlyPrice - tierConfig.yearlyPrice : 0;
  const hasFreeTrial = tierConfig.trialDays > 0;

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setStep('processing');

    const plan: SubscriptionPlan = {
      tier,
      billingCycle,
    };

    if (hasFreeTrial && tierConfig.trialDays) {
      plan.trialDays = tierConfig.trialDays;
    }

    try {
      const result = await SubscriptionService.initializeSubscription(plan);
      
      if (result.success && result.subscriptionId) {
        const subscriptionResult: { subscriptionId: string; trialEndsAt?: Date } = {
          subscriptionId: result.subscriptionId,
        };

        if (result.trialEndsAt) {
          subscriptionResult.trialEndsAt = result.trialEndsAt;
        }

        setSubscriptionResult(subscriptionResult);
        setStep('success');
        onSubscriptionComplete?.(result.subscriptionId);
      } else {
        throw new Error(result.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setStep('plan-review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      // Reset state after animation
      setTimeout(() => {
        setStep('plan-review');
        setSubscriptionResult(null);
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${
              isMobile ? 'max-w-sm mx-2 max-h-[90vh] overflow-y-auto' : 'max-w-md'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50">
                {step === 'success' ? 'Welcome aboard!' : `Subscribe to ${getTierDisplayName(tier)}`}
              </h2>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <RiCloseLine className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {step === 'plan-review' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Plan Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm sm:text-base">
                        {getTierDisplayName(tier)} Plan
                      </h3>
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs">
                        {billingCycle === 'annually' ? 'Annual' : 'Monthly'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
                        ${price}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>

                    {savings > 0 && (
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-2 sm:mb-3">
                        Save ${savings}/month with annual billing
                      </p>
                    )}

                    {hasFreeTrial && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                        <RiTimeLine className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{tierConfig.trialDays}-day free trial included</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-2 sm:mb-3 text-sm sm:text-base">
                      What&apos;s included:
                    </h4>
                    <ul className="space-y-1 sm:space-y-2">
                      {tierConfig.features.slice(0, isMobile ? 3 : 5).map((feature) => (
                        <li key={feature.id} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <RiCheckLine className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                          {feature.name}
                        </li>
                      ))}
                      {tierConfig.features.length > (isMobile ? 3 : 5) && (
                        <li className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 ml-5 sm:ml-7">
                          And {tierConfig.features.length - (isMobile ? 3 : 5)} more features...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Trial Info */}
                  {hasFreeTrial && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <RiShieldCheckLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1 text-sm sm:text-base">
                            Free Trial
                          </h4>
                          <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                            Try all features free for {tierConfig.trialDays} days. Cancel anytime during the trial period with no charges.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={handleSubscribe}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base py-2 sm:py-3"
                  >
                    {hasFreeTrial ? 'Start Free Trial' : 'Subscribe Now'}
                    <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Secure payment processing. Cancel anytime.
                  </p>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 sm:py-8"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 relative">
                    <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    Setting up your subscription...
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    This will only take a moment
                  </p>
                </motion.div>
              )}

              {step === 'success' && subscriptionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6 sm:py-8"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <RiCheckLine className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    Subscription activated!
                  </h3>
                  
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                    {hasFreeTrial && subscriptionResult.trialEndsAt ? (
                      <>Your free trial is active until {subscriptionResult.trialEndsAt.toLocaleDateString()}</>
                    ) : (
                      <>Your {getTierDisplayName(tier)} plan is now active</>
                    )}
                  </p>

                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base py-2 sm:py-3"
                  >
                    Go to Dashboard
                    <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}