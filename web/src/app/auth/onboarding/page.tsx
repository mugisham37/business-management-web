"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth/onboarding/welcome")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
