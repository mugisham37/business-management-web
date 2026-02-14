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
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
import { cx } from "@/lib/utils"
import { useAuth } from "@/foundation/providers/AuthProvider"
import { toast } from "sonner"
import { mapAuthError, validatePassword, type PasswordValidation } from "@/lib/auth-utils"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { resetPassword } = useAuth()
  
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false,
  })
  const [error, setError] = useState("")

  // Extract token from URL on mount
  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("No reset token found in URL")
      toast.error("Invalid reset link. Please request a new password reset.")
    }
  }, [searchParams])

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      setValidation(validatePassword(password))
    } else {
      setValidation({
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        isValid: false,
      })
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate token exists
    if (!token) {
      setError("No reset token found. Please use the link from your email.")
      return
    }

    // Validate password
    if (!validation.isValid) {
      setError("Please ensure your password meets all requirements")
      return
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password)
      
      // Show success state
      setSuccess(true)
      toast.success("Password reset successful!")
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err) {
      const errorMessage = mapAuthError(err as Error)
      toast.error(errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div
            className="motion-safe:animate-revealBottom text-center"
            style={{ animationDuration: "500ms" }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-secondary/10 shadow-lg ring-1 ring-secondary/20">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Password reset successful!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting you to login...
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
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div
          className="motion-safe:animate-revealBottom text-center"
          style={{ animationDuration: "500ms" }}
        >
          <Link
            href="/auth/login"
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-lg ring-1 ring-primary/20 transition-transform hover:scale-105"
          >
            <DatabaseLogo
              className="h-8 w-8 text-primary"
              aria-label="Insights logo"
            />
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password for your account
          </p>
        </div>

        {/* Reset Password Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 motion-safe:animate-revealBottom"
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
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-10"
                aria-invalid={!!error}
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
          </div>

          {/* Password Requirements */}
          <div
            id="password-requirements"
            className="rounded-lg border border-border bg-muted/50 p-4"
          >
            <p className="mb-2 text-xs font-medium text-foreground">
              Password must contain:
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-xs">
                {validation.minLength ? (
                  <Check className="h-3 w-3 text-secondary" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cx(
                    validation.minLength
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                {validation.hasUppercase ? (
                  <Check className="h-3 w-3 text-secondary" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cx(
                    validation.hasUppercase
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  One uppercase letter
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                {validation.hasNumber ? (
                  <Check className="h-3 w-3 text-secondary" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cx(
                    validation.hasNumber
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  One number
                </span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                {validation.hasSpecialChar ? (
                  <Check className="h-3 w-3 text-secondary" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cx(
                    validation.hasSpecialChar
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  One special character (!@#$%^&*...)
                </span>
              </li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-10"
                aria-invalid={!!error}
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
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-destructive">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !validation.isValid || !token}
          >
            {loading ? "Resetting password..." : "Reset password"}
          </Button>

          {/* Back to Login */}
          <Link href="/auth/login">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              size="lg"
            >
              Back to login
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
