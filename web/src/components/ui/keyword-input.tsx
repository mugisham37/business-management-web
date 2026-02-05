// Tremor Raw KeywordInput [v1.0.3]
"use client"

import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const keywordInputStyles = tv({
  base: [
    // base
    "relative block w-full appearance-none rounded-md border px-2.5 py-2 shadow-sm outline-none transition sm:text-sm",
    // border color
    "border-gray-300 dark:border-gray-800",
    // text color
    "text-gray-900 dark:text-gray-50",
    // placeholder color
    "placeholder-gray-400 dark:placeholder-gray-500",
    // background color
    "bg-white dark:bg-gray-950",
    // disabled
    "disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
    "disabled:dark:border-gray-700 disabled:dark:bg-gray-800 disabled:dark:text-gray-500",
    // focus
    ...focusInput,
    // remove webkit search decorations
    "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
  ],
  variants: {
    hasError: {
      true: [...hasErrorInput],
    },
    inputSize: {
      sm: "px-2 py-1.5 text-xs",
      md: "px-2.5 py-2 sm:text-sm",
      lg: "px-3 py-2.5 text-sm",
    },
  },
  defaultVariants: {
    inputSize: "md",
  },
})

const keywordIndicatorStyles = tv({
  base: [
    "pointer-events-none absolute inset-y-0 left-0 flex items-center",
  ],
  variants: {
    inputSize: {
      sm: "pl-2",
      md: "pl-3",
      lg: "pl-3.5",
    },
    variant: {
      default: "bg-rose-600 dark:bg-rose-500",
      primary: "bg-blue-600 dark:bg-blue-500",
      secondary: "bg-gray-600 dark:bg-gray-400",
      success: "bg-green-600 dark:bg-green-500",
      warning: "bg-yellow-600 dark:bg-yellow-500",
      danger: "bg-red-600 dark:bg-red-500",
    },
  },
  defaultVariants: {
    inputSize: "md",
    variant: "default",
  },
})

const keywordDotStyles = tv({
  base: "rounded-sm",
  variants: {
    inputSize: {
      sm: "size-1.5",
      md: "size-2",
      lg: "size-2.5",
    },
    variant: {
      default: "bg-rose-600 dark:bg-rose-500",
      primary: "bg-blue-600 dark:bg-blue-500",
      secondary: "bg-gray-600 dark:bg-gray-400",
      success: "bg-green-600 dark:bg-green-500",
      warning: "bg-yellow-600 dark:bg-yellow-500",
      danger: "bg-red-600 dark:bg-red-500",
    },
  },
  defaultVariants: {
    inputSize: "md",
    variant: "default",
  },
})

type KeywordInputSize = "sm" | "md" | "lg"
type KeywordInputVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger"

export interface KeywordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Pick<VariantProps<typeof keywordInputStyles>, "hasError"> {
  inputClassName?: string
  indicatorClassName?: string
  dotClassName?: string
  inputSize?: KeywordInputSize
  variant?: KeywordInputVariant
}

const KeywordInput = React.forwardRef<HTMLInputElement, KeywordInputProps>(
  (
    {
      className,
      inputClassName,
      indicatorClassName,
      dotClassName,
      hasError,
      inputSize = "md",
      variant = "default",
      type = "text",
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const paddingMap: Record<KeywordInputSize, string> = {
      sm: "!pl-6",
      md: "!pl-8",
      lg: "!pl-10",
    }

    return (
      <div className={cx("relative w-full", className)} tremor-id="tremor-raw">
        <input
          ref={ref}
          type={type}
          className={cx(
            "block",
            paddingMap[inputSize],
            keywordInputStyles({ hasError, inputSize }),
            inputClassName,
          )}
          aria-invalid={hasError || ariaInvalid}
          {...props}
        />
        <div className={cx(
          keywordIndicatorStyles({ inputSize, variant }),
          indicatorClassName,
        )}>
          <span
            className={cx(
              keywordDotStyles({ inputSize, variant }),
              dotClassName,
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  },
)

KeywordInput.displayName = "KeywordInput"

export { keywordInputStyles, keywordIndicatorStyles, keywordDotStyles, KeywordInput }
