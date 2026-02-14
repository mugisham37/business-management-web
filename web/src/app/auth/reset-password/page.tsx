"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cx } from "@/lib/utils"

type PageState = "loading" | "valid" | "invalid" | "expired" | "success" | "error"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [pageState, setPageState] = useState<PageState>("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setPageState("invalid")
      return
    }

    // Simulate API call to verify token
    const verifyToken = async () => {
      try {
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock response - replace with actual API
        const mockResponse = {
          valid: true,
          email: "admin@company.com",
          expired: false,
        }

        if (!mockResponse.valid) {
          setPageState("invalid")
        } else if (mockResponse.expired) {
          setPageState("expired")
        } else {
          setEmail(mockResponse.email)
          setPageState("valid")
        }
      } catch (error) {
        setPageState("error")
      }
    }

    verifyToken()
  }, [token])

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid:
        minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    }
  }

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password)
    const score = [
      validation.minLength,
      validation.hasUpperCase,
      validation.hasLowerCase,
      validation.hasNumber,
      validation.hasSpecialChar,
    ].filter(Boolean).length

    if (score === 0) return { label: "", color: "", width: 0 }
    if (score <= 2) return { label: "Weak", color: "bg-destructive", width: 33 }
    if (score <= 3) return { label: "Medium", color: "bg-accent", width: 66 }
    return { label: "Strong", color: "bg-secondary", width: 100 }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordValidation = validatePassword(password)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!password) {
      newErrors.password = "Password is required"
    } else if (!passwordValidation.isValid) {
      newErrors.password = "Password does not meet requirements"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Replace with actual API call
      // await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ token, password }),
      // })

      setPageState("success")
    } catch (error) {
      setPageState("error")
    } finally {
      setLoading(false)
    }
  }

  // Loading State
  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Verifying reset link...
          </p>
        </div>
      </div>
    )
  }

  // Invalid Token State
  if (pageState === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is invalid or has already been used.
          </p>
          <div className="mt-8 space-y-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full" size="lg">
                Request new reset link
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full" size="lg">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Expired Token State
  if (pageState === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <AlertCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Link expired
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link has expired. Reset links are valid for 1 hour.
          </p>
          <div className="mt-8 space-y-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full" size="lg">
                Request new reset link
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full" size="lg">
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success State
  if (pageState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div
            className="motion-safe:animate-revealBottom text-center"
            style={{ animationDuration: "500ms" }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Password reset successful!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password has been changed successfully.
            </p>
          </div>

          <Card
            className="mt-8 border-2 border-secondary/20 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <CardContent className="p-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">What's next?</strong>
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>You can now sign in with your new password</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      A confirmation email has been sent to {email}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      If you didn't make this change, contact support immediately
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div
            className="mt-6 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <Link href="/auth/login">
              <Button className="w-full" size="lg">
                Continue to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (pageState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't reset your password. Please try again.
          </p>
          <div className="mt-8 space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => setPageState("valid")}
            >
              Try again
            </Button>
            <Link href="/auth/forgot-password">
              <Button variant="ghost" className="w-full" size="lg">
                Request new reset link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Valid Token - Reset Form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div
          className="motion-safe:animate-revealBottom text-center"
          style={{ animationDuration: "500ms" }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-lg ring-1 ring-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Create new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password for {email}
          </p>
        </div>

        {/* Reset Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "100ms",
            animationFillMode: "backwards",
          }}
        >
          {/* New Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-10"
                aria-invalid={!!errors.password}
                aria-describedby="password-requirements"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span
                    className={cx(
                      "font-medium",
                      passwordStrength.label === "Strong"
                        ? "text-secondary"
                        : passwordStrength.label === "Medium"
                          ? "text-accent"
                          : "text-destructive"
                    )}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cx(
                      "h-full transition-all duration-300",
                      passwordStrength.color
                    )}
                    style={{ width: `${passwordStrength.width}%` }}
                  />
                </div>
              </div>
            )}

            <ul
              id="password-requirements"
              className="mt-2 space-y-1 text-xs text-muted-foreground"
            >
              <li
                className={
                  passwordValidation.minLength ? "text-secondary" : ""
                }
              >
                • At least 8 characters
              </li>
              <li
                className={
                  passwordValidation.hasUpperCase ? "text-secondary" : ""
                }
              >
                • One uppercase letter
              </li>
              <li
                className={
                  passwordValidation.hasLowerCase ? "text-secondary" : ""
                }
              >
                • One lowercase letter
              </li>
              <li
                className={
                  passwordValidation.hasNumber ? "text-secondary" : ""
                }
              >
                • One number
              </li>
              <li
                className={
                  passwordValidation.hasSpecialChar ? "text-secondary" : ""
                }
              >
                • One special character
              </li>
            </ul>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-10"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="mt-1 text-sm text-destructive"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Resetting password..." : "Reset password"}
          </Button>

          <Link href="/auth/login">
            <Button variant="ghost" className="w-full" size="lg">
              Cancel
            </Button>
          </Link>
        </form>

        {/* Security Note */}
        <div
          className="mt-6 rounded-lg border border-border bg-muted/50 p-4 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "200ms",
            animationFillMode: "backwards",
          }}
        >
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Security tip:</strong> Choose a
            unique password that you don't use for other accounts. Consider using
            a password manager to generate and store strong passwords.
          </p>
        </div>
      </div>
    </div>
  )
}


export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
