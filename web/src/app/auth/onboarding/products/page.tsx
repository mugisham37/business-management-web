"use client"

import React from "react"
import { badgeVariants } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { cx } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleCheckedChange = (categoryId: string, isChecked: boolean) => {
    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [categoryId]: isChecked,
    }))
  }

  const isAnyItemChecked = Object.values(checkedItems).some(Boolean)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!isAnyItemChecked) {
      return
    }
    
    setLoading(true)
    
    setTimeout(() => {
      router.push("/auth/onboarding/employees")
    }, 400)
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
            disabled={!isAnyItemChecked || loading}
            aria-disabled={!isAnyItemChecked || loading}
            isLoading={loading}
          >
            {loading ? "Submitting..." : "Continue"}
          </Button>
        </div>
      </form>
    </main>
  )
}
