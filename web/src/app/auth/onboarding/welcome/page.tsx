"use client"

import React from "react"
import { Button } from "@/components/ui/Button"
import { RiCheckLine, RiRocketLine, RiTimeLine, RiShieldCheckLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Welcome() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/auth/onboarding/business-info")
  }

  const features = [
    {
      icon: RiTimeLine,
      title: "Quick setup",
      description: "Get started in just 5 minutes",
    },
    {
      icon: RiShieldCheckLine,
      title: "Secure & compliant",
      description: "Enterprise-grade security from day one",
    },
    {
      icon: RiRocketLine,
      title: "Ready to scale",
      description: "Grows with your business",
    },
  ]

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Hero Section */}
      <div
        className="text-center motion-safe:animate-revealBottom"
        style={{
          animationDuration: "600ms",
          animationDelay: "100ms",
          animationFillMode: "backwards",
        }}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <RiRocketLine className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Welcome to your business platform
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Let&apos;s get your business set up in just a few steps.
          We&apos;ll customize everything to match your needs.
        </p>
      </div>

      {/* Features Grid */}
      <div
        className="mt-12 grid gap-6 sm:grid-cols-3 motion-safe:animate-revealBottom"
        style={{
          animationDuration: "600ms",
          animationDelay: "300ms",
          animationFillMode: "backwards",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* What to Expect */}
      <div
        className="mt-12 rounded-lg border border-border bg-card p-6 motion-safe:animate-revealBottom"
        style={{
          animationDuration: "600ms",
          animationDelay: "500ms",
          animationFillMode: "backwards",
        }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What to expect
        </h2>
        <ul className="space-y-3">
          {[
            "Tell us about your business",
            "Choose the features you need",
            "Configure your infrastructure",
            "Get a personalized plan recommendation",
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                <RiCheckLine className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Buttons */}
      <div
        className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-center motion-safe:animate-revealBottom"
        style={{
          animationDuration: "600ms",
          animationDelay: "700ms",
          animationFillMode: "backwards",
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleGetStarted}
          className="w-full sm:w-auto"
        >
          Get started
        </Button>
        <Button
          variant="ghost"
          size="lg"
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/dashboard/overview">Skip to dashboard</Link>
        </Button>
      </div>

      {/* Trust Badge */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Join 10,000+ businesses already using our platform
        </p>
      </div>
    </div>
  )
}
