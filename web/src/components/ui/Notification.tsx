"use client"

import * as React from "react"
import {
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "@remixicon/react"
import { cx } from "@/lib/utils"

export interface NotificationProps {
  variant?: "success" | "error" | "warning" | "info"
  title?: string
  message: string
  onClose?: () => void
  className?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

const variantStyles = {
  success: {
    container: "border-primary/20 bg-primary/10 text-primary",
    icon: "text-primary",
  },
  error: {
    container: "border-destructive/20 bg-destructive/10 text-destructive",
    icon: "text-destructive",
  },
  warning: {
    container: "border-accent/20 bg-accent/10 text-accent-foreground",
    icon: "text-accent",
  },
  info: {
    container: "border-secondary/20 bg-secondary/10 text-secondary-foreground",
    icon: "text-secondary",
  },
}

const defaultIcons = {
  success: RiCheckLine,
  error: RiErrorWarningLine,
  warning: RiErrorWarningLine,
  info: RiInformationLine,
}

export function Notification({
  variant = "info",
  title,
  message,
  onClose,
  className,
  icon,
  action,
}: NotificationProps) {
  const styles = variantStyles[variant]
  const IconComponent = defaultIcons[variant]

  return (
    <div
      role="alert"
      className={cx(
        "relative flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm transition-all",
        styles.container,
        className
      )}
    >
      {/* Icon */}
      <div className={cx("shrink-0", styles.icon)}>
        {icon || <IconComponent className="h-5 w-5" aria-hidden="true" />}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {title && (
          <p className="text-sm font-semibold leading-none">{title}</p>
        )}
        <p className={cx("text-sm", title ? "opacity-90" : "font-medium")}>
          {message}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={cx(
            "shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            styles.icon
          )}
          aria-label="Close notification"
        >
          <RiCloseLine className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// Toast-style notification that auto-dismisses
export interface ToastNotificationProps extends NotificationProps {
  duration?: number
  onDismiss?: () => void
}

export function ToastNotification({
  duration = 5000,
  onDismiss,
  ...props
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onDismiss?.()
        }, 300) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cx(
        "animate-in slide-in-from-top-5 fade-in",
        !isVisible && "animate-out slide-out-to-top-5 fade-out"
      )}
    >
      <Notification
        {...props}
        onClose={() => {
          setIsVisible(false)
          setTimeout(() => {
            onDismiss?.()
          }, 300)
        }}
      />
    </div>
  )
}

// Container for stacking multiple notifications
export interface NotificationContainerProps {
  children: React.ReactNode
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
  className?: string
}

const positionStyles = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
}

export function NotificationContainer({
  children,
  position = "top-right",
  className,
}: NotificationContainerProps) {
  return (
    <div
      className={cx(
        "fixed z-50 flex w-full max-w-md flex-col gap-2 p-4",
        positionStyles[position],
        className
      )}
    >
      {children}
    </div>
  )
}
