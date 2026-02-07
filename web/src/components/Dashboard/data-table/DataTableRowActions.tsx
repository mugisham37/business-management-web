"use client"

import { Button } from "@/components/ui/Button"
import { RiMoreFill } from "@remixicon/react"
import { Row } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (row: Row<TData>) => void
  onDelete?: (row: Row<TData>) => void
  onDuplicate?: (row: Row<TData>) => void
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onDuplicate,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group aspect-square p-1.5 row-actions-button"
          style={{
            '--hover-bg': 'var(--interactive-hover-light)',
            '--open-bg': 'var(--table-row-selected-bg)',
          } as React.CSSProperties}
          aria-label="Open row actions menu"
        >
          <RiMoreFill
            className="size-4 shrink-0"
            style={{
              color: 'var(--muted-foreground)',
              transition: 'color var(--transition-fast) var(--ease-in-out)'
            }}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        widthMode="auto"
        sideOffset={4}
        collisionPadding={8}
        loop
      >
        {onDuplicate && (
          <DropdownMenuItem 
            onClick={() => onDuplicate(row)}
            shortcut="⌘D"
          >
            Duplicate
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem 
            onClick={() => onEdit(row)}
            shortcut="⌘E"
          >
            Edit
          </DropdownMenuItem>
        )}
        {(onEdit || onDuplicate) && onDelete && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(row)}
            className=""
            style={{ color: 'var(--destructive)' }}
            shortcut="⌘⌫"
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
