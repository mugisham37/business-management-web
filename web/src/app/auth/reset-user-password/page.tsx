"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Users,
  Briefcase,
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"
import { cx } from "@/lib/utils"

type PageState = "loading" | "valid" | "invalid" | "expired" | "success" | "error"

interface ResetRequest {
  userId: string
  userName: string
  userEmail: string
  userRole: "worker" | "manager"
  reason: string
  requestedAt: string
  resetterRole: "manager" | "admin"
  resetterName: string
}

export default function ResetUserPassword() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [pageState, setPageState] = useState<PageState>("loading")
  const [requestData, setRequestData] = useState<ResetRequest | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setPageState("invalid")
      return
    }

    // Simulate API call to verify token and get request data
    const verifyToken = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock response - replace with actual API
        const mockResponse: ResetRequest = {
          userId: "user-123",
          userName: "John Doe",
          userEmail: "john.doe@company.com",
          userRole: "worker",
          reason:
            "I forgot my password and need access to complete urgent tasks for the quarterly report.",
          requestedAt: new Date().toISOString(),
          resetterRole: "manager",
          resetterName: "Jane Smith",
        }

        setRequestData(mockResponse)
        setPageState("valid")
      } catch (error) {
        setPageState("error")
      }
    }

    verifyToken()
  }, [token])

  const generatePassword = () => {
    const length = 12
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""

    // Ensure at least one of each required character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
    password += "0123456789"[Math.floor(Math.random() * 10)]
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setTemporaryPassword(newPassword)
    setError("")
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!temporaryPassword.trim()) {
      setError("Please generate or enter a temporary password")
      return
    }

    if (temporaryPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Replace with actual API call
      // await fetch('/api/auth/reset-user-password', {
      //   method: 'POST',
      //   body: JSON.stringify({ token, temporaryPassword }),
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
            Loading reset request...
          </p>
        </div>
      </div>
    )
  }

  // Invalid/Expired/Error States (similar to reset-password page)
  if (pageState === "invalid" || pageState === "expired" || pageState === "error") {
    const stateConfig = {
      invalid: {
        icon: AlertCircle,
        color: "destructive",
        title: "Invalid reset link",
        message: "This password reset link is invalid or has already been used.",
      },
      expired: {
        icon: AlertCircle,
        color: "accent",
        title: "Link expired",
        message: "This password reset link has expired. Links are valid for 24 hours.",
      },
      error: {
        icon: AlertCircle,
        color: "destructive",
        title: "Something went wrong",
        message: "We couldn't process this reset request. Please try again.",
      },
    }

    const config = stateConfig[pageState]
    const Icon = config.icon

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-${config.color}/10`}>
            <Icon className={`h-8 w-8 text-${config.color}`} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{config.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{config.message}</p>
          <div className="mt-8">
            <Link href="/dashboard/overview">
              <Button className="w-full" size="lg">
                Go to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success State
  if (pageState === "success" && requestData) {
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
              {requestData.userName}'s password has been reset
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
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">What happens next:</strong>
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      {requestData.userName} will receive an email with their
                      temporary password
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>The temporary password expires in 24 hours</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      They must change their password on their next login
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      You can contact them directly if they need assistance
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div
            className="mt-6 space-y-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <Link href="/dashboard/overview">
              <Button className="w-full" size="lg">
                Go to dashboard
              </Button>
            </Link>
            <a href={`mailto:${requestData.userEmail}`}>
              <Button variant="outline" className="w-full" size="lg">
                <Mail className="mr-2 h-4 w-4" />
                Contact {requestData.userName}
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Valid Token - Reset Form
  if (!requestData) return null

  const RoleIcon = requestData.userRole === "worker" ? Briefcase : Users

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div
          className="motion-safe:animate-revealBottom text-center"
          style={{ animationDuration: "500ms" }}
        >
          <Link
            href="/dashboard/overview"
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-lg ring-1 ring-primary/20 transition-transform hover:scale-105"
          >
            <DatabaseLogo className="h-8 w-8 text-primary" aria-label="Insights logo" />
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">
            Password Reset Request
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set a temporary password for {requestData.userName}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Request Details Card */}
          <Card
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <RoleIcon className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {requestData.userName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {requestData.userEmail}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RoleIcon className="h-4 w-4" />
                      <span className="capitalize">{requestData.userRole}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(requestData.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          Reason provided:
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          "{requestData.reason}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Form */}
          <form
            onSubmit={handleSubmit}
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="temporaryPassword" className="text-sm font-medium">
                    Temporary Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-2 space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="temporaryPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Generate or enter password"
                        value={temporaryPassword}
                        onChange={(e) => setTemporaryPassword(e.target.value)}
                        className="px-10"
                        aria-invalid={!!error}
                        aria-describedby={error ? "password-error" : undefined}
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

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleGeneratePassword}
                      >
                        Generate secure password
                      </Button>
                      {temporaryPassword && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopyPassword}
                          className="shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-secondary" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {error && (
                    <p id="password-error" className="mt-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    The user will receive this password via email and must change it
                    on their next login
                  </p>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        Important security notes:
                      </p>
                      <ul className="space-y-1">
                        <li>• This password is temporary and expires in 24 hours</li>
                        <li>
                          • The user must change it immediately upon first login
                        </li>
                        <li>• An email notification will be sent to the user</li>
                        <li>• This action will be logged in the audit trail</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/dashboard/overview" className="flex-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Resetting password..." : "Reset password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
