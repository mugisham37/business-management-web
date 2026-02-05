import * as React from "react"

import { cn, cx, focusInput, hasErrorInput } from "@/lib/utils"

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  variant?: "default" | "tremor"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, variant = "default", ...props }, ref) => {
    if (variant === "tremor") {
      return (
        <textarea
          ref={ref}
          className={cx(
            "flex min-h-[4rem] w-full rounded-md border px-3 py-1.5 shadow-sm outline-none transition-colors sm:text-sm",
            "text-gray-900 dark:text-gray-50",
            "border-gray-300 dark:border-gray-800",
            "bg-white dark:bg-gray-950",
            "placeholder-gray-400 dark:placeholder-gray-500",
            "disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-300",
            "disabled:dark:border-gray-700 disabled:dark:bg-gray-800 disabled:dark:text-gray-500",
            focusInput,
            hasError ? hasErrorInput : "",
            className,
          )}
          tremor-id="tremor-raw"
          {...props}
        />
      )
    }

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, type TextareaProps }