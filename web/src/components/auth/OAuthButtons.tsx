"use client"

import React from "react"
import { Button } from "@/components/ui/Button"
import { RiGithubFill, RiGoogleFill, RiMicrosoftFill } from "@remixicon/react"

export type OAuthProvider = "google" | "microsoft" | "github"

interface OAuthButtonsProps {
  onProviderClick?: (provider: OAuthProvider) => void
  loading?: boolean
  disabled?: boolean
  variant?: "horizontal" | "vertical"
  size?: "default" | "sm" | "lg"
}

export function OAuthButtons({
  onProviderClick,
  loading = false,
  disabled = false,
  variant = "horizontal",
  size = "default",
}: OAuthButtonsProps) {
  const handleClick = (provider: OAuthProvider) => {
    if (onProviderClick) {
      onProviderClick(provider)
    }
  }

  const containerClass =
    variant === "horizontal"
      ? "flex flex-col sm:flex-row gap-2 sm:items-center"
      : "flex flex-col gap-2"

  return (
    <div className={containerClass}>
      <Button
        type="button"
        variant="secondary"
        size={size}
        className="w-full"
        onClick={() => handleClick("google")}
        disabled={disabled || loading}
      >
        <RiGoogleFill className="h-4 w-4" aria-hidden="true" />
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="secondary"
        size={size}
        className="w-full"
        onClick={() => handleClick("microsoft")}
        disabled={disabled || loading}
      >
        <RiMicrosoftFill className="h-4 w-4" aria-hidden="true" />
        Continue with Microsoft
      </Button>

      <Button
        type="button"
        variant="secondary"
        size={size}
        className="w-full"
        onClick={() => handleClick("github")}
        disabled={disabled || loading}
      >
        <RiGithubFill className="h-5 w-5" aria-hidden="true" />
        Continue with GitHub
      </Button>
    </div>
  )
}
