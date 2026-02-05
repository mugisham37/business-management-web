"use client"

import { Badge, BadgeProps } from "@/components/ui/Badge"
import { Checkbox } from "@/components/ui/Checkbox"
import { ProgressCircle } from "@/components/ui/ProgressCircle"
import { Agent } from "@/data/agents/schema"
import { statuses } from "@/data/data"
import { Usage } from "@/data/schema"
import { Ticket } from "@/data/support/schema"
import { cx, formatters, isValidNumber } from "@/lib/utils"
import {
  RiAlarmWarningLine,
  RiFileCheckLine,
  RiFileListLine,
  RiFolderReduceLine,
  RiShieldCheckFill,
} from "@remixicon/react"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { ButtonTicketGeneration } from "./ButtonTicketGeneration"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { ConditionFilter } from "./DataTableFilter"
import { DataTableRowActions } from "./DataTableRowActions"

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

const StabilityIndicator = ({ number }: { number: number }) => {
  if (!isValidNumber(number)) {
    return (
      <div className="flex gap-0.5" aria-label="Stability unknown">
        {[0, 1, 2].map((index) => (
          <div 
            key={index}
            className="h-3.5 w-1 rounded-sm bg-gray-300 dark:bg-gray-800" 
          />
        ))}
      </div>
    )
  }

  let category: "zero" | "bad" | "ok" | "good"
  let ariaLabel: string

  if (number === 0) {
    category = "zero"
    ariaLabel = "No stability data"
  } else if (number < 9) {
    category = "bad"
    ariaLabel = "Poor stability"
  } else if (number >= 9 && number <= 15) {
    category = "ok"
    ariaLabel = "Moderate stability"
  } else {
    category = "good"
    ariaLabel = "Good stability"
  }

  const getBarClass = (index: number) => {
    if (category === "zero") {
      return "bg-gray-300 dark:bg-gray-800"
    } else if (category === "good") {
      return "bg-emerald-500 dark:bg-emerald-400"
    } else if (category === "ok" && index < 2) {
      return "bg-yellow-500 dark:bg-yellow-400"
    } else if (category === "bad" && index < 1) {
      return "bg-red-500 dark:bg-red-400"
    }
    return "bg-gray-300 dark:bg-gray-800"
  }

  return (
    <div className="flex gap-0.5" aria-label={ariaLabel}>
      {[0, 1, 2].map((index) => (
        <div 
          key={index}
          className={`h-3.5 w-1 rounded-sm transition-colors ${getBarClass(index)}`} 
        />
      ))}
    </div>
  )
}

const DurationCell = ({ minutes }: { minutes: string | null }) => {
  if (minutes === null) return null
  const mins = parseInt(minutes)
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60

  return (
    <span className="ml-auto text-gray-600 dark:text-gray-300 tabular-nums">
      {hours > 0 ? `${hours}h ` : ""}
      {remainingMins}m
    </span>
  )
}

const PriorityBadge = ({ priority }: { priority: string }) => (
  <Badge
    variant="neutral"
    size="sm"
    className="gap-1.5 font-normal capitalize text-gray-700 dark:text-gray-300"
  >
    <span
      className={cx(
        "size-2 shrink-0 rounded-sm transition-colors",
        "bg-gray-500 dark:bg-gray-500",
        {
          "bg-emerald-600 dark:bg-emerald-400": priority === "low",
          "bg-gray-500 dark:bg-gray-500": priority === "medium",
          "bg-orange-500 dark:bg-orange-500": priority === "high",
          "bg-red-500 dark:bg-red-500": priority === "emergency",
        },
      )}
      aria-hidden="true"
    />
    {priority}
  </Badge>
)

// =============================================================================
// ICON MAPPINGS
// =============================================================================

const typeIconMapping: Record<string, React.ElementType> = {
  "fnol-contact": RiFolderReduceLine,
  "policy-contact": RiFileListLine,
  "claims-contact": RiFileCheckLine,
  "emergency-contact": RiAlarmWarningLine,
}

// =============================================================================
// USAGE COLUMNS
// =============================================================================

const usageColumnHelper = createColumnHelper<Usage>()

