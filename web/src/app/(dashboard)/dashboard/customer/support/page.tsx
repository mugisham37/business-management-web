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
          className="flex items-center text-base sm:text-sm"
          style={{ gap: 'var(--spacing-xs)' }}
        >
          Create Ticket
          <RiAddLine 
            className="-mr-0.5 shrink-0" 
            style={{
              width: 'var(--icon-size-settings-default)',
              height: 'var(--icon-size-settings-default)'
            }}
            aria-hidden="true" 
          />
        </Button>
        <TicketDrawer open={isOpen} onOpenChange={setIsOpen} />
      </div>
      <Divider />
      <dl className="support-metrics-grid">
        <Card>
          <dt 
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--foreground)'
            }}
          >
            Current Tickets
          </dt>
          <dd className="support-metric-value">
            247
          </dd>
          <CategoryBar
            values={[82, 13, 5]}
            style={{ marginTop: 'var(--spacing-lg)' }}
            colors={["blue", "lightGray", "red"]}
            showLabels={false}
          />
          <ul
            role="list"
            className="flex flex-wrap text-sm"
            style={{
              marginTop: 'var(--spacing-md)',
              gap: 'var(--spacing-md) 2.5rem'
            }}
          >
            <li>
              <span 
                className="text-base font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                82%
              </span>
              <div className="support-legend-item">
                <span
                  className="support-legend-indicator"
                  style={{ backgroundColor: 'var(--primary)' }}
                  aria-hidden="true"
                />
                <span className="support-legend-label">Resolved</span>
              </div>
            </li>
            <li>
              <span 
                className="text-base font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                13%
              </span>
              <div className="support-legend-item">
                <span
                  className="support-legend-indicator"
                  style={{ backgroundColor: 'var(--muted)' }}
                  aria-hidden="true"
                />
                <span className="support-legend-label">In Progress</span>
              </div>
            </li>
            <li>
              <span 
                className="text-base font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                5%
              </span>
              <div className="support-legend-item">
                <span
                  className="support-legend-indicator"
                  style={{ backgroundColor: 'var(--status-critical)' }}
                  aria-hidden="true"
                />
                <span className="support-legend-label">Escalated</span>
              </div>
            </li>
          </ul>
        </Card>
        <Card>
          <dt 
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--foreground)'
            }}
          >
            SLA Performance
          </dt>
          <div 
            className="flex flex-nowrap items-center justify-between"
            style={{ 
              marginTop: 'var(--spacing-md)',
              gap: 'var(--spacing-md)'
            }}
          >
            <dd style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator"
                    style={{ backgroundColor: 'var(--primary)' }}
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">Within SLA</span>
                </div>
                <span 
                  className="block font-semibold"
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--foreground)'
                  }}
                >
                  83.3%
                </span>
              </div>
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator"
                    style={{ backgroundColor: 'var(--status-critical)' }}
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">
                    SLA Breached
                  </span>
                </div>
                <span 
                  className="block font-semibold"
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--foreground)'
                  }}
                >
                  16.7%
                </span>
              </div>
            </dd>
            <ProgressCircle 
              value={83} 
              radius={45} 
              strokeWidth={7} 
            />
          </div>
        </Card>
        <Card>
          <dt 
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--foreground)'
            }}
          >
            Call Volume Trends
          </dt>
          <div 
            className="flex items-center"
            style={{ 
              marginTop: 'var(--spacing-md)',
              gap: 'var(--spacing-lg) var(--spacing-xl)'
            }}
          >
            <dd 
              className="whitespace-nowrap"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}
            >
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator"
                    style={{ backgroundColor: 'var(--primary)' }}
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">Today</span>
                </div>
                <span 
                  className="block font-semibold"
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--foreground)'
                  }}
                >
                  573
                </span>
              </div>
              <div>
                <div className="support-legend-item">
                  <span
                    className="support-legend-indicator"
                    style={{ backgroundColor: 'var(--muted)' }}
                    aria-hidden="true"
                  />
                  <span className="support-legend-label">Yesterday</span>
                </div>
                <span 
                  className="block font-semibold"
                  style={{
                    marginTop: 'var(--spacing-xs)',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--foreground)'
                  }}
                >
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
