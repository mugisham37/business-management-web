"use client"

import { Badge, BadgeProps } from "@/components/ui/Badge"
import { Checkbox } from "@/components/ui/Checkbox"
import { statuses } from "@/data/data"
import { Usage } from "@/data/schema"
import { formatters, isValidNumber } from "@/lib/utils"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { ConditionFilter } from "./DataTableFilter"
import { DataTableRowActions } from "./DataTableRowActions"

const columnHelper = createColumnHelper<Usage>()

export const columns = [
  columnHelper.display({
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
  columnHelper.accessor("owner", {
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
  columnHelper.accessor("status", {
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
          <Badge variant="neutral" size="sm">
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
  columnHelper.accessor("region", {
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
  columnHelper.accessor("stability", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stability" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Stability",
    },
    cell: ({ getValue }) => {
      const value = getValue()

      function StabilityIndicator({ number }: { number: number }) {
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
  columnHelper.accessor("costs", {
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
  columnHelper.accessor("lastEdited", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last edited" />
    ),
    enableSorting: false,
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
  columnHelper.display({
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
"use client"

import { Badge } from "@/components/Badge"
import { ProgressCircle } from "@/components/ProgressCircle"
import { Agent } from "@/data/agents/schema"
import { cx } from "@/lib/utils"
import { RiShieldCheckFill } from "@remixicon/react"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { ButtonTicketGeneration } from "./ButtonTicketGeneration"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

const columnHelper = createColumnHelper<Agent>()

export const columns = [
  columnHelper.accessor("registered", {
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    meta: {
      displayName: "Registered",
      className: "hidden",
    },
  }),
  columnHelper.accessor("full_name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent" />
    ),
    enableSorting: true,
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
                "size-3 shrink-0",
                row.original.registered
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-600",
              )}
            />
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor("number", {
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
          <span className="text-gray-900 dark:text-gray-50">
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
  columnHelper.accessor("end_date", {
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
              <Badge className="px-1.5 py-0.5" variant="success">
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
  columnHelper.accessor("account", {
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

  columnHelper.accessor("minutes_called", {
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

      const getColorByCapacity = (value: number) => {
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
              aria-hidden={true}
            >
              <span className="text-[11px] font-semibold">
                {capacity.toFixed(0)}
              </span>
            </ProgressCircle>
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-gray-900 dark:text-gray-50">
              <span className="text-gray-500 dark:text-gray-500">Called </span>
              <span className="font-medium">
                {new Intl.NumberFormat().format(minutes_called)}
              </span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Booked {new Intl.NumberFormat().format(minutes_booked)}
            </span>
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor("ticket_generation", {
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
        <ButtonTicketGeneration initalState={row.original.ticket_generation} />
      )
    },
  }),
] as ColumnDef<Agent>[]
import { Badge } from "@/components/Badge"
import { Ticket } from "@/data/support/schema"
import { cx } from "@/lib/utils"
import {
  RiAlarmWarningLine,
  RiFileCheckLine,
  RiFileListLine,
  RiFolderReduceLine,
} from "@remixicon/react"
import { ColumnDef } from "@tanstack/react-table"

const typeIconMapping: Record<string, React.ElementType> = {
  "fnol-contact": RiFolderReduceLine,
  "policy-contact": RiFileListLine,
  "claims-contact": RiFileCheckLine,
  "emergency-contact": RiAlarmWarningLine,
}

export const columns = [
  {
    header: "Created at",
    accessorKey: "created",
    meta: {
      className: "text-left",
    },
    cell: ({ row }) => (
      <>
        {new Date(row.original.created).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </>
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    meta: {
      className: "text-left",
      cell: "font-medium text-gray-900 dark:text-gray-50",
    },
  },
  {
    header: "Policy Info",
    accessorKey: "policyNumber",
    meta: {
      className: "text-left",
      cell: "font-medium",
    },
  },
  {
    header: "Contact Type",
    accessorKey: "type",
    meta: {
      className: "text-left",
    },
    cell: ({ row }) => {
      const Icon = typeIconMapping[row.original.type]
      return (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
          <span className="capitalize">
            {row.original.type.replace("-contact", "")}
          </span>
        </div>
      )
    },
  },
  {
    header: "Duration",
    accessorKey: "duration",
    meta: {
      className: "text-right",
    },
    cell: ({ row }) => {
      const DurationCell = (props: { minutes: string | null }) => {
        if (props.minutes === null) return null
        const mins = parseInt(props.minutes)
        const hours = Math.floor(mins / 60)
        const remainingMins = mins % 60

        return (
          <span className="ml-auto text-gray-600 dark:text-gray-300">
            {hours > 0 ? `${hours}h ` : ""}
            {remainingMins}m
          </span>
        )
      }
      return (
        <div className="flex items-center gap-2">
          <DurationCell minutes={row.original.duration} />
        </div>
      )
    },
  },
  {
    header: "Assessed Priority",
    accessorKey: "priority",
    meta: {
      className: "text-left",
    },
    cell: ({ row }) => (
      <Badge
        variant="neutral"
        className="gap-1.5 font-normal capitalize text-gray-700 dark:text-gray-300"
      >
        <span
          className={cx(
            "size-2 shrink-0 rounded-sm",
            "bg-gray-500 dark:bg-gray-500",
            {
              "bg-emerald-600 dark:bg-emerald-400":
                row.original.priority === "low",
            },
            {
              "bg-gray-500 dark:bg-gray-500":
                row.original.priority === "medium",
            },
            {
              "bg-orange-500 dark:bg-orange-500":
                row.original.priority === "high",
            },
            {
              "bg-red-500 dark:bg-red-500":
                row.original.priority === "emergency",
            },
          )}
          aria-hidden="true"
        />
        {row.original.priority}
      </Badge>
    ),
  },
] as ColumnDef<Ticket>[]
