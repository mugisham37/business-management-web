"use client"

import React from "react"
import { badgeVariants } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { ErrorMessage } from "@/components/onboarding/ErrorMessage"
import { logError } from "@/lib/utils/error-logger"
import { cx } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useOnboardingStore } from "@/stores/onboarding.store"

interface Category {
  id: string
  title: string
  subcategories: string[]
}

interface CheckedItems {
  [categoryId: string]: boolean
}

interface CategoryItemProps {
  category: Category
  checked: boolean
  onCheckedChange: (categoryId: string, checked: boolean) => void
}

const categories: Category[] = [
  {
    id: "1",
    title: "Inventory Management",
    subcategories: [
      "Stock Tracking",
      "Multi-Location",
      "Auto Reordering",
    ],
  },
  {
    id: "2",
    title: "Point of Sale",
    subcategories: ["Retail POS", "Payment Processing", "Receipt Management"],
  },
  {
    id: "3",
    title: "Customer Relations",
    subcategories: ["CRM System", "Loyalty Programs", "Customer Insights"],
  },
  {
    id: "4",
    title: "Financial Management",
    subcategories: ["Invoicing", "Expense Tracking", "Financial Reports"],
  },
  {
    id: "5",
    title: "Supplier Management",
    subcategories: ["Purchase Orders", "Vendor Tracking", "Price Comparison"],
  },
  {
    id: "6",
    title: "Employee Management",
    subcategories: ["Time Tracking", "Shift Scheduling", "Payroll Integration"],
  },
  {
    id: "7",
    title: "Security & Access",
    subcategories: ["Role Permissions", "Data Encryption", "Audit Logging"],
  },
]

const CategoryItem = ({
  category,
  checked,
  onCheckedChange,
}: CategoryItemProps) => {
  return (
    <Card
      className={cx(
        "border-border p-5 transition-standard",
        checked && "border-primary ring-1 ring-primary",
      )}
    >
      <Label className="flex cursor-pointer items-start gap-2.5" htmlFor={category.id}>
        <Checkbox
          id={category.id}
          name={category.title}
          checked={checked}
          onCheckedChange={(isChecked) =>
            onCheckedChange(category.id, isChecked === true)
          }
          className="mt-0.5"
        />
        <div className="flex-1">
          <span className="text-base font-medium sm:text-sm">
            {category.title}
          </span>
          {category.subcategories.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {category.subcategories.map((subcategory) => (
                <li
                  className={badgeVariants({ variant: "neutral" })}
                  key={subcategory}
                >
                  {subcategory}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Label>
    </Card>
  )
}

export default function Products() {
  const [checkedItems, setCheckedItems] = React.useState<CheckedItems>({})
  const router = useRouter()
  const { data, setFeatures, loadProgress, isLoading, error } = useOnboardingStore()

  // Load existing progress on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await loadProgress()
      } catch (err) {
        // Error is handled by the store and logged
        logError(err instanceof Error ? err : new Error('Failed to load progress'), {
          step: 'products',
          metadata: { action: 'loadProgress' }
        })
      }
    }
    loadData()
  }, [loadProgress])

  // Populate form with existing data
  React.useEffect(() => {
    if (data.features?.selectedFeatures) {
      const newCheckedItems: CheckedItems = {}
      data.features.selectedFeatures.forEach((featureName) => {
        const category = categories.find(cat => cat.title === featureName)
        if (category) {
          newCheckedItems[category.id] = true
        }
      })
      setCheckedItems(newCheckedItems)
    }
  }, [data.features])

  const handleCheckedChange = (categoryId: string, isChecked: boolean) => {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [categoryId]: isChecked,
    }))
  }

  const isAnyItemChecked = Object.values(checkedItems).some(Boolean)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!isAnyItemChecked) {
      return
    }
    
    try {
      // Transform checkbox selections to array of strings
      const selectedFeatures = Object.entries(checkedItems)
        .filter(([_, isChecked]) => isChecked)
        .map(([categoryId]) => {
          const category = categories.find(cat => cat.id === categoryId)
          return category?.title || ''
        })
        .filter(title => title !== '')

      await setFeatures({ selectedFeatures })
      router.push("/auth/onboarding/employees")
    } catch (err) {
      // Error is handled by the store and logged
      logError(err instanceof Error ? err : new Error('Failed to save features'), {
        step: 'products',
        metadata: { action: 'submit', selectedFeatures }
      })
    }
  }

  const handleRetry = async () => {
    // Retry the last submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as any
    await handleSubmit(submitEvent)
  }

  return (
    <main className="mx-auto p-4">
      <div
        style={{ 
          animationDuration: "var(--animation-slide-down-duration)",
          animationDelay: "var(--animation-slide-down-delay)",
          animationFillMode: "var(--animation-fill-mode)"
        }}
        className="motion-safe:animate-revealBottom"
      >
        <h1 className="text-2xl font-semibold text-foreground sm:text-xl">
          Which products are you interested in?
        </h1>
        <p className="mt-6 text-muted-foreground sm:text-sm">
          You can choose multiple. This will help us customize the experience.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <ErrorMessage
          error={error}
          title="Failed to save product features"
          onRetry={handleRetry}
          isRetrying={isLoading}
          className="mt-4"
        />
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <fieldset>
          <legend className="sr-only">
            Select products you are interested in
          </legend>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                className="motion-safe:animate-revealBottom"
                key={category.id}
                style={{
                  animationDuration: "600ms",
                  animationDelay: `${100 + index * 50}ms`,
                  animationFillMode: "var(--animation-fill-mode)",
                }}
              >
                <CategoryItem
                  key={category.id}
                  category={category}
                  checked={checkedItems[category.id] || false}
                  onCheckedChange={handleCheckedChange}
                />
              </div>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 flex justify-between">
          <Button type="button" variant="ghost" asChild>
            <Link href="/auth/onboarding/business-info">Back</Link>
          </Button>
          <Button
            className="state-disabled"
            type="submit"
            disabled={!isAnyItemChecked || isLoading}
            aria-disabled={!isAnyItemChecked || isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Submitting..." : "Continue"}
          </Button>
        </div>
      </form>
    </main>
  )
}
