import * as React from "react"
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"
import { Column } from "@tanstack/react-table"

import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { cx, focusRing } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  column: Column<TData, TValue>
  title: string
  showTooltip?: boolean
  enableDropdownMenu?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  showTooltip = true,
  enableDropdownMenu = false,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cx("select-none", className)} {...props}>
        {title}
      </div>
    )
  }

  const getSortTooltipContent = () => {
    const sortState = column.getIsSorted()
    if (sortState === "asc") return `Sorted ascending. Click to sort descending.`
    if (sortState === "desc") return `Sorted descending. Click to clear sorting.`
    return `Click to sort ascending.`
  }

  const handleSort = (direction?: "asc" | "desc") => {
    if (direction) {
      column.toggleSorting(direction === "desc")
    } else {
      const handler = column.getToggleSortingHandler()
      if (handler) {
        handler({} as React.MouseEvent<HTMLButtonElement>)
      }
    }
  }

  const sortButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        const handler = column.getToggleSortingHandler()
        if (handler) {
          handler(e)
        }
      }}
      className={cx(
        "-mx-2 h-auto justify-start gap-2 px-2 py-1 font-medium",
        "sort-button-base",
        column.getIsSorted() && "sort-button-active",
        focusRing,
        className
      )}
      aria-label={`Sort by ${title}`}
    >
      <span className="truncate">{title}</span>
      <div className="ml-auto flex flex-col -space-y-2">
        <RiArrowUpSLine
          className={cx(
            "size-3.5 text-gray-900 dark:text-gray-50",
            column.getIsSorted() === "desc" ? "sort-icon-inactive" : "sort-icon-active",
          )}
          aria-hidden="true"
        />
        <RiArrowDownSLine
          className={cx(
            "size-3.5 text-gray-900 dark:text-gray-50",
            column.getIsSorted() === "asc" ? "sort-icon-inactive" : "sort-icon-active",
          )}
          aria-hidden="true"
        />
      </div>
    </Button>
  )

  if (enableDropdownMenu) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {sortButton}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem onClick={() => handleSort("asc")}>
            <RiArrowUpSLine className="mr-2 size-4" />
            Sort ascending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("desc")}>
            <RiArrowDownSLine className="mr-2 size-4" />
            Sort descending
          </DropdownMenuItem>
          {column.getIsSorted() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                Clear sorting
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (showTooltip) {
    return (
      <Tooltip content={getSortTooltipContent()} side="top" delayDuration={500}>
        {sortButton}
      </Tooltip>
    )
  }

  return sortButton
}