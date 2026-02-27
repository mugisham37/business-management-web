"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Drawer = DialogPrimitive.Root

const DrawerTrigger = DialogPrimitive.Trigger

const DrawerPortal = DialogPrimitive.Portal

const DrawerClose = DialogPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="drawer-overlay"
    className={cn(
      "cn-drawer-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left"
    showCloseButton?: boolean
  }
>(({ className, children, side = "bottom", showCloseButton = true, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="drawer-content"
      data-side={side}
      className={cn(
        "cn-drawer-content group/drawer-content fixed z-50 flex flex-col",
        "gap-4 border bg-card p-6 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-300",
        side === "bottom" && [
          "inset-x-0 bottom-0 rounded-t-lg",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        ],
        side === "top" && [
          "inset-x-0 top-0 rounded-b-lg",
          "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        ],
        side === "left" && [
          "inset-y-0 left-0 h-full w-3/4 rounded-r-lg sm:max-w-sm",
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        ],
        side === "right" && [
          "inset-y-0 right-0 h-full w-3/4 rounded-l-lg sm:max-w-sm",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        ],
        className
      )}
      {...props}
    >
      {(side === "bottom" || side === "top") && (
        <div className="cn-drawer-handle mx-auto h-1.5 w-12 shrink-0 rounded-full bg-muted" />
      )}
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="cn-drawer-close absolute right-4 top-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </Button>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = DialogPrimitive.Content.displayName

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="drawer-header"
    className={cn(
      "cn-drawer-header flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="drawer-footer"
    className={cn(
      "cn-drawer-footer mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="drawer-title"
    className={cn(
      "cn-drawer-title text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DialogPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="drawer-description"
    className={cn(
      "cn-drawer-description text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
))
DrawerDescription.displayName = DialogPrimitive.Description.displayName

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
