"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cx } from "@/lib/utils"

const cn = cx

const Popover = PopoverPrimitive.Root

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => <PopoverPrimitive.Trigger ref={ref} {...props} />)

PopoverTrigger.displayName = "PopoverTrigger"

const PopoverAnchor = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Anchor>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>
>((props, ref) => <PopoverPrimitive.Anchor ref={ref} {...props} />)

PopoverAnchor.displayName = "PopoverAnchor"

const PopoverClose = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>((props, ref) => <PopoverPrimitive.Close ref={ref} {...props} />)

PopoverClose.displayName = "PopoverClose"

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  variant?: "default" | "tremor"
}

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ 
  className, 
  align = "center", 
  sideOffset = 4, 
  side = "bottom",
  collisionPadding,
  avoidCollisions = true,
  variant = "default",
  ...props 
}, ref) => {
  const classNameUtil = variant === "tremor" ? cx : cn
  
  const baseClasses = variant === "tremor" 
    ? "max-h-[var(--radix-popper-available-height)] min-w-60 overflow-hidden rounded-md border p-2.5 text-sm shadow-md border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-950 will-change-[transform,opacity] data-[state=closed]:animate-hide data-[state=open]:data-[side=bottom]:animate-slideDownAndFade data-[state=open]:data-[side=left]:animate-slideLeftAndFade data-[state=open]:data-[side=right]:animate-slideRightAndFade data-[state=open]:data-[side=top]:animate-slideUpAndFade"
    : "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]"

  const tremorSideOffset = variant === "tremor" ? 10 : sideOffset

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={tremorSideOffset}
        side={side}
        collisionPadding={collisionPadding}
        avoidCollisions={avoidCollisions}
        className={classNameUtil(baseClasses, className)}
        {...(variant === "tremor" && { "tremor-id": "tremor-raw" })}
        {...(variant === "tremor" && {
          onWheel: (event: React.WheelEvent) => {
            event.stopPropagation()
            const isScrollingDown = event.deltaY > 0
            if (isScrollingDown) {
              event.currentTarget.dispatchEvent(
                new KeyboardEvent("keydown", { key: "ArrowDown" }),
              )
            } else {
              event.currentTarget.dispatchEvent(
                new KeyboardEvent("keydown", { key: "ArrowUp" }),
              )
            }
          }
        })}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})

PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose }
