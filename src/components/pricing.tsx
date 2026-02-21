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
    const iconStyle = isBlue
        ? {
            backgroundColor: "var(--token-e463222a-c3ec-4920-8338-555ca22c2bd5, rgba(10, 141, 255, 0.07))",
            stroke: "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(0, 94, 255))"
        }
        : {
            backgroundColor: "rgba(0, 0, 0, 0)",
            stroke: "var(--token-52749bb0-1899-4563-80ac-ac8a27c04772, rgb(145, 145, 145))"
        }

    return (
        <div className="framer-asyw4f" data-framer-name="Icon-holder"
            style={{ backgroundColor: iconStyle.backgroundColor, borderRadius: "13px", opacity: "1" }}>
            <svg className="framer-uMwCf framer-ya60st" role="presentation" viewBox="0 0 24 24"
                style={{ stroke: iconStyle.stroke, strokeWidth: "2", transform: "translate(-50%, -50%)", opacity: "1" } as React.CSSProperties}>
                <use href="#4119102008"></use>
            </svg>
        </div>
    )
}

const FeatureItem: React.FC<{ text: string; isBlue?: boolean }> = ({ text, isBlue }) => (
    <div className="framer-7urc9q-container" style={{ opacity: "1" }}>
        <div className={`framer-ZwGvg framer-ae7Kc framer-1611rx ${isBlue ? 'framer-v-1611rx' : 'framer-v-1w6uadn'}`}
            data-framer-name={isBlue ? "Check Items - Blue" : "Check Items - Grey"}
            style={{ width: "100%", opacity: "1" }}>
            <CheckIcon isBlue={isBlue} />
            <div className="framer-1nyf64z" data-framer-name="Text wrap" style={{ opacity: "1" }}>
                <div className="framer-8f7891" data-framer-name="Text"
                    data-framer-component-type="RichTextContainer"
                    style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", color: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", transform: "none", opacity: "1" }}>
                    <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx"
                        style={{ textAlign: "left", color: "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" }}>
                        {text}
                    </p>
                </div>
            </div>
        </div>
    </div>
)

