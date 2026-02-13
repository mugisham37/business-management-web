"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RadioCardGroup, RadioCardItem } from "@/components/ui/radio-card-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { SignupFormData } from "../page"
import { Server, AlertCircle } from "lucide-react"
import type { SVGProps } from "react"

interface Step4Props {
  formData: SignupFormData
  updateFormData: (data: Partial<SignupFormData>) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

type Region = {
  value: string
  label: string
  multiplier: number
}

type CloudProviderRegions = {
  aws: Region[]
  azure: Region[]
}

const regionOptions: CloudProviderRegions = {
  aws: [
    { value: "us-east-2", label: "Ohio (us-east-2)", multiplier: 1.0 },
    { value: "us-east-1", label: "N. Virginia (us-east-1)", multiplier: 1.1 },
    { value: "us-west-2", label: "Oregon (us-west-2)", multiplier: 1.0 },
    { value: "eu-central-1", label: "Frankfurt (eu-central-1)", multiplier: 1.2 },
    { value: "eu-west-1", label: "Ireland (eu-west-1)", multiplier: 1.2 },
    { value: "eu-west-2", label: "London (eu-west-2)", multiplier: 1.3 },
    { value: "ap-northeast-1", label: "Tokyo (ap-northeast-1)", multiplier: 1.4 },
    { value: "ap-south-1", label: "Mumbai (ap-south-1)", multiplier: 0.9 },
    { value: "ap-southeast-1", label: "Singapore (ap-southeast-1)", multiplier: 1.3 },
    { value: "ap-southeast-2", label: "Sydney (ap-southeast-2)", multiplier: 1.3 },
  ],
  azure: [
    { value: "eastus", label: "East US (eastus)", multiplier: 1.0 },
    { value: "eastus2", label: "East US 2 (eastus2)", multiplier: 1.1 },
    { value: "westus2", label: "West US 2 (westus2)", multiplier: 1.0 },
    { value: "germanywestcentral", label: "Germany West Central", multiplier: 1.3 },
    { value: "switzerlandnorth", label: "Switzerland North", multiplier: 1.4 },
  ],
}

const MicrosoftAzure = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" {...props}>
    <defs>
      <linearGradient id="a" x1={-1032.17} x2={-1059.21} y1={145.31} y2={65.43} gradientTransform="matrix(1 0 0 -1 1075 158)" gradientUnits="userSpaceOnUse">
        <stop offset={0} stopColor="#114a8b" />
        <stop offset={1} stopColor="#0669bc" />
      </linearGradient>
      <linearGradient id="c" x1={-1027.16} x2={-997.48} y1={147.64} y2={68.56} gradientTransform="matrix(1 0 0 -1 1075 158)" gradientUnits="userSpaceOnUse">
        <stop offset={0} stopColor="#3ccbf4" />
        <stop offset={1} stopColor="#2892df" />
      </linearGradient>
    </defs>
    <path fill="url(#a)" d="M33.34 6.54h26.04l-27.03 80.1a4.15 4.15 0 0 1-3.94 2.81H8.15a4.14 4.14 0 0 1-3.93-5.47L29.4 9.38a4.15 4.15 0 0 1 3.94-2.83z" />
    <path fill="#0078d4" d="M71.17 60.26H29.88a1.91 1.91 0 0 0-1.3 3.31l26.53 24.76a4.17 4.17 0 0 0 2.85 1.13h23.38z" />
    <path fill="url(#c)" d="M66.6 9.36a4.14 4.14 0 0 0-3.93-2.82H33.65a4.15 4.15 0 0 1 3.93 2.82l25.18 74.62a4.15 4.15 0 0 1-3.93 5.48h29.02a4.15 4.15 0 0 0 3.93-5.48z" />
  </svg>
)

const AmazonWebServices = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304 182" width="1em" height="1em" {...props}>
    <path d="m86 66 2 9c0 3 1 5 3 8v2l-1 3-7 4-2 1-3-1-4-5-3-6c-8 9-18 14-29 14-9 0-16-3-20-8-5-4-8-11-8-19s3-15 9-20c6-6 14-8 25-8a79 79 0 0 1 22 3v-7c0-8-2-13-5-16-3-4-8-5-16-5l-11 1a80 80 0 0 0-14 5h-2c-1 0-2-1-2-3v-5l1-3c0-1 1-2 3-2l12-5 16-2c12 0 20 3 26 8 5 6 8 14 8 25v32zM46 82l10-2c4-1 7-4 10-7l3-6 1-9v-4a84 84 0 0 0-19-2c-6 0-11 1-15 4-3 2-4 6-4 11s1 8 3 11c3 2 6 4 11 4zm80 10-4-1-2-3-23-78-1-4 2-2h10l4 1 2 4 17 66 15-66 2-4 4-1h8l4 1 2 4 16 67 17-67 2-4 4-1h9c2 0 3 1 3 2v2l-1 2-24 78-2 4-4 1h-9l-4-1-1-4-16-65-15 64-2 4-4 1h-9zm129 3a66 66 0 0 1-27-6l-3-3-1-2v-5c0-2 1-3 2-3h2l3 1a54 54 0 0 0 23 5c6 0 11-2 14-4 4-2 5-5 5-9l-2-7-10-5-15-5c-7-2-13-6-16-10a24 24 0 0 1 5-34l10-5a44 44 0 0 1 20-2 110 110 0 0 1 12 3l4 2 3 2 1 4v4c0 3-1 4-2 4l-4-2c-6-2-12-3-19-3-6 0-11 0-14 2s-4 5-4 9c0 3 1 5 3 7s5 4 11 6l14 4c7 3 12 6 15 10s5 9 5 14l-3 12-7 8c-3 3-7 5-11 6l-14 2z" fill="currentColor" />
    <path fill="#f90" d="M274 144A220 220 0 0 1 4 124c-4-3-1-6 2-4a300 300 0 0 0 263 16c5-2 10 4 5 8z" />
    <path fill="#f90" d="M287 128c-4-5-28-3-38-1-4 0-4-3-1-5 19-13 50-9 53-5 4 5-1 36-18 51-3 2-6 1-5-2 5-10 13-33 9-38z" />
  </svg>
)

const integrationOptions = [
  "QuickBooks / Xero",
  "Shopify / WooCommerce",
  "Stripe / PayPal",
  "Salesforce",
  "Slack / Microsoft Teams",
  "Google Workspace",
  "Zapier / Make",
  "Custom API",
]

export default function Step4TechnicalPreferences({
  formData,
  updateFormData,
  onNext,
  onBack,
  onSkip,
}: Step4Props) {
  useEffect(() => {
    if (formData.cloudProvider && regionOptions[formData.cloudProvider].length > 0) {
      if (!formData.region || !regionOptions[formData.cloudProvider].find(r => r.value === formData.region)) {
        updateFormData({ region: regionOptions[formData.cloudProvider][0].value })
      }
    }
  }, [formData.cloudProvider, formData.region, updateFormData])

  const handleIntegrationToggle = (integration: string) => {
    const current = formData.integrations
    const updated = current.includes(integration)
      ? current.filter((i) => i !== integration)
      : [...current, integration]
    updateFormData({ integrations: updated })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <main className="mx-auto max-w-4xl p-4 py-12">
      <div
        className="motion-safe:animate-revealBottom"
        style={{ animationDuration: "500ms" }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Server className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-center text-3xl font-semibold text-foreground sm:text-2xl">
          Technical preferences
        </h1>
        <p className="mt-4 text-center text-muted-foreground sm:text-sm">
          Optional: Configure your infrastructure and integration preferences
        </p>
        
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Skip this step
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="space-y-8">
          {/* Cloud Provider */}
          <fieldset
            className="space-y-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <legend className="text-base font-medium text-foreground sm:text-sm">
              Preferred cloud provider
            </legend>
            <RadioCardGroup
              value={formData.cloudProvider}
              onValueChange={(value: string) =>
                updateFormData({ cloudProvider: value as "aws" | "azure" })
              }
              className="grid gap-4 sm:grid-cols-2"
              aria-label="Select cloud provider"
            >
              <RadioCardItem value="aws">
                <div className="flex items-center gap-3">
                  <AmazonWebServices className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold">AWS</span>
                    <p className="text-xs text-muted-foreground">
                      {regionOptions.aws.length} regions available
                    </p>
                  </div>
                </div>
              </RadioCardItem>
              <RadioCardItem value="azure">
                <div className="flex items-center gap-3">
                  <MicrosoftAzure className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold">Azure</span>
                    <p className="text-xs text-muted-foreground">
                      {regionOptions.azure.length} regions available
                    </p>
                  </div>
                </div>
              </RadioCardItem>
            </RadioCardGroup>
          </fieldset>

          {/* Region and Storage */}
          {formData.cloudProvider && (
            <div
              className="grid gap-6 motion-safe:animate-revealBottom sm:grid-cols-2"
              style={{
                animationDuration: "600ms",
                animationDelay: "200ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="region" className="text-base sm:text-sm">
                  Region
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => updateFormData({ region: value })}
                >
                  <SelectTrigger id="region" className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions[formData.cloudProvider].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage" className="text-base sm:text-sm">
                  Storage (GB)
                </Label>
                <Input
                  id="storage"
                  type="number"
                  min={10}
                  max={500}
                  value={formData.storageVolume}
                  onChange={(e) =>
                    updateFormData({ storageVolume: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          )}

          {/* Active Hours and Compression */}
          {formData.cloudProvider && (
            <div
              className="space-y-6 motion-safe:animate-revealBottom"
              style={{
                animationDuration: "600ms",
                animationDelay: "300ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="hours" className="text-base sm:text-sm">
                  Active hours per day
                </Label>
                <div className="flex gap-4">
                  <Slider
                    value={formData.activeHours}
                    onValueChange={(value) => updateFormData({ activeHours: value })}
                    id="hours"
                    max={24}
                    step={1}
                    className="flex-1"
                    aria-valuetext={`${formData.activeHours[0]} hours`}
                  />
                  <div className="flex h-9 w-16 items-center justify-center rounded-md border border-border bg-background text-sm font-medium">
                    {formData.activeHours[0]}h
                  </div>
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-base font-medium text-foreground sm:text-sm">
                  Auto-compress data?
                </legend>
                <RadioGroup
                  value={formData.compression}
                  onValueChange={(value: string) =>
                    updateFormData({ compression: value as "true" | "false" })
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="compression-yes" />
                    <Label htmlFor="compression-yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="compression-no" />
                    <Label htmlFor="compression-no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </fieldset>
            </div>
          )}

          {/* Integrations */}
          <fieldset
            className="space-y-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "400ms",
              animationFillMode: "backwards",
            }}
          >
            <legend className="text-base font-medium text-foreground sm:text-sm">
              Integrations needed
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {integrationOptions.map((integration) => (
                <Label
                  key={integration}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                  htmlFor={`integration-${integration}`}
                >
                  <Checkbox
                    id={`integration-${integration}`}
                    checked={formData.integrations.includes(integration)}
                    onCheckedChange={() => handleIntegrationToggle(integration)}
                  />
                  <span className="text-sm">{integration}</span>
                </Label>
              ))}
            </div>
          </fieldset>

          {/* Navigation Buttons */}
          <div
            className="flex justify-between gap-4 pt-4 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "500ms",
              animationFillMode: "backwards",
            }}
          >
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" size="lg">
              Continue to Pricing
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
