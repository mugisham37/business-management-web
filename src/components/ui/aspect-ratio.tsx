"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
  asChild?: boolean
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, className, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="aspect-ratio"
        className={cn("relative w-full", className)}
        style={{
          paddingBottom: `${100 / ratio}%`,
          ...style,
        }}
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    )
  }
)

AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
