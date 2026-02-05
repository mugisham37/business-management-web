"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
// Tremor Raw Popover [v0.0.2]

import * as PopoverPrimitives from "@radix-ui/react-popover"
import React from "react"

import { cx } from "@/lib/utils"

const Popover = (
  props: React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Root>,
) => {
  return <PopoverPrimitives.Root {...props} />
}

Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Trigger>
>((props, forwardedRef) => {
  return <PopoverPrimitives.Trigger ref={forwardedRef} {...props} />
})

PopoverTrigger.displayName = "PopoverTrigger"

const PopoverAnchor = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitives.Anchor>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Anchor>
>((props, forwardedRef) => {
  return <PopoverPrimitives.Anchor ref={forwardedRef} {...props} />
})

PopoverAnchor.displayName = "PopoverAnchor"

const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Close>
>((props, forwardedRef) => {
  return <PopoverPrimitives.Close ref={forwardedRef} {...props} />
})

PopoverClose.displayName = "PopoverClose"

interface ContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Content> { }

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitives.Content>,
  ContentProps
>(
  (
    {
      className,
      sideOffset = 10,
      side = "bottom",
      align = "center",
      collisionPadding,
      avoidCollisions = true,
      ...props
    }: ContentProps,
    forwardedRef,
  ) => {
    return (
      <PopoverPrimitives.Portal>
        <PopoverPrimitives.Content
          ref={forwardedRef}
          sideOffset={sideOffset}
          side={side}
          align={align}
          collisionPadding={collisionPadding}
          avoidCollisions={avoidCollisions}
          className={cx(
            // base
            "max-h-[var(--radix-popper-available-height)] min-w-60 overflow-hidden rounded-md border p-2.5 text-sm shadow-md",
            // border color
            "border-gray-200 dark:border-gray-800",
            // text color
            "text-gray-900 dark:text-gray-50",
            // background color
            "bg-white dark:bg-gray-950",
            // transition
            "will-change-[transform,opacity]",
            "data-[state=closed]:animate-hide",
            "data-[state=open]:data-[side=bottom]:animate-slideDownAndFade data-[state=open]:data-[side=left]:animate-slideLeftAndFade data-[state=open]:data-[side=right]:animate-slideRightAndFade data-[state=open]:data-[side=top]:animate-slideUpAndFade",

            className,
          )}
          // https://github.com/radix-ui/primitives/issues/1159
          tremor-id="tremor-raw"
          onWheel={(event) => {
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
          }}
          {...props}
        />
      </PopoverPrimitives.Portal>
    )
  },
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger }
// Tremor Popover [v0.0.3]

import * as PopoverPrimitives from "@radix-ui/react-popover"
import React from "react"

import { cx } from "@/lib/utils"

const Popover = (
  props: React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Root>,
) => {
  return <PopoverPrimitives.Root {...props} />
}

Popover.displayName = "Popover"

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Trigger>
>((props, forwardedRef) => {
  return <PopoverPrimitives.Trigger ref={forwardedRef} {...props} />
})

PopoverTrigger.displayName = "PopoverTrigger"

const PopoverAnchor = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitives.Anchor>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Anchor>
>((props, forwardedRef) => {
  return <PopoverPrimitives.Anchor ref={forwardedRef} {...props} />
})

PopoverAnchor.displayName = "PopoverAnchor"

const PopoverClose = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitives.Close>
>((props, forwardedRef) => {
  return <PopoverPrimitives.Close ref={forwardedRef} {...props} />
})

PopoverClose.displayName = "PopoverClose"

type ContentProps = React.ComponentPropsWithoutRef<
  typeof PopoverPrimitives.Content
>

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitives.Content>,
  ContentProps
>(
  (
    {
      className,
      sideOffset = 10,
      side = "bottom",
      align = "center",
      collisionPadding,
      avoidCollisions = true,
      ...props
    }: ContentProps,
    forwardedRef,
  ) => {
    return (
      <PopoverPrimitives.Portal>
        <PopoverPrimitives.Content
          ref={forwardedRef}
          sideOffset={sideOffset}
          side={side}
          align={align}
          collisionPadding={collisionPadding}
          avoidCollisions={avoidCollisions}
          className={cx(
            // base
            "max-h-[var(--radix-popper-available-height)] min-w-60 overflow-hidden rounded-md border p-2.5 text-sm shadow-md",
            // border color
            "border-gray-200 dark:border-gray-800",
            // text color
            "text-gray-900 dark:text-gray-50",
            // background color
            "bg-white dark:bg-gray-950",
            // transition
            "will-change-[transform,opacity]",
            "data-[state=closed]:animate-hide",
            "data-[state=open]:data-[side=bottom]:animate-slideDownAndFade data-[state=open]:data-[side=left]:animate-slideLeftAndFade data-[state=open]:data-[side=right]:animate-slideRightAndFade data-[state=open]:data-[side=top]:animate-slideUpAndFade",

            className,
          )}
          tremor-id="tremor-raw"
          // https://github.com/radix-ui/primitives/issues/1159
          onWheel={(event) => {
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
          }}
          {...props}
        />
      </PopoverPrimitives.Portal>
    )
  },
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverAnchor, PopoverClose, PopoverContent, PopoverTrigger }
