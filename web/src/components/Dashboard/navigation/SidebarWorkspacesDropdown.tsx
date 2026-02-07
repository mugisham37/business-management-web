"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
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
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  // Add more workspaces...
]

export const WorkspacesDropdownDesktop = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false)
  const dropdownTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const focusRef = React.useRef<HTMLButtonElement | null>(null)

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
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button
          ref={dropdownTriggerRef}
          className={cx(
            "workspace-dropdown-button",
            focusInput,
          )}
          aria-label="Select workspace"
        >
          <span
            className="workspace-avatar bg-indigo-600 dark:bg-indigo-500"
            aria-hidden="true"
          >
            RA
          </span>
          <div className="flex w-full items-center justify-between gap-x-4 truncate">
            <div className="truncate">
              <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                Retail analytics
              </p>
              <p className="whitespace-nowrap text-left text-xs text-gray-700 dark:text-gray-300">
                Member
              </p>
            </div>
            <RiExpandUpDownLine
              className="size-5 shrink-0 text-gray-500"
              aria-hidden="true"
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        widthMode="trigger"
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
            <DropdownMenuItem 
              key={workspace.value}
              hint={workspace.role}
            >
              <div className="flex w-full items-center gap-x-2.5">
                <span
                  className={cx(
                    "workspace-avatar",
                    workspace.color,
                  )}
                  aria-hidden="true"
                >
                  {workspace.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {workspace.name}
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
  )
}

export const WorkspacesDropdownMobile = () => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false)
  const dropdownTriggerRef = React.useRef<HTMLButtonElement | null>(null)
  const focusRef = React.useRef<HTMLButtonElement | null>(null)

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
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button 
          ref={dropdownTriggerRef}
          className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-900"
          aria-label="Select workspace"
        >
          <span
            className={cx(
              "workspace-avatar workspace-avatar-mobile",
              "bg-indigo-600 dark:bg-indigo-500",
            )}
            aria-hidden="true"
          >
            RA
          </span>
          <RiArrowRightSLine
            className="size-4 shrink-0 text-gray-500"
            aria-hidden="true"
          />
          <div className="flex w-full items-center justify-between gap-x-3 truncate">
            <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
              Retail analytics
            </p>
            <RiExpandUpDownLine
              className="size-4 shrink-0 text-gray-500"
              aria-hidden="true"
            />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="!min-w-72"
        widthMode="auto"
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
            <DropdownMenuItem 
              key={workspace.value}
              hint={workspace.role}
            >
              <div className="flex w-full items-center gap-x-2.5">
                <span
                  className={cx(
                    "workspace-avatar",
                    workspace.color,
                  )}
                  aria-hidden="true"
                >
                  {workspace.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {workspace.name}
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
  )
}
