"use client"

import {
  RiAddLine,
  RiArrowDownSLine,
  RiCornerDownRightLine,
} from "@remixicon/react"
import { Column } from "@tanstack/react-table"

import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { cx, focusRing } from "@/lib/utils"
import React from "react"

export type ConditionFilter = {
  condition: string
  value: [number | string, number | string]
}

type FilterType = "select" | "checkbox" | "number"

interface DataTableFilterProps<TData, TValue> {
  column: Column<TData, TValue> | undefined
  title?: string
  options?: {
    label: string
    value: string
  }[]
  type?: FilterType
  formatter?: (value: any) => string
  disabled?: boolean
  hasError?: boolean
  isLoading?: boolean
}

const ColumnFiltersLabel = ({
  columnFilterLabels,
  className,
}: {
  columnFilterLabels: string[] | undefined
  className?: string
}) => {
  if (!columnFilterLabels) return null

  if (columnFilterLabels.length < 3) {
    return (
      <span className={cx("truncate", className)}>
        {columnFilterLabels.map((value, index) => (
          <span
            key={value}
            className="font-semibold text-indigo-600 dark:text-indigo-400"
          >
            {value}
            {index < columnFilterLabels.length - 1 && ", "}
          </span>
        ))}
      </span>
    )
  }

  return (
    <>
      <span
        className={cx(
          "font-semibold text-indigo-600 dark:text-indigo-400",
          className,
        )}
      >
        {columnFilterLabels[0]} and {columnFilterLabels.length - 1} more
      </span>
    </>
  )
}

type FilterValues = string | string[] | ConditionFilter | undefined