const CTAButton: React.FC = () => (
    <div className="framer-jqojbc-container" style={{ opacity: "1" }}>
        <a className="framer-i8Jnw framer-YF6mi framer-1jz64ot framer-v-mf8df3 framer-1jhx1jk"
            data-framer-name="Black - Phone" data-highlight="true"
            href="https://www.framer.com?via=green13" target="_blank"
            rel="noopener" tabIndex={0}
            style={{ borderBottomWidth: "0px", borderColor: "rgba(0, 0, 0, 0)", borderLeftWidth: "0px", borderRightWidth: "0px", borderStyle: "solid", borderTopWidth: "0px", backgroundColor: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", width: "100%", borderRadius: "27px", boxShadow: "none", opacity: "1" }}>
            <div className="framer-12n0srg" data-framer-name="Container" style={{ opacity: "1" }}>
                <div className="framer-1669q28" data-framer-name="Text" style={{ opacity: "1" }}>
                    <div className="framer-1fovsuz" data-framer-name="Text"
                        data-framer-component-type="RichTextContainer"
                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", color: "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))", marginBottom: "0px", transform: "none", opacity: "1" }}>
                        <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                            style={{ color: "var(--extracted-r6o4lv, var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255)))" }}>
                            Get Started
                        </p>
                    </div>
                </div>
            </div>
        </a>
    </div>
)

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
    const isBlue = plan.variant === 'standard' || plan.variant === 'pro'
    
    const containerStyle = plan.variant === 'standard'
        ? {
            backdropFilter: "none",
            backgroundColor: "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(0, 94, 255))",
            boxShadow: "rgba(25, 140, 255, 0.27) 0px 0px 5px 0px"
        }
        : {
            backdropFilter: "blur(1px)",
            backgroundColor: "var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))",
            boxShadow: "0px 2px 3px 0px var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))"
        }

    const innerBorderStyle = plan.variant === 'standard'
        ? {
            borderBottomWidth: "0px",
            borderLeftWidth: "0px",
            borderRightWidth: "0px",
            borderTopWidth: "0px"
        }
        : {
            borderBottomWidth: "1px",
            borderLeftWidth: "1px",
            borderRightWidth: "1px",
            borderTopWidth: "1px"
        }

    return (
        <div className="framer-ehmnr9-container" style={{ opacity: "1" }}>
            <div className={`framer-Yqamd framer-DSUVI framer-YF6mi framer-LtTNP framer-5CH85 framer-iqc937 framer-v-${plan.variant === 'basic' ? 'iqc937' : plan.variant === 'standard' ? '1xa2ebn' : '1owqqyv'}`}
                data-framer-name={`Monthly - ${plan.name}`}
                style={{ ...containerStyle, width: "100%", borderRadius: "18px", opacity: "1" }}>
                <div className="framer-1q0ezja" data-border="true" data-framer-name="Container"
                    style={{ ...innerBorderStyle, borderColor: "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", borderStyle: "solid", backgroundColor: plan.variant === 'standard' ? "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))" : "var(--token-e1c52d29-6b20-4ee3-afb3-f179ac191e9c, rgb(251, 251, 251))", borderRadius: "16px", opacity: "1" }}>
                    <div className="framer-1pxyokb" data-framer-name="Main" style={{ opacity: "1" }}>
                        <div className="framer-1vnfqx4" data-framer-name="Heading and price"
                            style={{ borderRadius: plan.variant === 'standard' ? "7px" : "0px", opacity: "1" }}>
                            <div className="framer-1wf0d7n" data-framer-name="Container" style={{ opacity: "1" }}>
                                <div className="framer-1yic3p" data-framer-name="Heading"
                                    data-framer-component-type="RichTextContainer"
                                    style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", marginBottom: "20px", transform: "none", opacity: "1" }}>
                                    <h5 className="framer-text framer-styles-preset-lvcpug" data-styles-preset="t16XcyCvn">
                                        {plan.name}
                                    </h5>
                                </div>
                                {plan.badge && (
                                    <div className="framer-p56ogw" data-framer-name=" Badge"
                                        style={{ backgroundColor: "var(--token-63f804c8-3c4f-490d-9524-ef19f06222dd, rgb(237, 247, 255))", borderRadius: "8px", opacity: "1" }}>
                                        <div className="framer-1eeojfe" data-framer-name="Content" style={{ opacity: "1" }}>
                                            <div className="framer-1uk2skb" data-framer-name="Heading"
                                                data-framer-component-type="RichTextContainer"
                                                style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", color: "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(0, 94, 255))", marginBottom: "20px", transform: "none", opacity: "1" }}>
                                                <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                                                    style={{ color: "var(--extracted-r6o4lv, var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(0, 94, 255)))" }}>
                                                    {plan.badge}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="framer-1tq8i6q" data-framer-name="Pricing" style={{ opacity: "1" }}>
                                <div className="framer-d8usxw" data-framer-name="Price"
                                    data-framer-component-type="RichTextContainer"
                                    style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "center", flexShrink: "0", marginBottom: "60px", transform: "none", opacity: "1" }}>
                                    <p className="framer-text framer-styles-preset-486ol4" data-styles-preset="aMVu6z32r">
                                        {plan.price}
                                    </p>
                                </div>
                            </div>
                            <div className="framer-gsmfp1" data-framer-name="Billed"
                                data-framer-component-type="RichTextContainer"
                                style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", color: "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", marginBottom: "20px", opacity: "0.9", transform: "none" }}>
                                <p className="framer-text framer-styles-preset-1wb1rql" data-styles-preset="jYYZSTRc7"
                                    style={{ textAlign: "left", color: plan.variant === 'standard' ? undefined : "var(--extracted-r6o4lv, var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61)))" }}>
                                    {plan.billingText}
                                </p>
                            </div>
                        </div>
                        <div className="framer-agfanv" data-framer-name="Line"
                            style={{ backgroundColor: "var(--token-9cf61545-9ec8-4c23-873d-6ec7f44bfe14, rgb(229, 229, 232))", opacity: "1" }}>
                        </div>
                        <div className="framer-1etq3v8" data-framer-name="Body" style={{ opacity: "1" }}>
                            <div className="framer-psz3ev" data-framer-name="What's Included" style={{ opacity: "1" }}>
                                {plan.features.map((feature, index) => (
                                    <FeatureItem key={index} text={feature.text} isBlue={isBlue} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <CTAButton />
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
        <>
            <section className="framer-1r7fcp3" data-framer-name="Pricing Section" id="pricing">
                <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                    <div className="framer-6gv9yh-container">
                        <div className="framer-4gClM framer-Qav6c framer-ae7Kc framer-YF6mi framer-mdwug3 framer-v-1iuggbf"
                            data-framer-name="Phone Monthly" style={{ width: "100%", opacity: "1" }}>
                            <div className="framer-u4itb3" data-framer-name="Heading Content" style={{ opacity: "1" }}>
                                <div className="framer-g7x3fq-container" style={{ opacity: "1" }}>
                                    <div className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                                        data-border="true" data-framer-name="Badge"
                                        style={{ borderBottomWidth: "1px", borderColor: "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", borderLeftWidth: "1px", borderRightWidth: "1px", borderStyle: "solid", borderTopWidth: "1px", backgroundColor: "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))", borderRadius: "17px", boxShadow: "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))", opacity: "1" }}>
                                        <div className="framer-1l1ajhh" data-framer-name="Icon" style={{ opacity: "1" }}>
                                            <svg className="framer-vR5Vf framer-qgvfsn" role="presentation" viewBox="0 0 24 24"
                                                style={{ stroke: "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", strokeWidth: "1.4", opacity: "1" } as React.CSSProperties}>
                                                <use href="#1018870535"></use>
                                            </svg>
                                        </div>
                                        <div className="framer-1710qob" data-framer-component-type="RichTextContainer"
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", textDecoration: "underline", transform: "none", opacity: "1" }}>
                                            <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                                                style={{ color: "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" }}>
                                                Plans That Grow With You
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="framer-12im7it" data-framer-name="Text Content" style={{ opacity: "1" }}>
                                    <div className="framer-1l84esa" data-framer-name="Pricing"
                                        data-framer-component-type="RichTextContainer"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none", opacity: "1" }}>
                                        <h2 className="framer-text framer-styles-preset-199apa9" data-styles-preset="Ty6zNsrjE">
                                            Pricing Options
                                        </h2>
                                    </div>
                                    <div className="framer-64l9bu" data-framer-name="Subheading"
                                        data-framer-component-type="RichTextContainer"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none", opacity: "1" }}>
                                        <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx">
                                            Choose the subscription plan that suits your needs
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="framer-hk1kjx" data-framer-name="Toggle Container"
                                style={{ backgroundColor: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", willChange: "transform", borderRadius: "20px", boxShadow: "0px 1px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))", opacity: "0", transform: "translateY(40px)" }}>
                                <div className="framer-1ada0g6" data-framer-name="Monthly" style={{ borderRadius: "15px", opacity: "1" }}>
                                    <div className="framer-1qcpun" data-framer-component-type="RichTextContainer"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", textDecoration: "underline", transform: "none", opacity: "1" }}>
                                        <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                                            style={{ color: "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" }}>
                                            Monthly
                                        </p>
                                    </div>
                                    <div className="framer-14tdddp"
                                        style={{ backgroundColor: "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))", borderRadius: "17px", opacity: "1" }}>
                                    </div>
                                </div>
                                <div className="framer-16soggz" data-framer-name="Yearly" data-highlight="true"
                                    tabIndex={0} style={{ borderRadius: "15px", opacity: "1" }}>
                                    <div className="framer-17g37xu" data-framer-component-type="RichTextContainer"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", textDecoration: "underline", transform: "none", opacity: "1" }}>
                                        <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                                            style={{ color: "var(--extracted-r6o4lv, var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255)))" }}>
                                            Yearly
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="framer-j501y8" data-framer-name="Pricing"
                                style={{ willChange: "transform", opacity: "0", transform: "translateY(80px)" }}>
                                {pricingPlans.map((plan, index) => (
                                    <PricingCard key={index} plan={plan} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Pricing
