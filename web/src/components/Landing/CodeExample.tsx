import Code from "@/components/ui/Code"
import {
  RiLinksLine,
  RiPlugLine,
  RiShieldKeyholeLine,
  RiStackLine,
} from "@remixicon/react"
import { Badge } from "../ui/Badge"
import CodeExampleTabs from "./CodeExampleTabs"

const code = `Inventory Management
• Track stock levels across locations
• Manage SKUs and product variants
• Automate reordering processes
• Monitor lot numbers and expiration dates

Sales & Point of Sale
• Process transactions online and offline
• Accept multiple payment methods
• Handle returns and exchanges
• Apply discounts and loyalty rewards

Customer Management
• Track purchase history and preferences
• Segment customers by behavior
• Run targeted marketing campaigns
• Manage loyalty programs

Financial Operations
• Generate invoices and track payments
• Monitor cash flow and profitability
• Manage accounts receivable/payable
• Export data for accounting`

const code2 = `Business Operations Dashboard

Inventory & Stock Control
Monitor real-time inventory levels across all locations. 
Track product movements, automate reordering, and manage 
suppliers with intelligent purchasing workflows.

Multi-Location Management
Coordinate operations across unlimited stores, warehouses, 
and facilities. Each location maintains independent settings 
while providing centralized oversight and reporting.

Sales & Customer Insights
Process transactions through integrated POS systems. 
Track customer relationships, purchase patterns, and 
loyalty programs to drive repeat business growth.

Financial Management
Access comprehensive financial reporting with real-time 
profit analysis by product, location, and time period. 
Integrate with accounting software for seamless operations.`

const features = [
  {
    name: "Integrate with your stack",
    description:
      "Connect seamlessly with payment processors, shipping carriers, and accounting software through our comprehensive APIs.",
    icon: RiStackLine,
  },
  {
    name: "Ready-to-use workflows",
    description:
      "Deploy automated inventory tracking, sales processing, and customer management directly from your dashboard.",
    icon: RiPlugLine,
  },
  {
    name: "Pre-built integrations",
    description:
      "Connect to essential business tools like Stripe, QuickBooks, Xero, Shopify, and major shipping carriers instantly.",
    icon: RiLinksLine,
  },
  {
    name: "Enterprise security",
    description:
      "Bank-level encryption with AES-256, multi-factor authentication, and complete audit trails for regulatory compliance.",
    icon: RiShieldKeyholeLine,
  },
]

export default function CodeExample() {
  return (
    <section
      aria-labelledby="code-example-title"
      className="mx-auto w-full max-w-6xl px-3"
      style={{ marginTop: 'var(--spacing-section-top)' }}
    >
      <Badge>Developer-first</Badge>
      <h2
        id="code-example-title"
        className="heading-gradient mt-2"
        style={{ 
          fontSize: 'var(--text-section-heading)',
          lineHeight: 'var(--leading-section)'
        }}
      >
        Designed for business, <br /> built for scale
      </h2>
      <p className="text-landing-body max-w-2xl text-lg" style={{ marginTop: 'var(--spacing-content-gap)' }}>
        Powerful management capabilities that let you track inventory, process sales, 
        manage customers, and analyze performance across your entire business operation.
      </p>
      <CodeExampleTabs
        tab1={
          <Code code={code} lang="sql" copy={false} className="h-[31rem]" />
        }
        tab2={
          <Code
            code={code2}
            lang="javascript"
            copy={false}
            className="h-[31rem]"
          />
        }
      />
      <dl className="mt-24 grid grid-cols-4 gap-10">
        {features.map((item) => (
          <div
            key={item.name}
            className="col-span-full sm:col-span-2 lg:col-span-1"
          >
            <div className="w-fit rounded-lg p-2 shadow-md shadow-primary/30 ring-1 ring-border">
              <item.icon
                aria-hidden="true"
                className="size-6 text-primary"
              />
            </div>
            <dt className="mt-6 font-semibold text-foreground">
              {item.name}
            </dt>
            <dd className="text-landing-body mt-2 leading-7">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
