"use client"

import React from "react"
import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Logo from "@/components/ui/Logo"
import { Alert } from "@/components/ui/Alert"
import { OAuthButtons } from "@/components/auth/OAuthButtons"
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator"
import { RiAlertLine, RiCheckLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegister } from "@/hooks/api/useAuth"

export default function Signup() {
  const router = useRouter()
  const register = useRegister()
  
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    businessName: "",
    fullName: "",
  })
  const [agreedToTerms, setAgreedToTerms] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.businessName) {
      setError("Please fill in all required fields")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy")
      return
    }

    setError(null)

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ')
      const firstName = nameParts[0] || 'User'
      const lastName = nameParts.slice(1).join(' ') || ''

      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        organizationName: formData.businessName,
      })

      // Redirect to email verification page
      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
    } catch (err: any) {
      const message = err.response?.data?.message
      if (Array.isArray(message)) {
        setError(message.join(', '))
      } else {
        setError(message || 'Registration failed. Please try again.')
      }
    }
  }

  const handleOAuthClick = (provider: string) => {
    console.log("OAuth signup with:", provider)
    // TODO: Implement OAuth flow when backend supports it
  }

  const isLoading = register.isPending

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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Main Content */}
        <div className="mt-10 w-full">
          {/* OAuth Buttons */}
          <OAuthButtons
            onProviderClick={handleOAuthClick}
            loading={loading}
            variant="vertical"
          />

          <Divider className="my-6">or</Divider>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <RiAlertLine className="h-4 w-4" />
                <div>
                  <p className="text-sm">{error}</p>
                </div>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="businessName">
                Business name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                placeholder="Acme Inc."
                value={formData.businessName}
                onChange={handleInputChange}
                hasError={!!error}
                variant="tremor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name (optional)</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                variant="tremor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Work email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleInputChange}
                hasError={!!error}
                variant="tremor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                hasError={!!error}
                variant="tremor"
                required
              />
              <PasswordStrengthIndicator
                password={formData.password}
                showRequirements={true}
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link
                  href="/legal/terms"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/privacy"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              loadingText="Creating account..."
              disabled={!agreedToTerms}
            >
              Create account
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 rounded-lg bg-muted/50 p-4 border border-border">
            <div className="flex items-start gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                <RiCheckLine className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  14-day free trial
                </p>
                <p className="text-xs text-muted-foreground">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
