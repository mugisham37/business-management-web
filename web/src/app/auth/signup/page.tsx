"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Step1BusinessAccount from "./_components/Step1BusinessAccount"
import Step2BusinessProfile from "./_components/Step2BusinessProfile"
import Step3NeedsAssessment from "./_components/Step3NeedsAssessment"
import Step4TechnicalPreferences from "./_components/Step4TechnicalPreferences"
import Step5PricingConfirmation from "./_components/Step5PricingConfirmation"

export interface SignupFormData {
  // Step 1: Business Account
  businessName: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  acceptedTerms: boolean

  // Step 2: Business Profile
  businessType: "solopreneur" | "small" | "retail" | "wholesale" | "industry" | ""
  employeeCount: string
  industry: string
  country: string

  // Step 3: Needs Assessment
  selectedModules: string[]
  primaryGoal: string

  // Step 4: Technical Preferences (optional)
  cloudProvider: "aws" | "azure" | ""
  region: string
  storageVolume: number
  compression: "true" | "false" | ""
  activeHours: number[]
  integrations: string[]

  // Step 5: Pricing
  selectedPlan: "starter" | "professional" | "enterprise" | ""
  billingCycle: "monthly" | "annual" | ""
}

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<SignupFormData>({
    // Step 1
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    acceptedTerms: false,

    // Step 2
    businessType: "",
    employeeCount: "",
    industry: "",
    country: "",

    // Step 3
    selectedModules: [],
    primaryGoal: "",

    // Step 4
    cloudProvider: "",
    region: "",
    storageVolume: 10,
    compression: "",
    activeHours: [8],
    integrations: [],

    // Step 5
    selectedPlan: "",
    billingCycle: "monthly",
  })

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSkipStep4 = () => {
    setCurrentStep(5)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log("Final form submission:", formData)
      // Here you would send data to your backend
      router.push("/dashboard/overview")
    }, 1500)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BusinessAccount
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <Step2BusinessProfile
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <Step3NeedsAssessment
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <Step4TechnicalPreferences
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkipStep4}
          />
        )
      case 5:
        return (
          <Step5PricingConfirmation
            formData={formData}
            updateFormData={updateFormData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
            onEditStep={setCurrentStep}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {renderStep()}
    </div>
  )
}
