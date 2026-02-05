"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from "@remixicon/react"
import { addYears, format } from "date-fns"
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  useDayPicker,
  useNavigation,
  type Matcher,
} from "react-day-picker"

import { cx, focusRing } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/Button"

interface NavigationButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  icon: React.ElementType
  disabled?: boolean
}

const NavigationButton = React.forwardRef<HTMLButtonElement, NavigationButtonProps>(
  ({ onClick, icon, disabled, ...props }, forwardedRef) => {
    const Icon = icon
    return (
      <button
        ref={forwardedRef}
        type="button"
        disabled={disabled}
        className={cx(
          "flex size-8 shrink-0 select-none items-center justify-center rounded border p-1 outline-none transition sm:size-[30px]",
          "text-gray-600 hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-200",
          "border-gray-300 dark:border-gray-800",
          "hover:bg-gray-50 active:bg-gray-100 hover:dark:bg-gray-900 active:dark:bg-gray-800",
          "disabled:pointer-events-none disabled:border-gray-200 disabled:dark:border-gray-800",
          "disabled:text-gray-400 disabled:dark:text-gray-600",
          focusRing
        )}
        onClick={onClick}
        {...props}
      >
        <Icon className="size-full shrink-0" />
      </button>
    )
  }
)

NavigationButton.displayName = "NavigationButton"

interface CalendarProps {
  variant?: "shadcn" | "tremor"
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  enableYearNavigation?: boolean
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
  formatters?: Record<string, any>
  components?: Record<string, any>
  [key: string]: any
}

