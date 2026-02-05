"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { tv, type VariantProps as TVVariantProps } from "tailwind-variants"

import { cx, focusRing } from "@/lib/utils"

const cn = cx

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      size: {
        default: "h-5 w-9",
        small: "h-4 w-7",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        default: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        small: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const tremorSwitchVariants = tv({
  slots: {
    root: [
      "group relative isolate inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 shadow-inner outline-none ring-1 ring-inset transition-all",
      "bg-gray-200 dark:bg-gray-950",
      "ring-black/5 dark:ring-gray-800",
      "data-[state=checked]:bg-blue-500 data-[state=checked]:dark:bg-blue-500",
      "data-[disabled]:cursor-default",
      "data-[disabled]:data-[state=checked]:bg-blue-200",
      "data-[disabled]:data-[state=checked]:ring-gray-300",
      "data-[disabled]:data-[state=checked]:dark:ring-gray-900",
      "data-[disabled]:data-[state=checked]:dark:bg-blue-900",
      "data-[disabled]:data-[state=unchecked]:ring-gray-300",
      "data-[disabled]:data-[state=unchecked]:bg-gray-100",
      "data-[disabled]:data-[state=unchecked]:dark:ring-gray-700",
      "data-[disabled]:data-[state=unchecked]:dark:bg-gray-800",
      ...focusRing,
    ],
    thumb: [
      "pointer-events-none relative inline-block transform appearance-none rounded-full border-none shadow-lg outline-none transition-all duration-150 ease-in-out focus:border-none focus:outline-none focus:outline-transparent",
      "bg-white dark:bg-gray-50",
      "group-data-[disabled]:shadow-none",
      "group-data-[disabled]:bg-gray-50 group-data-[disabled]:dark:bg-gray-500",
    ],
  },
  variants: {
    size: {
      default: {
        root: "h-5 w-9",
        thumb: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
      },
      small: {
        root: "h-4 w-7",
        thumb: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  variant?: "default" | "tremor"
}

export interface TremorSwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, "asChild">,
    TVVariantProps<typeof tremorSwitchVariants> {
  variant?: "tremor"
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps | TremorSwitchProps
>(({ className, size, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    const variants = tremorSwitchVariants({ size: size || "default" })
    const { root, thumb } = variants
    return (
      <SwitchPrimitives.Root
        className={cx(root(), className)}
        tremor-id="tremor-raw"
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb className={cx(thumb())} />
      </SwitchPrimitives.Root>
    )
  }

  return (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ size }), className)}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(switchThumbVariants({ size }))}
      />
    </SwitchPrimitives.Root>
  )
})

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch, switchVariants, tremorSwitchVariants }
