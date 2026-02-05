"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiExpandUpDownLine,
} from "@remixicon/react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const Select = SelectPrimitive.Root
Select.displayName = "Select"

const SelectGroup = SelectPrimitive.Group
SelectGroup.displayName = "SelectGroup"

const SelectValue = SelectPrimitive.Value
SelectValue.displayName = "SelectValue"

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  hasError?: boolean
  variant?: "default" | "tremor"
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, hasError, variant = "default", children, ...props }, ref) => {
  if (variant === "tremor") {
    const selectTriggerStyles = cx(
      "group/trigger flex w-full select-none items-center justify-between gap-2 truncate rounded-md border px-3 py-2 shadow-sm outline-none transition text-base sm:text-sm",
      "border-gray-300 dark:border-gray-800",
      "text-gray-900 dark:text-gray-50",
      "data-[placeholder]:text-gray-500 data-[placeholder]:dark:text-gray-500",
      "bg-white dark:bg-gray-950",
      "hover:bg-gray-50 hover:dark:bg-gray-950/50",
      "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400",
      "data-[disabled]:dark:border-gray-700 data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500",
      focusInput,
      hasError ? hasErrorInput : "",
      className
    )

    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={selectTriggerStyles}
        tremor-id="tremor-raw"
        {...props}
      >
        <span className="truncate">{children}</span>
        <SelectPrimitive.Icon asChild>
          <RiExpandUpDownLine
            className={cx(
              "size-4 shrink-0",
              "text-gray-400 dark:text-gray-600",
              "group-data-[disabled]/trigger:text-gray-300 group-data-[disabled]/trigger:dark:text-gray-600"
            )}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    )
  }

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cx(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

interface SelectScrollButtonProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> {
  variant?: "default" | "tremor"
}

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  SelectScrollButtonProps
>(({ className, variant = "default", ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    {variant === "tremor" ? (
      <RiArrowUpSLine className="size-3 shrink-0" aria-hidden="true" />
    ) : (
      <ChevronUp className="h-4 w-4" />
    )}
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  SelectScrollButtonProps
>(({ className, variant = "default", ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    {variant === "tremor" ? (
      <RiArrowDownSLine className="size-3 shrink-0" aria-hidden="true" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )}
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  variant?: "default" | "tremor"
  sideOffset?: number
  collisionPadding?: number
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", variant = "default", sideOffset = 8, collisionPadding = 10, ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cx(
            "relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/[2.5%]",
            "min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]",
            "max-h-[--radix-select-content-available-height]",
            "bg-white dark:bg-gray-950",
            "text-gray-900 dark:text-gray-50",
            "border-gray-200 dark:border-gray-800",
            "will-change-[transform,opacity]",
            "data-[state=closed]:animate-hide",
            "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
            className
          )}
          sideOffset={sideOffset}
          position={position}
          collisionPadding={collisionPadding}
          {...props}
        >
          <SelectScrollUpButton variant="tremor" />
          <SelectPrimitive.Viewport
            className={cx(
              "p-1",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width))]"
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton variant="tremor" />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    )
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cx(
          "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cx(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
  variant?: "default" | "tremor"
}

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, variant = "default", ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={variant === "tremor" 
      ? cx("px-3 py-2 text-xs font-medium tracking-wide text-gray-500 dark:text-gray-500", className)
      : cx("px-2 py-1.5 text-sm font-semibold", className)
    }
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectGroupLabel = SelectLabel

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  variant?: "default" | "tremor"
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <SelectPrimitive.Item
        ref={ref}
        className={cx(
          "grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
          "text-gray-900 dark:text-gray-50",
          "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
          "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
          "hover:bg-gray-100 hover:dark:bg-gray-900",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ItemText className="flex-1 truncate">
          {children}
        </SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator>
          <RiCheckLine
            className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
            aria-hidden="true"
          />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>
    )
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cx(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = SelectPrimitive.Item.displayName

interface SelectItemPeriodProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  period?: DateRange | undefined
}

const SelectItemPeriod = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemPeriodProps
>(({ className, children, period, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cx(
        "relative flex cursor-pointer items-center rounded py-2 pl-8 pr-3 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        "text-gray-900 dark:text-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <RiCheckLine
            className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
            aria-hidden="true"
          />
        </SelectPrimitive.ItemIndicator>
      </span>
      <div className="flex w-full items-center">
        <span className="w-40 sm:w-32">
          <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </span>
        <span>
          {period?.from && period?.to && (
            <span className="whitespace-nowrap font-normal text-gray-400">
              {format(period.from, "MMM d, yyyy")} –{" "}
              {format(period.to, "MMM d, yyyy")}
            </span>
          )}
        </span>
      </div>
    </SelectPrimitive.Item>
  )
})
SelectItemPeriod.displayName = "SelectItemPeriod"

interface SelectItemExtendedProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  option: string
  description: string | boolean
}

const SelectItemExtended = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemExtendedProps
>(({ className, option, description, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cx(
        "flex max-w-[var(--radix-select-trigger-width)] cursor-pointer items-center justify-between whitespace-nowrap rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        "text-gray-900 dark:text-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>
      <span className="ml-2 truncate font-normal text-gray-400 dark:text-gray-600">
        {description}
      </span>
    </SelectPrimitive.Item>
  )
})
SelectItemExtended.displayName = "SelectItemExtended"

interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {
  variant?: "default" | "tremor"
}

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, variant = "default", ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={variant === "tremor"
      ? cx("-mx-1 my-1 h-px bg-gray-300 dark:bg-gray-700", className)
      : cx("-mx-1 my-1 h-px bg-muted", className)
    }
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectGroupLabel,
  SelectItem,
  SelectItemPeriod,
  SelectItemExtended,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
