"use client"

import { Button } from "@/components/ui/button"
import { cx, focusRing } from "@/lib/utils"
import { ChevronsUpDown, User } from "lucide-react"

import { DropdownUserProfile } from "./DropdownUserProfile"

interface UserProfileDesktopProps {
  isCollapsed?: boolean
}

export const UserProfileDesktop = ({
  isCollapsed,
}: UserProfileDesktopProps) => {
  return (
    <DropdownUserProfile>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          isCollapsed ? "justify-center" : "justify-between",
          focusRing,
          "group flex w-full items-center rounded-md px-1 py-2 text-sm font-medium text-foreground hover:bg-muted data-[state=open]:bg-muted",
        )}
      >
        {isCollapsed ? (
          // h-8 to avoid layout shift with icon shown in isCollapsibled == false
          <div className="flex h-8 items-center">
            <User
              className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>
        ) : (
          <span className="flex items-center gap-3">
            <span
              className={cx(
                isCollapsed ? "size-5" : "size-8",
                "flex shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs text-foreground",
              )}
              aria-hidden="true"
            >
              ES
            </span>
            <span className={cx(isCollapsed ? "hidden" : "block")}>
              Emma Stone
            </span>
          </span>
        )}
        {!isCollapsed && (
          <ChevronsUpDown
            className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
            aria-hidden="true"
          />
        )}
      </Button>
    </DropdownUserProfile>
  )
}

export const UserProfileMobile = () => {
  return (
    <DropdownUserProfile align="end">
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          "group flex items-center rounded-md p-0.5 sm:p-1 text-sm font-medium text-foreground hover:bg-muted data-[state=open]:bg-muted",
        )}
      >
        <span
          className="flex size-8 sm:size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs text-foreground"
          aria-hidden="true"
        >
          ES
        </span>
      </Button>
    </DropdownUserProfile>
  )
}
