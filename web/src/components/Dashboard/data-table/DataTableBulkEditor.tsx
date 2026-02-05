"use client"

import {
  CommandBar,
  CommandBarBar,
  CommandBarCommand,
  CommandBarSeperator,
  CommandBarValue,
} from "@/components/ui/CommandBar"
import { RowSelectionState, Table } from "@tanstack/react-table"
import { useCallback, useMemo, useState } from "react"

type DataTableBulkEditorProps<TData> = {
  table: Table<TData>
  rowSelection: RowSelectionState
  onEdit?: (selectedRows: TData[]) => void | Promise<void>
  onDelete?: (selectedRows: TData[]) => void | Promise<void>
  onOpenChange?: (open: boolean) => void
  disableEdit?: boolean
  disableDelete?: boolean
}

function DataTableBulkEditor<TData>({
  table,
  rowSelection,
  onEdit,
  onDelete,
  onOpenChange,
  disableEdit = false,
  disableDelete = false,
}: DataTableBulkEditorProps<TData>) {
  const [isProcessing, setIsProcessing] = useState(false)
  
  const selectedCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection])
  const hasSelectedRows = selectedCount > 0
  
  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map(row => row.original)
  }, [table, rowSelection])

  const handleEdit = useCallback(async () => {
    if (!onEdit || isProcessing || disableEdit) return
    
    setIsProcessing(true)
    try {
      await onEdit(selectedRows)
    } finally {
      setIsProcessing(false)
    }
  }, [onEdit, selectedRows, isProcessing, disableEdit])

  const handleDelete = useCallback(async () => {
    if (!onDelete || isProcessing || disableDelete) return
    
    setIsProcessing(true)
    try {
      await onDelete(selectedRows)
    } finally {
      setIsProcessing(false)
    }
  }, [onDelete, selectedRows, isProcessing, disableDelete])

  const handleReset = useCallback(() => {
    if (isProcessing) return
    table.resetRowSelection()
  }, [table, isProcessing])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && !isProcessing) {
      table.resetRowSelection()
    }
    onOpenChange?.(open)
  }, [table, onOpenChange, isProcessing])

  return (
    <CommandBar 
      open={hasSelectedRows} 
      onOpenChange={handleOpenChange}
      disableAutoFocus={false}
    >
      <CommandBarBar>
        <CommandBarValue>
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </CommandBarValue>
        {onEdit && (
          <>
            <CommandBarSeperator />
            <CommandBarCommand
              label="Edit"
              action={handleEdit}
              shortcut={{ shortcut: "e" }}
              disabled={disableEdit || isProcessing || selectedCount === 0}
            />
          </>
        )}
        {onDelete && (
          <>
            <CommandBarSeperator />
            <CommandBarCommand
              label="Delete"
              action={handleDelete}
              shortcut={{ shortcut: "d" }}
              disabled={disableDelete || isProcessing || selectedCount === 0}
            />
          </>
        )}
        <CommandBarSeperator />
        <CommandBarCommand
          label="Clear"
          action={handleReset}
          shortcut={{ shortcut: "Escape", label: "esc" }}
          disabled={isProcessing}
        />
      </CommandBarBar>
    </CommandBar>
  )
}

export { DataTableBulkEditor }
