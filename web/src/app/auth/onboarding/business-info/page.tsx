"use client"

import React from "react"
import { StepContainer } from "@/components/onboarding/StepContainer"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { RadioCardGroup, RadioCardItem } from "@/components/ui/RadioGroup"
import { useRouter } from "next/navigation"
import type { BusinessType } from "@/types/onboarding"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { ErrorMessage } from "@/components/onboarding/ErrorMessage"
import { logError } from "@/lib/utils/error-logger"

const INDUSTRIES = [
  "Retail",
  "Wholesale",
  "Manufacturing",
  "Professional Services",
  "Healthcare",
  "Technology",
  "Food & Beverage",
  "Construction",
  "Real Estate",
  "Education",
  "Transportation",
  "Other",
]

const BUSINESS_TYPES: { value: BusinessType; label: string; description: string }[] = [
  {
    value: "Retail",
    label: "Retail",
    description: "Physical or online stores selling to consumers",
  },
  {
    value: "Wholesale",
    label: "Wholesale",
    description: "Selling products in bulk to other businesses",
  },
  {
    value: "Manufacturing",
    label: "Manufacturing",
    description: "Producing goods from raw materials",
  },
  {
    value: "Service",
    label: "Service",
    description: "Providing services to clients",
  },
  {
    value: "E-commerce",
    label: "E-commerce",
    description: "Online-only business",
  },
  {
    value: "Hybrid",
    label: "Hybrid",
    description: "Combination of multiple business types",
  },
]

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Switzerland",
  "Other",
]

export default function BusinessInfo() {
  const router = useRouter()
  const { data, setBusinessInfo, loadProgress, isLoading, error } = useOnboardingStore()
  const [formData, setFormData] = React.useState({
    businessName: "",
    industry: "",
    businessType: "" as BusinessType | "",
    country: "",
    registrationNumber: "",
    website: "",
  })

  // Load existing progress on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await loadProgress()
      } catch (err) {
        // Error is handled by the store and logged
        logError(err instanceof Error ? err : new Error('Failed to load progress'), {
          step: 'business-info',
          metadata: { action: 'loadProgress' }
        })
      }
    }
    loadData()
  }, [loadProgress])

  // Populate form with existing data
  React.useEffect(() => {
    if (data.businessInfo) {
      setFormData({
        businessName: data.businessInfo.businessName || "",
        industry: data.businessInfo.industry || "",
        businessType: data.businessInfo.businessType || "",
        country: data.businessInfo.country || "",
        registrationNumber: data.businessInfo.registrationNumber || "",
        website: data.businessInfo.website || "",
      })
    }
  }, [data.businessInfo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Transform form data correctly - omit optional empty fields
      const businessInfo: any = {
        businessName: formData.businessName,
        industry: formData.industry,
        businessType: formData.businessType as BusinessType,
        country: formData.country,
      }

      // Only include optional fields if they have values
      if (formData.registrationNumber) {
        businessInfo.registrationNumber = formData.registrationNumber
      }
      if (formData.website) {
        businessInfo.website = formData.website
      }

      await setBusinessInfo(businessInfo)
      router.push("/auth/onboarding/products")
    } catch (err) {
      // Error is handled by the store and logged
      logError(err instanceof Error ? err : new Error('Failed to save business info'), {
        step: 'business-info',
        metadata: { action: 'submit', formData: businessInfo }
      })
    }
  }

  const handleRetry = async () => {
    // Retry the last submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as any
    await handleSubmit(submitEvent)
  }

  const isFormValid =
    formData.businessName &&
    formData.industry &&
    formData.businessType &&
    formData.country

  return (
    <StepContainer
      title="Tell us about your business"
      description="This helps us customize your experience and recommend the right features."
      onSubmit={handleSubmit}
      backHref="/auth/onboarding/welcome"
      loading={isLoading}
      disabled={!isFormValid}
    >
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <ErrorMessage
            error={error}
            title="Failed to save business information"
            onRetry={handleRetry}
            isRetrying={isLoading}
          />
        )}
        {/* Business Name */}
        <div
          className="space-y-2 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "200ms",
            animationFillMode: "backwards",
          }}
        >
          <Label htmlFor="businessName">
            Business name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            placeholder="Acme Inc."
            value={formData.businessName}
            onChange={handleInputChange}
            variant="tremor"
            required
          />
        </div>

        {/* Industry */}
        <div
          className="space-y-2 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "300ms",
            animationFillMode: "backwards",
          }}
        >
          <Label htmlFor="industry">
            Industry <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.industry}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, industry: value }))
            }
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Business Type */}
        <div
          className="space-y-2 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "400ms",
            animationFillMode: "backwards",
          }}
        >
          <Label>
            Business type <span className="text-destructive">*</span>
          </Label>
          <RadioCardGroup
            value={formData.businessType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, businessType: value as BusinessType }))
            }
            className="grid gap-3 sm:grid-cols-2"
          >
            {BUSINESS_TYPES.map((type) => (
              <RadioCardItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium text-foreground">{type.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </RadioCardItem>
            ))}
          </RadioCardGroup>
        </div>

        {/* Country */}
        <div
          className="space-y-2 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "500ms",
            animationFillMode: "backwards",
          }}
        >
          <Label htmlFor="country">
            Country <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.country}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, country: value }))
            }
          >
            <SelectTrigger id="country">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            For tax and currency settings
          </p>
        </div>

        {/* Optional Fields */}
        <div
          className="space-y-4 motion-safe:animate-revealBottom"
          style={{
            animationDuration: "600ms",
            animationDelay: "600ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">
              Business registration number (optional)
            </Label>
            <Input
              id="registrationNumber"
              name="registrationNumber"
              type="text"
              placeholder="123456789"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              variant="tremor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleInputChange}
              variant="tremor"
            />
          </div>
        </div>
      </div>
    </StepContainer>
  )
}