function Calendar({
  variant = "shadcn",
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  enableYearNavigation = false,
  ...props
}: CalendarProps) {
  if (variant === "tremor") {
    const dayPickerProps = {
      showOutsideDays,
      className: cx(className),
      classNames: {
        months: "flex space-y-0",
        month: "space-y-4 p-3",
        nav: "gap-1 flex items-center rounded-full size-full justify-between p-4",
        table: "w-full border-collapse space-y-1",
        head_cell: "w-9 font-medium text-sm sm:text-xs text-center text-gray-400 dark:text-gray-600 pb-2",
        row: "w-full mt-0.5",
        cell: cx(
          "relative p-0 text-center focus-within:relative",
          "text-gray-900 dark:text-gray-50"
        ),
        day: cx(
          "size-9 rounded text-sm text-gray-900 focus:z-10 dark:text-gray-50",
          "hover:bg-gray-200 hover:dark:bg-gray-700",
          focusRing
        ),
        day_today: "font-semibold",
        day_selected: cx(
          "rounded",
          "aria-selected:bg-indigo-600 aria-selected:text-gray-50",
          "dark:aria-selected:bg-indigo-500 dark:aria-selected:text-gray-50"
        ),
        day_disabled: "!text-gray-300 dark:!text-gray-700 line-through disabled:hover:bg-transparent",
        day_outside: "text-gray-400 dark:text-gray-600",
        day_range_middle: cx(
          "!rounded-none",
          "aria-selected:!bg-gray-100 aria-selected:!text-gray-900",
          "dark:aria-selected:!bg-gray-900 dark:aria-selected:!text-gray-50"
        ),
        day_range_start: "rounded-r-none !rounded-l",
        day_range_end: "rounded-l-none !rounded-r",
        day_hidden: "invisible",
        ...classNames,
      },
      components: {
        Chevron: ({ orientation, ...chevronProps }: any) => {
          if (orientation === "left") {
            return <RiArrowLeftSLine aria-hidden="true" className="size-4" {...chevronProps} />
          }
          return <RiArrowRightSLine aria-hidden="true" className="size-4" {...chevronProps} />
        },
        MonthCaption: ({ calendarMonth }: { calendarMonth: { date: Date } }) => {
          const displayMonth = calendarMonth.date
          const navigation = useNavigation()
          const dayPicker = useDayPicker()

          if (!navigation || !dayPicker) {
            return (
              <div className="text-sm font-medium capitalize tabular-nums text-gray-900 dark:text-gray-50">
                {format(displayMonth, "LLLL yyy")}
              </div>
            )
          }

          const { goToMonth, nextMonth, previousMonth } = navigation
          const { numberOfMonths = 1, fromDate, toDate } = dayPicker as any

          const currentMonth = displayMonth
          const displayMonths = [displayMonth]
          const displayIndex = 0
          const isFirst = displayIndex === 0
          const isLast = displayIndex === displayMonths.length - 1

          const hideNextButton = numberOfMonths > 1 && (isFirst || !isLast)
          const hidePreviousButton = numberOfMonths > 1 && (isLast || !isFirst)

          const goToPreviousYear = () => {
            const targetMonth = addYears(currentMonth, -1)
            if (previousMonth && (!fromDate || targetMonth.getTime() >= fromDate.getTime())) {
              goToMonth(targetMonth)
            }
          }

          const goToNextYear = () => {
            const targetMonth = addYears(currentMonth, 1)
            if (nextMonth && (!toDate || targetMonth.getTime() <= toDate.getTime())) {
              goToMonth(targetMonth)
            }
          }

          return (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {enableYearNavigation && !hidePreviousButton && (
                  <NavigationButton
                    disabled={
                      !previousMonth ||
                      (fromDate && addYears(currentMonth, -1).getTime() < fromDate.getTime())
                    }
                    aria-label="Go to previous year"
                    onClick={goToPreviousYear}
                    icon={RiArrowLeftDoubleLine}
                  />
                )}
                {!hidePreviousButton && (
                  <NavigationButton
                    disabled={!previousMonth}
                    aria-label="Go to previous month"
                    onClick={() => previousMonth && goToMonth(previousMonth)}
                    icon={RiArrowLeftSLine}
                  />
                )}
              </div>

              <div
                role="presentation"
                aria-live="polite"
                className="text-sm font-medium capitalize tabular-nums text-gray-900 dark:text-gray-50"
              >
                {format(displayMonth, "LLLL yyy")}
              </div>

              <div className="flex items-center gap-1">
                {!hideNextButton && (
                  <NavigationButton
                    disabled={!nextMonth}
                    aria-label="Go to next month"
                    onClick={() => nextMonth && goToMonth(nextMonth)}
                    icon={RiArrowRightSLine}
                  />
                )}
                {enableYearNavigation && !hideNextButton && (
                  <NavigationButton
                    disabled={
                      !nextMonth ||
                      (toDate && addYears(currentMonth, 1).getTime() > toDate.getTime())
                    }
                    aria-label="Go to next year"
                    onClick={goToNextYear}
                    icon={RiArrowRightDoubleLine}
                  />
                )}
              </div>
            </div>
          )
        },
        ...components,
      },
      ...props,
    }

    return <DayPicker {...dayPickerProps} />
  }

  const defaultClassNames = getDefaultClassNames()

  const dayPickerProps = {
    showOutsideDays,
    className: cx(
      "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
      String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
      String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
      className
    ),
    captionLayout,
    formatters: {
      formatMonthDropdown: (date: Date) => date.toLocaleString("default", { month: "short" }),
      ...formatters,
    },
    classNames: {
      root: cx("w-fit", defaultClassNames.root),
      months: cx("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
      month: cx("flex w-full flex-col gap-4", defaultClassNames.month),
      nav: cx(
        "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
        defaultClassNames.nav
      ),
      button_previous: cx(
        buttonVariants({ variant: buttonVariant }),
        "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
        defaultClassNames.button_previous
      ),
      button_next: cx(
        buttonVariants({ variant: buttonVariant }),
        "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
        defaultClassNames.button_next
      ),
      month_caption: cx(
        "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
        defaultClassNames.month_caption
      ),
      dropdowns: cx(
        "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
        defaultClassNames.dropdowns
      ),
      dropdown_root: cx(
        "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
        defaultClassNames.dropdown_root
      ),
      dropdown: cx("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
      caption_label: cx(
        "select-none font-medium",
        captionLayout === "label"
          ? "text-sm"
          : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
        defaultClassNames.caption_label
      ),
      table: "w-full border-collapse",
      weekdays: cx("flex", defaultClassNames.weekdays),
      weekday: cx(
        "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
        defaultClassNames.weekday
      ),
      week: cx("mt-2 flex w-full", defaultClassNames.week),
      week_number_header: cx("w-[--cell-size] select-none", defaultClassNames.week_number_header),
      week_number: cx("text-muted-foreground select-none text-[0.8rem]", defaultClassNames.week_number),
      day: cx(
        "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
        defaultClassNames.day
      ),
      range_start: cx("bg-accent rounded-l-md", defaultClassNames.range_start),
      range_middle: cx("rounded-none", defaultClassNames.range_middle),
      range_end: cx("bg-accent rounded-r-md", defaultClassNames.range_end),
      today: cx(
        "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
        defaultClassNames.today
      ),
      outside: cx("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
      disabled: cx("text-muted-foreground opacity-50", defaultClassNames.disabled),
      hidden: cx("invisible", defaultClassNames.hidden),
      ...classNames,
    },
    components: {
      Root: ({ className, rootRef, ...rootProps }: any) => (
        <div data-slot="calendar" ref={rootRef} className={cx(className)} {...rootProps} />
      ),
      Chevron: ({ className, orientation, ...chevronProps }: any) => {
        if (orientation === "left") {
          return <ChevronLeftIcon className={cx("size-4", className)} {...chevronProps} />
        }
        if (orientation === "right") {
          return <ChevronRightIcon className={cx("size-4", className)} {...chevronProps} />
        }
        return <ChevronDownIcon className={cx("size-4", className)} {...chevronProps} />
      },
      DayButton: CalendarDayButton,
      WeekNumber: ({ children, ...weekProps }: any) => (
        <td {...weekProps}>
          <div className="flex size-[--cell-size] items-center justify-center text-center">
            {children}
          </div>
        </td>
      ),
      ...components,
    },
    ...props,
  }

  return <DayPicker {...dayPickerProps} />
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cx(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar, CalendarDayButton, NavigationButton, type Matcher }