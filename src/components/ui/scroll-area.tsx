"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative overflow-auto", className)}
        {...props}
      >
        <div data-slot="scroll-area-viewport" className="size-full">
          {children}
        </div>
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal"
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="scroll-area-scrollbar"
        data-orientation={orientation}
        className={cn(
          "flex touch-none select-none p-px transition-colors",
          orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
          orientation === "horizontal" && "h-2.5 w-full border-t border-t-transparent",
          className
        )}
        {...props}
      >
        <div
          data-slot="scroll-area-thumb"
          className="relative flex-1 rounded-full bg-border"
        />
      </div>
    )
  }
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
