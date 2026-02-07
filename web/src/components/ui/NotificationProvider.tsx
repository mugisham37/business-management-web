"use client"

import * as React from "react"
import {
  Notification,
  NotificationContainer,
  type NotificationProps,
} from "./Notification"

interface NotificationItem extends NotificationProps {
  id: string
}

interface NotificationContextValue {
  notifications: NotificationItem[]
  addNotification: (notification: Omit<NotificationProps, "onClose">) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  success: (message: string, title?: string) => string
  error: (message: string, title?: string) => string
  warning: (message: string, title?: string) => string
  info: (message: string, title?: string) => string
}

const NotificationContext = React.createContext<NotificationContextValue | undefined>(
  undefined
)

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
  maxNotifications?: number
  defaultDuration?: number
}

export function NotificationProvider({
  children,
  position = "top-right",
  maxNotifications = 5,
  defaultDuration = 5000,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])

  const addNotification = React.useCallback(
    (notification: Omit<NotificationProps, "onClose">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newNotification: NotificationItem = {
        ...notification,
        id,
      }

      setNotifications((prev) => {
        const updated = [newNotification, ...prev]
        // Limit the number of notifications
        return updated.slice(0, maxNotifications)
      })

      // Auto-dismiss after duration
      if (defaultDuration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, defaultDuration)
      }

      return id
    },
    [maxNotifications, defaultDuration]
  )

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = React.useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = React.useCallback(
    (message: string, title?: string) => {
      return addNotification({ variant: "success", message, title })
    },
    [addNotification]
  )

  const error = React.useCallback(
    (message: string, title?: string) => {
      return addNotification({ variant: "error", message, title })
    },
    [addNotification]
  )

  const warning = React.useCallback(
    (message: string, title?: string) => {
      return addNotification({ variant: "warning", message, title })
    },
    [addNotification]
  )

  const info = React.useCallback(
    (message: string, title?: string) => {
      return addNotification({ variant: "info", message, title })
    },
    [addNotification]
  )

  const value = React.useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearAll,
      success,
      error,
      warning,
      info,
    }),
    [notifications, addNotification, removeNotification, clearAll, success, error, warning, info]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.length > 0 && (
        <NotificationContainer position={position}>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </NotificationContainer>
      )}
    </NotificationContext.Provider>
  )
}
