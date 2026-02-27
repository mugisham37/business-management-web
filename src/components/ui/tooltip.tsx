"use client"

import * as React from "react"
import * as TooltipPrimitives from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

interface TooltipProviderProps
  extends React.ComponentProps<typeof TooltipPrimitives.Provider> {
  delayDuration?: number
}

function TooltipProvider({
  delayDuration = 150,
  ...props
}: TooltipProviderProps) {
  return (
    <TooltipPrimitives.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

interface TooltipRootProps
  extends React.ComponentProps<typeof TooltipPrimitives.Root> {}

function TooltipRoot({ ...props }: TooltipRootProps) {
  return <TooltipPrimitives.Root data-slot="tooltip" {...props} />
}

interface TooltipTriggerProps
  extends React.ComponentProps<typeof TooltipPrimitives.Trigger> {
  asChild?: boolean
}

function TooltipTrigger({ asChild = false, ...props }: TooltipTriggerProps) {
  return (
    <TooltipPrimitives.Trigger
      data-slot="tooltip-trigger"
      asChild={asChild}
      {...props}
    />
  )
}

interface TooltipContentProps
  extends Omit<
    React.ComponentProps<typeof TooltipPrimitives.Content>,
    "content"
  > {
  showArrow?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitives.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 10,
      side = "top",
      align = "center",
      showArrow = true,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <TooltipPrimitives.Portal>
        <TooltipPrimitives.Content
          ref={ref}
          data-slot="tooltip-content"
          side={side}
          sideOffset={sideOffset}
          align={align}
          className={cn(
            // base
            "z-50 max-w-xs select-none rounded-md px-2.5 py-1.5 text-sm leading-5 shadow-md",
            // colors using CSS variables
            "bg-popover text-popover-foreground",
            // border
            "border border-border",
            // animation
            "origin-[--radix-tooltip-content-transform-origin]",
            "will-change-[transform,opacity]",
            "data-[side=bottom]:animate-slideDownAndFade",
            "data-[side=left]:animate-slideLeftAndFade",
            "data-[side=right]:animate-slideRightAndFade",
            "data-[side=top]:animate-slideUpAndFade",
            "data-[state=closed]:animate-hide",
            className,
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <TooltipPrimitives.Arrow
              className="fill-popover"
              width={12}
              height={7}
              aria-hidden="true"
            />
          )}
        </TooltipPrimitives.Content>
      </TooltipPrimitives.Portal>
    )
  },
)

TooltipContent.displayName = "TooltipContent"

// Compound component with simplified API
interface TooltipProps
  extends Omit<
    React.ComponentProps<typeof TooltipPrimitives.Content>,
    "content"
  > {
  content: React.ReactNode
  triggerAsChild?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  showArrow?: boolean
}

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitives.Content>,
  TooltipProps
>(
  (
    {
      children,
      content,
      delayDuration = 150,
      defaultOpen,
      open,
      onOpenChange,
      triggerAsChild = false,
      showArrow = true,
      side = "top",
      sideOffset = 10,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <TooltipProvider delayDuration={delayDuration}>
        <TooltipRoot
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          delayDuration={delayDuration}
        >
          <TooltipTrigger asChild={triggerAsChild}>{children}</TooltipTrigger>
          <TooltipContent
            ref={ref}
            side={side}
            sideOffset={sideOffset}
            showArrow={showArrow}
            className={className}
            {...props}
          >
            {content}
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    )
  },
)

Tooltip.displayName = "Tooltip"

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  type TooltipProps,
  type TooltipContentProps,
  type TooltipProviderProps,
  type TooltipRootProps,
  type TooltipTriggerProps,
}
