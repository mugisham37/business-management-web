import * as React from "react"

import { cn } from "@/lib/utils"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          // base
          "relative block w-full appearance-none rounded-md border px-3 py-2 pr-10 shadow-sm outline-none transition sm:text-sm",
          // border color - using CSS variables
          "border-border",
          // text color - using CSS variables
          "text-foreground",
          // background color - using CSS variables
          "bg-background",
          // hover state
          "hover:border-input",
          // focus state
          "focus:border-ring focus:ring-2 focus:ring-ring/20",
          // disabled state
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          // size variants
          size === "sm" && "py-1.5 text-xs",
          size === "default" && "py-2 text-sm"
        )}
        {...props}
      />
      <IconPlaceholder
        lucide="ChevronDownIcon"
        tabler="IconSelector"
        hugeicons="UnfoldMoreIcon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-muted-foreground",
          size === "sm" && "size-4",
          size === "default" && "size-5"
        )}
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({ 
  className,
  ...props 
}: React.ComponentProps<"option">) {
  return (
    <option 
      data-slot="native-select-option"
      className={cn(
        // background and text colors using CSS variables
        "bg-background text-foreground",
        className
      )}
      {...props} 
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(
        // text color using CSS variables
        "text-muted-foreground font-semibold",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
