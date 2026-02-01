/**
 * Mobile Pricing Page Component
 * 
 * Optimized pricing page for mobile devices with swipe navigation,
 * vertical tier stacking, and mobile-friendly subscription flow.
 */
import React, { useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeScreen } from '@/components/layout';
import { Button, Card } from '@/components/core';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface PricingTier {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
  color: string;
}

interface MobilePricingPageProps {
  onSelectPlan: (tierId: string, billingCycle: 'monthly' | 'yearly') => void;
  recommendation?: {
    tier: string;
    reason: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    id: 'micro',
    name: 'Micro',
    price: 29,
    yearlyPrice: 290,
    description: 'Perfect for small businesses just getting started',
    features: [
      'Up to 5 employees',
      'Basic inventory management',
      'Simple POS system',
      'Basic reporting',
      'Email support'
    ],
    color: '#6B7280',
  },
  {
    id: 'small',
    name: 'Small',
    price: 79,
    yearlyPrice: 790,
    description: 'Great for growing businesses with more needs',
    features: [
      'Up to 25 employees',
      'Advanced inventory',
      'Multi-location support',
      'CRM features',
      'Financial reporting',
      'Priority support'
    ],
    popular: true,
    color: '#3B82F6',
  },
  {
    id: 'medium',
    name: 'Medium',
    price: 199,
    yearlyPrice: 1990,
    description: 'Ideal for established businesses with complex operations',
    features: [
      'Up to 100 employees',
      'Warehouse management',
      'B2B features',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Phone support'
    ],
    color: '#8B5CF6',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    yearlyPrice: 4990,
    description: 'For large organizations with enterprise needs',
    features: [
      'Unlimited employees',
      'Multi-tenant support',
      'Advanced security',
      'Custom workflows',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option'
    ],
    color: '#F59E0B',
  },
];

