"use client"

import {
  CommandBar,
  CommandBarBar,
  CommandBarCommand,
  CommandBarSeperator,
  CommandBarValue,
} from "@/components/ui/CommandBar"
import { RowSelectionState, Table } from "@tanstack/react-table"

type DataTableBulkEditorProps<TData> = {
  table: Table<TData>
  rowSelection: RowSelectionState
}

function DataTableBulkEditor<TData>({
  table,
  rowSelection,
}: DataTableBulkEditorProps<TData>) {
  const hasSelectedRows = Object.keys(rowSelection).length > 0
  return (
    <CommandBar open={hasSelectedRows}>
      <CommandBarBar className="command-bar">
        <CommandBarValue className="command-bar-value">
          {Object.keys(rowSelection).length} selected
        </CommandBarValue>
        <CommandBarSeperator className="command-bar-separator" />
        <CommandBarCommand
          label="Edit"
          action={() => {
            console.log("Edit")
          }}
          shortcut={{ shortcut: "e" }}
          className="command-bar-command"
        />
        <CommandBarSeperator className="command-bar-separator" />
        <CommandBarCommand
          label="Delete"
          action={() => {
            console.log("Delete")
          }}
          shortcut={{ shortcut: "d" }}
          className="command-bar-command"
        />
        <CommandBarSeperator className="command-bar-separator" />
        <CommandBarCommand
          label="Reset"
          action={() => {
            table.resetRowSelection()
          }}
          shortcut={{ shortcut: "Escape", label: "esc" }}
          className="command-bar-command"
          // don't disable this command
        />
      </CommandBarBar>
    </CommandBar>
  )
}

export { DataTableBulkEditor }
