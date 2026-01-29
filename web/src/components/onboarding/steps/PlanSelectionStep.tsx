'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Building } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OnboardingData, BusinessTier, PlanFeatures } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';

interface PlanSelectionStepProps {
    data: OnboardingData;
    plans: PlanFeatures[];
    recommendedPlan: BusinessTier | null;
    onChange: (data: Partial<OnboardingData>) => void;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
    micro: Zap,
    small: Star,
    medium: Crown,
    enterprise: Building,
};

const PLAN_COLORS: Record<string, string> = {
    micro: 'from-gray-500 to-gray-600',
    small: 'from-blue-500 to-indigo-600',
    medium: 'from-purple-500 to-violet-600',
    enterprise: 'from-orange-500 to-red-600',
};

const PLAN_TIER_MAP: Record<string, BusinessTier> = {
    'Free': BusinessTier.MICRO,
    'Growth': BusinessTier.SMALL,
    'Business': BusinessTier.MEDIUM,
    'Industry': BusinessTier.ENTERPRISE,
};

export function PlanSelectionStep({
    data,
    plans,
    recommendedPlan,
    onChange,
}: PlanSelectionStepProps) {
    const [isAnnual, setIsAnnual] = useState(true);
    const selectedPlan = data.selectedPlan || recommendedPlan;

    // Map plans to tiers
    const mappedPlans = plans.map((plan) => ({
        ...plan,
        tier: PLAN_TIER_MAP[plan.name] || BusinessTier.MICRO,
    }));

    return (
        <div className="space-y-6">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span
                    className={cn(
                        'text-sm font-medium',
                        !isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    )}
                >
                    Monthly
                </span>
                <Switch
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    className="data-[state=checked]:bg-indigo-600"
                />
                <span
                    className={cn(
                        'text-sm font-medium',
                        isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    )}
                >
                    Annual
                </span>
                {isAnnual && (
                    <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full">
                        Save 20%
                    </span>
                )}
            </div>

            {/* Plans Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {mappedPlans.map((plan, index) => {
                    const Icon = PLAN_ICONS[plan.tier] || Zap;
                    const isSelected = selectedPlan === plan.tier;
                    const isRecommended = recommendedPlan === plan.tier;
                    const price = isAnnual ? plan.price.annually : plan.price.monthly;

                    return (
                        <motion.button
                            key={plan.tier}
                            type="button"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onChange({ selectedPlan: plan.tier })}
                            className={cn(
                                'relative p-6 rounded-xl border-2 text-left transition-all',
                                isSelected
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            )}
                        >
                            {/* Recommended Badge */}
                            {isRecommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full">
                                    Recommended
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={cn(
                                        'w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br',
                                        PLAN_COLORS[plan.tier]
                                    )}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Plan Name & Price */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${price === 0 ? 'Free' : price}
                                </span>
                                {price > 0 && (
                                    <span className="text-sm text-gray-500">
                                        /{isAnnual ? 'year' : 'month'}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {plan.description}
                            </p>

                            {/* Key Features */}
                            <ul className="space-y-2">
                                {plan.features.slice(0, 4).map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    >
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                                {plan.features.length > 4 && (
                                    <li className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                        +{plan.features.length - 4} more features
                                    </li>
                                )}
                            </ul>

                            {/* Limits */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {plan.limits.employees === 999999 ? '∞' : plan.limits.employees}
                                        </div>
                                        <div className="text-gray-500">Employees</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {plan.limits.locations === 999999 ? '∞' : plan.limits.locations}
                                        </div>
                                        <div className="text-gray-500">Locations</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {plan.limits.transactions === 999999 ? '∞' : `${plan.limits.transactions / 1000}K`}
                                        </div>
                                        <div className="text-gray-500">Trans/mo</div>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

export default PlanSelectionStep;
