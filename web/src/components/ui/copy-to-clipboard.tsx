"use client"

import { RiCheckLine, RiFileCopy2Line } from "@remixicon/react"
import React from "react"
import { cx } from "@/lib/utils"

interface CopyToClipboardProps {
  value: string
  timeout?: number
  className?: string
  iconClassName?: string
  children?: React.ReactNode
  onCopy?: (value: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
  ariaLabel?: string
  copyIcon?: React.ComponentType<{ className?: string }>
  successIcon?: React.ComponentType<{ className?: string }>
}

const CopyToClipboard = React.forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  ({
    value,
    timeout = 1500,
    className,
    iconClassName,
    children,
    onCopy,
    onError,
    disabled = false,
    ariaLabel,
    copyIcon: CopyIcon = RiFileCopy2Line,
    successIcon: SuccessIcon = RiCheckLine,
    ...props
  }, ref) => {
    const [copied, setCopied] = React.useState(false)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const copyToClipboard = React.useCallback(async () => {
      if (disabled || !value) return

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value)
        } else {
          const textArea = document.createElement("textarea")
          textArea.value = value
          textArea.style.position = "fixed"
          textArea.style.left = "-999999px"
          textArea.style.top = "-999999px"
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand("copy")
          textArea.remove()
        }
        
        setCopied(true)
        onCopy?.(value)
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
        }, timeout)
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to copy to clipboard")
        console.error("Error copying to clipboard:", err)
        onError?.(err)
      }
    }, [value, disabled, onCopy, onError, timeout])

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        copyToClipboard()
      }
    }, [copyToClipboard])

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    const defaultClassName = "select-none rounded border border-white/10 bg-white/20 p-1.5 backdrop-blur-xl"
    const defaultIconClassName = "size-5 text-white"

    if (children) {
      return (
        <button
          ref={ref}
          onClick={copyToClipboard}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cx(defaultClassName, className)}
          aria-label={ariaLabel || `Copy ${copied ? "copied" : "to clipboard"}`}
          aria-pressed={copied}
          {...props}
        >
          {children}
        </button>
      )
    }

    return (
      <button
        ref={ref}
        onClick={copyToClipboard}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cx(defaultClassName, className)}
        aria-label={ariaLabel || `Copy ${copied ? "copied" : "to clipboard"}`}
        aria-pressed={copied}
        {...props}
      >
        {copied ? (
          <SuccessIcon className={cx(defaultIconClassName, iconClassName)} />
        ) : (
          <CopyIcon className={cx(defaultIconClassName, iconClassName)} />
        )}
      </button>
    )
  }
)

CopyToClipboard.displayName = "CopyToClipboard"

export default CopyToClipboard

// Legacy prop support
export interface CopyToClipboardLegacyProps {
  code: string
}

export const CopyToClipboardLegacy: React.FC<CopyToClipboardLegacyProps> = ({ code }) => {
  return <CopyToClipboard value={code} />
}
