// Tremor Raw Divider [v0.0.1]

import React from "react"

import { cx } from "@/lib/utils"

interface DividerProps extends React.ComponentPropsWithoutRef<"div"> {}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, children, ...props }, forwardedRef) => (
    <div
      ref={forwardedRef}
      className={cx(
        // base
        "mx-auto my-6 flex w-full items-center justify-between gap-3 text-sm",
        // text color using CSS variables
        "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children ? (
        <>
          <div
            className={cx(
              // base
              "h-[1px] w-full",
              // background color using CSS variables
              "bg-border",
            )}
          />
          <div className="whitespace-nowrap text-inherit">{children}</div>
          <div
            className={cx(
              // base
              "h-[1px] w-full",
              // background color using CSS variables
              "bg-border",
            )}
          />
        </>
      ) : (
        <div
          className={cx(
            // base
            "h-[1px] w-full",
            // background color using CSS variables
            "bg-border",
          )}
        />
      )}
    </div>
  ),
)

Divider.displayName = "Divider"

export { Divider }
