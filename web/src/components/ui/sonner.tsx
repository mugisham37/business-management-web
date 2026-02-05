"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import type { ToasterProps as SonnerToasterProps } from "sonner"

interface ToasterProps extends Omit<SonnerToasterProps, 'theme'> {
  theme?: SonnerToasterProps['theme']
}

const Toaster = React.forwardRef<
  React.ElementRef<typeof Sonner>,
  ToasterProps
>(({ className, theme, toastOptions, ...props }, ref) => {
  const { theme: nextTheme = "system" } = useTheme()
  
  const resolvedTheme = React.useMemo(() => {
    return theme || (nextTheme as SonnerToasterProps['theme'])
  }, [theme, nextTheme])

  const defaultToastOptions = React.useMemo(() => ({
    classNames: {
      toast:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton:
        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton:
        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      closeButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      error: "group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground",
      success: "group-[.toast]:bg-success group-[.toast]:text-success-foreground",
      warning: "group-[.toast]:bg-warning group-[.toast]:text-warning-foreground",
      info: "group-[.toast]:bg-info group-[.toast]:text-info-foreground",
    },
    ...toastOptions,
  }), [toastOptions])

  return (
    <Sonner
      ref={ref}
      theme={resolvedTheme}
      className={`toaster group ${className || ''}`}
      toastOptions={defaultToastOptions}
      position="bottom-right"
      expand={true}
      richColors={true}
      closeButton={true}
      {...props}
    />
  )
})

Toaster.displayName = "Toaster"

export { Toaster }
export type { ToasterProps }
