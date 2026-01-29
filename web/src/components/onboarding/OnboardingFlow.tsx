'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
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
 * Form validation errors
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * Multi-step onboarding flow component with enhanced animations and validation
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
        error,
    } = useOnboarding();

    const [stepData, setStepData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // Reset validation errors when step changes
    useEffect(() => {
        setValidationErrors({});
        setHasAttemptedSubmit(false);
    }, [currentStep]);

    // Handle step data updates
    const handleStepDataChange = useCallback((data: Record<string, any>) => {
        setStepData((prev) => ({ ...prev, ...data }));
        
        // Clear validation errors for updated fields
        if (hasAttemptedSubmit) {
            const updatedErrors = { ...validationErrors };
            Object.keys(data).forEach(key => {
                if (updatedErrors[key]) {
                    delete updatedErrors[key];
                }
            });
            setValidationErrors(updatedErrors);
        }
    }, [hasAttemptedSubmit, validationErrors]);

    // Validate current step data
    const validateCurrentStep = useCallback(() => {
        const errors: ValidationErrors = {};
        const currentData = { ...onboardingData, ...stepData };

        switch (currentStep) {
            case OnboardingStep.BUSINESS_PROFILE:
                if (!currentData.businessName?.trim()) {
                    errors.businessName = 'Business name is required';
                }
                if (!currentData.businessIndustry) {
                    errors.businessIndustry = 'Please select your industry';
                }
                if (!currentData.businessSize) {
                    errors.businessSize = 'Please select your team size';
                }
                break;

            case OnboardingStep.BUSINESS_TYPE:
                if (!currentData.businessType) {
                    errors.businessType = 'Please select your business type';
                }
                break;

            case OnboardingStep.USAGE_EXPECTATIONS:
                if (!currentData.expectedEmployees || currentData.expectedEmployees < 1) {
                    errors.expectedEmployees = 'Please enter expected number of employees';
                }
                if (!currentData.expectedLocations || currentData.expectedLocations < 1) {
                    errors.expectedLocations = 'Please enter expected number of locations';
                }
                if (!currentData.expectedMonthlyTransactions || currentData.expectedMonthlyTransactions < 0) {
                    errors.expectedMonthlyTransactions = 'Please enter expected monthly transactions';
                }
                if (!currentData.expectedMonthlyRevenue || currentData.expectedMonthlyRevenue < 0) {
                    errors.expectedMonthlyRevenue = 'Please enter expected monthly revenue';
                }
                break;

            case OnboardingStep.PLAN_SELECTION:
                if (!stepData.selectedPlan && !recommendedPlan) {
                    errors.selectedPlan = 'Please select a plan';
                }
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [currentStep, onboardingData, stepData, recommendedPlan]);

    // Handle next step with validation
    const handleNext = useCallback(async () => {
        setHasAttemptedSubmit(true);
        
        if (!validateCurrentStep()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await updateStep(currentStep, stepData);
            setStepData({});
            setHasAttemptedSubmit(false);
        } catch (error) {
            console.error('Failed to update step:', error);
            // Handle specific error cases
            if (error instanceof Error) {
                setValidationErrors({ general: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [currentStep, stepData, updateStep, validateCurrentStep]);

    // Handle completing onboarding
    const handleComplete = useCallback(async () => {
        setHasAttemptedSubmit(true);
        
        if (!validateCurrentStep()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await complete(stepData.selectedPlan as BusinessTier | undefined);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            if (error instanceof Error) {
                setValidationErrors({ general: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [complete, stepData.selectedPlan, router, validateCurrentStep]);

    // Handle going back
    const handleBack = useCallback(() => {
        // For now, just go back in browser history
        // In a real implementation, you might want to handle step navigation differently
        router.back();
    }, [router]);

    // Render current step content
    const renderStepContent = () => {
        const commonProps = {
            data: { ...onboardingData, ...stepData },
            onChange: handleStepDataChange,
            errors: validationErrors,
            hasAttemptedSubmit,
        };

        switch (currentStep) {
            case OnboardingStep.BUSINESS_PROFILE:
                return (
                    <BusinessProfileStep
                        {...commonProps}
                    />
                );
            case OnboardingStep.BUSINESS_TYPE:
                return (
                    <BusinessTypeStep
                        {...commonProps}
                    />
                );
            case OnboardingStep.USAGE_EXPECTATIONS:
                return (
                    <UsageExpectationsStep
                        {...commonProps}
                    />
                );
            case OnboardingStep.PLAN_SELECTION:
                return (
                    <PlanSelectionStep
                        {...commonProps}
                        plans={plans}
                        recommendedPlan={recommendedPlan}
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
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                    animate={{ 
                                        scale: index === currentStepIndex ? 1.2 : 1,
                                        opacity: 1 
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={cn(
                                        'w-3 h-3 rounded-full transition-all duration-300',
                                        index < currentStepIndex
                                            ? 'bg-green-500 shadow-lg shadow-green-200'
                                            : index === currentStepIndex
                                                ? 'bg-indigo-600 shadow-lg shadow-indigo-200'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error Display */}
                    {validationErrors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{validationErrors.general}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ 
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border shadow-lg p-8"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Loader2 className="w-8 h-8 text-indigo-600" />
                                    </motion.div>
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
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className={cn(
                                'transition-all duration-200',
                                isFirstStep && 'invisible'
                            )}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        {isLastStep ? (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Loader2 className="w-4 h-4 mr-2" />
                                            </motion.div>
                                            Finishing...
                                        </>
                                    ) : (
                                        <>
                                            Get Started
                                            <Check className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Loader2 className="w-4 h-4 mr-2" />
                                            </motion.div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default OnboardingFlow;
