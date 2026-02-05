"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cx, focusInput, focusRing } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cx("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cx(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioGroupIndicator = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Indicator>
>(({ className, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitive.Indicator
      ref={forwardedRef}
      className={cx("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cx(
          "size-1.5 shrink-0 rounded-full",
          "bg-white",
          "group-data-[disabled]:bg-gray-400 group-data-[disabled]:dark:bg-gray-500",
        )}
      />
    </RadioGroupPrimitive.Indicator>
  )
})
RadioGroupIndicator.displayName = "RadioGroupIndicator"

const RadioGroupItemTremor = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitive.Item
      ref={forwardedRef}
      className={cx(
        "group relative flex size-4 appearance-none items-center justify-center outline-none",
        className,
      )}
      {...props}
    >
      <div
        className={cx(
          "flex size-4 shrink-0 items-center justify-center rounded-full border shadow-sm",
          "border-gray-300 dark:border-gray-800",
          "bg-white dark:bg-gray-950",
          "group-data-[state=checked]:border-0 group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-blue-500",
          "group-data-[disabled]:border",
          "group-data-[disabled]:border-gray-300 group-data-[disabled]:bg-gray-100 group-data-[disabled]:text-gray-400",
          "group-data-[disabled]:dark:border-gray-700 group-data-[disabled]:dark:bg-gray-800",
          focusRing,
        )}
      >
        <RadioGroupIndicator />
      </div>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItemTremor.displayName = "RadioGroupItemTremor"

const RadioCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitive.Root
      ref={forwardedRef}
      className={cx("grid gap-2", className)}
      tremor-id="tremor-raw"
      {...props}
    />
  )
})
RadioCardGroup.displayName = "RadioCardGroup"

const RadioCardItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitive.Item
      ref={forwardedRef}
      className={cx(
        "group relative w-full rounded-md border p-4 text-left shadow-sm transition focus:outline-none",
        "bg-white dark:bg-gray-950",
        "border-gray-300 dark:border-gray-800",
        "data-[state=checked]:border-blue-500",
        "data-[state=checked]:dark:border-blue-500",
        "data-[disabled]:border-gray-100 data-[disabled]:dark:border-gray-800",
        "data-[disabled]:bg-gray-50 data-[disabled]:shadow-none data-[disabled]:dark:bg-gray-900",
        focusInput,
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  )
})
RadioCardItem.displayName = "RadioCardItem"

const RadioCardIndicator = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Indicator>
>(({ className, ...props }, forwardedRef) => {
  return (
    <div
      className={cx(
        "relative flex size-4 shrink-0 appearance-none items-center justify-center rounded-full border shadow-sm outline-none",
        "border-gray-300 dark:border-gray-800",
        "bg-white dark:bg-gray-950",
        "group-data-[state=checked]:border-0 group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-blue-500",
        "group-data-[disabled]:border-gray-300 group-data-[disabled]:bg-gray-100 group-data-[disabled]:text-gray-400",
        "group-data-[disabled]:dark:border-gray-700 group-data-[disabled]:dark:bg-gray-800",
        focusRing,
        className,
      )}
    >
      <RadioGroupPrimitive.Indicator
        ref={forwardedRef}
        className={cx("flex items-center justify-center")}
        {...props}
      >
        <div
          className={cx(
            "size-1.5 shrink-0 rounded-full",
            "bg-white",
            "group-data-[disabled]:bg-gray-400 group-data-[disabled]:dark:bg-gray-500",
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </div>
  )
})
RadioCardIndicator.displayName = "RadioCardIndicator"

export { 
  RadioGroup, 
  RadioGroupItem, 
  RadioGroupIndicator,
  RadioGroupItemTremor,
  RadioCardGroup, 
  RadioCardItem, 
  RadioCardIndicator 
}
