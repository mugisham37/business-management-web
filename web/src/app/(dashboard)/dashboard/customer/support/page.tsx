"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { CategoryBar } from "@/components/ui/CategoryBar"
import { Divider } from "@/components/ui/Divider"
import { LineChartSupport } from "@/components/ui/LineChartSupport"
import { ProgressCircle } from "@/components/ui/ProgressCircle"
import { TicketDrawer } from "@/components/Dashboard/customer/TicketDrawer"
import { DataTable } from "@/components/Dashboard/data-table/DataTable"
import { ticketColumns } from "@/components/Dashboard/data-table/columns"
import { tickets } from "@/data/support/tickets"
import { volume } from "@/data/support/volume"
import { RiAddLine } from "@remixicon/react"
import React from "react"

export default function SupportDashboard() {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <main>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Support Dashboard
          </h1>
          <p className="page-description">
            Real-time monitoring of support metrics with AI-powered insights
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-base sm:text-sm"
        >
          Create Ticket
          <RiAddLine className="-mr-0.5 size-5 shrink-0" aria-hidden="true" />
        </Button>
        <TicketDrawer open={isOpen} onOpenChange={setIsOpen} />
      </div>
      <Divider />
      <dl className="support-metrics-grid">
        <Card>
          <dt className="text-sm font-medium text-[var(--foreground)]">
            Current Tickets
          </dt>
          <dd className="support-metric-value">
            247
          </dd>
          <CategoryBar
            values={[82, 13, 5]}
            className="mt-6"
            colors={["blue", "lightGray", "red"]}
            showLabels={false}
          />
          <ul
            role="list"
            className="mt-4 flex flex-wrap gap-x-10 gap-y-4 text-sm"
          >
            <li>
              <span className="text-base font-semibold text-[var(--foreground)]">
                82%
              </span>
              <div className="support-legend-item">
                <span
                  className="support-legend-indicator bg-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="support-legend-label">Resolved</span>
              </div>
            </li>
            <li>
              <span className="text-base font-semibold text-[var(--foreground)]">
                13%
              </span>
              <div className="support-legend-item">
                <span
                  className="support-legend-indicator bg-[var(--muted)]"
                  aria-hidden="true"
                />
                <span className="support-legend-label">In Progress</span>
              </div>
            </li>
            <li>
              <span className="text-base font-semibold text-[var(--foreground)]">
                5%
              </span>
              <div className="support-legend-item">
                <span
                  className="support-legend-indicator bg-[var(--status-critical)]"
                  aria-hidden="true"
                />
                <span className="support-legend-label">Escalated</span>
              </div>
            </li>
          </ul>
        </Card>
        <Card>
          <dt className="text-sm font-medium text-[var(--foreground)]">
            SLA Performance
          </dt>
          <div className="mt-4 flex flex-nowrap items-center justify-between gap-y-4">
            <dd className="space-y-3">
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">Within SLA</span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-[var(--foreground)]">
                  83.3%
                </span>
              </div>
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator bg-[var(--status-critical)]"
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">
                    SLA Breached
                  </span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-[var(--foreground)]">
                  16.7%
                </span>
              </div>
            </dd>
            <ProgressCircle value={83} radius={45} strokeWidth={7} />
          </div>
        </Card>
        <Card>
          <dt className="text-sm font-medium text-[var(--foreground)]">
            Call Volume Trends
          </dt>
          <div className="mt-4 flex items-center gap-x-8 gap-y-4">
            <dd className="space-y-3 whitespace-nowrap">
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">Today</span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-[var(--foreground)]">
                  573
                </span>
              </div>
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator bg-[var(--muted)]"
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">Yesterday</span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-[var(--foreground)]">
                  451
                </span>
              </div>
            </dd>
            <LineChartSupport
              className="h-28"
              data={volume}
              index="time"
              categories={["Today", "Yesterday"]}
              colors={["blue", "lightGray"]}
              showTooltip={false}
              valueFormatter={(number: number) =>
                Intl.NumberFormat("us").format(number).toString()
              }
              startEndOnly={true}
              showYAxis={false}
              showLegend={false}
            />
          </div>
        </Card>
      </dl>
      <DataTable data={tickets} columns={ticketColumns} />
    </main>
  )
}