export function DataTableFilter<TData, TValue>({
  column,
  title,
  options,
  type = "select",
  formatter = (value) => value.toString(),
  disabled = false,
  hasError = false,
  isLoading = false,
}: DataTableFilterProps<TData, TValue>) {
  const columnFilters = column?.getFilterValue() as FilterValues

  const [selectedValues, setSelectedValues] =
    React.useState<FilterValues>(columnFilters)

  const columnFilterLabels = React.useMemo(() => {
    if (!selectedValues) return undefined

    if (Array.isArray(selectedValues)) {
      return selectedValues.map((value) => formatter(value))
    }

    if (typeof selectedValues === "string") {
      return [formatter(selectedValues)]
    }

    if (typeof selectedValues === "object" && "condition" in selectedValues) {
      const condition = options?.find(
        (option) => option.value === selectedValues.condition,
      )?.label
      if (!condition) return undefined
      if (!selectedValues.value?.[0] && !selectedValues.value?.[1])
        return [`${condition}`]
      if (!selectedValues.value?.[1])
        return [`${condition} ${formatter(selectedValues.value?.[0])}`]
      return [
        `${condition} ${formatter(selectedValues.value?.[0])} and ${formatter(
          selectedValues.value?.[1],
        )}`,
      ]
    }

    return undefined
  }, [selectedValues, options, formatter])

  const getDisplayedFilter = () => {
    switch (type) {
      case "select":
        return (
          <Select
            value={selectedValues as string}
            onValueChange={(value) => {
              setSelectedValues(value)
            }}
            disabled={disabled}
          >
            <SelectTrigger 
              className="mt-2 sm:py-1" 
              hasError={hasError}
              variant="tremor"
              disabled={disabled}
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent variant="tremor">
              {options?.map((item) => (
                <SelectItem 
                  key={item.value} 
                  value={item.value}
                  variant="tremor"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "checkbox":
        return (
          <div className="mt-2 space-y-2 overflow-y-auto sm:max-h-36">
            {options?.map((option) => {
              return (
                <div key={option.label} className="flex items-center gap-2">
                  <Checkbox
                    id={option.value}
                    checked={(selectedValues as string[])?.includes(
                      option.value,
                    )}
                    onCheckedChange={(checked) => {
                      setSelectedValues((prev) => {
                        if (checked) {
                          return prev
                            ? [...(prev as string[]), option.value]
                            : [option.value]
                        } else {
                          return (prev as string[]).filter(
                            (value) => value !== option.value,
                          )
                        }
                      })
                    }}
                    disabled={disabled}
                    variant="tremor"
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-base sm:text-sm"
                    disabled={disabled}
                  >
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        )
      case "number":
        const isBetween =
          (selectedValues as ConditionFilter)?.condition === "is-between"
        return (
          <div className="space-y-2">
            <Select
              value={(selectedValues as ConditionFilter)?.condition}
              onValueChange={(value) => {
                setSelectedValues((prev) => {
                  return {
                    condition: value,
                    value: [
                      value !== "" ? (prev as ConditionFilter)?.value?.[0] : "",
                      "",
                    ],
                  }
                })
              }}
              disabled={disabled}
            >
              <SelectTrigger 
                className="mt-2 sm:py-1"
                hasError={hasError}
                variant="tremor"
                disabled={disabled}
              >
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent variant="tremor">
                {options?.map((item) => (
                  <SelectItem 
                    key={item.value} 
                    value={item.value}
                    variant="tremor"
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex w-full items-center gap-2">
              <RiCornerDownRightLine
                className="size-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
              <Input
                disabled={disabled || !(selectedValues as ConditionFilter)?.condition}
                type="number"
                placeholder="$0"
                className="sm:[&>input]:py-1"
                inputClassName="sm:py-1"
                value={(selectedValues as ConditionFilter)?.value?.[0]}
                onChange={(e) => {
                  setSelectedValues((prev) => {
                    return {
                      condition: (prev as ConditionFilter)?.condition,
                      value: [
                        e.target.value,
                        isBetween ? (prev as ConditionFilter)?.value?.[1] : "",
                      ],
                    }
                  })
                }}
                hasError={hasError}
                variant="tremor"
                enableStepper={false}
              />
              {(selectedValues as ConditionFilter)?.condition ===
                "is-between" && (
                <>
                  <span className="text-xs font-medium text-gray-500">and</span>
                  <Input
                    disabled={disabled || !(selectedValues as ConditionFilter)?.condition}
                    type="number"
                    placeholder="$0"
                    className="sm:[&>input]:py-1"
                    inputClassName="sm:py-1"
                    value={(selectedValues as ConditionFilter)?.value?.[1]}
                    onChange={(e) => {
                      setSelectedValues((prev) => {
                        return {
                          condition: (prev as ConditionFilter)?.condition,
                          value: [
                            (prev as ConditionFilter)?.value?.[0],
                            e.target.value,
                          ],
                        }
                      })
                    }}
                    hasError={hasError}
                    variant="tremor"
                    enableStepper={false}
                  />
                </>
              )}
            </div>
          </div>
        )
    }
  }

  React.useEffect(() => {
    setSelectedValues(columnFilters)
  }, [columnFilters])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cx(
            "flex w-full items-center gap-x-1.5 whitespace-nowrap px-2 py-1.5 font-medium sm:w-fit sm:text-xs",
            "filter-button-base",
            selectedValues &&
              ((typeof selectedValues === "object" &&
                "condition" in selectedValues &&
                selectedValues.condition !== "") ||
                (typeof selectedValues === "string" && selectedValues !== "") ||
                (Array.isArray(selectedValues) && selectedValues.length > 0))
              ? "filter-button-active"
              : "filter-button-inactive",
            disabled && "opacity-50 cursor-not-allowed",
            hasError && "border-red-500 dark:border-red-400",
            focusRing,
          )}
          disabled={disabled}
          aria-label={`Filter by ${title}`}
        >
          <span
            aria-hidden="true"
            onClick={(e) => {
              if (selectedValues && !disabled) {
                e.stopPropagation()
                column?.setFilterValue("")
                setSelectedValues("")
              }
            }}
          >
            <RiAddLine
              className={cx(
                "-ml-px size-5 shrink-0 transition sm:size-4",
                selectedValues && !disabled && "rotate-45 hover:text-red-500",
                disabled && "opacity-50",
              )}
              aria-hidden="true"
            />
          </span>
          {/* differentiation below for better mobile view */}
          {columnFilterLabels && columnFilterLabels.length > 0 ? (
            <span>{title}</span>
          ) : (
            <span className="w-full text-left sm:w-fit">{title}</span>
          )}
          {columnFilterLabels && columnFilterLabels.length > 0 && (
            <span
              className="h-4 w-px bg-gray-300 dark:bg-gray-700"
              aria-hidden="true"
            />
          )}
          <ColumnFiltersLabel
            columnFilterLabels={columnFilterLabels}
            className="w-full text-left sm:w-fit"
          />
          <RiArrowDownSLine
            className="size-5 shrink-0 text-gray-500 sm:size-4"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={7}
        className="min-w-[calc(var(--radix-popover-trigger-width))] max-w-[calc(var(--radix-popover-trigger-width))] sm:min-w-56 sm:max-w-56"
        variant="tremor"
        collisionPadding={10}
        avoidCollisions={true}
        onInteractOutside={() => {
          if (
            !columnFilters ||
            (typeof columnFilters === "string" && columnFilters === "") ||
            (Array.isArray(columnFilters) && columnFilters.length === 0) ||
            (typeof columnFilters === "object" &&
              "condition" in columnFilters &&
              columnFilters.condition === "")
          ) {
            column?.setFilterValue("")
            setSelectedValues("")
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            column?.setFilterValue(selectedValues)
          }}
        >
          <div className="space-y-2">
            <div>
              <Label 
                className="text-base font-medium sm:text-sm"
                disabled={disabled}
              >
                Filter by {title}
              </Label>
              {getDisplayedFilter()}
            </div>
            <PopoverClose className="w-full" asChild>
              <Button 
                type="submit" 
                className="w-full sm:py-1"
                disabled={disabled}
                isLoading={isLoading}
                loadingText="Applying..."
                variant="primary"
                size="sm"
              >
                Apply
              </Button>
            </PopoverClose>
            {columnFilterLabels && columnFilterLabels.length > 0 && (
              <Button
                variant="secondary"
                className="w-full sm:py-1"
                type="button"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  column?.setFilterValue("")
                  setSelectedValues(
                    type === "checkbox"
                      ? []
                      : type === "number"
                        ? { condition: "", value: ["", ""] }
                        : "",
                  )
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
