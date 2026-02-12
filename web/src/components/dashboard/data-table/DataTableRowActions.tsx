"use client"

import { Button } from "@/components/ui/button"
import { RiMoreFill } from "@remixicon/react"
import { Row } from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<
  TData,
>({}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group aspect-square p-1.5 hover:border hover:border-border data-[state=open]:border-border data-[state=open]:bg-muted/50"
        >
          <RiMoreFill
            className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground group-data-[state=open]:text-foreground"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem>Add</DropdownMenuItem>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
