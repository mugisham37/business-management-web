'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding, OnboardingStep, BusinessType, BusinessTier } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';
import { BusinessProfileStep } from './steps/BusinessProfileStep';
import { BusinessTypeStep } from './steps/BusinessTypeStep';
import { UsageExpectationsStep } from './steps/UsageExpectationsStep';
import { PlanSelectionStep } from './steps/PlanSelectionStep';
import { WelcomeStep } from './steps/WelcomeStep';

/**
 * Multi-step onboarding flow component
 */
export function OnboardingFlow() {
    const router = useRouter();
    const {
        currentStep,
        currentStepIndex,
        currentStepMeta,
        progress,
        isLoading,
        isFirstStep,
        isLastStep,
        totalSteps,
        updateStep,
        complete,
        onboardingData,
        recommendedPlan,
        plans,
    } = useOnboarding();

    const [stepData, setStepData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle step data updates
    const handleStepDataChange = useCallback((data: Record<string, any>) => {
        setStepData((prev) => ({ ...prev, ...data }));
    }, []);

    // Handle next step
    const handleNext = useCallback(async () => {
        setIsSubmitting(true);
        try {
            await updateStep(currentStep, stepData);
            setStepData({});
        } catch (error) {
            console.error('Failed to update step:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentStep, stepData, updateStep]);

    // Handle completing onboarding
    const handleComplete = useCallback(async () => {
        setIsSubmitting(true);
        try {
            await complete(stepData.selectedPlan as BusinessTier | undefined);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [complete, stepData.selectedPlan, router]);

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case OnboardingStep.BUSINESS_PROFILE:
                return (
                    <BusinessProfileStep
                        data={onboardingData}
                        onChange={handleStepDataChange}
                    />
                );
            case OnboardingStep.BUSINESS_TYPE:
                return (
                    <BusinessTypeStep
                        data={onboardingData}
                        onChange={handleStepDataChange}
                    />
                );
            case OnboardingStep.USAGE_EXPECTATIONS:
                return (
                    <UsageExpectationsStep
                        data={onboardingData}
                        onChange={handleStepDataChange}
                    />
                );
            case OnboardingStep.PLAN_SELECTION:
                return (
                    <PlanSelectionStep
                        data={onboardingData}
                        plans={plans}
                        recommendedPlan={recommendedPlan}
                        onChange={handleStepDataChange}
                    />
                );
            case OnboardingStep.WELCOME:
                return (
                    <WelcomeStep
                        data={onboardingData}
                        selectedPlan={stepData.selectedPlan || recommendedPlan}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                BizManager
                            </span>
                        </div>

                        {/* Progress Indicator */}
                        <div className="hidden sm:flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Step {currentStepIndex + 1} of {totalSteps}
                            </span>
                            <div className="w-32">
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Step Header */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {currentStepMeta.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {currentStepMeta.description}
                        </p>
                    </motion.div>

                    {/* Step Indicators */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'w-3 h-3 rounded-full transition-colors',
                                        index < currentStepIndex
                                            ? 'bg-green-500'
                                            : index === currentStepIndex
                                                ? 'bg-indigo-600'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border shadow-lg p-8"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                </div>
                            ) : (
                                renderStepContent()
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className={cn(!isFirstStep && 'invisible')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        {isLastStep ? (
                            <Button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Finishing...
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <Check className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default OnboardingFlow;
