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
  RiInformationLine,
  RiSubtractLine,
  RiUserLine,
  RiStoreLine,
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
    name: "Solo",
    price: "$19",
    description:
      "For solopreneurs and freelancers managing their growing business.",
    capacity: ["1 business owner + 3 team members", "1 business location"],
    features: [
      "Up to 100 invoices/month",
      "Basic inventory (50 products)",
      "Email support & knowledge base",
    ],
    isStarter: true,
    isRecommended: false,
    buttonText: "Start for free",
    buttonLink: "#",
  },
  {
    name: "Retail",
    price: { monthly: "$79", annually: "$59" },
    description: "For small retailers and service businesses scaling operations.",
    capacity: ["Up to 10 employees, 3 managers", "Up to 3 business locations"],
    features: [
      "Unlimited invoices & quotes",
      "Advanced inventory management",
      "Point of Sale (POS) integration",
      "Priority email & chat support",
    ],
    isStarter: false,
    isRecommended: false,
    buttonText: "Try free for 14 days",
    buttonLink: "#",
  },
  {
    name: "Wholesale",
    price: { monthly: "$199", annually: "$159" },
    description:
      "For wholesalers and multi-location businesses with complex operations.",
    capacity: ["Up to 50 employees, 10 managers", "Unlimited locations"],
    features: [
      "Bulk order management",
      "Multi-warehouse inventory",
      "B2B customer portal",
      "Advanced reporting & analytics",
      "SSO & role-based access",
    ],
    isStarter: false,
    isRecommended: true,
    buttonText: "Try free for 14 days",
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
    name: "Business Operations",
    features: [
      {
        name: "Order notifications & customer alerts",
        tooltip:
          "Automated notifications for orders, payments, and customer activities.",
        plans: { Solo: true, Retail: true, Wholesale: true },
      },
      {
        name: "Business locations/branches",
        tooltip:
          "Manage multiple physical or virtual business locations from one platform.",
        plans: { Solo: "1", Retail: "3", Wholesale: "Unlimited" },
      },
      {
        name: "Document storage",
        tooltip:
          "Secure cloud storage for invoices, contracts, receipts, and business documents.",
        plans: {
          Solo: "5GB",
          Retail: "50GB + cloud backup",
          Wholesale: "200GB + enterprise backup",
        },
      },
      {
        name: "Employee accounts",
        tooltip:
          "User accounts with customizable permissions and role-based access.",
        plans: {
          Solo: "4 users",
          Retail: "Up to 10 users",
          Wholesale: "Up to 50 users",
        },
      },
    ],
  },
  {
    name: "Financial Management",
    features: [
      {
        name: "Invoicing & quotes",
        tooltip:
          "Create professional invoices and quotes with automated billing.",
        plans: { Solo: "Basic", Retail: "Advanced", Wholesale: "Enterprise" },
      },
      {
        name: "Expense tracking",
        tooltip:
          "Track and categorize business expenses with receipt management.",
        plans: { Solo: true, Retail: true, Wholesale: true },
      },
      {
        name: "Multi-currency support",
        tooltip:
          "Accept payments and manage transactions in multiple currencies.",
        plans: { Retail: true, Wholesale: true },
      },
      {
        name: "Advanced accounting suite",
        tooltip:
          "Full double-entry accounting, cost accounting, and budgeting tools.",
        plans: { Wholesale: true },
      },
    ],
  },
  {
    name: "Inventory Management",
    features: [
      {
        name: "Product catalog",
        tooltip:
          "Manage your product inventory with images, descriptions, and pricing.",
        plans: { Solo: "50 products", Retail: "Unlimited", Wholesale: "Unlimited" },
      },
      {
        name: "Low-stock alerts",
        tooltip:
          "Automated notifications when inventory levels reach minimum thresholds.",
        plans: { Retail: true, Wholesale: true },
      },
      {
        name: "Multi-warehouse management",
        tooltip:
          "Track inventory across multiple warehouses with transfer management.",
        plans: { Wholesale: true },
      },
      {
        name: "Batch & serial number tracking",
        tooltip:
          "Track products by batch numbers or serial numbers for compliance.",
        plans: { Wholesale: true },
      },
    ],
  },
  {
    name: "Business Intelligence",
    features: [
      {
        name: "Financial data retention",
        tooltip:
          "Historical data access for financial reporting and compliance.",
        plans: { Solo: "1 year", Retail: "3 years", Wholesale: "7 years" },
      },
      {
        name: "Fraud detection & alerts",
        tooltip:
          "AI-powered detection of unusual transactions and suspicious activities.",
        plans: { Retail: true, Wholesale: true },
      },
      {
        name: "Custom reports & dashboards",
        tooltip:
          "Build custom financial and operational reports with scheduled exports.",
        plans: { Solo: "Pre-built only", Retail: "10+ custom", Wholesale: "Unlimited + BI" },
      },
    ],
  },
  {
    name: "Customer Success",
    features: [
      {
        name: "Support channels",
        plans: {
          Solo: "Email",
          Retail: "Email + Chat",
          Wholesale: "Priority + Phone",
        },
      },
      {
        name: "Response time SLA",
        plans: { Solo: "48 hours", Retail: "24 hours", Wholesale: "4 hours" },
      },
      {
        name: "Dedicated account manager",
        plans: { Wholesale: true },
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
    <div className="pricing-root">
      <section
        aria-labelledby="pricing-title"
        className="pricing-header-section"
      >
        <Badge>Pricing</Badge>
        <h1 className="pricing-title">
          Business management that scales with you
        </h1>
        <p className="pricing-description">
          From your first sale to enterprise operations, our flexible plans adapt to your business needs. Choose the tier that matches your growth stage and upgrade as you expand.
        </p>
      </section>
      <section
        id="pricing-overview"
        className="pricing-overview-section"
        aria-labelledby="pricing-overview"
      >
        <div className="billing-toggle-container">
          <Label
            htmlFor="switch"
            className="billing-label"
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
            className="billing-label"
          >
            Annual <span className="save-text">(Save 20%)</span>
          </Label>
        </div>
        <div className="pricing-cards-grid">
          {plans.map((plan, planIdx) => (
            <div key={planIdx} className="plan-card">
              {plan.isRecommended ? (
                <div className="plan-header-divider">
                  <div className="recommended-badge-container">
                    <div
                      className="recommended-line-wrapper"
                      aria-hidden="true"
                    >
                      <div className="recommended-line" />
                    </div>
                    <div className="recommended-text-wrapper">
                      <span className="recommended-text">
                        Most popular
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="plan-header-divider">
                  <div className="plan-divider-line" />
                </div>
              )}
              <div className="plan-content">
                <h2 className="plan-name">
                  {plan.name}
                </h2>
                <div className="plan-price-container">
                  <span className="plan-price">
                    {isVariablePrice(plan.price)
                      ? billingFrequency === "monthly"
                        ? plan.price.monthly
                        : plan.price.annually
                      : plan.price}
                  </span>
                  <div className="plan-billing-period">
                    {plan.isStarter ? "per month" : (
                      <>
                        per month<br />billed {billingFrequency}
                      </>
                    )}
                  </div>
                </div>
                <div className="plan-description-container">
                  <p className="plan-description-text">
                    {plan.description}
                  </p>
                  <div className="plan-button-container">
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
                  className="plan-capacity-list"
                >
                  {plan.capacity.map((feature, index) => (
                    <li
                      key={feature}
                      className="plan-capacity-item"
                    >
                      {index === 0 && (
                        <RiUserLine
                          className="capacity-icon"
                          aria-hidden="true"
                        />
                      )}
                      {index === 1 && (
                        <RiStoreLine
                          className="capacity-icon"
                          aria-hidden="true"
                        />
                      )}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <ul
                  role="list"
                  className="plan-features-list"
                >
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="plan-feature-item"
                    >
                      <RiCheckLine
                        className="feature-check-icon"
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
        className="testimonial-section"
        aria-labelledby="testimonial"
      >
        <Testimonial />
      </section>

      {/* plan details (xs-lg)*/}
      <section
        id="pricing-details"
        className="pricing-details-section"
        aria-labelledby="pricing-details"
      >
        <div className="pricing-details-mobile">
          {plans.map((plan) => (
            <div key={plan.name}>
              <div className="plan-details-card">
                <h2
                  id={plan.name}
                  className="plan-details-name"
                >
                  {plan.name}
                </h2>
                <p className="plan-details-price">
                  {isVariablePrice(plan.price)
                    ? `${
                        billingFrequency === "monthly"
                          ? plan.price.monthly
                          : plan.price.annually
                      } / month`
                    : `${plan.price} / month`}
                </p>
              </div>
              <ul
                role="list"
                className="plan-sections-list"
              >
                {sections.map((section) => (
                  <li key={section.name}>
                    <h3 className="section-heading">{section.name}</h3>
                    <ul
                      role="list"
                      className="section-features-list"
                    >
                      {section.features.map((feature) =>
                        feature.plans[plan.name] ? (
                          <li
                            key={feature.name}
                            className="section-feature-item"
                          >
                            <RiCheckLine
                              className="section-check-icon"
                              aria-hidden="true"
                            />
                            <span>
                              {feature.name}{" "}
                              {typeof feature.plans[plan.name] === "string" ? (
                                <span className="feature-value-text">
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
      <section className="pricing-table-section">
        <div className="pricing-table-wrapper">
          <div className="table-container">
            <div className="table-sticky-header-spacer" />
            <table className="pricing-table">
              <caption className="sr-only">Pricing plan comparison</caption>
              <colgroup>
                <col className="col-feature-name" />
                <col className="col-plan" />
                <col className="col-plan" />
                <col className="col-plan" />
              </colgroup>
              <thead className="table-header">
                <tr>
                  <th
                    scope="col"
                    className="table-header-cell-first"
                  >
                    <div className="table-header-title">
                      Compare prices
                    </div>
                    <div className="table-header-subtitle">
                      Price per month (billed {billingFrequency})
                    </div>
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className="table-header-cell-plan"
                    >
                      <div
                        className={cx(
                          !plan.isStarter
                            ? "table-plan-name-premium"
                            : "table-plan-name-starter",
                        )}
                      >
                        {plan.name}
                      </div>
                      <div className="table-header-subtitle">
                        {isVariablePrice(plan.price)
                          ? `${
                              billingFrequency === "monthly"
                                ? plan.price.monthly
                                : plan.price.annually
                            } / month`
                          : `${plan.price} / month`}
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
                          sectionIdx === 0 ? "section-header-first" : "section-header-other",
                          "section-header-cell",
                        )}
                      >
                        {section.name}
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="feature-row"
                      >
                        <th
                          scope="row"
                          className="feature-name-cell"
                        >
                          <span>{feature.name}</span>
                          {feature.tooltip ? (
                            <Tooltip side="right" content={feature.tooltip}>
                              <RiInformationLine
                                className="info-icon"
                                aria-hidden="true"
                              />
                            </Tooltip>
                          ) : null}
                        </th>
                        {plans.map((plan) => (
                          <td
                            key={plan.name}
                            className="feature-value-cell"
                          >
                            {typeof feature.plans[plan.name] === "string" ? (
                              <div className="feature-value-string">
                                {feature.plans[plan.name]}
                              </div>
                            ) : (
                              <>
                                {feature.plans[plan.name] === true ? (
                                  <RiCheckLine
                                    className="check-icon-table"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <RiSubtractLine
                                    className="subtract-icon"
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
                    className="table-footer-row-header"
                  >
                    <span className="sr-only">Link to activate plan</span>
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.name} className="table-footer-cell">
                      {plan.isStarter ? (
                        <Button
                          variant="light"
                          asChild
                          className="table-button-starter group"
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
                          className="table-button-premium group"
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
