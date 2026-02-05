"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn, cx, focusRing } from "@/lib/utils"

type TabsListVariant = "default" | "line" | "solid"

const TabsListVariantContext = React.createContext<TabsListVariant>("default")

interface TabsProps extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "orientation"> {
  "tremor-id"?: string
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ "tremor-id": tremorId, ...props }, ref) => (
  <TabsPrimitive.Root ref={ref} tremor-id={tremorId} {...props} />
))
Tabs.displayName = "Tabs"

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsListVariant
}

const getListVariantStyles = (variant: TabsListVariant): string => {
  switch (variant) {
    case "line":
      return cx(
        "flex items-center justify-start border-b",
        "border-gray-200 dark:border-gray-800"
      )
    case "solid":
      return cx(
        "inline-flex items-center justify-center rounded-md p-1",
        "bg-gray-100 dark:bg-gray-900"
      )
    case "default":
    default:
      return "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
  }
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={variant === "default" ? cn(getListVariantStyles(variant), className) : cx(getListVariantStyles(variant), className)}
    {...props}
  >
    <TabsListVariantContext.Provider value={variant}>
      {children}
    </TabsListVariantContext.Provider>
  </TabsPrimitive.List>
))
TabsList.displayName = "TabsList"

const getTriggerVariantStyles = (variant: TabsListVariant): string => {
  switch (variant) {
    case "line":
      return cx(
        "-mb-px items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 pb-2 text-sm font-medium transition-all",
        "text-gray-500 dark:text-gray-500",
        "hover:text-gray-700 hover:dark:text-gray-400",
        "hover:border-gray-300 hover:dark:border-gray-400",
        "data-[state=active]:border-blue-500 data-[state=active]:text-blue-500",
        "data-[state=active]:dark:border-blue-500 data-[state=active]:dark:text-blue-500",
        "disabled:pointer-events-none data-[disabled]:pointer-events-none",
        "disabled:text-gray-300 disabled:dark:text-gray-700",
        "data-[disabled]:text-gray-300 data-[disabled]:dark:text-gray-700"
      )
    case "solid":
      return cx(
        "inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-1 text-sm font-medium ring-1 ring-inset transition-all",
        "text-gray-500 dark:text-gray-400",
        "hover:text-gray-700 hover:dark:text-gray-200",
        "ring-transparent",
        "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow",
        "data-[state=active]:dark:bg-gray-950 data-[state=active]:dark:text-gray-50",
        "disabled:pointer-events-none disabled:text-gray-400 disabled:opacity-50 disabled:dark:text-gray-600",
        "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:opacity-50 data-[disabled]:dark:text-gray-600"
      )
    case "default":
    default:
      return "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
  }
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const variant = React.useContext(TabsListVariantContext)
  const baseStyles = getTriggerVariantStyles(variant)
  const focusStyles = variant !== "default" ? focusRing : ""
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={variant === "default" ? cn(baseStyles, className) : cx(baseStyles, focusStyles, className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsListVariantContext)
  const baseStyles = variant === "default" 
    ? "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    : "outline-none"
  const focusStyles = variant !== "default" ? focusRing : ""
  
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={variant === "default" ? cn(baseStyles, className) : cx(baseStyles, focusStyles, className)}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }