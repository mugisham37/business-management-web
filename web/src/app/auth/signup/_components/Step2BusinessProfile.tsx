"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  RadioCardGroup,
  RadioCardIndicator,
  RadioCardItem,
} from "@/components/ui/radio-card-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SignupFormData } from "../page"
import {
  User,
  Users,
  Store,
  Package,
  Factory,
  Briefcase,
  Globe,
} from "lucide-react"

interface Step2Props {
  formData: SignupFormData
  updateFormData: (data: Partial<SignupFormData>) => void
  onNext: () => void
  onBack: () => void
}

const businessTypes = [
  {
    value: "solopreneur",
    label: "Solopreneur",
    description: "Just me, managing everything",
    icon: User,
  },
  {
    value: "small",
    label: "Small Business",
    description: "2-20 employees",
    icon: Users,
  },
  {
    value: "retail",
    label: "Retail",
    description: "Physical or online store",
    icon: Store,
  },
  {
    value: "wholesale",
    label: "Wholesale",
    description: "B2B distribution",
    icon: Package,
  },
  {
    value: "industry",
    label: "Manufacturing",
    description: "Production & assembly",
    icon: Factory,
  },
]

const employeeCounts = [
  { value: "1", label: "Just me (1)" },
  { value: "2-5", label: "2 – 5" },
  { value: "6-20", label: "6 – 20" },
  { value: "21-50", label: "21 – 50" },
  { value: "51-100", label: "51 – 100" },
  { value: "101-500", label: "101 – 500" },
  { value: "501+", label: "501+" },
]

const industries = [
  "Technology & Software",
  "Retail & E-commerce",
  "Manufacturing",
  "Healthcare",
  "Professional Services",
  "Food & Beverage",
  "Construction",
  "Education",
  "Finance & Insurance",
  "Real Estate",
  "Transportation & Logistics",
  "Hospitality & Tourism",
  "Agriculture",
  "Other",
]

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "India",
  "Brazil",
  "Mexico",
  "South Africa",
  "Japan",
  "China",
  "Singapore",
  "United Arab Emirates",
  "Other",
]

export default function Step2BusinessProfile({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessType) {
      newErrors.businessType = "Please select your business type"
    }

    if (!formData.employeeCount) {
      newErrors.employeeCount = "Please select employee count"
    }

    if (!formData.industry) {
      newErrors.industry = "Please select your industry"
    }

    if (!formData.country) {
      newErrors.country = "Please select your country"
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
        className="motion-safe:animate-revealBottom"
        style={{ animationDuration: "500ms" }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-center text-3xl font-semibold text-foreground sm:text-2xl">
          Tell us about your business
        </h1>
        <p className="mt-4 text-center text-muted-foreground sm:text-sm">
          This helps us customize your experience and recommend the right features
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="space-y-8">
          {/* Business Type */}
          <fieldset
            className="space-y-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <legend className="text-base font-medium text-foreground sm:text-sm">
              What type of business do you run? <span className="text-destructive">*</span>
            </legend>
            <RadioCardGroup
              value={formData.businessType}
              onValueChange={(value: string) =>
                updateFormData({ businessType: value as SignupFormData["businessType"] })
              }
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Select business type"
            >
              {businessTypes.map((type) => {
                const Icon = type.icon
                return (
                  <RadioCardItem
                    key={type.value}
                    value={type.value}
                    className="active:scale-[99%] bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <RadioCardIndicator />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-semibold sm:text-sm">{type.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </RadioCardItem>
                )
              })}
            </RadioCardGroup>
            {errors.businessType && (
              <p className="text-sm text-destructive">{errors.businessType}</p>
            )}
          </fieldset>

          {/* Employee Count */}
          <fieldset
            className="space-y-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            <legend className="text-base font-medium text-foreground sm:text-sm">
              How many employees do you have? <span className="text-destructive">*</span>
            </legend>
            <RadioCardGroup
              value={formData.employeeCount}
              onValueChange={(value: string) => updateFormData({ employeeCount: value })}
              className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4"
              aria-label="Select employee count"
            >
              {employeeCounts.map((count) => (
                <RadioCardItem
                  key={count.value}
                  value={count.value}
                  className="active:scale-[99%] bg-card"
                >
                  <div className="flex items-center gap-2.5">
                    <RadioCardIndicator />
                    <span className="sm:text-sm">{count.label}</span>
                  </div>
                </RadioCardItem>
              ))}
            </RadioCardGroup>
            {errors.employeeCount && (
              <p className="text-sm text-destructive">{errors.employeeCount}</p>
            )}
          </fieldset>

          {/* Industry and Country */}
          <div
            className="grid gap-6 motion-safe:animate-revealBottom sm:grid-cols-2"
            style={{
              animationDuration: "600ms",
              animationDelay: "300ms",
              animationFillMode: "backwards",
            }}
          >
            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-base sm:text-sm">
                Industry <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => updateFormData({ industry: value })}
              >
                <SelectTrigger
                  id="industry"
                  className="w-full"
                  aria-invalid={!!errors.industry}
                >
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-destructive">{errors.industry}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-base sm:text-sm">
                Country <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateFormData({ country: value })}
                >
                  <SelectTrigger
                    id="country"
                    className="w-full pl-10"
                    aria-invalid={!!errors.country}
                  >
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div
            className="flex justify-between gap-4 pt-4 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "400ms",
              animationFillMode: "backwards",
            }}
          >
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" size="lg">
              Continue to Needs Assessment
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
