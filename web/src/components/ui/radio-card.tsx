// Tremor Raw Radio Card [v0.0.0]

import * as RadioGroupPrimitives from "@radix-ui/react-radio-group"
import * as React from "react"

import { cx, focusInput, focusRing } from "@/lib/utils"

const RadioCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Root>
>(({ className, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitives.Root
      ref={forwardedRef}
      className={cx("grid gap-2", className)}
      {...props}
    />
  )
})
RadioCardGroup.displayName = "RadioCardGroup"

const RadioCardGroupIndicator = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Indicator>
>(({ className, ...props }, forwardedRef) => {
  return (
    <div
      className={cx(
        // base
        "relative flex size-4 shrink-0 appearance-none items-center justify-center rounded-full border shadow-sm outline-none",
        // border color
        "border-input",
        // background color
        "bg-background",
        // checked
        "group-data-[state=checked]:border-0 group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-primary",
        // disabled
        "group-data-[disabled]:border",
        "group-data-[disabled]:border-input group-data-[disabled]:bg-muted group-data-[disabled]:text-muted-foreground",
        // focus
        focusRing,
        className,
      )}
    >
      <RadioGroupPrimitives.Indicator
        ref={forwardedRef}
        className="flex items-center justify-center"
        {...props}
      >
        <div
          className={cx(
            // base
            "size size-1.5 shrink-0 rounded-full",
            // indicator
            "bg-primary-foreground",
            // disabled
            "group-data-[disabled]:bg-muted-foreground",
          )}
        />
      </RadioGroupPrimitives.Indicator>
    </div>
  )
})
RadioCardGroupIndicator.displayName = "RadioCardGroupIndicator"

const RadioCardItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Item>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitives.Item
      ref={forwardedRef}
      className={cx(
        // base
        "group relative w-full rounded-md border p-4 text-left shadow-sm transition-all focus:outline-none",
        // background color
        "bg-card",
        // border color
        "border-border",
        "data-[state=checked]:border-primary",
        focusInput,
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitives.Item>
  )
})
RadioCardItem.displayName = "RadioCardItem"

export { RadioCardGroup, RadioCardGroupIndicator, RadioCardItem }
