"use client"

import * as React from "react"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"
import { cn } from "@/lib/utils"
import { StructuredError, ErrorSeverity } from "@/lib/errors/structured-error.types"

interface ToastProps {
  id?: string | number
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "success" | "info" | "warning" | "error"
  duration?: number
  onDismiss?: () => void
  
  // Enhanced features
  structuredError?: StructuredError
  showTechnicalDetails?: boolean
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

    if (toast.duration !== Infinity && toast.duration !== undefined) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    } else if (toast.structuredError?.autoHideDuration) {
      setTimeout(() => {
        removeToast(id)
      }, toast.structuredError.autoHideDuration)
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
      className="size-5 shrink-0"
    />
  ),
  info: (
    <IconPlaceholder
      lucide="InfoIcon"
      tabler="IconInfoCircle"
      hugeicons="InformationCircleIcon"
      phosphor="InfoIcon"
      remixicon="RiInformationLine"
      className="size-5 shrink-0"
    />
  ),
  warning: (
    <IconPlaceholder
      lucide="TriangleAlertIcon"
      tabler="IconAlertTriangle"
      hugeicons="Alert02Icon"
      phosphor="WarningIcon"
      remixicon="RiErrorWarningLine"
      className="size-5 shrink-0"
    />
  ),
  error: (
    <IconPlaceholder
      lucide="OctagonXIcon"
      tabler="IconAlertOctagon"
      hugeicons="MultiplicationSignCircleIcon"
      phosphor="XCircleIcon"
      remixicon="RiCloseCircleLine"
      className="size-5 shrink-0"
    />
  ),
  default: null,
}

/**
 * Get color classes based on variant using proper Tailwind colors
 * Uses solid backgrounds with good contrast and distinct border colors
 */
const getVariantColors = (variant: string) => {
  switch (variant) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-950/40',
        border: 'border-green-500 dark:border-green-600',
        icon: 'text-green-600 dark:text-green-400',
        text: 'text-green-900 dark:text-green-100',
        accent: 'bg-green-100/50 dark:bg-green-900/30',
      }
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-950/40',
        border: 'border-red-500 dark:border-red-600',
        icon: 'text-red-600 dark:text-red-400',
        text: 'text-red-900 dark:text-red-100',
        accent: 'bg-red-100/50 dark:bg-red-900/30',
      }
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/40',
        border: 'border-yellow-500 dark:border-yellow-600',
        icon: 'text-yellow-600 dark:text-yellow-400',
        text: 'text-yellow-900 dark:text-yellow-100',
        accent: 'bg-yellow-100/50 dark:bg-yellow-900/30',
      }
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        border: 'border-blue-500 dark:border-blue-600',
        icon: 'text-blue-600 dark:text-blue-400',
        text: 'text-blue-900 dark:text-blue-100',
        accent: 'bg-blue-100/50 dark:bg-blue-900/30',
      }
    default:
      return {
        bg: 'bg-card dark:bg-card',
        border: 'border-border dark:border-border',
        icon: 'text-foreground dark:text-foreground',
        text: 'text-card-foreground dark:text-card-foreground',
        accent: 'bg-muted/50 dark:bg-muted/30',
      }
  }
}

