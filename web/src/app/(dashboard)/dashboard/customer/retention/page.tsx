"use client"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContentFull,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Divider } from "@/components/ui/Divider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/Table"
import { cohorts } from "@/data/retention/cohorts"
import { cohortsAggregate } from "@/data/retention/cohortsAggregate"
import {
  ActivitySummary,
  ChannelDistribution,
  CohortData,
  CohortRetentionData,
  PerformanceMetrics,
  SatisfactionMetrics,
  TopIssue,
} from "@/data/retention/schema"
import { valueFormatter } from "@/lib/formatters"
import { cx } from "@/lib/utils"
import { RiCloseLine, RiExpandDiagonalLine } from "@remixicon/react"
import { useState } from "react"

const getCohortColorClass = (
  value: number,
  minValue: number,
  maxValue: number,
): string => {
  const normalizedValue = (value - minValue) / (maxValue - minValue)
  const index = Math.min(
    Math.floor(normalizedValue * 7),
    6,
  )
  return `cohort-color-${index + 1}`
}

const getCohortTextClass = (value: number, minValue: number, maxValue: number): string => {
  return (value - minValue) / (maxValue - minValue) > 0.6
    ? "cohort-text-light"
    : "cohort-text-dark"
}

const getBackgroundColor = getCohortColorClass
const getTextColor = getCohortTextClass

interface CohortDetailsDialogProps {
  cohort: CohortData | null
  cohortKey: string | null
  isOpen: boolean
  onClose: () => void
}