export function MobilePricingPage({ onSelectPlan, recommendation }: MobilePricingPageProps) {
  const [currentTierIndex, setCurrentTierIndex] = useState(0);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const gestureRef = useRef(null);

  const goToNextTier = useCallback(() => {
    if (currentTierIndex < pricingTiers.length - 1) {
      setCurrentTierIndex(currentTierIndex + 1);
    }
  }, [currentTierIndex]);

  const goToPrevTier = useCallback(() => {
    if (currentTierIndex > 0) {
      setCurrentTierIndex(currentTierIndex - 1);
    }
  }, [currentTierIndex]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      const shouldGoNext = event.translationX < -screenWidth * 0.3 && currentTierIndex < pricingTiers.length - 1;
      const shouldGoPrev = event.translationX > screenWidth * 0.3 && currentTierIndex > 0;

      if (shouldGoNext) {
        translateX.value = withSpring(-screenWidth);
        runOnJS(goToNextTier)();
      } else if (shouldGoPrev) {
        translateX.value = withSpring(screenWidth);
        runOnJS(goToPrevTier)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const currentTier = pricingTiers[currentTierIndex];
  const currentPrice = billingCycle === 'monthly' ? currentTier.price : currentTier.yearlyPrice;
  const savings = billingCycle === 'yearly' ? (currentTier.price * 12 - currentTier.yearlyPrice) : 0;

  return (
    <SafeScreen hasHeader={false} bgColor="bg-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text-primary text-2xl font-bold text-center mb-2">
          Choose Your Plan
        </Text>
        <Text className="text-text-secondary text-center mb-4">
          Select the perfect plan for your business needs
        </Text>

        {/* Billing Toggle */}
        <View className="flex-row bg-border rounded-lg p-1 mb-4">
          <Button
            variant={billingCycle === 'monthly' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setBillingCycle('monthly')}
            className="flex-1"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'primary' : 'ghost'}
            size="sm"
            onPress={() => setBillingCycle('yearly')}
            className="flex-1"
          >
            Yearly
            {billingCycle === 'yearly' && (
              <View className="ml-1 px-1 py-0.5 bg-green-500 rounded text-xs">
                <Text className="text-white text-xs">Save</Text>
              </View>
            )}
          </Button>
        </View>

        {/* Tier Indicators */}
        <View className="flex-row justify-center space-x-2 mb-4">
          {pricingTiers.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentTierIndex ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Recommendation Banner */}
      {recommendation && recommendation.tier === currentTier.id && (
        <View className="mx-4 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text className="text-green-800 font-medium ml-2 text-sm">
              Recommended for You
            </Text>
          </View>
          <Text className="text-green-700 text-xs">
            {recommendation.reason}
          </Text>
        </View>
      )}

      {/* Pricing Card with Swipe Gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]} className="px-4">
          <Card className="mb-4">
            {/* Popular Badge */}
            {currentTier.popular && (
              <View className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <View className="bg-primary px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">Most Popular</Text>
                </View>
              </View>
            )}

            <View className="items-center py-6">
              {/* Tier Icon */}
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${currentTier.color}20` }}
              >
                <Ionicons 
                  name={currentTier.id === 'enterprise' ? 'business' : 'storefront'} 
                  size={32} 
                  color={currentTier.color} 
                />
              </View>

              {/* Tier Name */}
              <Text className="text-text-primary text-2xl font-bold mb-2">
                {currentTier.name}
              </Text>

              {/* Price */}
              <View className="items-center mb-4">
                <View className="flex-row items-baseline">
                  <Text className="text-text-primary text-4xl font-bold">
                    ${currentPrice}
                  </Text>
                  <Text className="text-text-secondary text-base ml-1">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </Text>
                </View>
                {savings > 0 && (
                  <Text className="text-green-600 text-sm mt-1">
                    Save ${savings}/year with yearly billing
                  </Text>
                )}
              </View>

              {/* Description */}
              <Text className="text-text-secondary text-center mb-6">
                {currentTier.description}
              </Text>

              {/* Features */}
              <View className="w-full mb-6">
                <Text className="text-text-primary font-medium mb-3">
                  What's included:
                </Text>
                {currentTier.features.slice(0, 5).map((feature, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                    <Text className="text-text-secondary text-sm ml-2 flex-1">
                      {feature}
                    </Text>
                  </View>
                ))}
                {currentTier.features.length > 5 && (
                  <Text className="text-text-tertiary text-sm text-center mt-2">
                    +{currentTier.features.length - 5} more features
                  </Text>
                )}
              </View>

              {/* Action Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => onSelectPlan(currentTier.id, billingCycle)}
                style={{ backgroundColor: currentTier.color }}
              >
                Choose {currentTier.name} Plan
              </Button>

              {/* Trial Info */}
              <Text className="text-text-tertiary text-xs text-center mt-3">
                30-day free trial • Cancel anytime
              </Text>
            </View>
          </Card>
        </Animated.View>
      </GestureDetector>

      {/* Navigation Hints */}
      <View className="px-4 pb-4">
        <View className="flex-row justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              if (currentTierIndex > 0) {
                setCurrentTierIndex(prev => prev - 1);
                translateX.value = withSpring(0);
              }
            }}
            disabled={currentTierIndex === 0}
            className="opacity-60"
          >
            <Ionicons name="chevron-back" size={16} />
            Previous
          </Button>

          <Text className="text-text-tertiary text-xs">
            Swipe to compare plans
          </Text>

          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              if (currentTierIndex < pricingTiers.length - 1) {
                setCurrentTierIndex(prev => prev + 1);
                translateX.value = withSpring(0);
              }
            }}
            disabled={currentTierIndex === pricingTiers.length - 1}
            className="opacity-60"
          >
            Next
            <Ionicons name="chevron-forward" size={16} />
          </Button>
        </View>

        {/* Comparison Link */}
        <View className="items-center mt-4">
          <Button variant="ghost" size="sm">
            View detailed comparison
          </Button>
        </View>
      </View>
    </SafeScreen>
  );
}