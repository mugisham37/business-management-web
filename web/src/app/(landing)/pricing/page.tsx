"use client"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { Tooltip } from "@/components/ui/Tooltip"
import { ArrowAnimated } from "@/components/Landing/ArrowAnimated"
import { Faqs } from "@/components/Landing/Faqs"
import Testimonial from "@/components/Landing/Testimonial"
import { cx } from "@/lib/utils"
import {
  RiCheckLine,
  RiCloudLine,
  RiInformationLine,
  RiSubtractLine,
  RiUserLine,
} from "@remixicon/react"
import Link from "next/link"
import React, { Fragment } from "react"

type FixedPrice = string

interface VariablePrice {
  monthly: string
  annually: string
}

interface Plan {
  name: string
  price: FixedPrice | VariablePrice
  description: string
  capacity: string[]
  features: string[]
  isStarter: boolean
  isRecommended: boolean
  buttonText: string
  buttonLink: string
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    description:
      "For solo entrepreneurs and freelancers managing their business.",
    capacity: ["Up to 5 users, 1 admin", "1 location"],
    features: [
      "Up to 500 transactions/month",
      "Basic inventory tracking",
      "Community support",
    ],
    isStarter: true,
    isRecommended: false,
    buttonText: "Get started",
    buttonLink: "#",
  },
  {
    name: "Teams",
    price: { monthly: "$49", annually: "$39" },
    description: "For growing businesses with multiple team members and needs.",
    capacity: ["Up to 100 users, 3 admins", "Up to 5 locations"],
    features: [
      "Unlimited transactions",
      "Advanced inventory & POS",
      "Multi-location support",
      "Priority email support",
    ],
    isStarter: false,
    isRecommended: false,
    buttonText: "Start 14-day trial",
    buttonLink: "#",
  },
  {
    name: "Business",
    price: { monthly: "$99", annually: "$79" },
    description:
      "For established enterprises requiring comprehensive management tools.",
    capacity: ["Up to 500 users, 10 admins", "Unlimited locations"],
    features: [
      "Unlimited transactions",
      "Enterprise features",
      "Custom integrations",
      "B2B wholesale tools",
      "Single Sign-On (SSO)",
    ],
    isStarter: false,
    isRecommended: true,
    buttonText: "Start 14-day trial",
    buttonLink: "#",
  },
]

interface Feature {
  name: string
  plans: Record<string, boolean | string>
  tooltip?: string
}

interface Section {
  name: string
  features: Feature[]
}

const sections: Section[] = [
  {
    name: "Core Business Features",
    features: [
      {
        name: "Inventory management",
        tooltip:
          "Track stock levels, manage SKUs, and automate reordering across locations.",
        plans: { Starter: true, Teams: true, Business: true },
      },
      {
        name: "Business locations",
        tooltip:
          "Manage multiple stores, warehouses, or facilities from one platform.",
        plans: { Starter: "1", Teams: "5", Business: "Unlimited" },
      },
      {
        name: "Data storage",
        tooltip:
          "Secure cloud storage for all your business data and documents.",
        plans: {
          Starter: "5 GB included",
          Teams: "50 GB included",
          Business: "Unlimited",
        },
      },
      {
        name: "User accounts",
        tooltip:
          "Employee and staff accounts with role-based access controls.",
        plans: {
          Starter: "5 users",
          Teams: "Up to 100 users",
          Business: "Unlimited",
        },
      },
    ],
  },
  {
    name: "Sales & Operations",
    features: [
      {
        name: "Point of Sale (POS)",
        tooltip:
          "Complete POS system with offline mode and payment processing.",
        plans: { Starter: true, Teams: true, Business: true },
      },
      {
        name: "Customer relationship management",
        tooltip:
          "Track customer interactions, purchase history, and preferences.",
        plans: { Teams: true, Business: true },
      },
      {
        name: "B2B wholesale features",
        tooltip:
          "Custom pricing tiers, bulk orders, and business customer portals.",
        plans: { Starter: "Limited", Teams: "Standard", Business: "Enhanced" },
      },
    ],
  },
  {
    name: "Analytics & Reporting",
    features: [
      {
        name: "Report history retention",
        tooltip:
          "How long your business analytics and reports are stored.",
        plans: { Starter: "30 days", Teams: "1 year", Business: "Unlimited" },
      },
      {
        name: "Real-time dashboards",
        tooltip:
          "Live business metrics and performance monitoring across locations.",
        plans: { Teams: true, Business: true },
      },
      {
        name: "Custom report builder",
        tooltip:
          "Create tailored reports for any aspect of your business operations.",
        plans: { Business: true },
      },
    ],
  },
  {
    name: "Support",
    features: [
      {
        name: "Chat support",
        plans: {
          Starter: "Community",
          Teams: "Business hours",
          Business: "24/7 dedicated",
        },
      },
      {
        name: "Email",
        plans: { Starter: "2-4 days", Teams: "1-2 days", Business: "Priority" },
      },
    ],
  },
]

