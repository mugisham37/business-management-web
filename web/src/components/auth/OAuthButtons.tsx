"use client"

import React from "react"
import { Button } from "@/components/ui/Button"
import { RiGithubFill, RiGoogleFill } from "@remixicon/react"

export type OAuthProvider = "google" | "github"

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
    </div>
  )
}
