'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Users, MapPin, ShoppingCart, DollarSign } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface UsageExpectationsStepProps {
    data: OnboardingData;
    onChange: (data: Partial<OnboardingData>) => void;
}

export function UsageExpectationsStep({ data, onChange }: UsageExpectationsStepProps) {
    return (
        <div className="space-y-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Help us understand your expected usage so we can recommend the best plan for your needs.
            </p>

            {/* Expected Employees */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Expected Employees
                    </Label>
                    <span className="text-sm font-semibold text-indigo-600">
                        {data.expectedEmployees || 1}
                    </span>
                </div>
                <Slider
                    value={[data.expectedEmployees || 1]}
                    onValueChange={([value]) => onChange({ expectedEmployees: value })}
                    min={1}
                    max={500}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>100</span>
                    <span>250</span>
                    <span>500+</span>
                </div>
            </div>

            {/* Expected Locations */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Number of Locations
                    </Label>
                    <span className="text-sm font-semibold text-indigo-600">
                        {data.expectedLocations || 1}
                    </span>
                </div>
                <Slider
                    value={[data.expectedLocations || 1]}
                    onValueChange={([value]) => onChange({ expectedLocations: value })}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                    <span>100+</span>
                </div>
            </div>

            {/* Monthly Transactions */}
            <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Expected Monthly Transactions
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 1000, label: '< 1,000' },
                        { value: 5000, label: '1,000 - 5,000' },
                        { value: 20000, label: '5,000 - 20,000' },
                        { value: 50000, label: '20,000+' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange({ expectedMonthlyTransactions: option.value })}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.expectedMonthlyTransactions === option.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Monthly Revenue */}
            <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Expected Monthly Revenue
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 10000, label: '< $10,000' },
                        { value: 50000, label: '$10K - $50K' },
                        { value: 100000, label: '$50K - $100K' },
                        { value: 500000, label: '$100K+' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange({ expectedMonthlyRevenue: option.value })}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.expectedMonthlyRevenue === option.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UsageExpectationsStep;
