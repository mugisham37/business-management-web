'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Users, MapPin, ShoppingCart, DollarSign, HelpCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';

interface UsageExpectationsStepProps {
    data: OnboardingData;
    onChange: (data: Partial<OnboardingData>) => void;
    errors?: Record<string, string>;
    hasAttemptedSubmit?: boolean;
}

const TRANSACTION_OPTIONS = [
    { value: 100, label: '< 100', description: 'Small scale operations' },
    { value: 1000, label: '100 - 1,000', description: 'Growing business' },
    { value: 5000, label: '1,000 - 5,000', description: 'Established business' },
    { value: 20000, label: '5,000 - 20,000', description: 'High volume business' },
    { value: 50000, label: '20,000+', description: 'Enterprise scale' },
];

const REVENUE_OPTIONS = [
    { value: 5000, label: '< $5,000', description: 'Startup phase' },
    { value: 25000, label: '$5K - $25K', description: 'Growing revenue' },
    { value: 100000, label: '$25K - $100K', description: 'Established revenue' },
    { value: 500000, label: '$100K - $500K', description: 'High revenue' },
    { value: 1000000, label: '$500K+', description: 'Enterprise revenue' },
];

export function UsageExpectationsStep({ 
    data, 
    onChange, 
    errors = {}, 
    hasAttemptedSubmit = false 
}: UsageExpectationsStepProps) {
    const [showHelp, setShowHelp] = useState<string | null>(null);

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

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    return (
        <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div 
                className="text-center space-y-2"
                variants={itemVariants}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help us understand your expected usage so we can recommend the best plan for your needs.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>Don't worry, you can always upgrade or downgrade later</span>
                </div>
            </motion.div>

            {/* Expected Employees */}
            <motion.div className="space-y-4" variants={itemVariants}>
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        Expected Employees
                        <span className="text-red-500">*</span>
                        <button
                            type="button"
                            onClick={() => setShowHelp(showHelp === 'employees' ? null : 'employees')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                    </Label>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded">
                        {formatNumber(data.expectedEmployees || 1)}
                    </span>
                </div>

                {showHelp === 'employees' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                        Include all team members who will use the system: full-time, part-time, and contractors.
                    </motion.div>
                )}

                <Slider
                    value={[data.expectedEmployees || 1]}
                    onValueChange={([value]) => onChange({ expectedEmployees: value || 1 })}
                    min={1}
                    max={500}
                    step={1}
                    className={cn(
                        "w-full",
                        errors.expectedEmployees && hasAttemptedSubmit && "opacity-50"
                    )}
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>50</span>
                    <span>200</span>
                    <span>500+</span>
                </div>

                {errors.expectedEmployees && hasAttemptedSubmit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-red-600 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors.expectedEmployees}
                    </motion.div>
                )}
            </motion.div>

            {/* Expected Locations */}
            <motion.div className="space-y-4" variants={itemVariants}>
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                        Number of Locations
                        <span className="text-red-500">*</span>
                        <button
                            type="button"
                            onClick={() => setShowHelp(showHelp === 'locations' ? null : 'locations')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                    </Label>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded">
                        {data.expectedLocations || 1}
                    </span>
                </div>

                {showHelp === 'locations' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                        Count physical locations, warehouses, stores, or offices that need inventory management.
                    </motion.div>
                )}

                <Slider
                    value={[data.expectedLocations || 1]}
                    onValueChange={([value]) => onChange({ expectedLocations: value || 1 })}
                    min={1}
                    max={100}
                    step={1}
                    className={cn(
                        "w-full",
                        errors.expectedLocations && hasAttemptedSubmit && "opacity-50"
                    )}
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>10</span>
                    <span>50</span>
                    <span>100+</span>
                </div>

                {errors.expectedLocations && hasAttemptedSubmit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-red-600 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors.expectedLocations}
                    </motion.div>
                )}
            </motion.div>

            {/* Monthly Transactions */}
            <motion.div className="space-y-4" variants={itemVariants}>
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-indigo-600" />
                        Expected Monthly Transactions
                        <span className="text-red-500">*</span>
                        <button
                            type="button"
                            onClick={() => setShowHelp(showHelp === 'transactions' ? null : 'transactions')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                    </Label>
                </div>

                {showHelp === 'transactions' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                        Include all sales transactions: in-store, online, B2B orders, and inventory movements.
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRANSACTION_OPTIONS.map((option, index) => (
                        <motion.button
                            key={option.value}
                            type="button"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onChange({ expectedMonthlyTransactions: option.value })}
                            className={cn(
                                'p-4 rounded-lg border text-left transition-all duration-200',
                                'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
                                data.expectedMonthlyTransactions === option.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700',
                                errors.expectedMonthlyTransactions && hasAttemptedSubmit && !data.expectedMonthlyTransactions && 
                                    'border-red-300 bg-red-50 dark:bg-red-950'
                            )}
                        >
                            <div className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {option.description}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {errors.expectedMonthlyTransactions && hasAttemptedSubmit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-red-600 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors.expectedMonthlyTransactions}
                    </motion.div>
                )}
            </motion.div>

            {/* Monthly Revenue */}
            <motion.div className="space-y-4" variants={itemVariants}>
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-indigo-600" />
                        Expected Monthly Revenue
                        <span className="text-red-500">*</span>
                        <button
                            type="button"
                            onClick={() => setShowHelp(showHelp === 'revenue' ? null : 'revenue')}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                    </Label>
                </div>

                {showHelp === 'revenue' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                        Your gross monthly revenue from all sales channels. This helps us recommend the right pricing tier.
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {REVENUE_OPTIONS.map((option, index) => (
                        <motion.button
                            key={option.value}
                            type="button"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onChange({ expectedMonthlyRevenue: option.value })}
                            className={cn(
                                'p-4 rounded-lg border text-left transition-all duration-200',
                                'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
                                data.expectedMonthlyRevenue === option.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700',
                                errors.expectedMonthlyRevenue && hasAttemptedSubmit && !data.expectedMonthlyRevenue && 
                                    'border-red-300 bg-red-50 dark:bg-red-950'
                            )}
                        >
                            <div className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {option.description}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {errors.expectedMonthlyRevenue && hasAttemptedSubmit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-red-600 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors.expectedMonthlyRevenue}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default UsageExpectationsStep;
