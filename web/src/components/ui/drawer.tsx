"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
// Tremor Raw Drawer [v0.0.0]

import * as DrawerPrimitives from "@radix-ui/react-dialog"
import { RiCloseLine } from "@remixicon/react"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"

import { Button } from "./Button"

const Drawer = (
  props: React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Root>,
) => {
  return <DrawerPrimitives.Root tremor-id="tremor-raw" {...props} />
}
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Trigger ref={ref} className={cx(className)} {...props} />
  )
})
DrawerTrigger.displayName = "Drawer.Trigger"

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Close>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Close ref={ref} className={cx(className)} {...props} />
  )
})
DrawerClose.displayName = "Drawer.Close"

const DrawerPortal = DrawerPrimitives.Portal

DrawerPortal.displayName = "DrawerPortal"

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/30 dark:bg-black/60",
        // transition
        "data-[state=closed]:animate-hide data-[state=open]:animate-dialogOverlayShow",
        className,
      )}
      {...props}
      style={{
        animationDuration: "400ms",
        animationFillMode: "backwards",
      }}
    />
  )
})

DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPortal>
      <DrawerOverlay>
        <DrawerPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed inset-y-2 mx-auto flex w-[95vw] flex-1 flex-col overflow-y-auto rounded-md border p-4 shadow-lg focus:outline-none max-sm:inset-x-2 sm:inset-y-2 sm:right-2 sm:max-w-lg sm:p-6",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
            // transition
            "data-[state=closed]:animate-drawerSlideRightAndFade data-[state=open]:animate-drawerSlideLeftAndFade",
            focusRing,
            className,
          )}
          {...props}
        />
      </DrawerOverlay>
    </DrawerPortal>
  )
})

DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="-mx-6 flex items-start justify-between gap-x-4 border-b border-gray-200 px-6 pb-4 dark:border-gray-900"
      {...props}
    >
      <div className={cx("mt-1 flex flex-col gap-y-1", className)}>
        {children}
      </div>
      <DrawerPrimitives.Close asChild>
        <Button
          variant="ghost"
          className="aspect-square p-1 text-gray-500 hover:bg-gray-100 hover:dark:bg-gray-400/10"
        >
          <RiCloseLine className="size-6" aria-hidden="true" />
        </Button>
      </DrawerPrimitives.Close>
    </div>
  )
})

DrawerHeader.displayName = "Drawer.Header"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DrawerPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-base font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DrawerTitle.displayName = "DrawerTitle"

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />
})

DrawerBody.displayName = "Drawer.Body"

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-gray-900",
        className,
      )}
      {...props}
    />
  )
}

DrawerFooter.displayName = "DrawerFooter"

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
}

// Tremor Drawer [v0.0.1]

import * as DrawerPrimitives from "@radix-ui/react-dialog"
import { RiCloseLine } from "@remixicon/react"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"

import { Button } from "./Button"

const Drawer = (
  props: React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Root>,
) => {
  return <DrawerPrimitives.Root tremor-id="tremor-raw" {...props} />
}
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Trigger ref={ref} className={cx(className)} {...props} />
  )
})
DrawerTrigger.displayName = "Drawer.Trigger"

const DrawerClose = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Close>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Close ref={ref} className={cx(className)} {...props} />
  )
})
DrawerClose.displayName = "Drawer.Close"

const DrawerPortal = DrawerPrimitives.Portal

DrawerPortal.displayName = "DrawerPortal"

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/30 backdrop-blur-sm",
        // transition
        "data-[state=closed]:animate-hide data-[state=open]:animate-dialogOverlayShow",
        className,
      )}
      {...props}
      style={{
        animationDuration: "400ms",
        animationFillMode: "backwards",
      }}
    />
  )
})

DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPortal>
      <DrawerOverlay>
        <DrawerPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed inset-y-2 mx-auto flex w-[95vw] flex-1 flex-col overflow-y-auto rounded-md border p-4 shadow-lg focus:outline-none max-sm:inset-x-2 sm:inset-y-2 sm:right-2 sm:max-w-lg sm:p-6",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
            // transition
            "data-[state=closed]:animate-drawerSlideRightAndFade data-[state=open]:animate-drawerSlideLeftAndFade",
            focusRing,
            className,
          )}
          {...props}
        />
      </DrawerOverlay>
    </DrawerPortal>
  )
})

DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="flex items-start justify-between gap-x-4 pb-4"
      {...props}
    >
      <div className={cx("mt-1 flex flex-col gap-y-1", className)}>
        {children}
      </div>
      <DrawerPrimitives.Close asChild>
        <Button
          variant="secondary"
          className="aspect-square p-1 hover:bg-gray-100 hover:dark:bg-gray-400/10"
        >
          <RiCloseLine className="size-6" aria-hidden="true" />
        </Button>
      </DrawerPrimitives.Close>
    </div>
  )
})

DrawerHeader.displayName = "Drawer.Header"

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DrawerPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-base font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DrawerTitle.displayName = "DrawerTitle"

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />
})
DrawerBody.displayName = "Drawer.Body"

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-gray-900",
        className,
      )}
      {...props}
    />
  )
}

DrawerFooter.displayName = "DrawerFooter"

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
}
// Tremor Drawer [v0.0.1]

import * as DrawerPrimitives from "@radix-ui/react-dialog"
import { RiCloseLine } from "@remixicon/react"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"

import { Button } from "./Button"

const Drawer = (
  props: React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Root>,
) => {
  return <DrawerPrimitives.Root tremor-id="tremor-raw" {...props} />
}
Drawer.displayName = "Drawer"

const DrawerTrigger = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Trigger ref={ref} className={cx(className)} {...props} />
  )
})
DrawerTrigger.displayName = "Drawer.Trigger"

const DrawerClose = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Close>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Close ref={ref} className={cx(className)} {...props} />
  )
})
DrawerClose.displayName = "Drawer.Close"

const DrawerPortal = DrawerPrimitives.Portal

DrawerPortal.displayName = "DrawerPortal"

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/30",
        // transition
        "data-[state=open]:animate-dialogOverlayShow data-[state=closed]:animate-hide",
        className,
      )}
      {...props}
      style={{
        animationDuration: "400ms",
        animationFillMode: "backwards",
      }}
    />
  )
})

DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPortal>
      <DrawerOverlay>
        <DrawerPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed inset-y-2 mx-auto flex w-[95vw] flex-1 flex-col overflow-y-auto rounded-md border p-4 shadow-lg focus:outline-none max-sm:inset-x-2 sm:inset-y-2 sm:right-2 sm:max-w-lg sm:p-6",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
            // transition
            "data-[state=closed]:animate-drawerSlideRightAndFade data-[state=open]:animate-drawerSlideLeftAndFade",
            focusRing,
            className,
          )}
          {...props}
        />
      </DrawerOverlay>
    </DrawerPortal>
  )
})

DrawerContent.displayName = "DrawerContent"

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="flex items-start justify-between gap-x-4 border-b border-gray-200 pb-4 dark:border-gray-900"
      {...props}
    >
      <div className={cx("mt-1 flex flex-col gap-y-1", className)}>
        {children}
      </div>
      <DrawerPrimitives.Close asChild>
        <Button
          variant="ghost"
          className="aspect-square p-1 hover:bg-gray-100 hover:dark:bg-gray-400/10"
        >
          <RiCloseLine className="size-6" aria-hidden="true" />
        </Button>
      </DrawerPrimitives.Close>
    </div>
  )
})

DrawerHeader.displayName = "Drawer.Header"

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DrawerPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-base font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DrawerTitle.displayName = "DrawerTitle"

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />
})
DrawerBody.displayName = "Drawer.Body"

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DrawerPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DrawerDescription.displayName = "DrawerDescription"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-gray-900",
        className,
      )}
      {...props}
    />
  )
}

DrawerFooter.displayName = "DrawerFooter"

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
}
