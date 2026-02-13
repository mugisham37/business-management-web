"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignupFormData } from "../page"
import { Eye, EyeOff, Building2, Mail, Lock, User, Phone } from "lucide-react"
import Link from "next/link"

interface Step1Props {
  formData: SignupFormData
  updateFormData: (data: Partial<SignupFormData>) => void
  onNext: () => void
}

export default function Step1BusinessAccount({
  formData,
  updateFormData,
  onNext,
}: Step1Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      isValid: minLength && hasUpperCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
    }
  }

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password)
    const score = [
      validation.minLength,
      validation.hasUpperCase,
      validation.hasNumber,
      validation.hasSpecialChar,
    ].filter(Boolean).length

    if (score === 0) return { label: "", color: "", width: 0 }
    if (score <= 2) return { label: "Weak", color: "bg-destructive", width: 33 }
    if (score === 3) return { label: "Medium", color: "bg-accent", width: 66 }
    return { label: "Strong", color: "bg-secondary", width: 100 }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(formData.password).isValid) {
      newErrors.password = "Password does not meet requirements"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms and conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-4 py-12">
      <div
        className="motion-safe:animate-revealBottom text-center"
        style={{ animationDuration: "500ms" }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-2xl">
          Create your business account
        </h1>
        <p className="mt-4 text-muted-foreground sm:text-sm">
          Join thousands of businesses managing their operations efficiently
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="space-y-6">
          {/* Business Name */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="businessName" className="text-base sm:text-sm">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="businessName"
                type="text"
                placeholder="Acme Corporation"
                value={formData.businessName}
                onChange={(e) => updateFormData({ businessName: e.target.value })}
                className="pl-10"
                aria-invalid={!!errors.businessName}
                aria-describedby={errors.businessName ? "businessName-error" : undefined}
              />
            </div>
            {errors.businessName && (
              <p id="businessName-error" className="mt-1 text-sm text-destructive">
                {errors.businessName}
              </p>
            )}
          </div>

          {/* Email */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "150ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="email" className="text-base sm:text-sm">
              Business Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
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

          {/* Name Fields */}
          <div
            className="grid gap-4 motion-safe:animate-revealBottom sm:grid-cols-2"
            style={{
              animationDuration: "600ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <div>
              <Label htmlFor="firstName" className="text-base sm:text-sm">
                First Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  className="pl-10"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                />
              </div>
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-destructive">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName" className="text-base sm:text-sm">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
                  className="pl-10"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                />
              </div>
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-destructive">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Phone (Optional) */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "250ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="phone" className="text-base sm:text-sm">
              Phone Number <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "300ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="password" className="text-base sm:text-sm">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="px-10"
                aria-invalid={!!errors.password}
                aria-describedby="password-requirements"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${passwordStrength.label === "Strong" ? "text-secondary" : passwordStrength.label === "Medium" ? "text-accent" : "text-destructive"}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.width}%` }}
                  />
                </div>
              </div>
            )}

            <ul id="password-requirements" className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li className={formData.password.length >= 8 ? "text-secondary" : ""}>
                • At least 8 characters
              </li>
              <li className={/[A-Z]/.test(formData.password) ? "text-secondary" : ""}>
                • One uppercase letter
              </li>
              <li className={/[0-9]/.test(formData.password) ? "text-secondary" : ""}>
                • One number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-secondary" : ""}>
                • One special character
              </li>
            </ul>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "350ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="confirmPassword" className="text-base sm:text-sm">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                className="px-10"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div
            className="motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "400ms",
              animationFillMode: "backwards",
            }}
          >
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptedTerms"
                checked={formData.acceptedTerms}
                onCheckedChange={(checked) =>
                  updateFormData({ acceptedTerms: checked === true })
                }
                aria-invalid={!!errors.acceptedTerms}
                aria-describedby={errors.acceptedTerms ? "terms-error" : undefined}
              />
              <Label
                htmlFor="acceptedTerms"
                className="cursor-pointer text-sm leading-relaxed"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptedTerms && (
              <p id="terms-error" className="mt-1 text-sm text-destructive">
                {errors.acceptedTerms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div
            className="motion-safe:animate-revealBottom pt-4"
            style={{
              animationDuration: "600ms",
              animationDelay: "450ms",
              animationFillMode: "backwards",
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Continue to Business Profile
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </form>
    </main>
  )
}
