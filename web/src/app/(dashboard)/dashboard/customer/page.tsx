"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function CustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Customer Management
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Manage your customers and track their interactions
        </p>
      </div>

      <div className="customer-card-grid">
        <Card className="customer-card">
          <h3 className="customer-card-title">
            Agents
          </h3>
          <p className="customer-card-description">
            Manage customer service agents
          </p>
          <Link href="/dashboard/customer/agents">
            <Button variant="outline" size="sm" className="w-full">
              View Agents
            </Button>
          </Link>
        </Card>

        <Card className="customer-card">
          <h3 className="customer-card-title">
            Retention
          </h3>
          <p className="customer-card-description">
            Track customer retention metrics
          </p>
          <Link href="/dashboard/customer/retention">
            <Button variant="outline" size="sm" className="w-full">
              View Retention
            </Button>
          </Link>
        </Card>

        <Card className="customer-card">
          <h3 className="customer-card-title">
            Support
          </h3>
          <p className="customer-card-description">
            Customer support tickets and issues
          </p>
          <Link href="/dashboard/customer/support">
            <Button variant="outline" size="sm" className="w-full">
              View Support
            </Button>
          </Link>
        </Card>

        <Card className="customer-card">
          <h3 className="customer-card-title">
            Workflow
          </h3>
          <p className="customer-card-description">
            Customer workflow automation
          </p>
          <Link href="/dashboard/customer/workflow">
            <Button variant="outline" size="sm" className="w-full">
              View Workflow
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
