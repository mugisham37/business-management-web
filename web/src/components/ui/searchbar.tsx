// Tremor Raw Input [v1.0.0]

import { RiSearchLine } from "@remixicon/react"
import * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const inputStyles = tv({
  base: [
    // base
    "relative block w-full appearance-none rounded-md border px-2.5 py-1.5 outline-none transition sm:text-sm",
    // border color
    "border-border",
    // text color
    "text-foreground",
    // placeholder color
    "placeholder-muted-foreground",
    // background color
    "bg-muted",
    // disabled
    "disabled:border-input disabled:bg-muted disabled:text-muted-foreground",
    // focus
    focusInput,
    // remove search cancel button
    "[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
    // number input
    enableStepper: {
      true: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
})

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  inputClassName?: string
}

const Searchbar = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      hasError,
      enableStepper,
      type = "search",
      ...props
    }: InputProps,
    forwardedRef,
  ) => {
    return (
      <div className={cx("relative w-full", className)}>
        <input
          ref={forwardedRef}
          type={type}
          className={cx(
            inputStyles({ hasError, enableStepper }),
            "pl-8",
            inputClassName,
          )}
          {...props}
        />
        <div
          className={cx(
            // base
            "pointer-events-none absolute bottom-0 left-2 flex h-full items-center justify-center",
            // text color
            "text-muted-foreground",
          )}
        >
          <RiSearchLine
            className="size-[1.125rem] shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    )
  },
)

Searchbar.displayName = "Searchbar"

export { Searchbar }
