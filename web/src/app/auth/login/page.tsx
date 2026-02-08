"use client"

import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Logo from "@/components/ui/Logo"
import { Alert } from "@/components/ui/Alert"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { RiAlertLine, RiArrowRightLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React from "react"

type LoginStep = "email" | "password"

export default function Login() {
  const router = useRouter()
  const [step, setStep] = React.useState<LoginStep>("email")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError(null)

    // Simulate email detection
    setTimeout(() => {
      // In real app, check if email exists in database
      setLoading(false)
      setStep("password")
    }, 800)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      setError("Please enter your password")
      return
    }

    setLoading(true)
    setError(null)

    // Simulate authentication
    setTimeout(() => {
      console.log("Login:", { email, password, rememberMe })
      router.push("/dashboard/overview")
    }, 1200)
  }

  const handleOAuthClick = (provider: string) => {
    console.log("OAuth login with:", provider)
    // In real app, redirect to OAuth provider
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 sm:p-6 bg-background">
      <div className="flex w-full flex-col items-start sm:max-w-md">
        {/* Logo */}
        <div className="relative flex items-center justify-center rounded-lg bg-card p-3 shadow-lg border border-border">
          <Logo
            className="size-8 text-primary"
            aria-label="Business platform logo"
          />
        </div>

        {/* Header */}
        <div className="mt-6 flex flex-col">
          <h1 className="text-2xl font-semibold text-foreground">
            {step === "email" ? "Sign in to your business" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "email" ? (
              <>
                Don&rsquo;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <button
                onClick={() => setStep("email")}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {email}
              </button>
            )}
          </p>
        </div>

        {/* Main Content */}
        <div className="mt-10 w-full">
          {step === "email" ? (
            <>
              {/* OAuth Buttons */}
              <OAuthButtons
                onProviderClick={handleOAuthClick}
                loading={loading}
                variant="vertical"
              />

              <Divider className="my-6">or</Divider>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <RiAlertLine className="h-4 w-4" />
                    <div>
                      <p className="text-sm">{error}</p>
                    </div>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError(null)
                    }}
                    hasError={!!error}
                    variant="tremor"
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                  loadingText="Checking..."
                >
                  Continue
                  <RiArrowRightLine className="h-4 w-4" />
                </Button>
              </form>

              {/* Team Member Link */}
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login/team"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Team member? <span className="text-primary font-medium">Sign in here</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <RiAlertLine className="h-4 w-4" />
                    <div>
                      <p className="text-sm">{error}</p>
                    </div>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    hasError={!!error}
                    variant="tremor"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Remember me
                    </span>
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                  loadingText="Signing in..."
                >
                  Sign in
                </Button>
              </form>

              <Divider className="my-6">or</Divider>

              {/* OAuth Buttons */}
              <OAuthButtons
                onProviderClick={handleOAuthClick}
                loading={loading}
                variant="vertical"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
