"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cx, focusInput } from "@/lib/utils"
import { RiArrowRightSLine, RiExpandUpDownLine } from "@remixicon/react"
import React from "react"
import { ModalAddWorkspace } from "./ModalAddWorkspace"

const workspaces = [
  {
    value: "retail-analytics",
    name: "Retail analytics",
    initials: "RA",
    role: "Member",
  },
  // Add more workspaces...
]

interface WorkspacesDropdownDesktopProps {
  isCollapsed: boolean
}

export const WorkspacesDropdownDesktop = ({ isCollapsed }: WorkspacesDropdownDesktopProps) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false)
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null)
  const focusRef = React.useRef<null | HTMLButtonElement>(null)

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current
  }

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open)
    if (open === false) {
      setDropdownOpen(false)
    }
  }
  return (
    <>
      {/* sidebar (lg+) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button
            ref={dropdownTriggerRef}
            className={cx(
              isCollapsed
                ? "flex aspect-square size-10 items-center justify-center rounded-md border border-sidebar-border bg-sidebar shadow-sm transition-all hover:bg-sidebar-accent/50"
                : "flex w-full items-center gap-x-2.5 rounded-md border border-sidebar-border bg-sidebar p-2 text-sm shadow-sm transition-all hover:bg-sidebar-accent/50",
              focusInput,
            )}
          >
            <span
              className={cx(
                "flex items-center justify-center rounded bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground",
                isCollapsed ? "size-6" : "aspect-square size-8 p-2"
              )}
              aria-hidden="true"
            >
              RA
            </span>
            {!isCollapsed && (
              <div className="flex w-full items-center justify-between gap-x-4 truncate">
                <div className="truncate">
                  <p className="truncate whitespace-nowrap text-sm font-medium text-sidebar-foreground">
                    Retail analytics
                  </p>
                  <p className="whitespace-nowrap text-left text-xs text-sidebar-foreground/60">
                    Member
                  </p>
                </div>
                <RiExpandUpDownLine
                  className="size-5 shrink-0 text-sidebar-foreground/60"
                  aria-hidden="true"
                />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          hidden={hasOpenDialog}
          side={isCollapsed ? "right" : "bottom"}
          align={isCollapsed ? "start" : "start"}
          sideOffset={isCollapsed ? 8 : 4}
          onCloseAutoFocus={(event: Event) => {
            if (focusRef.current) {
              focusRef.current.focus()
              focusRef.current = null
              event.preventDefault()
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Workspaces ({workspaces.length})
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.value}>
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className="flex aspect-square size-8 items-center justify-center rounded bg-sidebar-primary p-2 text-xs font-medium text-sidebar-primary-foreground"
                    aria-hidden="true"
                  >
                    {workspace.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-popover-foreground">
                      {workspace.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {workspace.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddWorkspace
            onSelect={handleDialogItemSelect}
            onOpenChange={handleDialogItemOpenChange}
            itemName="Add workspace"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export const WorkspacesDropdownMobile = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false)
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null)
  const focusRef = React.useRef<null | HTMLButtonElement>(null)

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current
  }

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open)
    if (open === false) {
      setDropdownOpen(false)
    }
  }
  return (
    <>
      {/* sidebar (xs-lg) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-muted focus:outline-none">
            <span
              className={cx(
                "flex aspect-square size-7 items-center justify-center rounded bg-primary p-2 text-xs font-medium text-primary-foreground",
              )}
              aria-hidden="true"
            >
              RA
            </span>
            <RiArrowRightSLine
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="flex w-full items-center justify-between gap-x-3 truncate">
              <p className="truncate whitespace-nowrap text-sm font-medium text-foreground">
                Retail analytics
              </p>
              <RiExpandUpDownLine
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="!min-w-72"
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event: Event) => {
            if (focusRef.current) {
              focusRef.current.focus()
              focusRef.current = null
              event.preventDefault()
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Workspaces ({workspaces.length})
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.value}>
                <div className="flex w-full items-center gap-x-2.5">
                  <span
                    className="flex size-8 items-center justify-center rounded bg-sidebar-primary p-2 text-xs font-medium text-sidebar-primary-foreground"
                    aria-hidden="true"
                  >
                    {workspace.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-popover-foreground">
                      {workspace.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {workspace.role}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddWorkspace
            onSelect={handleDialogItemSelect}
            onOpenChange={handleDialogItemOpenChange}
            itemName="Add workspace"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
