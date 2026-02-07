"use client"

import * as React from "react"
import { RiCheckLine, RiMailLine, RiPhoneLine, RiSendPlaneLine } from "@remixicon/react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/TextArea"
import { Checkbox } from "@/components/ui/Checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { useNotifications } from "@/components/ui/NotificationProvider"

interface ContactFormProps {
  className?: string
}

export default function ContactForm({ className }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [projectType, setProjectType] = React.useState<string>("")
  const notifications = useNotifications()
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get form data
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        company: formData.get("company"),
        projectType: projectType,
        message: formData.get("message"),
        nda: formData.get("nda") === "on",
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success (replace with actual API call)
      console.log("Form submitted:", data)
      
      notifications.success(
        "Thank you! We'll get back to you within 24 hours.",
        "Request sent successfully"
      )

      // Reset form
      formRef.current?.reset()
      setProjectType("")
    } catch (error) {
      notifications.error(
        "Please try again or contact us directly via email.",
        "Something went wrong"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      id="contact"
      className={`rounded-2xl border border-border bg-card/50 p-5 shadow-sm backdrop-blur-sm sm:p-6 md:p-8 ${className || ""}`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Info */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary ring-1 ring-primary/20">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></span>
            Booking Q4
          </div>

          <h4 className="text-lg font-semibold tracking-tight text-foreground">
            Start a project
          </h4>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <RiCheckLine
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>Senior engineers and designers only — no handoffs, no fluff.</span>
            </li>
            <li className="flex items-start gap-2">
              <RiCheckLine
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>Transparent weekly demos, metrics, and delivery plans.</span>
            </li>
            <li className="flex items-start gap-2">
              <RiCheckLine
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>Security, accessibility, and performance baked-in.</span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-sm">
            <a
              href="mailto:hello@relay.dev"
              className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <RiMailLine className="h-4 w-4" aria-hidden="true" />
              hello@relay.dev
            </a>
            <span className="text-border">•</span>
            <a
              href="tel:+14155551234"
              className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
            >
              <RiPhoneLine className="h-4 w-4" aria-hidden="true" />
              +1 (415) 555‑1234
            </a>
          </div>
        </div>

        {/* Right Column - Form */}
        <form
          ref={formRef}
          id="contact-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2"
        >
          <div className="sm:col-span-1">
            <Label htmlFor="name" className="mb-1 block text-xs font-medium">
              Your name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          <div className="sm:col-span-1">
            <Label htmlFor="email" className="mb-1 block text-xs font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jane@company.com"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          <div className="sm:col-span-1">
            <Label htmlFor="company" className="mb-1 block text-xs font-medium">
              Company
            </Label>
            <Input
              id="company"
              name="company"
              type="text"
              placeholder="Acme Inc."
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          <div className="sm:col-span-1">
            <Label htmlFor="project-type" className="mb-1 block text-xs font-medium">
              Project type
            </Label>
            <Select
              name="projectType"
              disabled={isSubmitting}
              value={projectType}
              onValueChange={setProjectType}
            >
              <SelectTrigger id="project-type" className="w-full">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">New product build</SelectItem>
                <SelectItem value="feature">Feature delivery</SelectItem>
                <SelectItem value="advisory">Advisory / audit</SelectItem>
                <SelectItem value="ai">AI integration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="message" className="mb-1 block text-xs font-medium">
              What are you building?
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder="A few sentences about your goals, timeline, and success metrics."
              className="w-full resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="nda"
                name="nda"
                disabled={isSubmitting}
              />
              <Label
                htmlFor="nda"
                className="text-xs font-normal text-muted-foreground"
              >
                Please send an NDA
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                className="inline-flex items-center gap-2"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                loadingText="Sending..."
              >
                <RiSendPlaneLine className="h-4 w-4" aria-hidden="true" />
                Send request
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
