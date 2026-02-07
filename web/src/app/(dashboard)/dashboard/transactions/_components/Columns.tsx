"use client"

import { Badge, BadgeProps } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { expense_statuses, Transaction } from "@/data/schema"
import { formatters } from "@/lib/utils"
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table"
import { format } from "date-fns"
import { Ellipsis } from "lucide-react"
import { DataTableColumnHeader } from "@/components/Dashboard/data-table/DataTableColumnHeader"

const columnHelper = createColumnHelper<Transaction>()

export const getColumns = ({
  onEditClick,
}: {
  onEditClick: (row: Row<Transaction>) => void
}) =>
  [
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
          className="checkbox-aligned"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          onCheckedChange={() => row.toggleSelected()}
          className="checkbox-aligned"
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        displayName: "Select",
      },
    }),
    columnHelper.accessor("transaction_date", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purchased on" />
      ),
      cell: ({ getValue }) => {
        const date = getValue()
        return format(new Date(date), "MMM dd, yyyy 'at' h:mma")
      },
      enableSorting: true,
      enableHiding: false,
      meta: {
        className: "tabular-nums",
        displayName: "Purchased",
      },
    }),
    columnHelper.accessor("expense_status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      enableSorting: true,
      meta: {
        className: "text-left",
        displayName: "Status",
      },
      cell: ({ row }) => {
        const statusValue = row.getValue("expense_status")
        const status = expense_statuses.find(
          (item) => item.value === statusValue,
        )
        if (!status) {
          return statusValue // Fallback to displaying the raw status
        }
        return (
          <Badge variant={status.variant as BadgeProps["variant"]}>
            {status.label}
          </Badge>
        )
      },
    }),
    columnHelper.accessor("merchant", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Merchant" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "Merchant",
      },
      filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor("category", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      enableSorting: false,
      meta: {
        className: "text-left",
        displayName: "Category",
      },
    }),
    columnHelper.accessor("amount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      enableSorting: true,
      meta: {
        className: "text-right",
        displayName: "Amount",
      },
      cell: ({ getValue }) => {
        return (
          <span className="font-medium">
            {formatters.currency({ number: getValue() })}
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
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => onEditClick?.(row)}
            className="edit-button-transaction group hover:border hover:border-[var(--edit-button-border-hover)] data-[state=open]:border data-[state=open]:border-[var(--edit-button-border-hover)] data-[state=open]:bg-[var(--edit-button-bg-open)]"
          >
            <Ellipsis
              className="edit-button-icon group-hover:text-[var(--edit-button-icon-hover-color)] group-data-[state=open]:text-[var(--edit-button-icon-hover-color)]"
              aria-hidden="true"
            />
          </Button>
        )
      },
    }),
  ] as ColumnDef<Transaction>[]