export const usageColumns = [
  usageColumnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={() => table.toggleAllPageRowsSelected()}
        className="translate-y-0.5"
        aria-label="Select all rows"
        variant="default"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        className="translate-y-0.5"
        aria-label={`Select row for ${row.getValue("owner")}`}
        variant="default"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      displayName: "Select",
    },
  }),
  usageColumnHelper.accessor("owner", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Owner",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <span className="font-medium text-gray-900 dark:text-gray-50">
          {value}
        </span>
      )
    },
  }),
  usageColumnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Status",
    },
    cell: ({ row }) => {
      const status = statuses.find(
        (item) => item.value === row.getValue("status"),
      )

      if (!status) {
        return (
          <Badge variant="neutral" size="sm" aria-label="Status: Unknown">
            Unknown
          </Badge>
        )
      }

      return (
        <Badge 
          variant={status.variant as BadgeProps["variant"]} 
          size="sm"
          aria-label={`Status: ${status.label}`}
        >
          {status.label}
        </Badge>
      )
    },
  }),
  usageColumnHelper.accessor("region", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Region" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Region",
    },
    filterFn: "arrIncludesSome",
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {value}
        </span>
      )
    },
  }),
  usageColumnHelper.accessor("stability", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stability" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Stability",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <div className="flex items-center gap-2">
          <span className="w-6 text-sm font-medium tabular-nums">
            {isValidNumber(value) ? value : "—"}
          </span>
          <StabilityIndicator number={value} />
        </div>
      )
    },
  }),
  usageColumnHelper.accessor("costs", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Costs" />
    ),
    enableSorting: true,
    meta: {
      className: "text-right",
      displayName: "Costs",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      
      if (!isValidNumber(value)) {
        return (
          <span className="font-medium text-gray-400 dark:text-gray-600">
            —
          </span>
        )
      }

      return (
        <span className="font-medium tabular-nums">
          {formatters.currency({ 
            number: value,
            maxFractionDigits: 2,
            minFractionDigits: 2,
            currency: "USD",
            locale: "en-US"
          })}
        </span>
      )
    },
    filterFn: (row, columnId, filterValue: ConditionFilter) => {
      const value = row.getValue(columnId) as number
      
      if (!isValidNumber(value) || !filterValue?.value) {
        return false
      }

      const [min, max] = filterValue.value as [number, number]

      switch (filterValue.condition) {
        case "is-equal-to":
          return Math.abs(value - min) < 0.01
        case "is-between":
          return value >= min && value <= max
        case "is-greater-than":
          return value > min
        case "is-less-than":
          return value < min
        default:
          return true
      }
    },
  }),
  usageColumnHelper.accessor("lastEdited", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last edited" />
    ),
    enableSorting: true,
    meta: {
      className: "tabular-nums",
      displayName: "Last edited",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
          {value || "—"}
        </span>
      )
    },
  }),
  usageColumnHelper.display({
    id: "edit",
    header: "Edit",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-right",
      displayName: "Edit",
    },
    cell: ({ row }) => <DataTableRowActions row={row} />,
  }),
] as ColumnDef<Usage>[]

// =============================================================================
// AGENT COLUMNS
// =============================================================================

const agentColumnHelper = createColumnHelper<Agent>()

