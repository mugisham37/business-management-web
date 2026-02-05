"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import * as DrawerPrimitives from "@radix-ui/react-dialog"
import { RiCloseLine } from "@remixicon/react"

import { cx, focusRing } from "@/lib/utils"
import { Button } from "./Button"

const VaulDrawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)

const RadixDrawer = (
  props: React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Root>,
) => {
  return <DrawerPrimitives.Root tremor-id="tremor-raw" {...props} />
}

const Drawer = VaulDrawer

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cx("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = "DrawerOverlay"

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cx(
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

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { withCloseButton?: boolean }
>(({ children, className, withCloseButton = false, ...props }, ref) => {
  if (withCloseButton) {
    return (
      <div
        ref={ref}
        className={cx(
          "flex items-start justify-between gap-x-4 border-b border-gray-200 pb-4 dark:border-gray-900",
          className
        )}
        {...props}
      >
        <div className="mt-1 flex flex-col gap-y-1 flex-1">
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
  }
  
  return (
    <div
      ref={ref}
      className={cx("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  )
})
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cx(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cx("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"

const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />
})
DrawerBody.displayName = "DrawerBody"

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
))
DrawerFooter.displayName = "DrawerFooter"

const RadixDrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Trigger ref={ref} className={cx(className)} {...props} />
  )
})
RadixDrawerTrigger.displayName = "RadixDrawerTrigger"

const RadixDrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Close>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Close ref={ref} className={cx(className)} {...props} />
  )
})
RadixDrawerClose.displayName = "RadixDrawerClose"

const RadixDrawerPortal = DrawerPrimitives.Portal

const RadixDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Overlay
      ref={ref}
      className={cx(
        "fixed inset-0 z-50 overflow-y-auto",
        "bg-black/30 backdrop-blur-sm dark:bg-black/60",
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
RadixDrawerOverlay.displayName = "RadixDrawerOverlay"

const RadixDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Content>
>(({ className, ...props }, ref) => {
  return (
    <RadixDrawerPortal>
      <RadixDrawerOverlay />
      <DrawerPrimitives.Content
        ref={ref}
        className={cx(
          "fixed inset-y-2 mx-auto flex w-[95vw] flex-1 flex-col overflow-y-auto rounded-md border p-4 shadow-lg focus:outline-none max-sm:inset-x-2 sm:inset-y-2 sm:right-2 sm:max-w-lg sm:p-6",
          "border-gray-200 dark:border-gray-900",
          "bg-white dark:bg-[#090E1A]",
          "data-[state=closed]:animate-drawerSlideRightAndFade data-[state=open]:animate-drawerSlideLeftAndFade",
          focusRing,
          className,
        )}
        {...props}
      />
    </RadixDrawerPortal>
  )
})
RadixDrawerContent.displayName = "RadixDrawerContent"

const RadixDrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { withCloseButton?: boolean }
>(({ children, className, withCloseButton = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cx(
        "flex items-start justify-between gap-x-4 pb-4",
        withCloseButton && "border-b border-gray-200 dark:border-gray-900",
        className
      )}
      {...props}
    >
      <div className="mt-1 flex flex-col gap-y-1 flex-1">
        {children}
      </div>
      {withCloseButton && (
        <DrawerPrimitives.Close asChild>
          <Button
            variant="ghost"
            className="aspect-square p-1 hover:bg-gray-100 hover:dark:bg-gray-400/10"
          >
            <RiCloseLine className="size-6" aria-hidden="true" />
          </Button>
        </DrawerPrimitives.Close>
      )}
    </div>
  )
})
RadixDrawerHeader.displayName = "RadixDrawerHeader"

const RadixDrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitives.Title
    ref={ref}
    className={cx(
      "text-base font-semibold",
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))
RadixDrawerTitle.displayName = "RadixDrawerTitle"

const RadixDrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Description>
>(({ className, ...props }, ref) => {
  return (
    <DrawerPrimitives.Description
      ref={ref}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})
RadixDrawerDescription.displayName = "RadixDrawerDescription"

const RadixDrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cx(
        "flex flex-col-reverse border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-gray-900",
        className,
      )}
      {...props}
    />
  )
})
RadixDrawerFooter.displayName = "RadixDrawerFooter"

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
  DrawerBody,
  VaulDrawer,
  RadixDrawer,
  RadixDrawerTrigger,
  RadixDrawerClose,
  RadixDrawerPortal,
  RadixDrawerOverlay,
  RadixDrawerContent,
  RadixDrawerHeader,
  RadixDrawerTitle,
  RadixDrawerDescription,
  RadixDrawerFooter,
}