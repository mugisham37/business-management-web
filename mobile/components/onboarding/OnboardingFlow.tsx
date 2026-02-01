/**
 * Mobile Onboarding Flow Component
 * 
 * Progressive onboarding with swipe gestures, mobile-friendly forms,
 * and optimized progress indicators for small screens.
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
import { Button, Card, Input } from '@/components/core';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    businessType: '',
    employeeCount: '',
    locationCount: '',
    expectedTransactions: '',
    expectedRevenue: '',
  });

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const gestureRef = useRef(null);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome to Enterprise BMS',
      description: 'Let\'s set up your business profile to get started',
      component: WelcomeStep,
    },
    {
      id: 2,
      title: 'Business Information',
      description: 'Tell us about your business',
      component: BusinessInfoStep,
    },
    {
      id: 3,
      title: 'Business Type',
      description: 'What type of business do you operate?',
      component: BusinessTypeStep,
    },
    {
      id: 4,
      title: 'Usage Expectations',
      description: 'Help us recommend the right plan',
      component: UsageStep,
    },
    {
      id: 5,
      title: 'Plan Recommendation',
      description: 'Based on your information, here\'s what we recommend',
      component: RecommendationStep,
    },
  ];

  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const goToPrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      const shouldGoNext = event.translationX < -screenWidth * 0.3 && currentStep < steps.length - 1;
      const shouldGoPrev = event.translationX > screenWidth * 0.3 && currentStep > 0;

      if (shouldGoNext) {
        translateX.value = withSpring(-screenWidth);
        runOnJS(goToNextStep)();
      } else if (shouldGoPrev) {
        translateX.value = withSpring(screenWidth);
        runOnJS(goToPrevStep)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      translateX.value = withSpring(0);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      translateX.value = withSpring(0);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeScreen hasHeader={false} bgColor="bg-background">
      {/* Header with Progress */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text-primary text-lg font-semibold">
            Step {currentStep + 1} of {steps.length}
          </Text>
          {onSkip && currentStep < steps.length - 1 && (
            <Button variant="ghost" size="sm" onPress={onSkip}>
              Skip
            </Button>
          )}
        </View>

        {/* Progress Bar */}
        <View className="w-full h-2 bg-border rounded-full mb-4">
          <View 
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </View>

        {/* Step Indicators */}
        <View className="flex-row justify-between mb-6">
          {steps.map((step, index) => (
            <View key={step.id} className="flex-1 items-center">
              <View 
                className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${
                  index <= currentStep 
                    ? 'bg-primary' 
                    : 'bg-border'
                }`}
              >
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : (
                  <Text className={`text-xs font-medium ${
                    index <= currentStep ? 'text-white' : 'text-text-tertiary'
                  }`}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text className={`text-xs text-center ${
                index <= currentStep ? 'text-text-primary' : 'text-text-tertiary'
              }`}>
                {step.title.split(' ')[0]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Content Area with Swipe Gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <ScrollView 
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Card className="mb-6">
              <View className="mb-4">
                <Text className="text-text-primary text-xl font-bold mb-2">
                  {steps[currentStep].title}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {steps[currentStep].description}
                </Text>
              </View>

              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
                isFirst={currentStep === 0}
                isLast={currentStep === steps.length - 1}
              />
            </Card>

            {/* Swipe Hint */}
            <View className="items-center mb-4">
              <Text className="text-text-tertiary text-xs">
                Swipe left/right to navigate • Tap buttons to continue
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>

      {/* Navigation Buttons */}
      <View className="px-4 pb-4 pt-2 border-t border-border">
        <View className="flex-row justify-between">
          <Button
            variant="secondary"
            size="md"
            onPress={prevStep}
            disabled={currentStep === 0}
            className="flex-1 mr-2"
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="md"
            onPress={nextStep}
            className="flex-1 ml-2"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
          </Button>
        </View>
      </View>
    </SafeScreen>
  );
}

// Step Components
function WelcomeStep({ onNext }: any) {
  return (
    <View className="items-center py-8">
      <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
        <Ionicons name="business-outline" size={40} color="#3B82F6" />
      </View>
      <Text className="text-text-primary text-lg font-semibold mb-4 text-center">
        Welcome to Enterprise BMS
      </Text>
      <Text className="text-text-secondary text-center mb-8">
        We'll help you set up your business profile and recommend the perfect plan for your needs.
      </Text>
      <Button variant="primary" size="lg" fullWidth onPress={onNext}>
        Get Started
      </Button>
    </View>
  );
}

function BusinessInfoStep({ formData, updateFormData, onNext }: any) {
  return (
    <View className="space-y-4">
      <Input
        label="Business Name"
        placeholder="Enter your business name"
        value={formData.businessName}
        onChangeText={(value) => updateFormData('businessName', value)}
        autoCapitalize="words"
      />
      <Input
        label="Industry"
        placeholder="e.g., Retail, Manufacturing, Services"
        value={formData.industry}
        onChangeText={(value) => updateFormData('industry', value)}
        autoCapitalize="words"
      />
    </View>
  );
}

function BusinessTypeStep({ formData, updateFormData }: any) {
  const businessTypes = [
    { id: 'free', label: 'Free/Hobby', description: 'Personal or hobby business' },
    { id: 'renewables', label: 'Renewables', description: 'Solar, wind, or green energy' },
    { id: 'retail', label: 'Retail', description: 'Direct to consumer sales' },
    { id: 'wholesale', label: 'Wholesale', description: 'Business to business sales' },
    { id: 'industry', label: 'Industry', description: 'Manufacturing or production' },
  ];

  return (
    <View className="space-y-3">
      {businessTypes.map((type) => (
        <Button
          key={type.id}
          variant={formData.businessType === type.id ? 'primary' : 'secondary'}
          size="lg"
          fullWidth
          onPress={() => updateFormData('businessType', type.id)}
          className="justify-start p-4"
        >
          <View className="flex-1">
            <Text className={`font-medium ${
              formData.businessType === type.id ? 'text-white' : 'text-text-primary'
            }`}>
              {type.label}
            </Text>
            <Text className={`text-sm ${
              formData.businessType === type.id ? 'text-white/80' : 'text-text-secondary'
            }`}>
              {type.description}
            </Text>
          </View>
        </Button>
      ))}
    </View>
  );
}

function UsageStep({ formData, updateFormData }: any) {
  return (
    <View className="space-y-4">
      <Input
        label="Number of Employees"
        placeholder="e.g., 5"
        value={formData.employeeCount}
        onChangeText={(value) => updateFormData('employeeCount', value)}
        keyboardType="numeric"
      />
      <Input
        label="Number of Locations"
        placeholder="e.g., 1"
        value={formData.locationCount}
        onChangeText={(value) => updateFormData('locationCount', value)}
        keyboardType="numeric"
      />
      <Input
        label="Expected Monthly Transactions"
        placeholder="e.g., 100"
        value={formData.expectedTransactions}
        onChangeText={(value) => updateFormData('expectedTransactions', value)}
        keyboardType="numeric"
      />
      <Input
        label="Expected Monthly Revenue"
        placeholder="e.g., $10,000"
        value={formData.expectedRevenue}
        onChangeText={(value) => updateFormData('expectedRevenue', value)}
        keyboardType="numeric"
      />
    </View>
  );
}

function RecommendationStep({ formData, onNext }: any) {
  // Simple recommendation logic based on form data
  const getRecommendation = () => {
    const employees = parseInt(formData.employeeCount) || 0;
    const locations = parseInt(formData.locationCount) || 0;
    const transactions = parseInt(formData.expectedTransactions) || 0;

    if (employees <= 5 && locations <= 1 && transactions <= 50) {
      return { tier: 'MICRO', name: 'Micro Plan', price: '$29/month' };
    } else if (employees <= 25 && locations <= 3 && transactions <= 500) {
      return { tier: 'SMALL', name: 'Small Plan', price: '$79/month' };
    } else if (employees <= 100 && locations <= 10 && transactions <= 2000) {
      return { tier: 'MEDIUM', name: 'Medium Plan', price: '$199/month' };
    } else {
      return { tier: 'ENTERPRISE', name: 'Enterprise Plan', price: '$499/month' };
    }
  };

  const recommendation = getRecommendation();

  return (
    <View className="items-center py-4">
      <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
        <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
      </View>
      <Text className="text-text-primary text-lg font-semibold mb-2 text-center">
        We recommend the {recommendation.name}
      </Text>
      <Text className="text-primary text-xl font-bold mb-4">
        {recommendation.price}
      </Text>
      <Text className="text-text-secondary text-center mb-6">
        Based on your business profile, this plan provides all the features you need to get started.
      </Text>
      <Button variant="primary" size="lg" fullWidth onPress={onNext}>
        Start Free Trial
      </Button>
    </View>
  );
}