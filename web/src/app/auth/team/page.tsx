"use client"

import React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Logo from "@/components/ui/Logo"
import { Alert } from "@/components/ui/Alert"
import { RiAlertLine, RiArrowLeftLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TeamLogin() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    companyCode: "",
    username: "",
    password: "",
  })

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

    if (!formData.username || !formData.password) {
      setError("Please enter your username and password")
      return
    }

    setLoading(true)
    setError(null)

    // Simulate authentication
    setTimeout(() => {
      console.log("Team login:", formData)
      // In real app, authenticate and redirect based on role
      router.push("/dashboard/overview")
    }, 1200)
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
            Team member sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your team credentials
          </p>
        </div>

        {/* Main Content */}
        <div className="mt-10 w-full">
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
              <Label htmlFor="companyCode">
                Company code (optional)
              </Label>
              <Input
                id="companyCode"
                name="companyCode"
                type="text"
                placeholder="e.g., acme-corp"
                value={formData.companyCode}
                onChange={handleInputChange}
                variant="tremor"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if you were invited via email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Your username"
                value={formData.username}
                onChange={handleInputChange}
                hasError={!!error}
                variant="tremor"
                required
                autoFocus
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
                autoComplete="current-password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleInputChange}
                hasError={!!error}
                variant="tremor"
                required
              />
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

          {/* Help Text */}
          <div className="mt-6 rounded-lg bg-muted/50 p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Need help?</strong>
              <br />
              Contact your administrator if you&apos;ve forgotten your username or password.
              Team members cannot reset passwords independently.
            </p>
          </div>

          {/* Back to Owner Login */}
          <div className="mt-6">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RiArrowLeftLine className="h-4 w-4" />
              Back to owner sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
