'use client';

import { useState } from 'react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                {step === 'success' ? 'Welcome aboard!' : `Subscribe to ${getTierDisplayName(tier)}`}
              </h2>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'plan-review' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Plan Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                        {getTierDisplayName(tier)} Plan
                      </h3>
                      <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {billingCycle === 'annually' ? 'Annual' : 'Monthly'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        ${price}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>

                    {savings > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                        Save ${savings}/month with annual billing
                      </p>
                    )}

                    {hasFreeTrial && (
                      <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                        <RiTimeLine className="w-4 h-4" />
                        <span>{tierConfig.trialDays}-day free trial included</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-50 mb-3">
                      What's included:
                    </h4>
                    <ul className="space-y-2">
                      {tierConfig.features.slice(0, 5).map((feature) => (
                        <li key={feature.id} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <RiCheckLine className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature.name}
                        </li>
                      ))}
                      {tierConfig.features.length > 5 && (
                        <li className="text-sm text-gray-500 dark:text-gray-500 ml-7">
                          And {tierConfig.features.length - 5} more features...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Trial Info */}
                  {hasFreeTrial && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <RiShieldCheckLine className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                            Free Trial
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Try all features free for {tierConfig.trialDays} days. Cancel anytime during the trial period with no charges.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={handleSubscribe}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {hasFreeTrial ? 'Start Free Trial' : 'Subscribe Now'}
                    <RiArrowRightLine className="w-4 h-4 ml-2" />
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
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    Setting up your subscription...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This will only take a moment
                  </p>
                </motion.div>
              )}

              {step === 'success' && subscriptionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <RiCheckLine className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    Subscription activated!
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {hasFreeTrial && subscriptionResult.trialEndsAt ? (
                      <>Your free trial is active until {subscriptionResult.trialEndsAt.toLocaleDateString()}</>
                    ) : (
                      <>Your {getTierDisplayName(tier)} plan is now active</>
                    )}
                  </p>

                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Go to Dashboard
                    <RiArrowRightLine className="w-4 h-4 ml-2" />
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