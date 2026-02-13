"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { badgeVariants } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SignupFormData } from "../page"
import { cx } from "@/lib/utils"
import {
  Package,
  FileText,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  UserCog,
  TrendingUp,
  Target,
} from "lucide-react"

interface Step3Props {
  formData: SignupFormData
  updateFormData: (data: Partial<SignupFormData>) => void
  onNext: () => void
  onBack: () => void
}

interface Module {
  id: string
  title: string
  description: string
  features: string[]
  icon: React.ElementType
  recommended?: boolean
}

const modules: Module[] = [
  {
    id: "inventory",
    title: "Inventory Management",
    description: "Track stock levels, manage warehouses",
    features: ["Stock tracking", "Low stock alerts", "Multi-location"],
    icon: Package,
  },
  {
    id: "sales",
    title: "Sales & Invoicing",
    description: "Create invoices, track payments",
    features: ["Invoice generation", "Payment tracking", "Sales reports"],
    icon: FileText,
  },
  {
    id: "purchases",
    title: "Purchase Orders",
    description: "Manage supplier orders and costs",
    features: ["PO creation", "Supplier management", "Cost tracking"],
    icon: ShoppingCart,
  },
  {
    id: "crm",
    title: "Customer Management",
    description: "Build customer relationships",
    features: ["Contact management", "Sales pipeline", "Communication history"],
    icon: Users,
  },
  {
    id: "suppliers",
    title: "Supplier Management",
    description: "Manage vendor relationships",
    features: ["Vendor database", "Performance tracking", "Contract management"],
    icon: Truck,
  },
  {
    id: "financial",
    title: "Financial Reporting",
    description: "Track finances and profitability",
    features: ["P&L statements", "Cash flow", "Tax reports"],
    icon: BarChart3,
  },
  {
    id: "employees",
    title: "Employee Management",
    description: "Manage team and payroll",
    features: ["Employee records", "Attendance", "Payroll integration"],
    icon: UserCog,
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    description: "Data-driven business decisions",
    features: ["Custom dashboards", "KPI tracking", "Predictive analytics"],
    icon: TrendingUp,
  },
]

const primaryGoals = [
  "Streamline operations and reduce manual work",
  "Reduce costs and improve profitability",
  "Scale business and handle growth",
  "Get better insights and make data-driven decisions",
  "Improve customer satisfaction",
  "Better inventory and supply chain management",
]

export default function Step3NeedsAssessment({
  formData,
  updateFormData,
  onNext,
  onBack,
}: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleModuleToggle = (moduleId: string) => {
    const currentModules = formData.selectedModules
    const newModules = currentModules.includes(moduleId)
      ? currentModules.filter((id) => id !== moduleId)
      : [...currentModules, moduleId]
    
    updateFormData({ selectedModules: newModules })
  }

  const handleSelectAll = () => {
    updateFormData({ selectedModules: modules.map((m) => m.id) })
  }

  const handleDeselectAll = () => {
    updateFormData({ selectedModules: [] })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.selectedModules.length === 0) {
      newErrors.selectedModules = "Please select at least one module"
    }

    if (!formData.primaryGoal) {
      newErrors.primaryGoal = "Please select your primary goal"
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
    <main className="mx-auto max-w-5xl p-4 py-12">
      <div
        className="motion-safe:animate-revealBottom"
        style={{ animationDuration: "500ms" }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-center text-3xl font-semibold text-foreground sm:text-2xl">
          What features do you need?
        </h1>
        <p className="mt-4 text-center text-muted-foreground sm:text-sm">
          Select the modules that match your business needs. You can always add more later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="space-y-8">
          {/* Quick Actions */}
          <div
            className="flex justify-end gap-2 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
            >
              Deselect all
            </Button>
          </div>

          {/* Modules */}
          <fieldset className="space-y-3">
            <legend className="sr-only">Select modules you are interested in</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {modules.map((module, index) => {
                const Icon = module.icon
                const isSelected = formData.selectedModules.includes(module.id)
                
                return (
                  <div
                    key={module.id}
                    className="motion-safe:animate-revealBottom"
                    style={{
                      animationDuration: "600ms",
                      animationDelay: `${150 + index * 50}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <Label
                      className={cx(
                        "block cursor-pointer border p-4 transition-all active:scale-[99%]",
                        "has-[:checked]:border-primary has-[:checked]:bg-primary/5",
                        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
                        "rounded-xl border-border bg-card shadow-xs"
                      )}
                      htmlFor={module.id}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={module.id}
                          checked={isSelected}
                          onCheckedChange={() => handleModuleToggle(module.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground sm:text-sm">
                              {module.title}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {module.description}
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {module.features.map((feature) => (
                              <li
                                key={feature}
                                className={badgeVariants({ variant: "secondary" })}
                              >
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </div>
            {errors.selectedModules && (
              <p className="text-sm text-destructive">{errors.selectedModules}</p>
            )}
          </fieldset>

          {/* Primary Goal */}
          <div
            className="space-y-3 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "600ms",
              animationFillMode: "backwards",
            }}
          >
            <Label htmlFor="primaryGoal" className="text-base sm:text-sm">
              What's your primary goal? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.primaryGoal}
              onValueChange={(value) => updateFormData({ primaryGoal: value })}
            >
              <SelectTrigger
                id="primaryGoal"
                className="w-full"
                aria-invalid={!!errors.primaryGoal}
              >
                <SelectValue placeholder="Select your primary goal" />
              </SelectTrigger>
              <SelectContent>
                {primaryGoals.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primaryGoal && (
              <p className="text-sm text-destructive">{errors.primaryGoal}</p>
            )}
          </div>

          {/* Selected Count */}
          {formData.selectedModules.length > 0 && (
            <div
              className="rounded-lg border border-primary/20 bg-primary/5 p-4 motion-safe:animate-revealBottom"
              style={{
                animationDuration: "600ms",
                animationDelay: "650ms",
                animationFillMode: "backwards",
              }}
            >
              <p className="text-sm text-foreground">
                <span className="font-semibold">{formData.selectedModules.length}</span>{" "}
                {formData.selectedModules.length === 1 ? "module" : "modules"} selected
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="flex justify-between gap-4 pt-4 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "700ms",
              animationFillMode: "backwards",
            }}
          >
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" size="lg">
              Continue to Technical Setup
            </Button>
          </div>
        </div>
      </form>
    </main>
  )
}
