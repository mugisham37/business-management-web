"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import {
  Mail,
  ArrowLeft,
  Shield,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { cx } from "@/lib/utils"

type UserRole = "admin" | "manager" | "worker" | null
type FlowStep = "email" | "reason" | "success" | "error"

interface RoleInfo {
  role: UserRole
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  description: string
  recoveryProcess: string
}

const roleInfo: Record<Exclude<UserRole, null>, RoleInfo> = {
  admin: {
    role: "admin",
    label: "Admin",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Organization Owner",
    recoveryProcess:
      "We'll send a secure password reset link to your email address. The link will be valid for 1 hour.",
  },
  manager: {
    role: "manager",
    label: "Manager",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    description: "Department Lead",
    recoveryProcess:
      "Your request will be sent to your organization admin. They'll receive a notification and can reset your password.",
  },
  worker: {
    role: "worker",
    label: "Worker",
    icon: Briefcase,
    color: "text-accent",
    bgColor: "bg-accent/10",
    description: "Team Member",
    recoveryProcess:
      "Your request will be sent to your manager. They'll receive a notification and can reset your password.",
  },
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<FlowStep>("email")
  const [email, setEmail] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const [reason, setReason] = useState("")
  const [detectedRole, setDetectedRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [roleFromLogin, setRoleFromLogin] = useState<UserRole>(null)

  // Initialize from URL parameters (from login page)
  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole
    const emailParam = searchParams.get("email")
    const orgParam = searchParams.get("org")

    // Validate role parameter
    if (roleParam && ["admin", "manager", "worker"].includes(roleParam)) {
      setRoleFromLogin(roleParam)
      setDetectedRole(roleParam)
    }

    // Pre-fill email if provided
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }

    // Pre-fill organization ID if provided
    if (orgParam) {
      setOrganizationId(decodeURIComponent(orgParam))
    }
  }, [searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    // Validate organization ID for non-admins
    if (detectedRole && detectedRole !== "admin" && !organizationId.trim()) {
      setError("Please enter your organization ID")
      return
    }

    setLoading(true)

    // Simulate API call to detect/verify user role
    setTimeout(() => {
      // If role was provided from login, use it (but verify with backend in production)
      // Otherwise, detect role from email
      let finalRole: UserRole = detectedRole

      if (!finalRole) {
        // Mock role detection - replace with actual API call
        finalRole = email.includes("admin")
          ? "admin"
          : email.includes("manager")
            ? "manager"
            : "worker"
      }

      setDetectedRole(finalRole)
      setLoading(false)

      // Admin goes directly to success (email sent)
      // Worker/Manager need to provide reason
      if (finalRole === "admin") {
        setStep("success")
      } else {
        setStep("reason")
      }
    }, 1200)
  }

  const handleReasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!reason.trim()) {
      setError("Please provide a reason for your password reset request")
      return
    }

    if (reason.trim().length < 10) {
      setError("Please provide a more detailed reason (at least 10 characters)")
      return
    }

    setLoading(true)

    // Simulate API call to send notification
    setTimeout(() => {
      setLoading(false)
      setStep("success")
    }, 1200)
  }

  const handleStartOver = () => {
    setStep("email")
    setEmail("")
    setOrganizationId("")
    setReason("")
    setDetectedRole(null)
    setRoleFromLogin(null)
    setError("")
  }

  const roleData = detectedRole ? roleInfo[detectedRole] : null

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
            {step === "success" ? "Check your email" : "Forgot password?"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "success"
              ? "We've sent you recovery instructions"
              : "No worries, we'll help you reset it"}
          </p>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form
            onSubmit={handleEmailSubmit}
            className="mt-8 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <div className="space-y-4">
              {/* Show role badge if coming from login */}
              {roleFromLogin && (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cx("rounded-full p-2", roleInfo[roleFromLogin].bgColor)}>
                        {React.createElement(roleInfo[roleFromLogin].icon, {
                          className: cx("h-5 w-5", roleInfo[roleFromLogin].color)
                        })}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {roleInfo[roleFromLogin].label} Account Recovery
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {roleInfo[roleFromLogin].description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Organization ID for non-admins */}
              {detectedRole && detectedRole !== "admin" && (
                <div>
                  <Label htmlFor="organizationId" className="text-sm font-medium">
                    Organization ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="organizationId"
                      type="text"
                      placeholder="acme-corp"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      className="pl-10"
                      autoComplete="organization"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ask your {detectedRole === "worker" ? "manager" : "admin"} for your organization ID
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-error" : undefined}
                    autoFocus={!email}
                  />
                </div>
                {error && (
                  <p id="email-error" className="mt-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {roleFromLogin 
                    ? "Confirm your email address to continue"
                    : "Enter the email address associated with your account"}
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Checking..." : "Continue"}
              </Button>

              <Link href="/auth/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </form>
        )}

        {/* Reason Step (Worker/Manager only) */}
        {step === "reason" && roleData && (
          <div
            className="mt-8 space-y-6 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            {/* Role Badge */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cx("rounded-full p-2", roleData.bgColor)}>
                    <roleData.icon className={cx("h-5 w-5", roleData.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {roleData.label} Account
                    </p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Process Info */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    How this works
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {roleData.recoveryProcess}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Form */}
            <form onSubmit={handleReasonSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for password reset{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder={`Example: "I forgot my password and need access to complete urgent tasks" or "My account may have been compromised"`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2 min-h-[100px] resize-none"
                  aria-invalid={!!error}
                  aria-describedby={error ? "reason-error" : undefined}
                  maxLength={500}
                  autoFocus
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {reason.length}/500 characters
                  </p>
                  {error && (
                    <p id="reason-error" className="text-xs text-destructive">
                      {error}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This will be sent to your{" "}
                  {detectedRole === "worker" ? "manager" : "admin"} along with
                  your reset request
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  "Sending request..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send reset request
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                size="lg"
                onClick={handleStartOver}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Use different email
              </Button>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && roleData && (
          <div
            className="mt-8 space-y-6 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <CheckCircle2 className="h-8 w-8 text-secondary" />
              </div>
            </div>

            {/* Success Message */}
            <Card className="border-2 border-secondary/20">
              <CardContent className="p-6 text-center">
                <h2 className="text-lg font-semibold text-foreground">
                  {detectedRole === "admin"
                    ? "Reset link sent!"
                    : "Request sent successfully!"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {detectedRole === "admin" ? (
                    <>
                      We've sent a password reset link to{" "}
                      <span className="font-medium text-foreground">{email}</span>
                    </>
                  ) : (
                    <>
                      Your password reset request has been sent to your{" "}
                      <span className="font-medium text-foreground">
                        {detectedRole === "worker" ? "manager" : "admin"}
                      </span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Next steps:</h3>
              {detectedRole === "admin" ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">1.</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">2.</span>
                    <span>Click the reset link (valid for 1 hour)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">3.</span>
                    <span>Create a new secure password</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">4.</span>
                    <span>Sign in with your new password</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">1.</span>
                    <span>
                      Your {detectedRole === "worker" ? "manager" : "admin"} will
                      receive an email notification
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">2.</span>
                    <span>They'll review your request and reset your password</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">3.</span>
                    <span>
                      You'll receive an email with a temporary password (usually
                      within 24 hours)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">4.</span>
                    <span>
                      Sign in and change your password immediately for security
                    </span>
                  </li>
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full"
                size="lg"
                onClick={handleStartOver}
              >
                Send another request
              </Button>
            </div>

            {/* Help Text */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Didn't receive the email?</strong>
                <br />
                Check your spam folder or{" "}
                {detectedRole === "admin" ? (
                  <>
                    wait a few minutes and try again. If you continue to have
                    issues, contact support.
                  </>
                ) : (
                  <>
                    contact your{" "}
                    {detectedRole === "worker" ? "manager" : "admin"} directly if
                    it's urgent.
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default function ForgotPassword() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
