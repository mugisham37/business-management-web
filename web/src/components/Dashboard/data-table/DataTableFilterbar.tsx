"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Searchbar } from "@/components/ui/SearchBar"
import { Switch } from "@/components/ui/Switch"
import { conditions, regions, statuses } from "@/data/data"
import { formatters } from "@/lib/utils"
import { RiDownloadLine } from "@remixicon/react"
import { Table } from "@tanstack/react-table"
import { useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { DataTableFilter } from "./DataTableFilter"
import { ViewOptions } from "./DataTableViewOptions"

interface DataTableFilterbarProps<TData> {
  table: Table<TData>
  onExport?: () => void
  exportLabel?: string
  isExporting?: boolean
  disabled?: boolean
  searchColumn?: string
  searchPlaceholder?: string
  showExport?: boolean
  showViewOptions?: boolean
}

interface GlobalFilterbarProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  registeredOnly?: boolean
  setRegisteredOnly?: (checked: boolean) => void
  switchLabel?: string
  switchId?: string
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  onClear?: () => void
  variant?: "default" | "contained"
  className?: string
}

interface UnifiedFilterbarProps<TData> extends Partial<DataTableFilterbarProps<TData>>, Partial<GlobalFilterbarProps> {
  mode: "table" | "global"
}

export function Filterbar<TData>({
  mode,
  table,
  onExport,
  exportLabel = "Export",
  isExporting = false,
  disabled = false,
  searchColumn = "owner",
  searchPlaceholder,
  showExport = true,
  showViewOptions = true,
  globalFilter = "",
  setGlobalFilter,
  registeredOnly = false,
  setRegisteredOnly,
  switchLabel = "Registered agents only",
  switchId = "registered-filter",
  placeholder = "Search all columns...",
  isLoading = false,
  onClear,
  variant = "default",
  className = "",
}: UnifiedFilterbarProps<TData>) {
  const [searchTerm, setSearchTerm] = useState<string>(globalFilter)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSetFilterValue = useDebouncedCallback((value: string) => {
    if (mode === "table" && table) {
      table.getColumn(searchColumn)?.setFilterValue(value)
    } else if (mode === "global" && setGlobalFilter) {
      setGlobalFilter(value)
    }
  }, 300)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    debouncedSetFilterValue(value)
  }

  const handleClear = () => {
    setSearchTerm("")
    if (mode === "table" && table) {
      table.getColumn(searchColumn)?.setFilterValue("")
    } else if (mode === "global" && setGlobalFilter) {
      setGlobalFilter("")
    }
    onClear?.()
    searchInputRef.current?.focus()
  }

  const handleClearAllFilters = () => {
    if (mode === "table" && table) {
      table.resetColumnFilters()
      setSearchTerm("")
    }
  }

  if (mode === "table" && table) {
    const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

    return (
      <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-x-6 ${className}`}>
        <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
          {table.getColumn("status")?.getIsVisible() && (
            <DataTableFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
              type="select"
              disabled={disabled}
              isLoading={isLoading}
            />
          )}
          {table.getColumn("region")?.getIsVisible() && (
            <DataTableFilter
              column={table.getColumn("region")}
              title="Region"
              options={regions}
              type="checkbox"
              disabled={disabled}
              isLoading={isLoading}
            />
          )}
          {table.getColumn("costs")?.getIsVisible() && (
            <DataTableFilter
              column={table.getColumn("costs")}
              title="Costs"
              type="number"
              options={conditions}
              formatter={formatters.currency}
              disabled={disabled}
              isLoading={isLoading}
            />
          )}
          {table.getColumn(searchColumn)?.getIsVisible() && (
            <Searchbar
              ref={searchInputRef}
              placeholder={searchPlaceholder || `Search by ${searchColumn}...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:max-w-[250px]"
              containerClassName="w-full sm:w-auto"
              disabled={disabled}
              variant="filled"
              size="default"
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleClearAllFilters}
              disabled={disabled}
              className="border px-2 font-semibold sm:border-none sm:py-1"
              style={{ 
                color: 'var(--primary)',
                borderColor: 'var(--border)'
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showExport && (
            <Button
              variant="secondary"
              onClick={onExport}
              disabled={disabled}
              isLoading={isExporting}
              loadingText="Exporting..."
              className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
            >
              <RiDownloadLine className="size-4 shrink-0" aria-hidden="true" />
              {exportLabel}
            </Button>
          )}
          {showViewOptions && <ViewOptions table={table} />}
        </div>
      </div>
    )
  }

  if (mode === "global") {
    const containerClasses = variant === "contained" 
      ? "flex flex-wrap items-center justify-between gap-6 rounded-lg p-6 ring-1"
      : "flex flex-wrap items-center justify-between gap-6"
    
    const containerStyle = variant === "contained"
      ? {
          backgroundColor: 'var(--settings-section-bg-elevated)',
          '--ring-color': 'var(--border)',
        } as React.CSSProperties & { '--ring-color': string }
      : undefined

    return (
      <div className={`${containerClasses} ${className}`} style={containerStyle}>
        <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={disabled}
            variant="tremor"
            className="w-full sm:w-96"
            enableStepper={false}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={disabled}
              className="border px-2.5 font-semibold sm:border-none sm:py-1"
              style={{ 
                color: 'var(--primary)',
                borderColor: 'var(--border)'
              }}
            >
              Clear
            </Button>
          )}
        </div>
        {setRegisteredOnly && (
          <div className="flex items-center gap-2.5">
            <Switch
              id={switchId}
              checked={registeredOnly}
              onCheckedChange={setRegisteredOnly}
              disabled={disabled}
              size="small"
              variant="tremor"
            />
            <Label
              htmlFor={switchId}
              disabled={disabled}
              className="text-base sm:text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {switchLabel}
            </Label>
          </div>
        )}
      </div>
    )
  }

  return null
}
