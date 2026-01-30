/**
 * Upgrade Flow Modal Component
 * Complete tier upgrade experience with payment integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTierAccess } from '@/hooks/utilities-infrastructure/useTierAccess';
import { useUpgradeFlow } from '@/hooks/utilities-infrastructure/useUpgradeFlow';
import { cn } from '@/lib/utils/cn';

export interface BusinessTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    users: number | 'unlimited';
    locations: number | 'unlimited';
    transactions: number | 'unlimited';
    storage: string;
  };
  popular?: boolean;
  recommended?: boolean;
}

interface UpgradeFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
  targetTier?: string;
  featureId?: string;
}

const BUSINESS_TIERS: BusinessTier[] = [
  {
    id: 'micro',
    name: 'micro',
    displayName: 'Micro',
    description: 'Perfect for solo entrepreneurs and small startups',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Up to 2 users',
      '1 location',
      'Basic POS functionality',
      'Simple inventory tracking',
      'Email support',
      '1GB storage',
    ],
    limits: {
      users: 2,
      locations: 1,
      transactions: 100,
      storage: '1GB',
    },
  },
  {
    id: 'small',
    name: 'small',
    displayName: 'Small Business',
    description: 'Ideal for growing small businesses',
    price: { monthly: 29, yearly: 290 },
    features: [
      'Up to 10 users',
      '3 locations',
      'Advanced POS features',
      'Inventory management',
      'Customer management',
      'Basic reporting',
      'Priority email support',
      '10GB storage',
    ],
    limits: {
      users: 10,
      locations: 3,
      transactions: 1000,
      storage: '10GB',
    },
    popular: true,
  },
  {
    id: 'medium',
    name: 'medium',
    displayName: 'Medium Business',
    description: 'For established businesses with multiple locations',
    price: { monthly: 79, yearly: 790 },
    features: [
      'Up to 50 users',
      '10 locations',
      'Multi-location management',
      'Advanced inventory',
      'CRM integration',
      'Advanced reporting & analytics',
      'API access',
      'Phone & email support',
      '100GB storage',
    ],
    limits: {
      users: 50,
      locations: 10,
      transactions: 10000,
      storage: '100GB',
    },
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: { monthly: 199, yearly: 1990 },
    features: [
      'Unlimited users',
      'Unlimited locations',
      'Enterprise-grade security',
      'Custom integrations',
      'Advanced analytics',
      'Dedicated account manager',
      'SLA guarantee',
      'Unlimited storage',
    ],
    limits: {
      users: 'unlimited',
      locations: 'unlimited',
      transactions: 'unlimited',
      storage: 'Unlimited',
    },
  },
];

export function UpgradeFlowModal({
  isOpen,
  onClose,
  currentTier = 'micro',
  targetTier,
  featureId,
}: UpgradeFlowModalProps) {
  const [step, setStep] = useState<'selection' | 'billing' | 'payment' | 'confirmation'>('selection');
  const [selectedTier, setSelectedTier] = useState(targetTier || 'small');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // useTierAccess hook is available for feature gating
  useTierAccess();
  const { 
    processUpgrade, 
    calculateUpgradePrice,
  } = useUpgradeFlow();

  const selectedTierData = BUSINESS_TIERS.find(tier => tier.id === selectedTier);
  const currentTierData = BUSINESS_TIERS.find(tier => tier.id === currentTier);

  const upgradePrice = calculateUpgradePrice(currentTier, selectedTier, billingCycle);

  useEffect(() => {
    if (targetTier) {
      setSelectedTier(targetTier);
    }
  }, [targetTier]);

  const handleUpgrade = async () => {
    if (!selectedTierData) return;

    setIsProcessing(true);
    try {
      const success = await processUpgrade({
        targetTier: selectedTier,
        billingCycle,
        paymentMethod,
        ...(featureId ? { featureId } : {}),
      });

      if (success) {
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'micro': return <Zap className="h-5 w-5" />;
      case 'small': return <Users className="h-5 w-5" />;
      case 'medium': return <BarChart3 className="h-5 w-5" />;
      case 'enterprise': return <Shield className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const isCurrentTier = (tierId: string) => tierId === currentTier;
  const isDowngrade = (tierId: string) => {
    const tierOrder = ['micro', 'small', 'medium', 'enterprise'];
    return tierOrder.indexOf(tierId) < tierOrder.indexOf(currentTier);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Upgrade Your Plan</span>
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Feature Context */}
              {featureId && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Upgrade Required
                        </p>
                        <p className="text-sm text-blue-700">
                          This feature requires a higher tier plan to access.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      billingCycle === 'monthly'
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors relative",
                      billingCycle === 'yearly'
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Yearly
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                      Save 17%
                    </Badge>
                  </button>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {BUSINESS_TIERS.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-200 relative",
                        selectedTier === tier.id
                          ? "ring-2 ring-blue-500 border-blue-500"
                          : "hover:border-gray-300",
                        isCurrentTier(tier.id) && "bg-gray-50",
                        tier.popular && "border-blue-200",
                        tier.recommended && "border-green-200"
                      )}
                      onClick={() => !isCurrentTier(tier.id) && setSelectedTier(tier.id)}
                    >
                      {tier.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                          Most Popular
                        </Badge>
                      )}
                      {tier.recommended && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                          Recommended
                        </Badge>
                      )}

                      <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-center mb-2">
                          {getTierIcon(tier.id)}
                        </div>
                        <CardTitle className="text-lg">{tier.displayName}</CardTitle>
                        <CardDescription className="text-sm">
                          {tier.description}
                        </CardDescription>
                        <div className="mt-4">
                          <div className="text-3xl font-bold">
                            ${billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}
                          </div>
                          <div className="text-sm text-gray-500">
                            {billingCycle === 'monthly' ? '/month' : '/year'}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {tier.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                          {tier.features.length > 4 && (
                            <div className="text-sm text-gray-500">
                              +{tier.features.length - 4} more features
                            </div>
                          )}
                        </div>

                        {isCurrentTier(tier.id) && (
                          <Badge className="w-full mt-4 justify-center bg-gray-500">
                            Current Plan
                          </Badge>
                        )}
                        {isDowngrade(tier.id) && !isCurrentTier(tier.id) && (
                          <Badge className="w-full mt-4 justify-center bg-orange-500">
                            Downgrade
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Upgrade Summary */}
              {selectedTierData && !isCurrentTier(selectedTier) && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">
                          Upgrade to {selectedTierData.displayName}
                        </p>
                        <p className="text-sm text-green-700">
                          {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-900">
                          ${upgradePrice}
                        </div>
                        <div className="text-sm text-green-700">
                          {billingCycle === 'monthly' ? '/month' : '/year'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('billing')}
                  disabled={isCurrentTier(selectedTier)}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold">Billing Information</h3>
                <p className="text-gray-600">Choose your payment method</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded" />
                        <span>PayPal</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('selection')}>
                  Back
                </Button>
                <Button onClick={() => setStep('payment')}>
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold">Confirm Your Upgrade</h3>
                <p className="text-gray-600">Review your order before proceeding</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Current Plan</span>
                      <span className="capitalize">{currentTierData?.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Plan</span>
                      <span className="capitalize">{selectedTierData?.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing Cycle</span>
                      <span className="capitalize">{billingCycle}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${upgradePrice} {billingCycle === 'monthly' ? '/month' : '/year'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('billing')}>
                  Back
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Processing...' : `Upgrade Now`}
                  {!isProcessing && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-900">
                  Upgrade Successful!
                </h3>
                <p className="text-gray-600 mt-2">
                  Welcome to {selectedTierData?.displayName}! Your new features are now available.
                </p>
              </div>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <p className="text-sm text-green-700">
                    You now have access to all {selectedTierData?.displayName} features.
                    Check your email for the receipt and billing details.
                  </p>
                </CardContent>
              </Card>

              <Button onClick={onClose} className="w-full">
                Get Started
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}