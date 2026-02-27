"use client"

import * as React from "react"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"
import { cn } from "@/lib/utils"

interface ToastProps {
  id?: string | number
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "success" | "info" | "warning" | "error"
  duration?: number
  onDismiss?: () => void
}

interface ToasterProps {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  duration?: number
  className?: string
}

const ToastContext = React.createContext<{
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string | number) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { ...toast, id }])

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 4000)
    }
  }, [])

  const removeToast = React.useCallback((id: string | number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

const variantIcons = {
  success: (
    <IconPlaceholder
      lucide="CircleCheckIcon"
      tabler="IconCircleCheck"
      hugeicons="CheckmarkCircle02Icon"
      phosphor="CheckCircleIcon"
      remixicon="RiCheckboxCircleLine"
      className="size-4 shrink-0"
    />
  ),
  info: (
    <IconPlaceholder
      lucide="InfoIcon"
      tabler="IconInfoCircle"
      hugeicons="InformationCircleIcon"
      phosphor="InfoIcon"
      remixicon="RiInformationLine"
      className="size-4 shrink-0"
    />
  ),
  warning: (
    <IconPlaceholder
      lucide="TriangleAlertIcon"
      tabler="IconAlertTriangle"
      hugeicons="Alert02Icon"
      phosphor="WarningIcon"
      remixicon="RiErrorWarningLine"
      className="size-4 shrink-0"
    />
  ),
  error: (
    <IconPlaceholder
      lucide="OctagonXIcon"
      tabler="IconAlertOctagon"
      hugeicons="MultiplicationSignCircleIcon"
      phosphor="XCircleIcon"
      remixicon="RiCloseCircleLine"
      className="size-4 shrink-0"
    />
  ),
  default: null,
}

const variantStyles = {
  default: "bg-popover text-popover-foreground border-border",
  success: "bg-popover text-popover-foreground border-border",
  info: "bg-popover text-popover-foreground border-border",
  warning: "bg-popover text-popover-foreground border-border",
  error: "bg-popover text-popover-foreground border-border",
}

function Toast({ toast, onDismiss }: { toast: ToastProps; onDismiss: () => void }) {
  const variant = toast.variant || "default"

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-md items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
        variantStyles[variant],
        "animate-in slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-full"
      )}
      role="alert"
      aria-live="polite"
    >
      {variantIcons[variant]}
      <div className="flex flex-1 flex-col gap-1">
        {toast.title && (
          <div className="text-sm font-semibold leading-none">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
        {toast.action && <div className="mt-2">{toast.action}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Close"
      >
        <IconPlaceholder
          lucide="XIcon"
          tabler="IconX"
          hugeicons="Cancel01Icon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
          className="size-4"
        />
      </button>
    </div>
  )
}

const positionStyles = {
  "top-left": "top-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-0 right-0",
}

function Toaster({ position = "top-right", className }: ToasterProps) {
  const { toasts, removeToast } = useToast()

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50 flex flex-col gap-2 p-4",
        positionStyles[position],
        className
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={() => toast.id && removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export { Toaster, type ToasterProps, type ToastProps }
