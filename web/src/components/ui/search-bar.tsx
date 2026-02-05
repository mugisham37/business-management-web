import { RiSearchLine } from "@remixicon/react"
import * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const searchbarVariants = tv({
  base: [
    "relative block w-full appearance-none rounded-md border px-2.5 py-1.5 outline-none transition sm:text-sm",
    "border-transparent dark:border-gray-800",
    "text-gray-900 dark:text-gray-50",
    "placeholder-gray-400 dark:placeholder-gray-500",
    "bg-gray-100 dark:bg-gray-950",
    "disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
    "disabled:dark:border-gray-700 disabled:dark:bg-gray-800 disabled:dark:text-gray-500",
    "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
    ...focusInput,
  ],
  variants: {
    hasError: {
      true: [...hasErrorInput],
    },
    enableStepper: {
      true: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
    size: {
      sm: "px-2 py-1 text-xs",
      default: "px-2.5 py-1.5 sm:text-sm",
      lg: "px-3 py-2 text-sm",
    },
    variant: {
      default: "",
      filled: [
        "bg-gray-100 dark:bg-gray-950",
        "border-transparent dark:border-gray-800",
      ],
      outlined: [
        "bg-transparent",
        "border-gray-300 dark:border-gray-700",
      ],
    },
  },
  defaultVariants: {
    size: "default",
    variant: "filled",
    enableStepper: false,
  },
})

const iconVariants = tv({
  base: [
    "pointer-events-none absolute flex items-center justify-center",
    "text-gray-400 dark:text-gray-600",
  ],
  variants: {
    size: {
      sm: "bottom-0 left-1.5 h-full",
      default: "bottom-0 left-2 h-full",
      lg: "bottom-0 left-2.5 h-full",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const iconSizeMap = {
  sm: "size-4",
  default: "size-[1.125rem]",
  lg: "size-5",
} as const

const paddingMap = {
  sm: "pl-6",
  default: "pl-8",
  lg: "pl-9",
} as const

export interface SearchbarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    VariantProps<typeof searchbarVariants> {
  inputClassName?: string
  iconClassName?: string
  containerClassName?: string
}

const Searchbar = React.forwardRef<HTMLInputElement, SearchbarProps>(
  (
    {
      className,
      containerClassName,
      inputClassName,
      iconClassName,
      hasError,
      enableStepper,
      size = "default",
      variant = "filled",
      placeholder = "Search...",
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cx("relative w-full", containerClassName)}>
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={cx(
            searchbarVariants({ hasError, enableStepper, size, variant }),
            paddingMap[size],
            inputClassName,
            className,
          )}
          {...props}
        />
        <div className={cx(iconVariants({ size }), iconClassName)}>
          <RiSearchLine
            className={cx(iconSizeMap[size], "shrink-0")}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  },
)

Searchbar.displayName = "Searchbar"

export { Searchbar, searchbarVariants }
