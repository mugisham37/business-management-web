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
          className="group aspect-square p-1.5 hover:border hover:border-gray-300 data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50 hover:dark:border-gray-700 data-[state=open]:dark:border-gray-700 data-[state=open]:dark:bg-gray-900"
          aria-label="Open row actions menu"
        >
          <RiMoreFill
            className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-data-[state=open]:text-gray-700 group-hover:dark:text-gray-300 group-data-[state=open]:dark:text-gray-300"
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
            className="text-red-600 dark:text-red-500"
            shortcut="⌘⌫"
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
