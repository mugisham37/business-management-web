"use client"
import { Badge } from "@/components/landing/Badge"
import { Button } from "@/components/landing/Button"
import { Label } from "@/components/landing/Label"
import { Switch } from "@/components/landing/Switch"
import { Tooltip } from "@/components/landing/Tooltip"
import { ArrowAnimated } from "@/components/landing/ui/ArrowAnimated"
import { Faqs } from "@/components/landing/ui/Faqs"
import Testimonial from "@/components/landing/ui/Testimonial"
import { RecommendationBanner } from "@/components/pricing/RecommendationBanner"
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal"
import { cx } from "@/lib/utils/cn"
import {
  RiCheckLine,
  RiCloudLine,
  RiInformationLine,
  RiSubtractLine,
  RiUserLine,
  RiStarFill,
} from "@remixicon/react"
import React, { Fragment, useState, useMemo, useCallback } from "react"
import { TIER_CONFIGS, formatLimit } from "@/lib/config/pricing-config"
import { BusinessTier } from "@/types/pricing"
import { motion } from "framer-motion"
import { usePricingRecommendations } from "@/hooks/usePricingRecommendations"
import { useSubscription } from "@/hooks/useSubscription"

export default function Pricing() {
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "annually">("monthly")
  const { recommendation, hasPersonalizedRecommendation, isLoading } = usePricingRecommendations()
  const {
    isModalOpen,
    selectedPlan,
    openSubscriptionModal,
    closeSubscriptionModal,
    handleSubscriptionComplete,
  } = useSubscription()
  
  // Handle plan selection from recommendation
  const handlePlanSelect = useCallback((tier: BusinessTier) => {
    // Scroll to the selected plan
    const planElement = document.getElementById(`plan-${tier}`)
    if (planElement) {
      planElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Add a highlight effect
      planElement.classList.add('ring-4', 'ring-indigo-500', 'ring-opacity-50')
      setTimeout(() => {
        planElement.classList.remove('ring-4', 'ring-indigo-500', 'ring-opacity-50')
      }, 2000)
    }
  }, [])

  // Handle subscription button click
  const handleSubscribeClick = useCallback((tier: BusinessTier) => {
    if (tier === BusinessTier.MICRO) {
      // Free tier - redirect to registration
      window.location.href = '/auth/register'
    } else {
      // Paid tier - open subscription modal
      openSubscriptionModal(tier, billingFrequency)
    }
  }, [billingFrequency, openSubscriptionModal])
  
  // Transform tier configs to match the existing plan structure
  const plans = useMemo(() => {
    return TIER_CONFIGS.map(config => ({
      name: config.displayName,
      tier: config.tier,
      price: config.monthlyPrice === 0 
        ? "$0" 
        : {
            monthly: `$${config.monthlyPrice}`,
            annually: `$${config.yearlyPrice}`
          },
      description: config.description,
      capacity: [
        `Up to ${formatLimit(config.limits.maxEmployees)} employees`,
        `${formatLimit(config.limits.maxLocations)} location${config.limits.maxLocations === 1 ? '' : 's'}`,
        `${formatLimit(config.limits.storageGB)} GB storage`
      ],
      features: config.features.slice(0, 4).map(f => f.name), // Show first 4 features
      allFeatures: config.features,
      isStarter: config.tier === BusinessTier.MICRO,
      isRecommended: config.isRecommended || config.tier === recommendation?.recommendedTier,
      isPopular: config.isPopular || false,
      buttonText: config.tier === BusinessTier.MICRO ? "Get started" : "Start 30-day trial",
      buttonLink: config.tier === BusinessTier.MICRO ? "/auth/register" : `/subscribe/${config.tier}`,
      trialDays: config.trialDays,
      limits: config.limits
    }))
  }, [recommendation])

  // Feature comparison sections
  const sections = useMemo(() => {
    const allFeatureIds = new Set<string>()
    TIER_CONFIGS.forEach(config => {
      config.features.forEach(feature => allFeatureIds.add(feature.id))
    })

    const featureCategories = {
      'Core Features': ['dashboard', 'user_management', 'basic_reporting', 'email_support'],
      'Analytics & Reporting': ['advanced_analytics', 'financial_reporting'],
      'Business Management': ['inventory_management', 'advanced_inventory', 'crm_integration', 'custom_workflows'],
      'Integration & API': ['api_access', 'sso_integration', 'custom_integrations'],
      'Support': ['priority_support', 'phone_support', 'dedicated_support'],
      'Enterprise Features': ['white_label', 'compliance_tools']
    }

    return Object.entries(featureCategories).map(([categoryName, featureIds]) => ({
      name: categoryName,
      features: featureIds.map(featureId => {
        let featureData = null
        for (const config of TIER_CONFIGS) {
          featureData = config.features.find(f => f.id === featureId)
          if (featureData) break
        }
        
        if (!featureData) return null

        const planSupport: Record<string, boolean | string> = {}
        TIER_CONFIGS.forEach(config => {
          const feature = config.features.find(f => f.id === featureId)
          planSupport[config.displayName] = feature ? 
            (feature.limit ? `${feature.limit}` : true) : false
        })

        return {
          name: featureData.name,
          plans: planSupport,
          tooltip: featureData.description
        }
      }).filter((feature): feature is NonNullable<typeof feature> => feature !== null)
    })).filter(section => section.features.length > 0)
  }, [])

  const isVariablePrice = (price: string | { monthly: string; annually: string }): price is { monthly: string; annually: string } => {
    return typeof price === 'object' && 'monthly' in price
  }

  return (
    <div className="px-3">
      <motion.section
        aria-labelledby="pricing-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Badge>Pricing</Badge>
        <h1 className="mt-2 inline-block bg-linear-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300">
          Choose the perfect plan for your business
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
          Scale your business with our flexible pricing tiers. From startups to enterprises, 
          we have the right solution to power your growth.
        </p>
      </motion.section>

      {/* AI Recommendation Banner */}
      {!isLoading && recommendation && (
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <RecommendationBanner
            recommendation={recommendation}
            onSelectPlan={handlePlanSelect}
          />
          {hasPersonalizedRecommendation && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Based on your business profile from onboarding
            </p>
          )}
        </motion.section>
      )}

      <motion.section
        id="pricing-overview"
        className="mt-20"
        aria-labelledby="pricing-overview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Label
            htmlFor="switch"
            className="text-base font-medium sm:text-sm dark:text-gray-400"
          >
            Monthly
          </Label>
          <Switch
            id="switch"
            checked={billingFrequency === "annually"}
            onCheckedChange={() =>
              setBillingFrequency(
                billingFrequency === "monthly" ? "annually" : "monthly",
              )
            }
          />
          <Label
            htmlFor="switch"
            className="text-base font-medium sm:text-sm dark:text-gray-400"
          >
            Yearly (-20%)
          </Label>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-4 mt-8">
          {plans.map((plan, planIdx) => (
            <motion.div 
              key={planIdx} 
              id={`plan-${plan.tier}`}
              className="relative transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * planIdx }}
              whileHover={{ y: -4 }}
            >
              {plan.isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <RiStarFill className="w-3 h-3" />
                    {hasPersonalizedRecommendation ? 'Recommended for You' : 'Recommended'}
                  </div>
                </div>
              )}
              
              {plan.isPopular && !plan.isRecommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className={cx(
                "relative h-full rounded-2xl p-8 ring-1 ring-gray-200 dark:ring-gray-800 transition-all duration-300",
                plan.isRecommended && "ring-2 ring-indigo-600 dark:ring-indigo-400 shadow-lg",
                plan.isPopular && !plan.isRecommended && "ring-2 ring-blue-600 dark:ring-blue-400 shadow-lg"
              )}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {plan.name}
                  </h2>
                  {plan.trialDays > 0 && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {plan.trialDays}-day trial
                    </Badge>
                  )}
                </div>
                
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                    {isVariablePrice(plan.price)
                      ? billingFrequency === "monthly"
                        ? plan.price.monthly
                        : plan.price.annually
                      : plan.price}
                  </span>
                  {!plan.isStarter && (
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">
                      /month
                    </span>
                  )}
                </div>
                
                {billingFrequency === "annually" && !plan.isStarter && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Save 20% with annual billing
                  </p>
                )}

                <p className="mt-6 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>

                <div className="mt-8">
                  <Button 
                    onClick={() => handleSubscribeClick(plan.tier)}
                    variant={plan.isStarter ? "secondary" : "primary"} 
                    className={cx(
                      "w-full group",
                      plan.isRecommended && "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    )}
                  >
                    {plan.buttonText}
                    <ArrowAnimated />
                  </Button>
                </div>

                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {plan.capacity.map((feature, index) => (
                    <li key={feature} className="flex gap-x-3">
                      {index === 0 && <RiUserLine className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400" />}
                      {index === 1 && <RiCloudLine className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400" />}
                      {index === 2 && <RiCloudLine className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400" />}
                      {feature}
                    </li>
                  ))}
                </ul>

                <ul className="mt-6 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <RiCheckLine className="h-5 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section
        id="testimonial"
        className="mx-auto mt-20 max-w-xl sm:mt-32 lg:max-w-6xl"
        aria-labelledby="testimonial"
      >
        <Testimonial />
      </section>

      {/* Feature comparison table for mobile */}
      <section
        id="pricing-details"
        className="mt-20 sm:mt-36"
        aria-labelledby="pricing-details"
      >
        <div className="mx-auto space-y-8 sm:max-w-md lg:hidden">
          {plans.map((plan) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-xl bg-gray-400/5 p-6 ring-1 ring-inset ring-gray-200 dark:ring-gray-800">
                <h2 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                  {plan.name}
                </h2>
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  {isVariablePrice(plan.price)
                    ? `${billingFrequency === "monthly" ? plan.price.monthly : plan.price.annually} / per month`
                    : plan.price}
                </p>
              </div>
              <ul className="mt-10 space-y-10 text-sm leading-6 text-gray-900 dark:text-gray-50">
                {sections.map((section) => (
                  <li key={section.name}>
                    <h3 className="font-semibold">{section.name}</h3>
                    <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                      {section.features.map((feature) =>
                        feature && feature.plans[plan.name] ? (
                          <li key={feature.name} className="flex gap-x-3 py-2.5">
                            <RiCheckLine className="size-5 flex-none text-indigo-600 dark:text-indigo-400" />
                            <span>
                              {feature.name}{" "}
                              {typeof feature.plans[plan.name] === "string" ? (
                                <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                                  ({feature.plans[plan.name]})
                                </span>
                              ) : null}
                            </span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature comparison table for desktop */}
      <section className="mx-auto mt-20">
        <div className="mt-20 hidden sm:mt-28 lg:block">
          <div className="relative">
            <div className="sticky top-0 z-20 h-28 w-full bg-white dark:bg-gray-950" />
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <caption className="sr-only">Pricing plan comparison</caption>
              <colgroup>
                <col className="w-2/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
              </colgroup>
              <thead className="sticky top-28">
                <tr>
                  <th className="border-b border-gray-100 bg-white pb-8 dark:border-gray-800 dark:bg-gray-950">
                    <div className="font-semibold leading-7 text-gray-900 dark:text-gray-50">
                      Compare features
                    </div>
                    <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      Choose the plan that fits your needs
                    </div>
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className="border-b border-gray-100 bg-white px-6 pb-8 lg:px-8 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className={cx(
                        !plan.isStarter ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-gray-50",
                        "font-semibold leading-7"
                      )}>
                        {plan.name}
                      </div>
                      <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {isVariablePrice(plan.price)
                          ? `${billingFrequency === "monthly" ? plan.price.monthly : plan.price.annually} / month`
                          : plan.price}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((section, sectionIdx) => (
                  <Fragment key={section.name}>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={5}
                        className={cx(
                          sectionIdx === 0 ? "pt-14" : "pt-10",
                          "border-b border-gray-100 pb-4 text-base font-semibold leading-6 text-gray-900 dark:border-gray-800 dark:text-gray-50",
                        )}
                      >
                        {section.name}
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      feature && (
                        <motion.tr
                          key={feature.name}
                          className="transition hover:bg-indigo-50/30 dark:hover:bg-indigo-800/5"
                          whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                        >
                          <th className="flex items-center gap-2 border-b border-gray-100 py-4 text-sm font-normal leading-6 text-gray-900 dark:border-gray-800 dark:text-gray-50">
                            <span>{feature.name}</span>
                            {feature.tooltip && (
                              <Tooltip side="right" content={feature.tooltip}>
                                <RiInformationLine className="size-4 shrink-0 text-gray-700 dark:text-gray-400" />
                              </Tooltip>
                            )}
                          </th>
                          {plans.map((plan) => (
                            <td
                              key={plan.name}
                              className="border-b border-gray-100 px-6 py-4 lg:px-8 dark:border-gray-800"
                            >
                              {typeof feature.plans[plan.name] === "string" ? (
                                <div className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                                  {feature.plans[plan.name]}
                                </div>
                              ) : (
                                <>
                                  {feature.plans[plan.name] === true ? (
                                    <RiCheckLine className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  ) : (
                                    <RiSubtractLine className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                                  )}
                                  <span className="sr-only">
                                    {feature.plans[plan.name] === true ? "Included" : "Not included"} in {plan.name}
                                  </span>
                                </>
                              )}
                            </td>
                          ))}
                        </motion.tr>
                      )
                    ))}
                  </Fragment>
                ))}
                <tr>
                  <th className="pt-6 text-sm font-normal leading-6 text-gray-900 dark:text-gray-50">
                    <span className="sr-only">Link to activate plan</span>
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.name} className="px-6 pt-6 lg:px-8">
                      <Button
                        onClick={() => handleSubscribeClick(plan.tier)}
                        variant="light"
                        className={cx(
                          "group bg-transparent px-0 text-base hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent",
                          plan.isStarter ? "" : "text-indigo-600 dark:text-indigo-400"
                        )}
                      >
                        {plan.buttonText}
                        <ArrowAnimated />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      {selectedPlan && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={closeSubscriptionModal}
          tier={selectedPlan.tier}
          billingCycle={selectedPlan.billingCycle}
          onSubscriptionComplete={handleSubscriptionComplete}
        />
      )}

      <Faqs />
    </div>
  )
}
