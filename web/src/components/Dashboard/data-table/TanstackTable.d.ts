import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    displayName: string
  }
}
import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    className?: string
    cell?: string
    displayName: string
  }
}
