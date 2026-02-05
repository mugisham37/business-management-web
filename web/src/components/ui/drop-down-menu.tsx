"use client"

import * as React from "react"
import * as DropdownMenuPrimitives from "@radix-ui/react-dropdown-menu"
import {
  RiArrowRightSLine,
  RiCheckboxBlankCircleLine,
  RiCheckLine,
  RiRadioButtonFill,
} from "@remixicon/react"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cx } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitives.Root
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = DropdownMenuPrimitives.Trigger
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuGroup = DropdownMenuPrimitives.Group
DropdownMenuGroup.displayName = "DropdownMenuGroup"

const DropdownMenuPortal = DropdownMenuPrimitives.Portal
DropdownMenuPortal.displayName = "DropdownMenuPortal"

const DropdownMenuSub = DropdownMenuPrimitives.Sub
DropdownMenuSub.displayName = "DropdownMenuSub"

const DropdownMenuSubMenu = DropdownMenuPrimitives.Sub
DropdownMenuSubMenu.displayName = "DropdownMenuSubMenu"

const DropdownMenuRadioGroup = DropdownMenuPrimitives.RadioGroup
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup"

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.SubTrigger> & {
    inset?: boolean
    iconType?: "remix" | "lucide"
  }
>(({ className, inset, children, iconType = "remix", ...props }, ref) => (
  <DropdownMenuPrimitives.SubTrigger
    ref={ref}
    className={cx(
      "relative flex cursor-default select-none items-center rounded py-1.5 pl-2 pr-1 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
      "text-gray-900 dark:text-gray-50",
      "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600",
      "focus-visible:bg-gray-100 data-[state=open]:bg-gray-100 focus-visible:dark:bg-gray-900 data-[state=open]:dark:bg-gray-900",
      "hover:bg-gray-100 hover:dark:bg-gray-900",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    {iconType === "remix" ? (
      <RiArrowRightSLine className="ml-auto size-4 shrink-0 text-gray-500" aria-hidden="true" />
    ) : (
      <ChevronRight className="ml-auto size-4 shrink-0" />
    )}
  </DropdownMenuPrimitives.SubTrigger>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubMenuTrigger = DropdownMenuSubTrigger
DropdownMenuSubMenuTrigger.displayName = "DropdownMenuSubMenuTrigger"

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.SubContent>
>(({ className, collisionPadding = 8, ...props }, ref) => (
  <DropdownMenuPrimitives.Portal>
    <DropdownMenuPrimitives.SubContent
      ref={ref}
      collisionPadding={collisionPadding}
      className={cx(
        "relative z-50 overflow-hidden rounded-md border p-1 shadow-xl shadow-black/[2.5%]",
        "min-w-32",
        "max-h-[var(--radix-popper-available-height)]",
        "bg-white dark:bg-gray-950",
        "text-gray-900 dark:text-gray-50",
        "border-gray-200 dark:border-gray-800",
        "will-change-[transform,opacity]",
        "data-[state=closed]:animate-hide",
        "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitives.Portal>
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

const DropdownMenuSubMenuContent = DropdownMenuSubContent
DropdownMenuSubMenuContent.displayName = "DropdownMenuSubMenuContent"

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Content> & {
    widthMode?: "trigger" | "min" | "auto"
  }
>(
  (
    {
      className,
      sideOffset = 8,
      collisionPadding = 8,
      align = "center",
      loop = true,
      widthMode = "min",
      ...props
    },
    ref,
  ) => (
    <DropdownMenuPrimitives.Portal>
      <DropdownMenuPrimitives.Content
        ref={ref}
        className={cx(
          "relative z-50 overflow-hidden rounded-md border p-1 shadow-xl shadow-black/[2.5%]",
          widthMode === "trigger" && "min-w-[calc(var(--radix-dropdown-menu-trigger-width))]",
          widthMode === "min" && "min-w-48",
          widthMode === "auto" && "min-w-[8rem]",
          "max-h-[var(--radix-popper-available-height)] overflow-y-auto overflow-x-hidden",
          "bg-white dark:bg-gray-950",
          "text-gray-900 dark:text-gray-50",
          "border-gray-200 dark:border-gray-800",
          "will-change-[transform,opacity]",
          "data-[state=closed]:animate-hide",
          "data-[side=bottom]:animate-slideDownAndFade data-[side=left]:animate-slideLeftAndFade data-[side=right]:animate-slideRightAndFade data-[side=top]:animate-slideUpAndFade",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
          className,
        )}
        sideOffset={sideOffset}
        align={align}
        collisionPadding={collisionPadding}
        loop={loop}
        {...props}
      />
    </DropdownMenuPrimitives.Portal>
  ),
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Item> & {
    inset?: boolean
    shortcut?: string
    hint?: string
  }
>(({ className, inset, shortcut, hint, children, ...props }, ref) => (
  <DropdownMenuPrimitives.Item
    ref={ref}
    className={cx(
      "group/DropdownMenuItem relative flex cursor-pointer select-none items-center rounded py-1.5 pl-2 pr-1 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
      "text-gray-900 dark:text-gray-50",
      "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600 data-[disabled]:opacity-50",
      "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900 focus:bg-gray-100 focus:dark:bg-gray-900",
      "hover:bg-gray-100 hover:dark:bg-gray-900",
      inset && "pl-8",
      "[&>svg]:size-4 [&>svg]:shrink-0",
      className,
    )}
    tremor-id="tremor-raw"
    {...props}
  >
    {children}
    {hint && (
      <span className={cx("ml-auto pl-2 text-sm text-gray-400 dark:text-gray-600")}>
        {hint}
      </span>
    )}
    {shortcut && (
      <span className={cx("ml-auto pl-2 text-sm text-gray-400 dark:text-gray-600")}>
        {shortcut}
      </span>
    )}
  </DropdownMenuPrimitives.Item>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.CheckboxItem> & {
    shortcut?: string
    hint?: string
    iconType?: "remix" | "lucide"
  }
>(
  (
    { className, hint, shortcut, children, checked, iconType = "remix", ...props },
    ref,
  ) => (
    <DropdownMenuPrimitives.CheckboxItem
      ref={ref}
      className={cx(
        "relative flex cursor-pointer select-none items-center gap-x-2 rounded py-1.5 pl-8 pr-1 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        "text-gray-900 dark:text-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600 data-[disabled]:opacity-50",
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900 focus:bg-gray-100 focus:dark:bg-gray-900",
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitives.ItemIndicator>
          {iconType === "remix" ? (
            <RiCheckLine
              aria-hidden="true"
              className="size-full shrink-0 text-gray-800 dark:text-gray-200"
            />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </DropdownMenuPrimitives.ItemIndicator>
      </span>
      {children}
      {hint && (
        <span className={cx("ml-auto text-sm font-normal text-gray-400 dark:text-gray-600")}>
          {hint}
        </span>
      )}
      {shortcut && (
        <span className={cx("ml-auto text-sm font-normal tracking-widest text-gray-400 dark:border-gray-800 dark:text-gray-600")}>
          {shortcut}
        </span>
      )}
    </DropdownMenuPrimitives.CheckboxItem>
  ),
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.RadioItem> & {
    shortcut?: string
    hint?: string
    iconType?: "check" | "radio"
    iconLibrary?: "remix" | "lucide"
  }
>(
  (
    { className, hint, shortcut, children, iconType = "radio", iconLibrary = "remix", ...props },
    ref,
  ) => (
    <DropdownMenuPrimitives.RadioItem
      ref={ref}
      className={cx(
        "group/DropdownMenuRadioItem relative flex cursor-pointer select-none items-center gap-x-2 rounded py-1.5 pl-8 pr-1 outline-none transition-colors data-[state=checked]:font-semibold sm:text-sm",
        "text-gray-900 dark:text-gray-50",
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:hover:bg-none dark:data-[disabled]:text-gray-600 data-[disabled]:opacity-50",
        "focus-visible:bg-gray-100 focus-visible:dark:bg-gray-900 focus:bg-gray-100 focus:dark:bg-gray-900",
        "hover:bg-gray-100 hover:dark:bg-gray-900",
        className,
      )}
      {...props}
    >
      {iconType === "radio" ? (
        <span className="absolute left-2 flex size-4 items-center justify-center">
          {iconLibrary === "remix" ? (
            <>
              <RiRadioButtonFill
                aria-hidden="true"
                className="size-full shrink-0 text-blue-500 group-data-[state=checked]/DropdownMenuRadioItem:flex group-data-[state=unchecked]/DropdownMenuRadioItem:hidden dark:text-blue-500"
              />
              <RiCheckboxBlankCircleLine
                aria-hidden="true"
                className="size-full shrink-0 text-gray-300 group-data-[state=unchecked]/DropdownMenuRadioItem:flex group-data-[state=checked]/DropdownMenuRadioItem:hidden dark:text-gray-700"
              />
            </>
          ) : (
            <DropdownMenuPrimitives.ItemIndicator>
              <Circle className="h-2 w-2 fill-current" />
            </DropdownMenuPrimitives.ItemIndicator>
          )}
        </span>
      ) : iconType === "check" ? (
        <span className="absolute left-2 flex size-4 items-center justify-center">
          {iconLibrary === "remix" ? (
            <RiCheckLine
              aria-hidden="true"
              className="size-full shrink-0 text-gray-800 group-data-[state=checked]/DropdownMenuRadioItem:flex group-data-[state=unchecked]/DropdownMenuRadioItem:hidden dark:text-gray-200"
            />
          ) : (
            <DropdownMenuPrimitives.ItemIndicator>
              <Check className="h-4 w-4" />
            </DropdownMenuPrimitives.ItemIndicator>
          )}
        </span>
      ) : null}
      {children}
      {hint && (
        <span className={cx("ml-auto text-sm font-normal text-gray-400 dark:text-gray-600")}>
          {hint}
        </span>
      )}
      {shortcut && (
        <span className={cx("ml-auto text-sm font-normal tracking-widest text-gray-400 dark:border-gray-800 dark:text-gray-600")}>
          {shortcut}
        </span>
      )}
    </DropdownMenuPrimitives.RadioItem>
  ),
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitives.Label
    ref={ref}
    className={cx(
      "px-2 py-2 text-xs font-medium tracking-wide",
      "text-gray-500 dark:text-gray-500",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitives.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitives.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitives.Separator
    ref={ref}
    className={cx(
      "-mx-1 my-1 h-px border-t border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cx("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

const DropdownMenuIconWrapper = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <div
      className={cx(
        "text-gray-600 dark:text-gray-400",
        "group-data-[disabled]/DropdownMenuItem:text-gray-400 group-data-[disabled]/DropdownMenuItem:dark:text-gray-700",
        className,
      )}
      {...props}
    />
  )
}
DropdownMenuIconWrapper.displayName = "DropdownMenuIconWrapper"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubMenu,
  DropdownMenuSubContent,
  DropdownMenuSubMenuContent,
  DropdownMenuSubTrigger,
  DropdownMenuSubMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuIconWrapper,
}