import Code from "@/components/ui/Code"
import {
  RiLinksLine,
  RiPlugLine,
  RiShieldKeyholeLine,
  RiStackLine,
} from "@remixicon/react"
import { Badge } from "../ui/Badge"
import CodeExampleTabs from "./CodeExampleTabs"

const code = `Employee Management
• Track employee information and roles
• Monitor department assignments
• Manage hiring and onboarding processes
• Set up role-based permissions

Expense Tracking
• Submit and approve expense reports
• Categorize business expenses
• Track spending by department
• Generate expense analytics

Project Management
• Create and assign projects
• Set budgets and deadlines
• Monitor project progress
• Track team collaboration

Time & Attendance
• Log work hours and timesheets
• Track project time allocation
• Generate attendance reports
• Calculate billable hours`

const code2 = `Financial Overview

Revenue & Expenses
Track all business income and expenses in real-time. 
Monitor cash flow, profit margins, and financial health 
with automated reporting and analytics.

Approval Workflows
Set up multi-level approval processes for expenses, 
purchase orders, and budget requests. Ensure compliance 
and maintain control over business spending.

Team Collaboration
Enable seamless communication between departments. 
Share documents, assign tasks, and track progress 
across all your business operations.

Reporting & Analytics
Generate comprehensive reports on expenses, revenue, 
employee performance, and project metrics. Export data 
for accounting and compliance purposes.`

const features = [
  {
    name: "Integrate with your stack",
    description:
      "Connect seamlessly with your existing tools using our APIs and SDKs for all major platforms.",
    icon: RiStackLine,
  },
  {
    name: "Ready-to-use workflows",
    description:
      "Deploy automated approval workflows, expense tracking, and reporting directly from your dashboard.",
    icon: RiPlugLine,
  },
  {
    name: "Pre-built integrations",
    description:
      "Connect to accounting software, payroll systems, and business tools like Stripe, QuickBooks, and Xero.",
    icon: RiLinksLine,
  },
  {
    name: "Enterprise security",
    description:
      "Bank-level encryption with AES-256, role-based access control, and full audit trails for compliance.",
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
        Built by developers, <br /> for developers
      </h2>
      <p className="text-landing-body max-w-2xl text-lg" style={{ marginTop: 'var(--spacing-content-gap)' }}>
        Powerful query capabilities that let you filter expenses, track employee time, 
        and generate reports across all your business data with ease.
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