function Toast({ toast, onDismiss }: { toast: ToastProps; onDismiss: () => void }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)
  
  const variant = toast.variant || "default"
  const colors = getVariantColors(variant)
  const hasDetails = !!toast.structuredError

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyFullError = () => {
    if (!toast.structuredError) return
    const errorJson = JSON.stringify(toast.structuredError, null, 2)
    copyToClipboard(errorJson, 'full')
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-md flex-col overflow-hidden rounded-lg border-2 shadow-xl backdrop-blur-sm transition-all",
        colors.bg,
        colors.border,
        "animate-in slide-in-from-top-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-full data-[state=closed]:duration-200"
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Main content */}
      <div className="flex items-start gap-3 p-4">
        <div className={cn("mt-0.5", colors.icon)}>
          {variantIcons[variant]}
        </div>
        
        <div className="flex flex-1 flex-col gap-1">
          {toast.title && (
            <div className={cn("text-sm font-semibold leading-none", colors.text)}>
              {toast.title}
            </div>
          )}
          {toast.description && (
            <div className={cn("text-sm opacity-90", colors.text)}>
              {toast.description}
            </div>
          )}
          
          {/* Suggestions */}
          {toast.structuredError?.userInfo.suggestions && (
            <div className="mt-2 space-y-1">
              {toast.structuredError.userInfo.suggestions.map((suggestion, idx) => (
                <div key={idx} className={cn("text-xs opacity-75 flex items-start gap-1.5", colors.text)}>
                  <span className="mt-0.5">•</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
          
          {toast.action && <div className="mt-2">{toast.action}</div>}
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

      {/* Technical details section */}
      {hasDetails && (
        <div className={cn("border-t", colors.border, "border-opacity-30")}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex w-full items-center justify-between px-4 py-2 text-xs font-medium transition-colors",
              colors.accent,
              "hover:opacity-80",
              colors.text
            )}
          >
            <span className="flex items-center gap-2">
              <IconPlaceholder
                lucide="CodeIcon"
                tabler="IconCode"
                hugeicons="Code01Icon"
                phosphor="CodeIcon"
                remixicon="RiCodeLine"
                className="size-3.5"
              />
              Technical Details
            </span>
            <IconPlaceholder
              lucide="ChevronDownIcon"
              tabler="IconChevronDown"
              hugeicons="ArrowDown01Icon"
              phosphor="CaretDownIcon"
              remixicon="RiArrowDownSLine"
              className={cn(
                "size-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>

          {isExpanded && toast.structuredError && (
            <div className={cn(
              "max-h-96 overflow-y-auto border-t p-4 space-y-3",
              colors.border,
              "border-opacity-30",
              colors.accent
            )}>
              {/* Copy full error button */}
              <div className="flex justify-end">
                <button
                  onClick={copyFullError}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
                    "bg-white/60 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/60 border",
                    colors.border,
                    colors.text
                  )}
                >
                  <IconPlaceholder
                    lucide={copiedSection === 'full' ? "CheckIcon" : "CopyIcon"}
                    tabler={copiedSection === 'full' ? "IconCheck" : "IconCopy"}
                    hugeicons={copiedSection === 'full' ? "Tick02Icon" : "Copy01Icon"}
                    phosphor={copiedSection === 'full' ? "CheckIcon" : "CopyIcon"}
                    remixicon={copiedSection === 'full' ? "RiCheckLine" : "RiFileCopyLine"}
                    className="size-3"
                  />
                  {copiedSection === 'full' ? 'Copied!' : 'Copy All'}
                </button>
              </div>

              {/* Error details */}
              <DetailSection
                title="Error Information"
                items={[
                  { label: 'Category', value: toast.structuredError.category },
                  { label: 'Severity', value: toast.structuredError.severity },
                  { label: 'Code', value: toast.structuredError.technicalDetails.errorCode },
                  { label: 'Type', value: toast.structuredError.technicalDetails.errorType },
                ]}
                colors={colors}
              />

              {/* Operation context */}
              {toast.structuredError.technicalDetails.operationName && (
                <DetailSection
                  title="Operation Context"
                  items={[
                    { label: 'Operation', value: toast.structuredError.technicalDetails.operationName },
                    { label: 'Type', value: toast.structuredError.technicalDetails.operationType },
                    { label: 'Duration', value: toast.structuredError.technicalDetails.duration ? `${toast.structuredError.technicalDetails.duration}ms` : undefined },
                  ]}
                  colors={colors}
                />
              )}

              {/* Variables */}
              {toast.structuredError.technicalDetails.variables && (
                <DetailSection
                  title="Variables"
                  content={
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(toast.structuredError.technicalDetails.variables, null, 2)}
                    </pre>
                  }
                  colors={colors}
                  copyable
                  onCopy={() => copyToClipboard(
                    JSON.stringify(toast.structuredError!.technicalDetails.variables, null, 2),
                    'variables'
                  )}
                  copied={copiedSection === 'variables'}
                />
              )}

              {/* Original message */}
              <DetailSection
                title="Original Error Message"
                content={
                  <p className="text-xs break-words">
                    {toast.structuredError.technicalDetails.originalMessage}
                  </p>
                }
                colors={colors}
                copyable
                onCopy={() => copyToClipboard(
                  toast.structuredError!.technicalDetails.originalMessage,
                  'message'
                )}
                copied={copiedSection === 'message'}
              />

              {/* Tracing */}
              <DetailSection
                title="Tracing"
                items={[
                  { label: 'Correlation ID', value: toast.structuredError.technicalDetails.correlationId },
                  { label: 'Timestamp', value: new Date(toast.structuredError.technicalDetails.timestamp).toLocaleString() },
                ]}
                colors={colors}
              />

              {/* Stack trace */}
              {toast.structuredError.technicalDetails.stackTrace && (
                <DetailSection
                  title="Stack Trace"
                  content={
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                      {toast.structuredError.technicalDetails.stackTrace}
                    </pre>
                  }
                  colors={colors}
                  copyable
                  onCopy={() => copyToClipboard(
                    toast.structuredError!.technicalDetails.stackTrace!,
                    'stack'
                  )}
                  copied={copiedSection === 'stack'}
                />
              )}

              {/* Support message */}
              {toast.structuredError.userInfo.supportMessage && (
                <div className={cn(
                  "text-xs italic opacity-75 pt-2 border-t",
                  colors.border,
                  "border-opacity-30",
                  colors.text
                )}>
                  {toast.structuredError.userInfo.supportMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface DetailSectionProps {
  title: string
  items?: Array<{ label: string; value?: string }>
  content?: React.ReactNode
  colors: ReturnType<typeof getVariantColors>
  copyable?: boolean
  onCopy?: () => void
  copied?: boolean
}

function DetailSection({ title, items, content, colors, copyable, onCopy, copied }: DetailSectionProps) {
  return (
    <div className={cn("space-y-1.5 rounded-md p-2.5 border", colors.border, "border-opacity-20", "bg-white/40 dark:bg-black/20")}>
      <div className="flex items-center justify-between">
        <h4 className={cn("text-xs font-semibold uppercase tracking-wide", colors.text)}>{title}</h4>
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors border",
              colors.border,
              "border-opacity-30",
              "bg-white/60 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/60",
              colors.text
            )}
          >
            <IconPlaceholder
              lucide={copied ? "CheckIcon" : "CopyIcon"}
              tabler={copied ? "IconCheck" : "IconCopy"}
              hugeicons={copied ? "Tick02Icon" : "Copy01Icon"}
              phosphor={copied ? "CheckIcon" : "CopyIcon"}
              remixicon={copied ? "RiCheckLine" : "RiFileCopyLine"}
              className="size-3"
            />
          </button>
        )}
      </div>
      {items && (
        <div className="space-y-1">
          {items.map((item, idx) => item.value && (
            <div key={idx} className="flex gap-2 text-xs">
              <span className={cn("font-medium opacity-80", colors.text)}>{item.label}:</span>
              <span className={cn("opacity-95 font-mono text-xs break-all", colors.text)}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
      {content && (
        <div className={cn("opacity-95 text-xs", colors.text)}>
          {content}
        </div>
      )}
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
