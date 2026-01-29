'use client';

import { motion } from 'framer-motion';
import { Leaf, ShoppingBag, Warehouse, Factory, Sparkles, Check } from 'lucide-react';
import { OnboardingData, BusinessType } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';

interface BusinessTypeStepProps {
    data: OnboardingData;
    onChange: (data: Partial<OnboardingData>) => void;
}

const BUSINESS_TYPES = [
    {
        value: BusinessType.FREE,
        label: 'Free / Personal',
        description: 'Just getting started or personal use',
        icon: Sparkles,
        color: 'from-gray-500 to-gray-600',
    },
    {
        value: BusinessType.RENEWABLES,
        label: 'Renewables & Eco',
        description: 'Sustainable and eco-friendly products',
        icon: Leaf,
        color: 'from-green-500 to-emerald-600',
    },
    {
        value: BusinessType.RETAIL,
        label: 'Retail',
        description: 'Direct-to-consumer retail sales',
        icon: ShoppingBag,
        color: 'from-blue-500 to-indigo-600',
    },
    {
        value: BusinessType.WHOLESALE,
        label: 'Wholesale',
        description: 'B2B distribution and bulk sales',
        icon: Warehouse,
        color: 'from-purple-500 to-violet-600',
    },
    {
        value: BusinessType.INDUSTRY,
        label: 'Industry',
        description: 'Manufacturing and industrial operations',
        icon: Factory,
        color: 'from-orange-500 to-red-600',
    },
];

export function BusinessTypeStep({ data, onChange }: BusinessTypeStepProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Select the category that best describes your business. This helps us recommend the right
                features for you.
            </p>

            <div className="grid gap-4">
                {BUSINESS_TYPES.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = data.businessType === type.value;

                    return (
                        <motion.button
                            key={type.value}
                            type="button"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onChange({ businessType: type.value })}
                            className={cn(
                                'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                                isSelected
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br',
                                    type.color
                                )}
                            >
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {type.label}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {type.description}
                                </div>
                            </div>

                            <div
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                                    isSelected
                                        ? 'border-indigo-500 bg-indigo-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                )}
                            >
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

export default BusinessTypeStep;
