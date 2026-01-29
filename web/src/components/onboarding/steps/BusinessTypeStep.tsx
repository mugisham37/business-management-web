'use client';

import { motion } from 'framer-motion';
import { Leaf, ShoppingBag, Warehouse, Factory, Sparkles, Check, AlertCircle } from 'lucide-react';
import { OnboardingData, BusinessType } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';

interface BusinessTypeStepProps {
    data: OnboardingData;
    onChange: (data: Partial<OnboardingData>) => void;
    errors?: Record<string, string>;
    hasAttemptedSubmit?: boolean;
}

const BUSINESS_TYPES = [
    {
        value: BusinessType.FREE,
        label: 'Free / Personal',
        description: 'Just getting started or personal use',
        icon: Sparkles,
        color: 'from-gray-500 to-gray-600',
        features: ['Basic inventory', 'Simple reporting', 'Single location'],
    },
    {
        value: BusinessType.RENEWABLES,
        label: 'Renewables & Eco',
        description: 'Sustainable and eco-friendly products',
        icon: Leaf,
        color: 'from-green-500 to-emerald-600',
        features: ['Sustainability tracking', 'Carbon footprint', 'Eco certifications'],
    },
    {
        value: BusinessType.RETAIL,
        label: 'Retail',
        description: 'Direct-to-consumer retail sales',
        icon: ShoppingBag,
        color: 'from-blue-500 to-indigo-600',
        features: ['POS system', 'Customer management', 'Multi-channel sales'],
    },
    {
        value: BusinessType.WHOLESALE,
        label: 'Wholesale',
        description: 'B2B distribution and bulk sales',
        icon: Warehouse,
        color: 'from-purple-500 to-violet-600',
        features: ['Bulk pricing', 'B2B portal', 'Advanced inventory'],
    },
    {
        value: BusinessType.INDUSTRY,
        label: 'Industry',
        description: 'Manufacturing and industrial operations',
        icon: Factory,
        color: 'from-orange-500 to-red-600',
        features: ['Production planning', 'Quality control', 'Supply chain'],
    },
];

export function BusinessTypeStep({ 
    data, 
    onChange, 
    errors = {}, 
    hasAttemptedSubmit = false 
}: BusinessTypeStepProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.p 
                className="text-sm text-gray-600 dark:text-gray-400 text-center"
                variants={itemVariants}
            >
                Select the category that best describes your business. This helps us recommend the right
                features and pricing tier for you.
            </motion.p>

            <motion.div className="grid gap-4" variants={containerVariants}>
                {BUSINESS_TYPES.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = data.businessType === type.value;

                    return (
                        <motion.button
                            key={type.value}
                            type="button"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onChange({ businessType: type.value })}
                            className={cn(
                                'flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left group',
                                'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50',
                                isSelected
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-800/50'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                                errors.businessType && hasAttemptedSubmit && !data.businessType && 
                                    'border-red-300 bg-red-50 dark:bg-red-950/50'
                            )}
                        >
                            <motion.div
                                className={cn(
                                    'w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                                    type.color
                                )}
                                whileHover={{ rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Icon className="w-7 h-7 text-white" />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {type.label}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {type.description}
                                </div>
                                
                                {/* Features */}
                                <div className="flex flex-wrap gap-1">
                                    {type.features.map((feature, featureIndex) => (
                                        <span
                                            key={featureIndex}
                                            className={cn(
                                                'text-xs px-2 py-1 rounded-full transition-colors',
                                                isSelected
                                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            )}
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1',
                                    isSelected
                                        ? 'border-indigo-500 bg-indigo-500'
                                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                                )}
                                animate={{ scale: isSelected ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.button>
                    );
                })}
            </motion.div>

            {errors.businessType && hasAttemptedSubmit && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm justify-center"
                >
                    <AlertCircle className="w-4 h-4" />
                    {errors.businessType}
                </motion.div>
            )}
        </motion.div>
    );
}

export default BusinessTypeStep;
