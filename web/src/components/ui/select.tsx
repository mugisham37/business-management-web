"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
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
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
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
        className={cn(
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
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
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
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
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
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
// Tremor Raw Select [v0.0.2]

import * as SelectPrimitives from "@radix-ui/react-select"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiExpandUpDownLine,
} from "@remixicon/react"
import { format } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const Select = SelectPrimitives.Root
Select.displayName = "Select"

const SelectGroup = SelectPrimitives.Group
SelectGroup.displayName = "SelectGroup"

const SelectValue = SelectPrimitives.Value
SelectValue.displayName = "SelectValue"

const selectTriggerStyles = [
  cx(
    // base
    "group/trigger flex w-full select-none items-center justify-between gap-2 truncate rounded-md border px-3 py-2 shadow-sm outline-none transition text-base sm:text-sm",
    // border color
    "border-gray-300 dark:border-gray-800",
    // text color
    "text-gray-900 dark:text-gray-50",
    // placeholder
    "data-[placeholder]:text-gray-500 data-[placeholder]:dark:text-gray-500",
    // background color
    "bg-white dark:bg-[#090E1A]",
    // hover
    "hover:bg-gray-50 hover:dark:bg-gray-950/50",
    // disabled
    "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400",
    "data-[disabled]:dark:border-gray-700 data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500",
    focusInput,
    // invalid (optional)
    // "aria-[invalid=true]:dark:ring-red-400/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
  ),
]

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger> & {
    hasError?: boolean
  }
>(({ className, hasError, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cx(
        selectTriggerStyles,
        hasError ? hasErrorInput : "",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitives.Icon asChild>
        <RiExpandUpDownLine
          className={cx(
            // base
            "size-4 shrink-0",
            // text color
            "text-gray-400 dark:text-gray-600",
            // disabled
            "group-data-[disabled]/trigger:text-gray-300 group-data-[disabled]/trigger:dark:text-gray-600",
          )}
        />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  )
})

SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollUpButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollUpButton
    ref={forwardedRef}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <RiArrowUpSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitives.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollDownButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollDownButton
    ref={forwardedRef}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <RiArrowDownSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitives.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  (
    {
      className,
      position = "popper",
      children,
      sideOffset = 8,
      collisionPadding = 10,
      ...props
    },
    forwardedRef,
  ) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cx(
          // base
          "relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/[2.5%]",
          // widths
          "min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]",
          // heights
          "max-h-[--radix-select-content-available-height]",
          // background color
          "bg-white dark:bg-[#090E1A]",
          // text color
          "text-gray-900 dark:text-gray-50",
          // border color
          "border-gray-200 dark:border-gray-800",
          // transition
          "will-change-[transform,opacity]",
          // "data-[state=open]:animate-slideDownAndFade",
          "data-[state=closed]:animate-hide",
          "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
          className,
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitives.Viewport
          className={cx(
            "p-1",
            position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width))]",
          )}
        >
          {children}
        </SelectPrimitives.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  ),
)

SelectContent.displayName = "SelectContent"

const SelectGroupLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Label>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Label
    ref={forwardedRef}
    className={cx(
      // base
      "px-3 py-2 text-xs font-medium tracking-wide",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

SelectGroupLabel.displayName = "SelectGroupLabel"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        "grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        // text color
        "text-gray-900 dark:text-gray-50",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        // focus
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        // hover
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      <SelectPrimitives.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator>
        <RiCheckLine
          className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
          aria-hidden="true"
        />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  )
})

SelectItem.displayName = "SelectItem"

const SelectItemPeriod = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item> & {
    period?: DateRange | undefined
  }
>(({ className, children, period, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        "relative flex cursor-pointer items-center rounded py-2 pl-8 pr-3 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        // text color
        "text-gray-900 dark:text-gray-50",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        // focus
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        // hover
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitives.ItemIndicator>
          <RiCheckLine
            className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
            aria-hidden="true"
          />
        </SelectPrimitives.ItemIndicator>
      </span>
      <div className="flex w-full items-center">
        {/* adapt width accordingly if you use longer names for periods */}
        <span className="w-40 sm:w-32">
          <SelectPrimitives.ItemText>{children}</SelectPrimitives.ItemText>
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
    </SelectPrimitives.Item>
  )
})

SelectItemPeriod.displayName = "SelectItemPeriod"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Separator
    ref={forwardedRef}
    className={cx(
      // base
      "-mx-1 my-1 h-px",
      // background color
      "bg-gray-300 dark:bg-gray-700",
      className,
    )}
    {...props}
  />
))

SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemPeriod,
  SelectSeparator,
  SelectTrigger,
  SelectValue
}

// Tremor Select [v0.0.3]

import * as SelectPrimitives from "@radix-ui/react-select"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiExpandUpDownLine,
} from "@remixicon/react"
import React from "react"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const Select = SelectPrimitives.Root
Select.displayName = "Select"

const SelectGroup = SelectPrimitives.Group
SelectGroup.displayName = "SelectGroup"

const SelectValue = SelectPrimitives.Value
SelectValue.displayName = "SelectValue"

const selectTriggerStyles = [
  cx(
    // base
    "group/trigger flex w-full select-none items-center justify-between gap-2 truncate rounded-md border px-3 py-2 shadow-sm outline-none transition sm:text-sm",
    // border color
    "border-gray-300 dark:border-gray-800",
    // text color
    "text-gray-900 dark:text-gray-50",
    // placeholder
    "data-[placeholder]:text-gray-500 data-[placeholder]:dark:text-gray-500",
    // background color
    "bg-white dark:bg-gray-950",
    // hover
    "hover:bg-gray-50 hover:dark:bg-gray-950/50",
    // disabled
    "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400",
    "data-[disabled]:dark:border-gray-700 data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500",
    focusInput,
    // invalid (optional)
    // "aria-[invalid=true]:dark:ring-red-400/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
  ),
]

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger> & {
    hasError?: boolean
  }
>(({ className, hasError, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cx(
        selectTriggerStyles,
        hasError ? hasErrorInput : "",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitives.Icon asChild>
        <RiExpandUpDownLine
          className={cx(
            // base
            "size-4 shrink-0",
            // text color
            "text-gray-400 dark:text-gray-600",
            // disabled
            "group-data-[disabled]/trigger:text-gray-300 group-data-[disabled]/trigger:dark:text-gray-600",
          )}
        />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  )
})

SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollUpButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollUpButton
    ref={forwardedRef}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <RiArrowUpSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitives.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollDownButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollDownButton
    ref={forwardedRef}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <RiArrowDownSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitives.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  (
    {
      className,
      position = "popper",
      children,
      sideOffset = 8,
      collisionPadding = 10,
      ...props
    },
    forwardedRef,
  ) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cx(
          // base
          "relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/[2.5%]",
          // widths
          "min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]",
          // heights
          "max-h-[--radix-select-content-available-height]",
          // background color
          "bg-white dark:bg-gray-950",
          // text color
          "text-gray-900 dark:text-gray-50",
          // border color
          "border-gray-200 dark:border-gray-800",
          // transition
          "will-change-[transform,opacity]",
          // "data-[state=open]:animate-slideDownAndFade",
          "data-[state=closed]:animate-hide",
          "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
          className,
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitives.Viewport
          className={cx(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width))]",
          )}
        >
          {children}
        </SelectPrimitives.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  ),
)

SelectContent.displayName = "SelectContent"

const SelectGroupLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Label>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Label
    ref={forwardedRef}
    className={cx(
      // base
      "px-3 py-2 text-xs font-medium tracking-wide",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

SelectGroupLabel.displayName = "SelectGroupLabel"

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        "grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        // text color
        "text-gray-900 dark:text-gray-50",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        // focus
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        // hover
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      <SelectPrimitives.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator>
        <RiCheckLine
          className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
          aria-hidden="true"
        />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  )
})

SelectItem.displayName = "SelectItem"

// new component created specifically for this template, outside of Tremor's standard components
const SelectItemExtended = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item> & {
    option: string
    description: string | boolean
  }
>(({ className, option, description, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        "flex max-w-[var(--radix-select-trigger-width)] cursor-pointer items-center justify-between whitespace-nowrap rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        // text color
        "text-gray-900 dark:text-gray-50",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        // focus
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        // hover
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      <SelectPrimitives.ItemText>{option}</SelectPrimitives.ItemText>
      <span className="ml-2 truncate font-normal text-gray-400 dark:text-gray-600">
        {description}
      </span>
    </SelectPrimitives.Item>
  )
})

SelectItemExtended.displayName = "SelectItemExtended"

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Separator
    ref={forwardedRef}
    className={cx(
      // base
      "-mx-1 my-1 h-px",
      // background color
      "bg-gray-300 dark:bg-gray-700",
      className,
    )}
    {...props}
  />
))

SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemExtended,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
// Tremor Select [v0.0.3]

import React from "react"
import * as SelectPrimitives from "@radix-ui/react-select"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiExpandUpDownLine,
} from "@remixicon/react"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const Select = SelectPrimitives.Root
Select.displayName = "Select"

