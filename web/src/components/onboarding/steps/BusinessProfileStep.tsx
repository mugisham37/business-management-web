'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Building2, Globe, Users } from 'lucide-react';
import { OnboardingData } from '@/hooks/useOnboarding';

interface BusinessProfileStepProps {
    data: OnboardingData;
    onChange: (data: Partial<OnboardingData>) => void;
}

const INDUSTRIES = [
    'Retail',
    'Food & Beverage',
    'Healthcare',
    'Beauty & Wellness',
    'Automotive',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Recreation',
    'Professional Services',
    'Other',
];

const BUSINESS_SIZES = [
    { value: 'solo', label: 'Just me', description: 'Solo operation' },
    { value: 'small', label: '2-10 employees', description: 'Small team' },
    { value: 'medium', label: '11-50 employees', description: 'Growing business' },
    { value: 'large', label: '51-200 employees', description: 'Established business' },
    { value: 'enterprise', label: '200+ employees', description: 'Large enterprise' },
];

export function BusinessProfileStep({ data, onChange }: BusinessProfileStepProps) {
    return (
        <div className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">
                    Business Name
                </Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="businessName"
                        type="text"
                        defaultValue={data.businessName}
                        onChange={(e) => onChange({ businessName: e.target.value })}
                        placeholder="Enter your business name"
                        className="pl-10 h-12"
                    />
                </div>
            </div>

            {/* Industry */}
            <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">
                    Industry
                </Label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Select
                        defaultValue={data.businessIndustry}
                        onValueChange={(value) => onChange({ businessIndustry: value })}
                    >
                        <SelectTrigger className="h-12 pl-10">
                            <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                            {INDUSTRIES.map((industry) => (
                                <SelectItem key={industry} value={industry.toLowerCase()}>
                                    {industry}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Business Size */}
            <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Size
                </Label>
                <div className="grid gap-3">
                    {BUSINESS_SIZES.map((size) => (
                        <label
                            key={size.value}
                            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:border-indigo-300 ${data.businessSize === size.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <input
                                type="radio"
                                name="businessSize"
                                value={size.value}
                                checked={data.businessSize === size.value}
                                onChange={() => onChange({ businessSize: size.value as any })}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {size.label}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {size.description}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BusinessProfileStep;
