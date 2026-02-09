"use client"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import {
  RadioCardGroup,
  RadioCardIndicator,
  RadioCardItem,
} from "@/components/ui/RadioGroup"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import type { GrowthProjection } from "@/types/onboarding-api"

const employeeCounts = [
  { value: "1", label: "1", numericValue: 1 },
  { value: "2-5", label: "2 – 5", numericValue: 3 },
  { value: "6-20", label: "6 – 20", numericValue: 13 },
  { value: "21-100", label: "21 – 100", numericValue: 60 },
  { value: "101-500", label: "101 – 500", numericValue: 300 },
  { value: "501+", label: "501+", numericValue: 501 },
]

export default function Employees() {
  const [selectedEmployeeCount, setSelectedEmployeeCount] = useState("")
  const [growthProjection, setGrowthProjection] = useState<GrowthProjection>("None")
  const router = useRouter()
  const { data, setTeamSize, loadProgress, isLoading, error } = useOnboardingStore()

  // Load existing progress on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await loadProgress()
      } catch (err) {
        // Error is handled by the store
        console.error('Failed to load progress:', err)
      }
    }
    loadData()
  }, [loadProgress])

  // Populate form with existing data
  React.useEffect(() => {
    if (data.teamSize) {
      // Find the matching employee count range
      const matchingCount = employeeCounts.find(
        count => count.numericValue === data.teamSize?.current
      )
      if (matchingCount) {
        setSelectedEmployeeCount(matchingCount.value)
      }
      if (data.teamSize.growthProjection) {
        setGrowthProjection(data.teamSize.growthProjection)
      }
    }
  }, [data.teamSize])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      // Transform radio selection to numeric value
      const selectedCount = employeeCounts.find(
        count => count.value === selectedEmployeeCount
      )
      
      if (!selectedCount) {
        return
      }

      await setTeamSize({
        current: selectedCount.numericValue,
        growthProjection,
      })
      
      router.push("/auth/onboarding/infrastructure")
    } catch (err) {
      // Error is handled by the store and displayed below
      console.error('Failed to save team size:', err)
    }
  }

  return (
    <main className="mx-auto p-4">
      <div
        className="motion-safe:animate-revealBottom"
        style={{ 
          animationDuration: "var(--animation-slide-down-duration)",
          animationDelay: "var(--animation-slide-down-delay)",
          animationFillMode: "var(--animation-fill-mode)"
        }}
      >
        <h1 className="text-2xl font-semibold text-foreground sm:text-xl">
          How many employees does your company have?
        </h1>
        <p className="mt-6 text-muted-foreground sm:text-sm">
          This will help us customize the experience to you.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <p>{error}</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <fieldset>
          <legend className="sr-only">Select number of employees</legend>
          <RadioCardGroup
            value={selectedEmployeeCount}
            onValueChange={(value) => setSelectedEmployeeCount(value)}
            required
            aria-label="Number of employees"
          >
            {employeeCounts.map((count, index) => (
              <div
                className="motion-safe:animate-revealBottom"
                key={count.value}
                style={{
                  animationDuration: "600ms",
                  animationDelay: `${100 + index * 50}ms`,
                  animationFillMode: "var(--animation-fill-mode)",
                }}
              >
                <RadioCardItem
                  className="active:scale-[99%] bg-card transition-transform-standard"
                  key={count.value}
                  value={count.value}
                  style={{
                    animationDuration: "600ms",
                    animationDelay: `${100 + index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <RadioCardIndicator />
                    <span className="block sm:text-sm">{count.label}</span>
                  </div>
                </RadioCardItem>
              </div>
            ))}
          </RadioCardGroup>
        </fieldset>
        <div className="mt-6 flex justify-between">
          <Button type="button" variant="ghost" asChild>
            <Link href="/auth/onboarding/products">Back</Link>
          </Button>
          <Button
            className="state-disabled"
            type="submit"
            disabled={!selectedEmployeeCount || isLoading}
            aria-disabled={!selectedEmployeeCount || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Submitting..." : "Continue"}
          </Button>
        </div>
      </form>
    </main>
  )
}