const SelectGroup = SelectPrimitives.Group
SelectGroup.displayName = "SelectGroup"

const SelectValue = SelectPrimitives.Value
SelectValue.displayName = "SelectValue"

const selectTriggerStyles = [
  cx(
    // base
    "group/trigger flex w-full select-none items-center justify-between gap-2 truncate rounded-md border px-3 py-2 shadow-sm outline-none transition sm:text-sm",
    // border color
    "border-gray-300 dark:border-gray-800",
    // text color
    "text-gray-900 dark:text-gray-50",
    // placeholder
    "data-[placeholder]:text-gray-500 data-[placeholder]:dark:text-gray-500",
    // background color
    "bg-white dark:bg-gray-950",
    // hover
    "hover:bg-gray-50 hover:dark:bg-gray-950/50",
    // disabled
    "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400",
    "data-[disabled]:dark:border-gray-700 data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500",
    focusInput,
    // invalid (optional)
    // "aria-[invalid=true]:dark:ring-red-400/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
  ),
]

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Trigger> & {
    hasError?: boolean
  }
>(({ className, hasError, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Trigger
      ref={forwardedRef}
      className={cx(
        selectTriggerStyles,
        hasError ? hasErrorInput : "",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitives.Icon asChild>
        <RiExpandUpDownLine
          className={cx(
            // base
            "size-4 shrink-0",
            // text color
            "text-gray-400 dark:text-gray-600",
            // disabled
            "group-data-[disabled]/trigger:text-gray-300 group-data-[disabled]/trigger:dark:text-gray-600",
          )}
        />
      </SelectPrimitives.Icon>
    </SelectPrimitives.Trigger>
  )
})

SelectTrigger.displayName = "SelectTrigger"

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollUpButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollUpButton
    ref={forwardedRef}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <RiArrowUpSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitives.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.ScrollDownButton>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.ScrollDownButton
    ref={forwardedRef}
    className={cx(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <RiArrowDownSLine className="size-3 shrink-0" aria-hidden="true" />
  </SelectPrimitives.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitives.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Content>
>(
  (
    {
      className,
      position = "popper",
      children,
      sideOffset = 8,
      collisionPadding = 10,
      ...props
    },
    forwardedRef,
  ) => (
    <SelectPrimitives.Portal>
      <SelectPrimitives.Content
        ref={forwardedRef}
        className={cx(
          // base
          "relative z-50 overflow-hidden rounded-md border shadow-xl shadow-black/[2.5%]",
          // widths
          "min-w-[calc(var(--radix-select-trigger-width)-2px)] max-w-[95vw]",
          // heights
          "max-h-[--radix-select-content-available-height]",
          // background color
          "bg-white dark:bg-gray-950",
          // text color
          "text-gray-900 dark:text-gray-50",
          // border color
          "border-gray-200 dark:border-gray-800",
          // transition
          "will-change-[transform,opacity]",
          // "data-[state=open]:animate-slideDownAndFade",
          "data-[state=closed]:animate-hide",
          "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
          className,
        )}
        sideOffset={sideOffset}
        position={position}
        collisionPadding={collisionPadding}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitives.Viewport
          className={cx(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[calc(var(--radix-select-trigger-width))]",
          )}
        >
          {children}
        </SelectPrimitives.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitives.Content>
    </SelectPrimitives.Portal>
  ),
)

SelectContent.displayName = "SelectContent"

const SelectGroupLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Label>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Label
    ref={forwardedRef}
    className={cx(
      // base
      "px-3 py-2 text-xs font-medium tracking-wide",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

SelectGroupLabel.displayName = "SelectGroupLabel"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        "grid cursor-pointer grid-cols-[1fr_20px] gap-x-2 rounded px-3 py-2 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        // text color
        "text-gray-900 dark:text-gray-50",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
        // focus
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900",
        // hover
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      <SelectPrimitives.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitives.ItemText>
      <SelectPrimitives.ItemIndicator>
        <RiCheckLine
          className="size-5 shrink-0 text-gray-800 dark:text-gray-200"
          aria-hidden="true"
        />
      </SelectPrimitives.ItemIndicator>
    </SelectPrimitives.Item>
  )
})

SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitives.Separator>
>(({ className, ...props }, forwardedRef) => (
  <SelectPrimitives.Separator
    ref={forwardedRef}
    className={cx(
      // base
      "-mx-1 my-1 h-px",
      // background color
      "bg-gray-300 dark:bg-gray-700",
      className,
    )}
    {...props}
  />
))

SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
