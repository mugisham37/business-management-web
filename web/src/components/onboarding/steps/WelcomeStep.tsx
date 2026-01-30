'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { OnboardingData, BusinessTier } from '@/hooks/useOnboarding';

interface WelcomeStepProps {
    data: OnboardingData;
    selectedPlan: BusinessTier | null;
}

const PLAN_NAMES: Record<BusinessTier, string> = {
    [BusinessTier.MICRO]: 'Free',
    [BusinessTier.SMALL]: 'Growth',
    [BusinessTier.MEDIUM]: 'Business',
    [BusinessTier.ENTERPRISE]: 'Industry',
};

const NEXT_STEPS = [
    {
        title: 'Explore your dashboard',
        description: 'Get familiar with your business management tools',
    },
    {
        title: 'Add your first product',
        description: 'Start building your inventory',
    },
    {
        title: 'Set up your point of sale',
        description: 'Configure registers and payment methods',
    },
    {
        title: 'Invite team members',
        description: 'Collaborate with your staff',
    },
];

export function WelcomeStep({ data, selectedPlan }: WelcomeStepProps) {
    const planName = selectedPlan ? PLAN_NAMES[selectedPlan] : 'Free';

    return (
        <div className="text-center space-y-8">
            {/* Success Animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center"
            >
                <Check className="w-12 h-12 text-white" />
            </motion.div>

            {/* Welcome Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
            >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome to BizManager!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Your account is ready with the{' '}
                    <span className="font-semibold text-indigo-600">{planName} Plan</span>.
                    {data.businessName && (
                        <>
                            {' '}
                            Let&apos;s get <span className="font-semibold">{data.businessName}</span>{' '}
                            up and running!
                        </>
                    )}
                </p>
            </motion.div>

            {/* Next Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
            >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Get Started
                </h3>
                <div className="grid gap-3 text-left">
                    {NEXT_STEPS.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {step.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {step.description}
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Celebration */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            >
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>You&apos;re all set to grow your business!</span>
                <Sparkles className="w-4 h-4 text-yellow-500" />
            </motion.div>
        </div>
    );
}

export default WelcomeStep;
