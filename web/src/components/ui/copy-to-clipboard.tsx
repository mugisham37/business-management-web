"use client"

import { RiCheckLine, RiFileCopy2Line } from "@remixicon/react"
import React from "react"

export default function CopyToClipboard({ code }: { code: string }) {
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
      onClick={copyToClipboard}
      className="select-none rounded border border-border/50 bg-muted/50 p-1.5 backdrop-blur-xl hover:bg-muted transition-colors"
    >
      {!copied ? (
        <RiFileCopy2Line aria-hidden="true" className="size-5 text-foreground" />
      ) : (
        <RiCheckLine aria-hidden="true" className="size-5 text-foreground" />
      )}
    </button>
  )
}
