"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import {
  Shield,
  Users,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react"
import { RiGithubFill, RiGoogleFill } from "@remixicon/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cx } from "@/lib/utils"
import { useAuth } from "@/foundation/providers/AuthProvider"
import { toast } from "sonner"
import { mapAuthError, getRedirectUrlForRole } from "@/lib/auth-utils"
import { UserRole } from "@/foundation/types/generated/graphql"

type LocalUserRole = "admin" | "manager" | "worker"

interface RoleConfig {
  id: LocalUserRole
  label: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

const roles: RoleConfig[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Organization owner",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "manager",
    label: "Manager",
    description: "Department lead",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    id: "worker",
    label: "Worker",
    description: "Team member",
    icon: Briefcase,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
]

export default function Login() {
  const router = useRouter()
  const { login, verifyMFA } = useAuth()
  const [selectedRole, setSelectedRole] = useState<LocalUserRole>("admin")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // MFA state
  const [mfaState, setMfaState] = useState({
    show: false,
    userId: "",
    code: "",
  })

  const [formData, setFormData] = useState({
    organizationId: "",
    email: "",
    password: "",
  })

  const selectedRoleConfig = roles.find((r) => r.id === selectedRole)!

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (selectedRole !== "admin" && !formData.organizationId.trim()) {
      newErrors.organizationId = "Organization ID is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // Call foundation login
      const result = await login(
        formData.email,
        formData.password,
        formData.organizationId
      )
      
      // Handle MFA requirement
      if (result.requiresMFA) {
        setMfaState({
          show: true,
          userId: result.user?.id || "",
          code: "",
        })
        setLoading(false)
        return
      }
      
      // Success - redirect based on role
      if (result.user) {
        toast.success("Login successful!")
        const redirectUrl = getRedirectUrlForRole(result.user.role)
        router.push(redirectUrl)
      }
    } catch (error) {
      toast.error(mapAuthError(error as Error))
      setLoading(false)
    }
  }

  const handleMFASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!mfaState.code || mfaState.code.length !== 6) {
      toast.error("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)
    
    try {
      const user = await verifyMFA(
        mfaState.userId,
        mfaState.code,
        formData.organizationId
      )
      
      toast.success("Login successful!")
      const redirectUrl = getRedirectUrlForRole(user.role)
      router.push(redirectUrl)
    } catch (error) {
      toast.error(mapAuthError(error as Error))
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Implement social login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div
          className="motion-safe:animate-revealBottom text-center"
          style={{ animationDuration: "500ms" }}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-lg ring-1 ring-primary/20">
            <DatabaseLogo className="h-8 w-8 text-primary" aria-label="Insights logo" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Role Selection */}
        <div
          className="mt-8 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "100ms",
            animationFillMode: "backwards",
          }}
        >
          <Label className="mb-3 block text-sm font-medium text-foreground">
            Sign in as
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={cx(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
                    "hover:border-primary/50 hover:bg-accent/5",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card"
                  )}
                >
                  <div
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isSelected ? role.bgColor : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cx(
                        "h-5 w-5",
                        isSelected ? role.color : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={cx(
                        "text-xs font-semibold",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {role.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Social Login */}
        <div
          className="mt-6 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "200ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("github")}
              className="w-full"
            >
              <RiGithubFill className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="w-full"
            >
              <RiGoogleFill className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </div>

        <div
          className="my-6 flex items-center gap-3 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "250ms",
            animationFillMode: "backwards",
          }}
        >
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or continue with email</span>
          <Separator className="flex-1" />
        </div>

        {/* Login Form */}
        <form onSubmit={mfaState.show ? handleMFASubmit : handleSubmit} className="space-y-4">
          {/* MFA Code Input */}
          {mfaState.show && (
            <div
              className="motion-safe:animate-revealBottom"
              style={{
                animationDuration: "600ms",
                animationDelay: "300ms",
                animationFillMode: "backwards",
              }}
            >
              <Label htmlFor="mfaCode" className="text-sm font-medium">
                Authentication Code <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mfaCode"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaState.code}
                  onChange={(e) =>
                    setMfaState({ ...mfaState, code: e.target.value.replace(/\D/g, "") })
                  }
                  className="pl-10 text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          )}

          {/* Organization ID (for non-admins) */}
          {!mfaState.show && selectedRole !== "admin" && (
            <div
              className="motion-safe:animate-revealBottom"
              style={{
                animationDuration: "600ms",
                animationDelay: "300ms",
                animationFillMode: "backwards",
              }}
            >
              <Label htmlFor="organizationId" className="text-sm font-medium">
                Organization ID <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="organizationId"
                  type="text"
                  placeholder="acme-corp"
                  value={formData.organizationId}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationId: e.target.value })
                  }
                  className="pl-10"
                  aria-invalid={!!errors.organizationId}
                  aria-describedby={
                    errors.organizationId ? "organizationId-error" : undefined
                  }
                />
              </div>
              {errors.organizationId && (
                <p id="organizationId-error" className="mt-1 text-sm text-destructive">
                  {errors.organizationId}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Ask your admin for your organization ID
              </p>
            </div>
          )}

          {/* Email */}
          {!mfaState.show && (
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: selectedRole !== "admin" ? "350ms" : "300ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>
          )}

          {/* Password */}
          {!mfaState.show && (
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: selectedRole !== "admin" ? "400ms" : "350ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="password" className="text-sm font-medium">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="px-10"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
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
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>
          )}

          {/* Remember Me & Forgot Password */}
          {!mfaState.show && (
          <div
            className="flex items-center justify-between motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: selectedRole !== "admin" ? "450ms" : "400ms",
              animationFillMode: "backwards",
            }}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-normal"
              >
                Remember me
              </Label>
            </div>
            <Link
              href={`/auth/forgot-password?role=${selectedRole}${formData.email ? `&email=${encodeURIComponent(formData.email)}` : ''}${selectedRole !== 'admin' && formData.organizationId ? `&org=${encodeURIComponent(formData.organizationId)}` : ''}`}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          )}

          {/* Submit Button */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: selectedRole !== "admin" ? "500ms" : "450ms",
              animationFillMode: "backwards",
            }}
          >
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (mfaState.show ? "Verifying..." : "Signing in...") : (mfaState.show ? "Verify Code" : "Sign in")}
            </Button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div
          className="mt-6 text-center motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: selectedRole !== "admin" ? "550ms" : "500ms",
            animationFillMode: "backwards",
          }}
        >
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Role-specific Help Text */}
        {selectedRole !== "admin" && (
          <div
            className="mt-4 rounded-lg border border-border bg-muted/50 p-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "600ms",
              animationFillMode: "backwards",
            }}
          >
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">
                {selectedRoleConfig.label} Access:
              </strong>{" "}
              {selectedRole === "manager"
                ? "You'll have access to your department's data and team management features."
                : "You'll have access to your assigned tasks and relevant modules."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
