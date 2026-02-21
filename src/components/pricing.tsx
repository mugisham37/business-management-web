import React from 'react'

// Type definitions for better code organization
interface FeatureItem {
    text: string
}

interface PricingPlan {
    name: string
    price: string
    billingText: string
    features: FeatureItem[]
    isHighlighted?: boolean
    badge?: string
    variant: 'basic' | 'standard' | 'pro'
}

// Reusable components
const CheckIcon: React.FC<{ isBlue?: boolean }> = ({ isBlue }) => {
    return (
        <div className={`flex items-center justify-center w-[26px] h-[26px] rounded-[13px] ${
            isBlue ? 'bg-[rgba(10,141,255,0.07)]' : 'bg-transparent'
        }`}>
            <svg 
                className={`w-[24px] h-[24px] ${isBlue ? 'stroke-[rgb(0,94,255)]' : 'stroke-[rgb(145,145,145)]'}`}
                role="presentation" 
                viewBox="0 0 24 24"
                strokeWidth="2"
                fill="none"
            >
                <use href="#4119102008"></use>
            </svg>
        </div>
    )
}

const FeatureItem: React.FC<{ text: string; isBlue?: boolean }> = ({ text, isBlue }) => (
    <div className="w-full">
        <div className="flex items-center gap-3 w-full">
            <CheckIcon isBlue={isBlue} />
            <div className="flex-1">
                <p className="font-['Switzer'] text-base font-normal tracking-normal leading-[1.4em] text-[rgb(38,38,38)] text-left">
                    {text}
                </p>
            </div>
        </div>
    </div>
)

const CTAButton: React.FC = () => (
    <div className="w-full">
        <a 
            className="flex items-center justify-center w-full bg-[rgb(38,38,38)] rounded-[27px] px-6 py-4 transition-opacity hover:opacity-90"
            href="https://www.framer.com?via=green13" 
            target="_blank"
            rel="noopener" 
            tabIndex={0}
        >
            <p className="font-['Switzer'] text-sm font-normal tracking-[-0.01em] leading-[1.3em] text-white text-center">
                Get Started
            </p>
        </a>
    </div>
)

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
    const isBlue = plan.variant === 'standard' || plan.variant === 'pro'
    
    return (
        <div className="w-full">
            <div className={`w-full rounded-[18px] ${
                plan.variant === 'standard' 
                    ? 'bg-[rgb(0,94,255)] shadow-[rgba(25,140,255,0.27)_0px_0px_5px_0px]' 
                    : 'backdrop-blur-[1px] bg-[rgb(240,241,242)] shadow-[0px_2px_3px_0px_rgb(248,249,250)]'
            }`}>
                <div className={`rounded-[16px] p-8 ${
                    plan.variant === 'standard' 
                        ? 'bg-white border-0' 
                        : 'bg-[rgb(251,251,251)] border border-[rgb(229,229,232)]'
                }`}>
                    <div className="flex flex-col gap-6">
                        {/* Header Section */}
                        <div className={`${plan.variant === 'standard' ? 'rounded-[7px]' : ''}`}>
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-['Inter'] text-2xl font-medium tracking-normal leading-[1.3em] text-[rgb(38,38,38)] text-left">
                                    {plan.name}
                                </h5>
                                {plan.badge && (
                                    <div className="bg-[rgb(237,247,255)] rounded-[8px] px-3 py-1.5">
                                        <p className="font-['Switzer'] text-sm font-normal tracking-[-0.01em] leading-[1.3em] text-[rgb(0,94,255)] text-center">
                                            {plan.badge}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Price */}
                            <div className="mb-4">
                                <h2 className="font-['Switzer'] text-[42px] font-semibold tracking-[-0.02em] leading-[1em] text-black text-left mb-4">
                                    {plan.price}
                                </h2>
                            </div>
                            
                            {/* Billing Text */}
                            <p className={`font-['Switzer'] text-lg font-normal tracking-normal leading-[1.3em] opacity-90 text-left ${
                                plan.variant === 'standard' ? 'text-[rgb(56,56,61)]' : 'text-[rgb(56,56,61)]'
                            }`}>
                                {plan.billingText}
                            </p>
                        </div>
                        
                        {/* Divider */}
                        <div className="w-full h-[1px] bg-[rgb(229,229,232)]"></div>
                        
                        {/* Features */}
                        <div className="flex flex-col gap-4">
                            {plan.features.map((feature, index) => (
                                <FeatureItem key={index} text={feature.text} isBlue={isBlue} />
                            ))}
                        </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-6">
                        <CTAButton />
                    </div>
                </div>
            </div>
        </div>
    )
}

const Pricing = () => {
    const pricingPlans: PricingPlan[] = [
        {
            name: "Basic Plan",
            price: "$10",
            billingText: "Billed monthly",
            variant: "basic",
            features: [
                { text: "Smart Task Input" },
                { text: "Daily Focus Mode" },
                { text: "Basic Collaboration" },
                { text: "Cloud-Synced History" }
            ]
        },
        {
            name: "Standard Plan",
            price: "$30",
            billingText: "Billed monthly",
            variant: "standard",
            badge: "Best value",
            features: [
                { text: "Team Dashboard" },
                { text: "Smart Auto-Assign" },
                { text: "Integrated Calendar View" },
                { text: "AI Suggestions" },
                { text: "Workflow Templates" }
            ]
        },
        {
            name: "Pro Plan",
            price: "$60",
            billingText: "Billed monthly",
            variant: "pro",
            features: [
                { text: "Advanced Permissions" },
                { text: "Multi-Team Coordination" },
                { text: "Custom AI Workflows" },
                { text: "Audit Trail & Logs" },
                { text: "Priority Analytics" },
                { text: "Unlimited Integrations" }
            ]
        }
    ]

    return (
        <section className="py-20 px-4" id="pricing">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[rgb(250,250,250)] border border-[rgb(229,229,232)] rounded-[17px] shadow-[0px_2px_5px_0px_rgb(240,241,242)]">
                        <svg 
                            className="w-6 h-6 stroke-[rgb(56,56,61)]" 
                            role="presentation" 
                            viewBox="0 0 24 24"
                            strokeWidth="1.4"
                            fill="none"
                        >
                            <use href="#1018870535"></use>
                        </svg>
                        <p className="font-['Switzer'] text-sm font-normal tracking-[-0.01em] leading-[1.3em] text-[rgb(38,38,38)] underline">
                            Plans That Grow With You
                        </p>
                    </div>
                    
                    {/* Heading */}
                    <h2 className="font-['Switzer'] text-[50px] md:text-[38px] sm:text-[28px] font-semibold tracking-[-0.02em] leading-[1em] text-[rgb(38,38,38)] text-center mb-4">
                        Pricing Options
                    </h2>
                    
                    {/* Subheading */}
                    <p className="font-['Switzer'] text-base font-normal tracking-normal leading-[1.4em] text-[rgb(56,56,61)] text-center max-w-2xl">
                        Choose the subscription plan that suits your needs
                    </p>
                </div>
                
                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard key={index} plan={plan} />
                    ))}
                </div>
            </div>
            
            {/* SVG Definitions */}
            <svg style={{ display: 'none' }}>
                <defs>
                    <symbol id="4119102008" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </symbol>
                    <symbol id="1018870535" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </symbol>
                </defs>
            </svg>
        </section>
    )
}

export default Pricing