export const agentColumns = [
  agentColumnHelper.accessor("registered", {
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    meta: {
      displayName: "Registered",
      className: "hidden",
    },
  }),
  agentColumnHelper.accessor("full_name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Agent",
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {row.original.full_name}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-500 dark:text-gray-500">AgID </span>
            <span className="font-mono font-medium uppercase tabular-nums text-gray-900 dark:text-gray-50">
              {row.original.agent_id}
            </span>
            <RiShieldCheckFill
              className={cx(
                "size-3 shrink-0 transition-colors",
                row.original.registered
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-600",
              )}
              aria-label={row.original.registered ? "Registered" : "Not registered"}
            />
          </div>
        </div>
      )
    },
  }),
  agentColumnHelper.accessor("number", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact Information" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Contact Information",
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-gray-900 dark:text-gray-50 tabular-nums">
            {row.original.number.replace(
              /(\+41)(\d{2})(\d{3})(\d{2})(\d{2})/,
              "$1 $2 $3 $4 $5",
            )}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {row.original.email}
          </span>
        </div>
      )
    },
  }),
  agentColumnHelper.accessor("end_date", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contract Dates" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Contract Dates",
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="tabular-nums text-gray-900 dark:text-gray-50">
            {row.original.end_date ? (
              <>
                End:{" "}
                {new Date(row.original.end_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </>
            ) : (
              <Badge size="sm" variant="success" aria-label="Contract status: Active">
                Active
              </Badge>
            )}
          </span>
          <span className="text-xs tabular-nums text-gray-500 dark:text-gray-500">
            Start:{" "}
            {new Date(row.original.start_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
      )
    },
  }),
  agentColumnHelper.accessor("account", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Account",
    },
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-gray-900 dark:text-gray-50">
            {row.original.account}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Main division
          </span>
        </div>
      )
    },
  }),
  agentColumnHelper.accessor("minutes_called", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacity (mins)" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Capacity (mins)",
    },
    cell: ({ row }) => {
      const { minutes_called, minutes_booked } = row.original

      const calculatePercentage = () => {
        if (!minutes_booked || minutes_booked === 0) return 0
        return (minutes_called / minutes_booked) * 100
      }

      const capacity = calculatePercentage()

      const getColorByCapacity = (value: number): "default" | "warning" | "error" => {
        const fixedValue = parseFloat(value.toFixed(0))
        if (fixedValue >= 85) return "error"
        if (fixedValue > 60) return "warning"
        return "default"
      }

      return (
        <div className="flex gap-2">
          <div className="flex items-center gap-x-2.5">
            <ProgressCircle
              value={capacity}
              radius={14}
              strokeWidth={3}
              variant={getColorByCapacity(capacity)}
              showAnimation={true}
              aria-label={`Capacity: ${capacity.toFixed(0)}%`}
            >
              <span className="text-[11px] font-semibold tabular-nums">
                {capacity.toFixed(0)}
              </span>
            </ProgressCircle>
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-gray-900 dark:text-gray-50">
              <span className="text-gray-500 dark:text-gray-500">Called </span>
              <span className="font-medium tabular-nums">
                {formatters.unit({ number: minutes_called, maxFractionDigits: 0 })}
              </span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">
              Booked {formatters.unit({ number: minutes_booked, maxFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )
    },
  }),
  agentColumnHelper.accessor("ticket_generation", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ticket Generation" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Ticket Generation",
    },
    cell: ({ row }) => {
      return (
        <ButtonTicketGeneration initialState={row.original.ticket_generation} />
      )
    },
  }),
] as ColumnDef<Agent>[]

// =============================================================================
// TICKET COLUMNS
// =============================================================================

export const ticketColumns = [
  {
    header: "Created at",
    accessorKey: "created",
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Created at",
    },
    cell: ({ row }: { row: { original: Ticket } }) => (
      <span className="tabular-nums text-gray-900 dark:text-gray-50">
        {new Date(row.original.created).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Description",
    },
    cell: ({ row }: { row: { original: Ticket } }) => (
      <span className="font-medium text-gray-900 dark:text-gray-50">
        {row.original.description}
      </span>
    ),
  },
  {
    header: "Policy Info",
    accessorKey: "policyNumber",
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Policy Info",
    },
    cell: ({ row }: { row: { original: Ticket } }) => (
      <span className="font-medium tabular-nums text-gray-900 dark:text-gray-50">
        {row.original.policyNumber}
      </span>
    ),
  },
  {
    header: "Contact Type",
    accessorKey: "type",
    enableSorting: true,
    filterFn: "arrIncludesSome",
    meta: {
      className: "text-left",
      displayName: "Contact Type",
    },
    cell: ({ row }: { row: { original: Ticket } }) => {
      const Icon = typeIconMapping[row.original.type]
      return (
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon 
              className="size-4 shrink-0 text-gray-500 dark:text-gray-400" 
              aria-hidden="true" 
            />
          )}
          <span className="capitalize text-gray-900 dark:text-gray-50">
            {row.original.type.replace("-contact", "")}
          </span>
        </div>
      )
    },
  },
  {
    header: "Duration",
    accessorKey: "duration",
    enableSorting: true,
    meta: {
      className: "text-right",
      displayName: "Duration",
    },
    cell: ({ row }: { row: { original: Ticket } }) => (
      <div className="flex items-center justify-end gap-2">
        <DurationCell minutes={row.original.duration} />
      </div>
    ),
  },
  {
    header: "Assessed Priority",
    accessorKey: "priority",
    enableSorting: true,
    filterFn: "arrIncludesSome",
    meta: {
      className: "text-left",
      displayName: "Assessed Priority",
    },
    cell: ({ row }: { row: { original: Ticket } }) => (
      <PriorityBadge priority={row.original.priority} />
    ),
  },
] as ColumnDef<Ticket>[]

// =============================================================================
// LEGACY EXPORTS (Backward Compatibility)
// =============================================================================

export const columns = usageColumns
