'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    Star, 
    Zap, 
    Crown, 
    Building, 
    Sparkles, 
    TrendingUp, 
    AlertCircle,
    Info,
    ArrowRight,
    X
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { OnboardingData, BusinessTier, PlanFeatures } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';

interface PlanSelectionStepProps {
    data: OnboardingData;
    plans: PlanFeatures[];
    recommendedPlan: BusinessTier | null;
    onChange: (data: Partial<OnboardingData>) => void;
    errors?: Record<string, string>;
    hasAttemptedSubmit?: boolean;
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

// Mock AI recommendation reasoning based on business data
const getRecommendationReasoning = (data: OnboardingData, recommendedTier: BusinessTier | null) => {
    if (!recommendedTier) return [];
    
    const reasons = [];
    
    if (data.expectedEmployees && data.expectedEmployees > 50) {
        reasons.push(`Your team size of ${data.expectedEmployees} employees suggests you need advanced collaboration features`);
    }
    
    if (data.expectedLocations && data.expectedLocations > 5) {
        reasons.push(`Managing ${data.expectedLocations} locations requires multi-location inventory tracking`);
    }
    
    if (data.expectedMonthlyTransactions && data.expectedMonthlyTransactions > 10000) {
        reasons.push(`High transaction volume (${data.expectedMonthlyTransactions.toLocaleString()}/month) needs robust processing capabilities`);
    }
    
    if (data.expectedMonthlyRevenue && data.expectedMonthlyRevenue > 100000) {
        reasons.push(`Revenue of $${(data.expectedMonthlyRevenue / 1000).toFixed(0)}K/month indicates need for advanced reporting and analytics`);
    }
    
    if (data.businessType === 'wholesale') {
        reasons.push('Wholesale businesses benefit from B2B features and bulk pricing tools');
    }
    
    if (data.businessType === 'industry') {
        reasons.push('Manufacturing operations require production planning and quality control features');
    }
    
    return reasons.length > 0 ? reasons : ['Based on your business profile, this plan offers the best value for your needs'];
};

export function PlanSelectionStep({
    data,
    plans,
    recommendedPlan,
    onChange,
    errors = {},
    hasAttemptedSubmit = false,
}: PlanSelectionStepProps) {
    const [isAnnual, setIsAnnual] = useState(true);
    const [, setShowComparison] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<BusinessTier | null>(null);
    
    const selectedPlan = data.selectedPlan || recommendedPlan;
    const recommendationReasons = getRecommendationReasoning(data, recommendedPlan);

    // Map plans to tiers
    const mappedPlans = plans.map((plan) => ({
        ...plan,
        tier: PLAN_TIER_MAP[plan.name] || BusinessTier.MICRO,
    }));

    const handlePlanSelection = (tier: BusinessTier) => {
        if (tier !== recommendedPlan && recommendedPlan) {
            setPendingSelection(tier);
            setShowConfirmation(true);
        } else {
            onChange({ selectedPlan: tier });
        }
    };

    const confirmPlanSelection = () => {
        if (pendingSelection) {
            onChange({ selectedPlan: pendingSelection });
            setPendingSelection(null);
            setShowConfirmation(false);
        }
    };

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
            {/* AI Recommendation Banner */}
            {recommendedPlan && (
                <motion.div 
                    className="bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800"
                    variants={itemVariants}
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                AI Recommendation
                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                                    Powered by your business data
                                </span>
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Based on your business profile, we recommend the{' '}
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {mappedPlans.find(p => p.tier === recommendedPlan)?.name}
                                </span>{' '}
                                plan for optimal value and features.
                            </p>
                            <div className="space-y-2">
                                {recommendationReasons.map((reason, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <TrendingUp className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                        {reason}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Billing Toggle */}
            <motion.div 
                className="flex items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                variants={itemVariants}
            >
                <span
                    className={cn(
                        'text-sm font-medium transition-colors',
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
                        'text-sm font-medium transition-colors',
                        isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    )}
                >
                    Annual
                </span>
                {isAnnual && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full"
                    >
                        Save 20%
                    </motion.span>
                )}
            </motion.div>

            {/* Plans Grid */}
            <motion.div className="grid gap-4 md:grid-cols-2" variants={containerVariants}>
                {mappedPlans.map((plan, index) => {
                    const Icon = PLAN_ICONS[plan.tier] || Zap;
                    const isSelected = selectedPlan === plan.tier;
                    const isRecommended = recommendedPlan === plan.tier;
                    const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;

                    return (
                        <motion.button
                            key={plan.tier}
                            type="button"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePlanSelection(plan.tier)}
                            className={cn(
                                'relative p-6 rounded-xl border-2 text-left transition-all duration-200',
                                'hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50',
                                isSelected
                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-800/50'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                                errors.selectedPlan && hasAttemptedSubmit && !selectedPlan && 
                                    'border-red-300 bg-red-50 dark:bg-red-950/50'
                            )}
                        >
                            {/* Recommended Badge */}
            {isRecommended && (
                                <motion.div 
                                    initial={{ scale: 0, y: 10 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg"
                                >
                                    ✨ Recommended
                                </motion.div>
                            )}

                            {/* Plan Header */}
                            <div className="flex items-start justify-between mb-4">
                                <motion.div
                                    className={cn(
                                        'w-12 h-12 rounded-lg flex items-center justify-center bg-linear-to-br shadow-lg',
                                        PLAN_COLORS[plan.tier]
                                    )}
                                    whileHover={{ rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Icon className="w-6 h-6 text-white" />
                                </motion.div>
                                {isSelected && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                        className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Plan Name & Price */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {price === 0 ? 'Free' : `$${price}`}
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
                            <ul className="space-y-2 mb-4">
                                {plan.features.slice(0, 4).map((feature, featureIndex) => (
                                    <motion.li
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                                    >
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        {feature}
                                    </motion.li>
                                ))}
                                {plan.features.length > 4 && (
                                    <li className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                        +{plan.features.length - 4} more features
                                    </li>
                                )}
                            </ul>

                            {/* Limits */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
            </motion.div>

            {/* Compare Plans Button */}
            <motion.div className="text-center" variants={itemVariants}>
                <Button
                    variant="outline"
                    onClick={() => setShowComparison(true)}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                >
                    <Info className="w-4 h-4 mr-2" />
                    Compare All Features
                </Button>
            </motion.div>

            {/* Error Display */}
            {errors.selectedPlan && hasAttemptedSubmit && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm justify-center"
                >
                    <AlertCircle className="w-4 h-4" />
                    {errors.selectedPlan}
                </motion.div>
            )}

            {/* Plan Confirmation Modal */}
            <AnimatePresence>
                {showConfirmation && pendingSelection && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmation(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Confirm Plan Selection
                                </h3>
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    You&apos;re selecting a different plan than our AI recommendation. 
                                    Are you sure this is the right choice for your business?
                                </p>
                                
                                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                                Consider our recommendation
                                            </p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                The {mappedPlans.find(p => p.tier === recommendedPlan)?.name} plan 
                                                is optimized for your business size and expected usage.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmPlanSelection}
                                    className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                >
                                    Confirm Selection
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default PlanSelectionStep;
