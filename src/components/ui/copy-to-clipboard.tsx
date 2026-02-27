"use client"

import * as React from "react"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"
import { cn } from "@/lib/utils"

interface CopyToClipboardProps {
  code: string
  className?: string
}

export default function CopyToClipboard({ 
  code, 
  className 
}: CopyToClipboardProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch (error) {
      console.error("Error copying to clipboard", error)
    } finally {
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    }
  }

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={cn(
        "select-none rounded-md border p-1.5 transition-all",
        "border-border/50 bg-muted/50 backdrop-blur",
        "hover:bg-muted hover:border-border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {!copied ? (
        <IconPlaceholder
          lucide="CopyIcon"
          tabler="IconCopy"
          hugeicons="Copy01Icon"
          phosphor="CopyIcon"
          remixicon="RiFileCopy2Line"
          aria-hidden="true"
          className="size-5 text-foreground"
        />
      ) : (
        <IconPlaceholder
          lucide="CheckIcon"
          tabler="IconCheck"
          hugeicons="Tick02Icon"
          phosphor="CheckIcon"
          remixicon="RiCheckLine"
          aria-hidden="true"
          className="size-5 text-foreground"
        />
      )}
    </button>
  )
}
