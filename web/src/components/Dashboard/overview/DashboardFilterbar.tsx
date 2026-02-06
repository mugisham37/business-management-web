"use client"

import {
  Select,
  SelectContent,
  SelectItemPeriod,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

import { Label } from "@/components/ui/Label"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"

import { PeriodValue } from "@/app/(dashboard)/dashboard/overview/page"
import { OverviewData } from "@/data/schema"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { DateRangePicker } from "@/components/ui/DatePicker"
import { cx } from "@/lib/utils"
import { RiSettings5Line } from "@remixicon/react"
import { eachDayOfInterval, interval, subDays, subYears } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"
import { ChartCard } from "./DashboardChartCard"

type Period = {
  value: PeriodValue
  label: string
}

const periods: Period[] = [
  {
    value: "previous-period",
    label: "Previous period",
  },
  {
    value: "last-year",
    label: "Last year",
  },
  {
    value: "no-comparison",
    label: "No comparison",
  },
]

export const getPeriod = (
  dateRange: DateRange | undefined,
  value: PeriodValue,
): DateRange | undefined => {
  if (!dateRange?.from || !dateRange?.to) return undefined
  
  const from = dateRange.from
  const to = dateRange.to
  
  switch (value) {
    case "previous-period": {
      const datesInterval = interval(from, to)
      const numberOfDaysBetween = eachDayOfInterval(datesInterval).length
      const previousPeriodTo = subDays(from, 1)
      const previousPeriodFrom = subDays(previousPeriodTo, numberOfDaysBetween - 1)
      return { from: previousPeriodFrom, to: previousPeriodTo }
    }
    case "last-year": {
      const lastYearFrom = subYears(from, 1)
      const lastYearTo = subYears(to, 1)
      return { from: lastYearFrom, to: lastYearTo }
    }
    case "no-comparison":
      return undefined
    default:
      return undefined
  }
}

type Category = {
  title: keyof OverviewData
  type: "currency" | "unit"
}

type FilterbarProps = {
  maxDate?: Date
  minDate?: Date
  selectedDates: DateRange | undefined
  onDatesChange: (dates: DateRange | undefined) => void
  selectedPeriod: PeriodValue
  onPeriodChange: (period: PeriodValue) => void
  categories: Category[]
  setSelectedCategories: (categories: (keyof OverviewData)[]) => void
  selectedCategories: (keyof OverviewData)[]
  disabled?: boolean
  hasError?: boolean
}

export function Filterbar({
  maxDate,
  minDate,
  selectedDates,
  onDatesChange,
  selectedPeriod,
  onPeriodChange,
  categories,
  setSelectedCategories,
  selectedCategories,
  disabled = false,
  hasError = false,
}: FilterbarProps) {
  const [tempSelectedCategories, setTempSelectedCategories] =
    React.useState<(keyof OverviewData)[]>(selectedCategories)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  React.useEffect(() => {
    setTempSelectedCategories(selectedCategories)
  }, [selectedCategories, isDialogOpen])

  const handleCategoryChange = (category: keyof OverviewData) => {
    setTempSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    )
  }

  const handleSelectAll = () => {
    const allCategories = categories.map((cat) => cat.title)
    setTempSelectedCategories(
      tempSelectedCategories.length === allCategories.length ? [] : allCategories
    )
  }

  const handleApply = () => {
    setSelectedCategories(tempSelectedCategories)
    setIsDialogOpen(false)
  }

  const handleCancel = () => {
    setTempSelectedCategories(selectedCategories)
    setIsDialogOpen(false)
  }

  const isAllSelected = tempSelectedCategories.length === categories.length

  return (
    <div className="flex w-full justify-between">
      <div className="w-full sm:flex sm:items-center sm:gap-2">
        <DateRangePicker
          value={selectedDates}
          onChange={onDatesChange}
          className="w-full sm:w-fit"
          toDate={maxDate}
          fromDate={minDate}
          align="start"
          disabled={disabled}
          hasError={hasError}
          placeholder="Select date range"
          required
          aria-label="Select date range for filtering"
        />
        <span className="hidden text-sm font-medium text-gray-500 dark:text-gray-400 sm:block">
          compared to
        </span>
        <Select
          value={selectedPeriod}
          onValueChange={(value) => {
            onPeriodChange(value as PeriodValue)
          }}
          disabled={disabled}
        >
          <SelectTrigger 
            className="mt-2 w-full sm:mt-0 sm:w-fit"
            hasError={hasError}
            variant="tremor"
            aria-label="Select comparison period"
          >
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent variant="tremor">
            {periods.map((period) => (
              <SelectItemPeriod
                key={period.value}
                value={period.value}
                period={getPeriod(selectedDates, period.value)}
              >
                {period.label}
              </SelectItemPeriod>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="hidden gap-2 px-2 py-1 sm:flex"
            disabled={disabled}
            aria-label="Edit chart categories"
          >
            <RiSettings5Line
              className="-ml-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>Edit</span>
          </Button>
        </DialogTrigger>
        <DialogContent 
          className="max-w-5xl" 
          variant="tremor"
          aria-describedby="dialog-description"
        >
          <DialogHeader variant="tremor">
            <DialogTitle variant="tremor">Customize overview charts</DialogTitle>
            <DialogDescription variant="tremor" id="dialog-description">
              Select which charts to display in the overview panel. You can choose multiple charts to customize your dashboard view.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <Label className="text-sm font-medium">
                Chart Selection ({tempSelectedCategories.length} of {categories.length} selected)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-8"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div
              className={cx(
                "grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {categories.map((category) => {
                const isSelected = tempSelectedCategories.includes(category.title)
                return (
                  <Label
                    htmlFor={category.title}
                    key={category.title}
                    className={cx(
                      "relative cursor-pointer rounded-md border p-4 shadow-sm transition-colors",
                      "border-gray-200 dark:border-gray-800",
                      "hover:border-gray-300 dark:hover:border-gray-700",
                      {
                        "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20": isSelected,
                      }
                    )}
                  >
                    <Checkbox
                      id={category.title}
                      className="absolute right-4 top-4"
                      checked={isSelected}
                      onCheckedChange={() => handleCategoryChange(category.title)}
                      variant="tremor"
                      aria-label={`Toggle ${category.title} chart`}
                    />
                    <div className="pointer-events-none">
                      <ChartCard
                        title={category.title}
                        type={category.type}
                        selectedDates={selectedDates}
                        selectedPeriod={selectedPeriod}
                        isThumbnail={true}
                      />
                    </div>
                  </Label>
                )
              })}
            </div>
          </div>
          <DialogFooter className="mt-6" variant="tremor">
            <Button
              className="mt-2 w-full sm:mt-0 sm:w-fit"
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              className="w-full sm:w-fit" 
              variant="primary"
              onClick={handleApply}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
