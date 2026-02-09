"use client"

import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Logo from "@/components/ui/Logo"
import { Alert } from "@/components/ui/Alert"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { RiAlertLine, RiArrowRightLine } from "@remixicon/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import React from "react"
import { useLogin, useMfaLogin } from "@/hooks/api/useAuth"

type LoginStep = "email" | "password" | "mfa"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard/overview'
  
  const login = useLogin()
  const mfaLogin = useMfaLogin()
  
  const [step, setStep] = React.useState<LoginStep>("email")
  const [error, setError] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [mfaCode, setMfaCode] = React.useState("")
  const [tempToken, setTempToken] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setError(null)
    // Move to password step
    setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      setError("Please enter your password")
      return
    }

    setError(null)

    try {
      console.log('[Login] Submitting password...');
      const result = await login.mutateAsync({
        email,
        password,
      })

      console.log('[Login] Login result:', result);

      // Check if MFA is required
      if (result.requiresMFA) {
        console.log('[Login] MFA required, showing MFA step');
        setTempToken(result.tempToken || '')
        setStep("mfa")
        return
      }

      console.log('[Login] Login successful, user authenticated');
      
      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 150))
      
      console.log('[Login] Redirecting to:', redirectTo);
      // Use Next.js router for client-side navigation (no page reload)
      router.push(redirectTo)
    } catch (err: any) {
      console.error('[Login] Login error:', err)
      const message = err.response?.data?.message
      if (Array.isArray(message)) {
        setError(message.join(', '))
      } else {
        setError(message || 'Login failed. Please check your credentials.')
      }
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!mfaCode || mfaCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setError(null)

    try {
      console.log('[Login] Submitting MFA code...');
      await mfaLogin.mutateAsync({
        tempToken,
        mfaCode,
      })

      console.log('[Login] MFA verification successful');
      
      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 150))
      
      console.log('[Login] Redirecting to:', redirectTo);
      // Use Next.js router for client-side navigation
      router.push(redirectTo)
    } catch (err: any) {
      console.error('[Login] MFA verification error:', err);
      const message = err.response?.data?.message
      setError(message || 'Invalid MFA code. Please try again.')
      setMfaCode("") // Clear the code for retry
    }
  }

  const handleOAuthClick = (provider: string) => {
    console.log("OAuth login with:", provider)
    // TODO: Implement OAuth flow when backend supports it
  }

  const isLoading = login.isPending || mfaLogin.isPending

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
            {step === "email" && "Sign in to your business"}
            {step === "password" && "Welcome back"}
            {step === "mfa" && "Two-factor authentication"}
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
            ) : step === "password" ? (
              <button
                onClick={() => setStep("email")}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {email}
              </button>
            ) : (
              <span>Enter the 6-digit code from your authenticator app</span>
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
                loading={isLoading}
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
                  isLoading={isLoading}
                  loadingText="Checking..."
                >
                  Continue
                  <RiArrowRightLine className="h-4 w-4" />
                </Button>
              </form>

              {/* Team Member Link */}
              <div className="mt-6 text-center">
                <Link
                  href="/auth/team"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Team member? <span className="text-primary font-medium">Sign in here</span>
                </Link>
              </div>
            </>
          ) : step === "password" ? (
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
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign in
                </Button>
              </form>

              <Divider className="my-6">or</Divider>

              {/* OAuth Buttons */}
              <OAuthButtons
                onProviderClick={handleOAuthClick}
                loading={isLoading}
                variant="vertical"
              />
            </>
          ) : (
            <>
              {/* MFA Form */}
              <form onSubmit={handleMfaSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <RiAlertLine className="h-4 w-4" />
                    <div>
                      <p className="text-sm">{error}</p>
                    </div>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="mfaCode">Authentication code</Label>
                  <Input
                    id="mfaCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      setMfaCode(value)
                      if (error) setError(null)
                    }}
                    hasError={!!error}
                    variant="tremor"
                    required
                    autoFocus
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  loadingText="Verifying..."
                  disabled={mfaCode.length !== 6}
                >
                  Verify and sign in
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("password")
                      setMfaCode("")
                      setError(null)
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to password
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
