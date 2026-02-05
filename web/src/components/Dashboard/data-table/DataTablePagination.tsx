import { Button } from "@/components/ui/Button"
import { cx } from "@/lib/utils"
import {
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Table } from "@tanstack/react-table"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSize: number
  showSelection?: boolean
  showRowInfo?: boolean
  isLoading?: boolean
}

export function DataTablePagination<TData>({
  table,
  pageSize,
  showSelection = true,
  showRowInfo = true,
  isLoading = false,
}: DataTablePaginationProps<TData>) {
  const paginationButtons = [
    {
      icon: RiArrowLeftDoubleLine,
      onClick: () => table.setPageIndex(0),
      disabled: !table.getCanPreviousPage(),
      srText: "Go to first page",
      ariaLabel: "Go to first page",
      mobileView: "hidden sm:flex",
    },
    {
      icon: RiArrowLeftSLine,
      onClick: () => table.previousPage(),
      disabled: !table.getCanPreviousPage(),
      srText: "Go to previous page",
      ariaLabel: "Go to previous page",
      mobileView: "",
    },
    {
      icon: RiArrowRightSLine,
      onClick: () => table.nextPage(),
      disabled: !table.getCanNextPage(),
      srText: "Go to next page",
      ariaLabel: "Go to next page",
      mobileView: "",
    },
    {
      icon: RiArrowRightDoubleLine,
      onClick: () => table.setPageIndex(table.getPageCount() - 1),
      disabled: !table.getCanNextPage(),
      srText: "Go to last page",
      ariaLabel: "Go to last page",
      mobileView: "hidden sm:flex",
    },
  ]

  const totalRows = table.getFilteredRowModel().rows.length
  const selectedRows = table.getFilteredSelectedRowModel().rows.length
  const currentPage = table.getState().pagination.pageIndex
  const firstRowIndex = totalRows > 0 ? currentPage * pageSize + 1 : 0
  const lastRowIndex = Math.min(totalRows, firstRowIndex + pageSize - 1)

  const handlePageNavigation = (onClick: () => void) => {
    onClick()
    table.resetRowSelection()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-6">
        {showSelection && selectedRows > 0 && (
          <div className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
            {selectedRows} of {totalRows} row{totalRows !== 1 ? "s" : ""} selected
          </div>
        )}
        {showRowInfo && (
          <p className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
            {totalRows > 0 ? (
              <>
                Showing{" "}
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {firstRowIndex}–{lastRowIndex}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {totalRows}
                </span>
              </>
            ) : (
              "No results"
            )}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:justify-end">
        {paginationButtons.map((button, index) => (
          <Button
            key={index}
            variant="secondary"
            size="icon"
            className={cx(button.mobileView)}
            onClick={() => handlePageNavigation(button.onClick)}
            disabled={button.disabled || isLoading}
            isLoading={isLoading && !button.disabled}
            aria-label={button.ariaLabel}
          >
            <span className="sr-only">{button.srText}</span>
            <button.icon className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  )
}
