"use client"

import { Button } from "@/components/ui/button"
import { cx, focusRing } from "@/lib/utils"
import { ChevronsUpDown } from "lucide-react"

import { DropdownUserProfile } from "./DropdownUserProfile"

export function UserProfile() {
  return (
    <DropdownUserProfile>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          "group flex w-full items-center justify-between rounded-md px-1 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent/50",
          focusRing,
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-background text-xs text-foreground"
            aria-hidden="true"
          >
            ES
          </span>
          <span>Emma Stone</span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
          aria-hidden="true"
        />
      </Button>
    </DropdownUserProfile>
  )
}