const isVariablePrice = (
  price: FixedPrice | VariablePrice,
): price is VariablePrice => {
  return (price as VariablePrice).monthly !== undefined
}

export default function Pricing() {
  const [billingFrequency, setBillingFrequency] = React.useState<
    "monthly" | "annually"
  >("monthly")
  return (
    <div className="px-3">
      <section
        aria-labelledby="pricing-title"
        className="animate-slide-up-fade"
        style={{
          animationDuration: "600ms",
          animationFillMode: "backwards",
        }}
      >
        <Badge>Pricing</Badge>
        <h1 className="heading-gradient mt-2 text-4xl sm:text-6xl md:text-6xl">
          Plans that grow with your business
        </h1>
        <p className="text-landing-body mt-6 max-w-2xl">
          From solo entrepreneur to enterprise operation, our flexible pricing
          scales with your needs. Powerful business management that fits your
          budget at every stage of growth.
        </p>
      </section>
      <section
        id="pricing-overview"
        className="pricing-section-spacing animate-slide-up-fade"
        aria-labelledby="pricing-overview"
        style={{
          animationDuration: "600ms",
          animationDelay: "200ms",
          animationFillMode: "backwards",
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <Label
            htmlFor="switch"
            className="pricing-toggle-label"
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
            className="pricing-toggle-label"
          >
            Yearly <span className="pricing-discount-badge">(-20%)</span>
          </Label>
        </div>
        <div className="pricing-card-grid">
          {plans.map((plan, planIdx) => (
            <div key={planIdx} className="mt-6">
              {plan.isRecommended ? (
                <div className="pricing-popular-indicator">
                  <div className="pricing-popular-indicator-line">
                    <div
                      className="pricing-popular-indicator-border"
                      aria-hidden="true"
                    />
                    <div className="pricing-popular-label">
                      <span className="pricing-popular-label-text">
                        Most popular
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-4 items-center">
                  <div className="pricing-divider" />
                </div>
              )}
              <div className="pricing-plan-card">
                <h2 className="pricing-plan-name">
                  {plan.name}
                </h2>
                <div className="pricing-amount">
                  <span className="pricing-amount-value">
                    {isVariablePrice(plan.price)
                      ? billingFrequency === "monthly"
                        ? plan.price.monthly
                        : plan.price.annually
                      : plan.price}
                  </span>
                  <div className="pricing-amount-period">
                    per user <br /> per month
                  </div>
                </div>
                <div className="mt-6 flex flex-col justify-between">
                  <p className="pricing-description">
                    {plan.description}
                  </p>
                  <div className="mt-6">
                    {plan.isStarter ? (
                      <Button variant="secondary" asChild className="group">
                        <Link href={plan.buttonLink}>
                          {plan.buttonText}
                          <ArrowAnimated />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild className="group">
                        <Link href={plan.buttonLink}>
                          {plan.buttonText}
                          <ArrowAnimated />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <ul
                  role="list"
                  className="pricing-feature-list"
                >
                  {plan.capacity.map((feature, index) => (
                    <li
                      key={feature}
                      className="pricing-feature-item"
                    >
                      {index === 0 && (
                        <RiUserLine
                          className="pricing-feature-icon pricing-feature-icon-capacity"
                          aria-hidden="true"
                        />
                      )}
                      {index === 1 && (
                        <RiCloudLine
                          className="pricing-feature-icon pricing-feature-icon-capacity"
                          aria-hidden="true"
                        />
                      )}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul
                  role="list"
                  className="pricing-feature-list text-muted-foreground"
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="pricing-feature-item"
                    >
                      <RiCheckLine
                        className="pricing-feature-icon-check"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="testimonial"
        className="mx-auto pricing-section-spacing max-w-xl sm:max-w-6xl"
        aria-labelledby="testimonial"
      >
        <Testimonial />
      </section>

      {/* plan details (xs-lg)*/}
      <section
        id="pricing-details"
        className="pricing-section-spacing"
        aria-labelledby="pricing-details"
      >
        <div className="mx-auto space-y-8 sm:max-w-md lg:hidden">
          {plans.map((plan) => (
            <div key={plan.name}>
              <div className="pricing-card-mobile">
                <h2
                  id={plan.name}
                  className="pricing-mobile-plan-header"
                >
                  {plan.name}
                </h2>
                <p className="pricing-mobile-plan-price">
                  {isVariablePrice(plan.price)
                    ? `${
                        billingFrequency === "monthly"
                          ? plan.price.monthly
                          : plan.price.annually
                      } / per user`
                    : plan.price}
                </p>
              </div>
              <ul
                role="list"
                className="pricing-mobile-feature-list"
              >
                {sections.map((section) => (
                  <li key={section.name}>
                    <h3 className="pricing-mobile-section-title">{section.name}</h3>
                    <ul
                      role="list"
                      className="pricing-mobile-section-list"
                    >
                      {section.features.map((feature) =>
                        feature.plans[plan.name] ? (
                          <li
                            key={feature.name}
                            className="flex gap-x-3 py-2.5"
                          >
                            <RiCheckLine
                              className="pricing-feature-icon-check"
                              aria-hidden="true"
                            />
                            <span>
                              {feature.name}{" "}
                              {typeof feature.plans[plan.name] === "string" ? (
                                <span className="pricing-feature-value">
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
            </div>
          ))}
        </div>
      </section>

      {/* plan details (lg+) */}
      <section className="mx-auto pricing-section-spacing">
        <div className="mt-20 hidden sm:mt-28 lg:block">
          <div className="relative">
            <div className="pricing-table-sticky-header-primary" />
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <caption className="sr-only">Pricing plan comparison</caption>
              <colgroup>
                <col className="pricing-table-col-feature" />
                <col className="pricing-table-col-plan" />
                <col className="pricing-table-col-plan" />
                <col className="pricing-table-col-plan" />
              </colgroup>
              <thead className="pricing-table-sticky-header">
                <tr>
                  <th
                    scope="col"
                    className="pricing-table-cell"
                  >
                    <div className="pricing-table-header-title">
                      Compare prices
                    </div>
                    <div className="pricing-table-header-subtitle">
                      Price per month (billed yearly)
                    </div>
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className="pricing-table-cell lg:px-8"
                    >
                      <div
                        className={cx(
                          !plan.isStarter
                            ? "pricing-plan-header-name-popular"
                            : "pricing-plan-header-name",
                          "pricing-plan-header-name",
                        )}
                      >
                        {plan.name}
                      </div>
                      <div className="pricing-plan-header-price">
                        {isVariablePrice(plan.price)
                          ? `${
                              billingFrequency === "monthly"
                                ? plan.price.monthly
                                : plan.price.annually
                            } / per user`
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
                        colSpan={4}
                        className={cx(
                          sectionIdx === 0 ? "pt-14" : "pt-10",
                          "pricing-section-header",
                        )}
                      >
                        {section.name}
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="pricing-table-row"
                      >
                        <th
                          scope="row"
                          className="flex items-center gap-2 pricing-table-cell text-sm font-normal leading-6 text-foreground"
                        >
                          <span>{feature.name}</span>
                          {feature.tooltip ? (
                            <Tooltip side="right" content={feature.tooltip}>
                              <RiInformationLine
                                className="pricing-feature-icon text-muted-foreground"
                                aria-hidden="true"
                              />
                            </Tooltip>
                          ) : null}
                        </th>
                        {plans.map((plan) => (
                          <td
                            key={plan.name}
                            className="pricing-table-cell lg:px-8"
                          >
                            {typeof feature.plans[plan.name] === "string" ? (
                              <div className="pricing-feature-value">
                                {feature.plans[plan.name]}
                              </div>
                            ) : (
                              <>
                                {feature.plans[plan.name] === true ? (
                                  <RiCheckLine
                                    className="pricing-feature-icon-check"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <RiSubtractLine
                                    className="pricing-feature-icon-unavailable"
                                    aria-hidden="true"
                                  />
                                )}

                                <span className="sr-only">
                                  {feature.plans[plan.name] === true
                                    ? "Included"
                                    : "Not included"}{" "}
                                  in {plan.name}
                                </span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
                <tr>
                  <th
                    scope="row"
                    className="pt-6 text-sm font-normal leading-6 text-foreground"
                  >
                    <span className="sr-only">Link to activate plan</span>
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.name} className="px-6 pt-6 lg:px-8">
                      {plan.isStarter ? (
                        <Button
                          variant="light"
                          asChild
                          className="group bg-transparent px-0 text-base hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent"
                        >
                          <Link href={plan.buttonLink}>
                            {plan.buttonText}
                            <ArrowAnimated />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          asChild
                          className="group bg-transparent px-0 text-base text-primary hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent"
                        >
                          <Link href={plan.buttonLink}>
                            {plan.buttonText}
                            <ArrowAnimated />
                          </Link>
                        </Button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Faqs />
    </div>
  )
}
