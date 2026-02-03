/**
 * Subscription Modal Component
 * 
 * Modal for handling subscription sign-up and upgrades
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Check } from 'lucide-react';
import { BusinessTier, SubscriptionState } from '@/types/pricing';
import { getTierConfig, formatLimit } from '@/lib/config/pricing-config';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: BusinessTier | null;
  billingCycle: 'monthly' | 'annually';
  onComplete: (subscription: SubscriptionState) => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  selectedTier,
  billingCycle,
  onComplete,
}: SubscriptionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const tierConfig = selectedTier ? getTierConfig(selectedTier) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // TODO: Integrate with payment processor
      await new Promise(resolve => setTimeout(resolve, 2000));

      const subscription: SubscriptionState = {
        currentTier: selectedTier!,
        billingCycle,
        isActive: true,
        isTrial: tierConfig?.trialDays ? tierConfig.trialDays > 0 : false,
        autoRenew: true,
        trialEndsAt: tierConfig?.trialDays 
          ? new Date(Date.now() + tierConfig.trialDays * 24 * 60 * 60 * 1000)
          : undefined,
      };

      onComplete(subscription);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !tierConfig) return null;

  const price = billingCycle === 'monthly' 
    ? tierConfig.monthlyPrice 
    : tierConfig.yearlyPrice;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Subscribe to {tierConfig.displayName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tierConfig.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Price Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} subscription
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
              {tierConfig.trialDays && tierConfig.trialDays > 0 && (
                <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                  Includes {tierConfig.trialDays}-day free trial
                </p>
              )}
            </div>

            {/* Features Preview */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                What&apos;s included:
              </h3>
              <ul className="space-y-2">
                {tierConfig.features.slice(0, 5).map((feature) => (
                  <li key={feature.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature.name}
                    {feature.limit && <span className="text-gray-400">({feature.limit})</span>}
                  </li>
                ))}
                {tierConfig.features.length > 5 && (
                  <li className="text-sm text-indigo-600 dark:text-indigo-400">
                    + {tierConfig.features.length - 5} more features
                  </li>
                )}
              </ul>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatLimit(tierConfig.limits.maxEmployees)}
                </p>
                <p className="text-xs text-gray-500">Employees</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatLimit(tierConfig.limits.maxLocations)}
                </p>
                <p className="text-xs text-gray-500">Locations</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatLimit(tierConfig.limits.storageGB)} GB
                </p>
                <p className="text-xs text-gray-500">Storage</p>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Secure payment powered by Stripe
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {tierConfig.trialDays && tierConfig.trialDays > 0 
                    ? 'Start Free Trial' 
                    : 'Subscribe Now'}
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              {tierConfig.trialDays && tierConfig.trialDays > 0 && (
                <> You won&apos;t be charged until your trial ends.</>
              )}
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
