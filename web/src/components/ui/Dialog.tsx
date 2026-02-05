"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cx, focusRing } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={
      variant === "tremor"
        ? cx(
            "fixed inset-0 z-50 overflow-y-auto bg-black/70 data-[state=open]:animate-dialogOverlayShow",
            className
          )
        : cx(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
          )
    }
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    variant?: "default" | "tremor"
    showCloseButton?: boolean
  }
>(({ className, children, variant = "default", showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant={variant} />
    <DialogPrimitive.Content
      ref={ref}
      className={
        variant === "tremor"
          ? cx(
              "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border p-6 shadow-lg",
              "border-gray-200 dark:border-gray-900",
              "bg-white dark:bg-[#090E1A]",
              "data-[state=open]:animate-dialogContentShow",
              focusRing,
              className
            )
          : cx(
              "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
              "sm:rounded-lg",
              className
            )
      }
      tremor-id={variant === "tremor" ? "tremor-raw" : undefined}
      {...props}
    >
      {children}
      {variant === "default" && showCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogContentFull = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant="tremor" />
    <DialogPrimitive.Content
      ref={ref}
      className={cx(
        "fixed z-50 max-w-lg overflow-y-auto rounded-md border p-6 shadow-lg",
        "border-gray-200 dark:border-gray-900",
        "bg-white dark:bg-[#090E1A]",
        "data-[state=open]:animate-dialogContentFullShow",
        focusRing,
        className
      )}
      tremor-id="tremor-raw"
      {...props}
    />
  </DialogPortal>
))
DialogContentFull.displayName = "DialogContentFull"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={
      variant === "tremor"
        ? cx("flex flex-col gap-y-1", className)
        : cx("flex flex-col space-y-1.5 text-center sm:text-left", className)
    }
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cx("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={
      variant === "tremor"
        ? cx("text-lg font-semibold text-gray-900 dark:text-gray-50", className)
        : cx("text-lg font-semibold leading-none tracking-tight", className)
    }
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={
      variant === "tremor"
        ? cx("text-gray-500 dark:text-gray-500", className)
        : cx("text-sm text-muted-foreground", className)
    }
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cx("flex-1 py-4", className)}
    {...props}
  />
))
DialogBody.displayName = "DialogBody"

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogContentFull,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