const CohortDetailsDialog = ({
  cohort,
  cohortKey,
  isOpen,
  onClose,
}: CohortDetailsDialogProps) => {
  if (!cohort) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContentFull 
        className="fixed inset-4 mx-auto flex flex-col overflow-hidden rounded-lg p-0 shadow-lg"
        style={{
          width: '95vw',
          maxWidth: 'var(--container-max-width-lg)'
        }}
      >
        <DialogHeader 
          className="flex-none border-b px-6 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <DialogTitle 
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)'
            }}
          >
            Cohort Details
          </DialogTitle>
          <DialogDescription 
            className="sm:text-sm/6"
            style={{ 
              marginTop: 'var(--spacing-xs)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-normal)'
            }}
          >
            Detailed metrics for cohort starting {cohortKey} with {cohort.size}{" "}
            initial customers
          </DialogDescription>
          <DialogClose asChild>
            <Button 
              className="absolute p-2" 
              variant="ghost"
              style={{
                right: 'var(--spacing-md)',
                top: 'var(--spacing-md)'
              }}
            >
              <RiCloseLine 
                className="shrink-0" 
                style={{
                  width: 'var(--icon-size-settings-default)',
                  height: 'var(--icon-size-settings-default)'
                }}
              />
            </Button>
          </DialogClose>
        </DialogHeader>

        <DialogBody 
          className="flex-1 overflow-y-auto"
          style={{ padding: 'var(--spacing-lg)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Activity Metrics */}
            <section>
              <h3 
                className="mb-3"
                style={{
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--foreground)'
                }}
              >
                Activity Summary
              </h3>
              <div 
                className="grid grid-cols-2"
                style={{ gap: 'var(--spacing-md)' }}
              >
                {Object.entries(
                  cohort.summary.activity as Record<
                    keyof ActivitySummary,
                    number
                  >,
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <span 
                      className="text-sm capitalize"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span style={{ fontWeight: 'var(--font-medium)' }}>
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Satisfaction Metrics */}
            <section>
              <h3 
                className="mb-3"
                style={{
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--foreground)'
                }}
              >
                Customer Satisfaction
              </h3>
              <div 
                className="grid grid-cols-2"
                style={{ gap: 'var(--spacing-md)' }}
              >
                {Object.entries(
                  cohort.summary.satisfaction as Record<
                    keyof SatisfactionMetrics,
                    number
                  >,
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <span 
                      className="text-sm capitalize"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span style={{ fontWeight: 'var(--font-medium)' }}>
                      {key.includes("score")
                        ? `${value}%`
                        : value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Performance Metrics */}
            <section>
              <h3 
                className="mb-3"
                style={{
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--foreground)'
                }}
              >
                Performance Metrics
              </h3>
              <div 
                className="grid grid-cols-2"
                style={{ gap: 'var(--spacing-md)' }}
              >
                {Object.entries(
                  cohort.summary.performance as Record<
                    keyof PerformanceMetrics,
                    number
                  >,
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <span 
                      className="text-sm capitalize"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span style={{ fontWeight: 'var(--font-medium)' }}>
                      {key.includes("rate")
                        ? `${(value * 100).toFixed(1)}%`
                        : `${value} mins`}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Issues */}
            <section>
              <h3 
                className="mb-3"
                style={{
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--foreground)'
                }}
              >
                Top Issues
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {cohort.summary.top_issues.map(
                  (issue: TopIssue, index: number) => (
                    <div
                      key={index}
                      className="rounded-lg p-3"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ fontWeight: 'var(--font-medium)' }}>{issue.category}</span>
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {issue.count} tickets
                        </span>
                      </div>
                      <div 
                        className="h-2 rounded"
                        style={{ 
                          marginTop: 'var(--spacing-xs)',
                          backgroundColor: 'var(--border)'
                        }}
                      >
                        <div
                          className="h-full rounded"
                          style={{ 
                            width: `${issue.resolution_rate * 100}%`,
                            backgroundColor: 'var(--primary)'
                          }}
                        />
                      </div>
                      <div 
                        className="text-sm"
                        style={{ 
                          marginTop: 'var(--spacing-xs)',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        {(issue.resolution_rate * 100).toFixed(1)}% resolved
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* Channel Distribution */}
            <section>
              <h3 
                className="mb-3"
                style={{
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--foreground)'
                }}
              >
                Channel Distribution
              </h3>
              <div 
                className="grid grid-cols-4"
                style={{ gap: 'var(--spacing-md)' }}
              >
                {Object.entries(
                  cohort.summary.channels as Record<
                    keyof ChannelDistribution,
                    number
                  >,
                ).map(([channel, value]) => (
                  <div
                    key={channel}
                    className="rounded-lg p-3 text-center"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <span 
                      className="mb-1 block text-sm capitalize"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {channel}
                    </span>
                    <span 
                      className="block text-lg"
                      style={{ fontWeight: 'var(--font-medium)' }}
                    >
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </DialogBody>
        <DialogFooter 
          className="flex-none border-t px-6 py-4"
          style={{ 
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)'
          }}
        >
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContentFull>
    </Dialog>
  )
}

export default function CohortRetention() {
  const [selectedCohort, setSelectedCohort] = useState<CohortData | null>(null)
  const [selectedCohortKey, setSelectedCohortKey] = useState<string | null>(
    null,
  )

  const cohortEntries = Object.entries(cohorts as CohortRetentionData)
  const weeksCount = cohortEntries[0]?.[1].weeks.length ?? 0
  const weeks = Array.from({ length: weeksCount }, (_, i) => i)

  return (
    <main>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Cohort Retention
          </h1>
          <p className="page-description">
            Track customer engagement patterns and analyze support trends across
            user segments
          </p>
        </div>
      </div>
      <Divider />
      <section className="mt-8">
        <TableRoot className="overflow-scroll">
          <Table className="border-none">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="cohort-table-header-sticky">
                  <span className="block">Cohort</span>
                  <span className="block font-normal text-[var(--muted-foreground)]">
                    Initial customers
                  </span>
                </TableHeaderCell>
                {weeks.map((week) => (
                  <TableHeaderCell
                    key={week}
                    className="border-none font-medium"
                  >
                    Week {week}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody className="divide-none">
              {cohortEntries.map(
                ([cohortKey, cohortData]: [string, CohortData]) => (
                  <TableRow key={cohortKey} className="h-full">
                    <TableCell className="cohort-table-header-sticky h-full sm:min-w-56">
                      <button
                        className="cohort-cell-button focus-ring"
                        onClick={() => {
                          setSelectedCohort(cohortData)
                          setSelectedCohortKey(cohortKey)
                        }}
                      >
                        <span
                          className="cohort-expand-icon"
                          aria-hidden="true"
                        >
                          <RiExpandDiagonalLine className="size-5 shrink-0" />
                        </span>
                        <span className="block text-sm font-medium text-[var(--foreground)]">
                          {cohortKey}
                        </span>
                        <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">
                          {valueFormatter(cohortData.size)} customers
                        </span>
                      </button>
                    </TableCell>
                    {cohortData.weeks.map((weekData, weekIndex) => (
                      <TableCell
                        key={weekIndex}
                        className="h-full min-w-24 p-[2px]"
                      >
                        {weekData === null ? (
                          <div className="cohort-cell-empty">
                            <span className="cohort-cell-empty-skeleton h-3 w-9" />
                            <span className="cohort-cell-empty-skeleton mt-1 h-3 w-6" />
                          </div>
                        ) : (
                          <div
                            className={cx(
                              "cohort-cell-value",
                              getBackgroundColor(weekData.percentage, 0, 100),
                              getTextColor(weekData.percentage, 0, 100),
                            )}
                          >
                            <span className="block text-sm font-medium">
                              {weekData.percentage.toFixed(1)}%
                            </span>
                            <span
                              className={cx(
                                "mt-0.5 block text-sm",
                                getTextColor(weekData.percentage, 0, 100),
                              )}
                            >
                              {weekData.count}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TableRoot>
        <CohortDetailsDialog
          cohort={selectedCohort}
          cohortKey={selectedCohortKey}
          isOpen={!!selectedCohort}
          onClose={() => {
            setSelectedCohort(null)
            setSelectedCohortKey(null)
          }}
        />
      </section>
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Cohort Analytics
        </h2>

        <div className="retention-analytics-grid">
          <Card className="retention-analytics-main">
            <p className="font-semibold text-[var(--foreground)]">
              Cohort Statistics
            </p>
            <dl className="retention-stats-grid">
              {/* Left Column */}
              <div className="retention-stat-item">
                <div>
                  <dt className="retention-stat-label">
                    Total Users
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.totalUsers.toLocaleString()}
                    </span>
                    <span className="retention-stat-value-change">
                      +17%
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="retention-stat-label">
                    Average CSAT Score
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.aggregateMetrics.satisfaction.avgCsatScore.toFixed(
                        1,
                      )}
                    </span>
                    <span className="retention-stat-value-change">
                      +6%
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="retention-stat-label">
                    Average Response Time
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.aggregateMetrics.performance.avgResponseTimeMinutes.toFixed(
                        1,
                      )}
                      m
                    </span>
                    <span className="retention-stat-value-change">
                      +12%
                    </span>
                  </dd>
                </div>
              </div>

              {/* Middle Column */}
              <div className="retention-stat-item">
                <div>
                  <dt className="retention-stat-label">
                    Total Tickets
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.aggregateMetrics.activity.totalTicketsCreated.toLocaleString()}
                    </span>
                    <span className="retention-stat-value-change">
                      +11%
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="retention-stat-label">
                    Resolution Rate
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {(
                        cohortsAggregate.aggregateMetrics.activity
                          .ticketResolutionRate * 100
                      ).toFixed(1)}
                      %
                    </span>
                    <span className="retention-stat-value-change">
                      +2%
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="retention-stat-label">
                    Total Cohorts
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.totalCohorts}
                    </span>
                    <span className="retention-stat-value-change">
                      +5%
                    </span>
                  </dd>
                </div>
              </div>
              {/* Right Column */}
              <div className="retention-stat-item">
                <div>
                  <dt className="retention-stat-label">
                    Avg. Handling Time
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.aggregateMetrics.performance.avgHandlingTimeMinutes.toFixed(
                        1,
                      )}
                      m
                    </span>
                    <span className="retention-stat-value-change">
                      +21%
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="retention-stat-label">
                    First Contact Resolution
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {(
                        cohortsAggregate.aggregateMetrics.performance
                          .avgFirstContactResolutionRate * 100
                      ).toFixed(1)}
                      %
                    </span>
                    <span className="retention-stat-value-change">
                      +3%
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="retention-stat-label">
                    Retention Rate
                  </dt>
                  <dd className="retention-stat-value">
                    <span className="retention-stat-value-main">
                      {cohortsAggregate.aggregateMetrics.retention.overallRetentionRate.toFixed(
                        1,
                      )}
                      %
                    </span>
                    <span className="retention-stat-value-change">
                      +2%
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card className="retention-analytics-sidebar">
            <p className="font-semibold text-[var(--foreground)]">
              Top Issues
            </p>
            <ol className="mt-4 divide-y divide-[var(--border)]">
              {cohortsAggregate.commonIssues
                .sort((a, b) => b.totalCount - a.totalCount)
                .slice(0, 6)
                .map((issue, index) => {
                  const totalCount = cohortsAggregate.commonIssues.reduce(
                    (sum, issue) => sum + issue.totalCount,
                    0,
                  )
                  return (
                    <li
                      key={issue.category}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {index + 1}.
                        </span>
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {issue.category}
                        </span>
                      </div>
                      <div className="text-sm tabular-nums text-[var(--muted-foreground)]">
                        {Math.round((issue.totalCount / totalCount) * 100)}% (
                        {issue.totalCount.toLocaleString()})
                      </div>
                    </li>
                  )
                })}
            </ol>
          </Card>
        </div>
      </section>
    </main>
  )
}
