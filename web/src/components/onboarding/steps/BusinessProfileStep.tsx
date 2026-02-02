'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Globe, Users, Search, AlertCircle } from 'lucide-react';
import { OnboardingData, BusinessSize } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils/cn';

interface BusinessProfileStepProps {
    data: OnboardingData;
    onChange: (data: Partial<OnboardingData>) => void;
    errors?: Record<string, string>;
    hasAttemptedSubmit?: boolean;
}

const INDUSTRIES = [
    { value: 'retail', label: 'Retail', description: 'Physical and online stores' },
    { value: 'food-beverage', label: 'Food & Beverage', description: 'Restaurants, cafes, bars' },
    { value: 'healthcare', label: 'Healthcare', description: 'Medical, dental, wellness' },
    { value: 'beauty-wellness', label: 'Beauty & Wellness', description: 'Salons, spas, fitness' },
    { value: 'automotive', label: 'Automotive', description: 'Car sales, repair, parts' },
    { value: 'electronics', label: 'Electronics', description: 'Tech products and services' },
    { value: 'fashion', label: 'Fashion', description: 'Clothing, accessories, jewelry' },
    { value: 'home-garden', label: 'Home & Garden', description: 'Furniture, decor, landscaping' },
    { value: 'sports-recreation', label: 'Sports & Recreation', description: 'Sports equipment, activities' },
    { value: 'professional-services', label: 'Professional Services', description: 'Consulting, legal, accounting' },
    { value: 'manufacturing', label: 'Manufacturing', description: 'Production and assembly' },
    { value: 'construction', label: 'Construction', description: 'Building and contracting' },
    { value: 'education', label: 'Education', description: 'Schools, training, tutoring' },
    { value: 'real-estate', label: 'Real Estate', description: 'Property sales and management' },
    { value: 'transportation', label: 'Transportation', description: 'Logistics and delivery' },
    { value: 'other', label: 'Other', description: 'Not listed above' },
];

const BUSINESS_SIZES = [
    { 
        value: 'solo', 
        label: 'Just me', 
        description: 'Solo operation',
        employees: '1',
        icon: '👤'
    },
    { 
        value: 'small', 
        label: '2-10 employees', 
        description: 'Small team',
        employees: '2-10',
        icon: '👥'
    },
    { 
        value: 'medium', 
        label: '11-50 employees', 
        description: 'Growing business',
        employees: '11-50',
        icon: '🏢'
    },
    { 
        value: 'large', 
        label: '51-200 employees', 
        description: 'Established business',
        employees: '51-200',
        icon: '🏬'
    },
    { 
        value: 'enterprise', 
        label: '200+ employees', 
        description: 'Large enterprise',
        employees: '200+',
        icon: '🏭'
    },
];

export function BusinessProfileStep({ 
    data, 
    onChange, 
    errors = {}, 
    hasAttemptedSubmit = false 
}: BusinessProfileStepProps) {
    const [industrySearch, setIndustrySearch] = useState('');

    // Filter industries based on search
    const filteredIndustries = useMemo(() => {
        if (!industrySearch.trim()) return INDUSTRIES;
        
        const search = industrySearch.toLowerCase();
        return INDUSTRIES.filter(industry => 
            industry.label.toLowerCase().includes(search) ||
            industry.description.toLowerCase().includes(search)
        );
    }, [industrySearch]);

    // Animation variants
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
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Business Name */}
            <motion.div className="space-y-3" variants={itemVariants}>
                <Label htmlFor="businessName" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Business Name
                    <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="businessName"
                        type="text"
                        value={data.businessName || ''}
                        onChange={(e) => onChange({ businessName: e.target.value })}
                        placeholder="Enter your business name"
                        className={cn(
                            "h-12 text-base transition-all duration-200",
                            "focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500",
                            errors.businessName && hasAttemptedSubmit && "border-red-500 focus:border-red-500 focus:ring-red-200"
                        )}
                    />
                    {errors.businessName && hasAttemptedSubmit && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1 mt-2 text-red-600 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {errors.businessName}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Industry Selection */}
            <motion.div className="space-y-3" variants={itemVariants}>
                <Label htmlFor="industry" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Industry
                    <span className="text-red-500">*</span>
                </Label>
                
                {/* Industry Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        value={industrySearch}
                        onChange={(e) => setIndustrySearch(e.target.value)}
                        placeholder="Search industries..."
                        className="pl-10 h-10 text-sm"
                    />
                </div>

                {/* Industry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {filteredIndustries.map((industry) => (
                        <motion.label
                            key={industry.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200',
                                'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950',
                                data.businessIndustry === industry.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-700',
                                errors.businessIndustry && hasAttemptedSubmit && !data.businessIndustry && 
                                    'border-red-300 bg-red-50 dark:bg-red-950'
                            )}
                        >
                            <input
                                type="radio"
                                name="businessIndustry"
                                value={industry.value}
                                checked={data.businessIndustry === industry.value}
                                onChange={() => onChange({ businessIndustry: industry.value })}
                                className="w-4 h-4 text-indigo-600 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                    {industry.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {industry.description}
                                </div>
                            </div>
                        </motion.label>
                    ))}
                </div>

                {filteredIndustries.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No industries found matching &quot;{industrySearch}&quot;</p>
                    </div>
                )}

                {errors.businessIndustry && hasAttemptedSubmit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-red-600 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessIndustry}
                    </motion.div>
                )}
            </motion.div>

            {/* Business Size */}
            <motion.div className="space-y-4" variants={itemVariants}>
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Team Size
                    <span className="text-red-500">*</span>
                </Label>
                <div className="grid gap-3">
                    {BUSINESS_SIZES.map((size, index) => (
                        <motion.label
                            key={size.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200',
                                'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950',
                                data.businessSize === size.value
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-700',
                                errors.businessSize && hasAttemptedSubmit && !data.businessSize && 
                                    'border-red-300 bg-red-50 dark:bg-red-950'
                            )}
                        >
                            <input
                                type="radio"
                                name="businessSize"
                                value={size.value}
                                checked={data.businessSize === size.value}
                                onChange={() => onChange({ businessSize: size.value as BusinessSize })}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <div className="text-2xl">{size.icon}</div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {size.label}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {size.description}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                                {size.employees}
                            </div>
                        </motion.label>
                    ))}
                </div>

                {errors.businessSize && hasAttemptedSubmit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-red-600 text-sm"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {errors.businessSize}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default BusinessProfileStep;
