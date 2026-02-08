"use client"

import React from "react"
import { cx } from "@/lib/utils"
import { RiCheckLine } from "@remixicon/react"

export interface PasswordRequirement {
  label: string
  met: boolean
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4 // 0=very weak, 4=very strong
  requirements: PasswordRequirement[]
}

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Contains number",
      met: /\d/.test(password),
    },
    {
      label: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ]

  const metCount = requirements.filter((r) => r.met).length
  let score: 0 | 1 | 2 | 3 | 4 = 0

  if (metCount >= 5) score = 4
  else if (metCount >= 4) score = 3
  else if (metCount >= 3) score = 2
  else if (metCount >= 2) score = 1

  return { score, requirements }
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password)

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return "bg-destructive"
      case 2:
        return "bg-accent"
      case 3:
        return "bg-secondary"
      case 4:
        return "bg-primary"
      default:
        return "bg-muted"
    }
  }

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 0:
        return "Very weak"
      case 1:
        return "Weak"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Strong"
      default:
        return ""
    }
  }

  if (!password) return null

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex h-1.5 gap-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={cx(
                "h-full flex-1 rounded-full transition-colors duration-300",
                index <= strength.score
                  ? getStrengthColor(strength.score)
                  : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Password strength: {getStrengthLabel(strength.score)}
        </p>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <ul className="space-y-1.5">
          {strength.requirements.map((req, index) => (
            <li
              key={index}
              className={cx(
                "flex items-center gap-2 text-xs transition-colors",
                req.met ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div
                className={cx(
                  "flex h-4 w-4 items-center justify-center rounded-full border transition-all",
                  req.met
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                )}
              >
                {req.met && <RiCheckLine className="h-3 w-3" />}
              </div>
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
