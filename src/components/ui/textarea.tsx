import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn, cx, focusInput, hasErrorInput } from "@/lib/utils"

// Simple Textarea Component using CSS variables from global.css
function TextareaSimple({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex min-h-16 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

// Tremor Textarea [v1.0.5] - Enhanced with CSS variables
const textareaVariants = cva(
  [
    // base
    "relative block w-full appearance-none rounded-md border px-2.5 py-2 shadow-sm outline-none transition sm:text-sm resize-none",
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
  ].join(" "),
  {
    variants: {
      hasError: {
        true: hasErrorInput.join(" "),
        false: focusInput.join(" "),
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
)

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  textareaClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      textareaClassName,
      hasError,
      ...props
    },
    forwardedRef,
  ) => {
    return (
      <div className={cx("relative w-full", className)} tremor-id="tremor-raw">
        <textarea
          ref={forwardedRef}
          className={cx(textareaVariants({ hasError }), textareaClassName)}
          {...props}
        />
      </div>
    )
  },
)

Textarea.displayName = "Textarea"

export { Textarea, TextareaSimple, textareaVariants, type TextareaProps }
