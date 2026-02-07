"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table"
import { cx } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import { DataTableBulkEditor } from "./DataTableBulkEditor"
import { Filterbar } from "./DataTableFilterbar"
import { DataTablePagination } from "./DataTablePagination"

const fuzzyFilter: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string,
) => {
  const value = row.getValue(columnId)
  return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  enableRowSelection?: boolean
  enableGlobalFilter?: boolean
  enableColumnFilters?: boolean
  enableSorting?: boolean
  enableStriped?: boolean
  pageSize?: number
  className?: string
  variant?: "default" | "simple" | "advanced"
}

export function DataTable<TData>({
  columns,
  data,
  enableRowSelection = false,
  enableGlobalFilter = false,
  enableColumnFilters = true,
  enableSorting = true,
  enableStriped = false,
  pageSize = 20,
  className,
  variant = "default",
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const registeredFilterValue = columnFilters.find(
    (filter) => filter.id === "registered",
  )?.value as boolean | undefined

  const table = useReactTable({
    data,
    columns,
    enableColumnResizing: false,
    filterFns: {
      fuzzy: fuzzyFilter,
    } as any,
    sortingFns: {} as any,
    aggregationFns: {} as any,
    state: {
      rowSelection: enableRowSelection ? rowSelection : {},
      globalFilter: enableGlobalFilter ? globalFilter : "",
      columnFilters: enableColumnFilters ? columnFilters : [],
      sorting: enableSorting ? sorting : [],
    },
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onGlobalFilterChange: enableGlobalFilter ? setGlobalFilter : undefined,
    onColumnFiltersChange: enableColumnFilters ? setColumnFilters : undefined,
    onSortingChange: enableSorting ? setSorting : undefined,
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    enableRowSelection,
    enableGlobalFilter,
    enableColumnFilters,
    enableSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const renderFilterbar = () => {
    if (variant === "simple") return null
    
    if (enableGlobalFilter) {
      return (
        <Filterbar
          mode="global"
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          registeredOnly={Boolean(registeredFilterValue)}
          setRegisteredOnly={(checked: boolean) => {
            table.getColumn("registered")?.setFilterValue(checked || null)
          }}
        />
      )
    }
    
    if (enableColumnFilters) {
      return <Filterbar mode="table" table={table} />
    }
    
    return null
  }

  const getRowClassName = (row: any) => {
    const baseClasses = "group select-none"
    
    if (enableRowSelection) {
      return cx(
        baseClasses,
        "table-row-hover cursor-pointer",
        row.getIsSelected() && "table-row-selected"
      )
    }
    
    if (enableStriped) {
      return cx(baseClasses, "table-row-striped")
    }
    
    return cx(baseClasses, "table-row-hover")
  }

  const getCellClassName = (cell: any, row: any) => {
    const baseClasses = cx(
      "relative whitespace-nowrap",
      cell.column.columnDef.meta?.className,
      cell.column.columnDef.meta?.cell
    )
    
    if (variant === "simple") {
      return cx(baseClasses, "py-2.5")
    }
    
    if (enableRowSelection) {
      return cx(
        baseClasses,
        "py-1 first:w-10",
        row.getIsSelected() && "table-row-selected"
      )
    }
    
    return cx(baseClasses, "py-2.5")
  }

  const getHeaderClassName = () => {
    if (variant === "simple") {
      return "whitespace-nowrap py-2.5"
    }
    return "whitespace-nowrap py-1 text-sm sm:text-xs"
  }

  const getContainerSpacing = () => {
    switch (variant) {
      case "simple":
        return "mt-8 space-y-3"
      case "advanced":
        return "space-y-6"
      default:
        return "space-y-3"
    }
  }

  return (
    <div className={cx(getContainerSpacing(), className)}>
      {renderFilterbar()}
      
      <div className="relative overflow-hidden overflow-x-auto">
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-y"
                style={{ borderColor: 'var(--border)' }}
              >
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell
                    key={header.id}
                    className={cx(
                      getHeaderClassName(),
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={
                    enableRowSelection
                      ? () => row.toggleSelected(!row.getIsSelected())
                      : undefined
                  }
                  className={getRowClassName(row)}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      className={getCellClassName(cell, row)}
                    >
                      {cellIndex === 0 && enableRowSelection && row.getIsSelected() && (
                        <div className="table-row-selected-indicator" />
                      )}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {enableRowSelection && (
          <DataTableBulkEditor table={table} rowSelection={rowSelection} />
        )}
      </div>
      
      <DataTablePagination table={table} pageSize={pageSize} />
    </div>
  )
}
