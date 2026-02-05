"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
// Tremor Raw Dialog [v0.0.0]

import * as DialogPrimitives from "@radix-ui/react-dialog"
import React from "react"

import { cx, focusRing } from "@/lib/utils"

const Dialog = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Root>,
) => {
  return <DialogPrimitives.Root {...props} />
}
Dialog.displayName = "Dialog"

const DialogTrigger = DialogPrimitives.Trigger

DialogTrigger.displayName = "DialogTrigger"

const DialogClose = DialogPrimitives.Close

DialogClose.displayName = "DialogClose"

const DialogPortal = DialogPrimitives.Portal

DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/70",
        // transition
        "data-[state=open]:animate-dialogOverlayShow",
        className,
      )}
      {...props}
    />
  )
})

DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPortal>
      <DialogOverlay>
        <DialogPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border p-6 shadow-lg",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
            // transition
            "data-[state=open]:animate-dialogContentShow",
            focusRing,
            className,
          )}
          tremor-id="tremor-raw"
          {...props}
        />
      </DialogOverlay>
    </DialogPortal>
  )
})

DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cx("flex flex-col gap-y-1", className)} {...props} />
}

DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-lg font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

DialogFooter.displayName = "DialogFooter"

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
}

// Tremor Dialog [v0.0.1]

import * as DialogPrimitives from "@radix-ui/react-dialog"
import React from "react"

import { cx, focusRing } from "@/lib/utils"

const Dialog = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Root>,
) => {
  return <DialogPrimitives.Root {...props} />
}
Dialog.displayName = "Dialog"

const DialogTrigger = DialogPrimitives.Trigger

DialogTrigger.displayName = "DialogTrigger"

const DialogClose = DialogPrimitives.Close

DialogClose.displayName = "DialogClose"

const DialogPortal = DialogPrimitives.Portal

DialogPortal.displayName = "DialogPortal"

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Overlay
      ref={forwardedRef}
      className={cx(
        // base
        "fixed inset-0 z-50 overflow-y-auto",
        // background color
        "bg-black/70",
        // transition
        "data-[state=open]:animate-dialogOverlayShow",
        className,
      )}
      {...props}
    />
  )
})

DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPortal>
      <DialogOverlay>
        <DialogPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border p-6 shadow-lg",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
            // transition
            "data-[state=open]:animate-dialogContentShow",
            focusRing,
            className,
          )}
          tremor-id="tremor-raw"
          {...props}
        />
      </DialogOverlay>
    </DialogPortal>
  )
})

DialogContent.displayName = "DialogContent"

const DialogContentFull = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Content>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPortal>
      <DialogOverlay>
        <DialogPrimitives.Content
          ref={forwardedRef}
          className={cx(
            // base
            "fixed z-50 max-w-lg overflow-y-auto rounded-md border p-6 shadow-lg",
            // border color
            "border-gray-200 dark:border-gray-900",
            // background color
            "bg-white dark:bg-[#090E1A]",
            // transition
            "data-[state=open]:animate-dialogContentFullShow",
            focusRing,
            className,
          )}
          tremor-id="tremor-raw"
          {...props}
        />
      </DialogOverlay>
    </DialogPortal>
  )
})

DialogContentFull.displayName = "DialogContentFull"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cx("flex flex-col gap-y-1", className)} {...props} />
}

DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitives.Title
    ref={forwardedRef}
    className={cx(
      // base
      "text-lg font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      className,
    )}
    {...props}
  />
))

DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitives.Description>
>(({ className, ...props }, forwardedRef) => {
  return (
    <DialogPrimitives.Description
      ref={forwardedRef}
      className={cx("text-gray-500 dark:text-gray-500", className)}
      {...props}
    />
  )
})

DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  )
}

DialogFooter.displayName = "DialogFooter"

const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cx("flex-1 py-4", className)} {...props} />
})

DialogBody.displayName = "DialogBody.Body"

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogContentFull,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
