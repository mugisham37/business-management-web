import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
// Tremor Raw Table [v0.0.2]

import React from "react"

import { cx } from "@/lib/utils"

const TableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
  // Activate if table is used in a float environment
  // className="flow-root"
  >
    <div
      // make table scrollable on mobile
      className={cx("w-full overflow-auto whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </div>
  </div>
))

TableRoot.displayName = "TableRoot"

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, forwardedRef) => (
  <table
    ref={forwardedRef}
    tremor-id="tremor-raw"
    className={cx(
      // base
      "w-full caption-bottom border-b",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

Table.displayName = "Table"

const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <thead ref={forwardedRef} className={cx(className)} {...props} />
))

TableHead.displayName = "TableHead"

const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <th
    ref={forwardedRef}
    className={cx(
      // base
      "border-b px-4 py-3.5 text-left text-sm font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

TableHeaderCell.displayName = "TableHeaderCell"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <tbody
    ref={forwardedRef}
    className={cx(
      // base
      "divide-y",
      // divide color
      "divide-gray-200 dark:divide-gray-800",
      className,
    )}
    {...props}
  />
))

TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, forwardedRef) => (
  <tr
    ref={forwardedRef}
    className={cx(
      "[&_td:last-child]:pr-4 [&_th:last-child]:pr-4",
      "[&_td:first-child]:pl-4 [&_th:first-child]:pl-4",
      className,
    )}
    {...props}
  />
))

TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <td
    ref={forwardedRef}
    className={cx(
      // base
      "p-4 text-sm",
      // text color
      "text-gray-600 dark:text-gray-400",
      className,
    )}
    {...props}
  />
))

TableCell.displayName = "TableCell"

const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => {
  return (
    <tfoot
      ref={forwardedRef}
      className={cx(
        // base
        "border-t text-left font-medium",
        // text color
        "text-gray-900 dark:text-gray-50",
        // border color
        "border-gray-200 dark:border-gray-800",
        className,
      )}
      {...props}
    />
  )
})

TableFoot.displayName = "TableFoot"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    className={cx(
      // base
      "mt-3 px-3 text-center text-sm",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow
}


// Tremor Raw Table [v0.0.2]

import React from "react"

import { cx } from "@/lib/utils"

const TableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    // Activate if table is used in a float environment
    // className="flow-root"
  >
    <div
      // make table scrollable on mobile
      className={cx("w-full overflow-auto whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </div>
  </div>
))

TableRoot.displayName = "TableRoot"

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, forwardedRef) => (
  <table
    ref={forwardedRef}
    className={cx(
      // base
      "w-full caption-bottom border-b",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

Table.displayName = "Table"

const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <thead ref={forwardedRef} className={cx(className)} {...props} />
))

TableHead.displayName = "TableHead"

const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <th
    ref={forwardedRef}
    className={cx(
      // base
      "border-b px-4 py-3.5 text-left text-sm font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

TableHeaderCell.displayName = "TableHeaderCell"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <tbody
    ref={forwardedRef}
    className={cx(
      // base
      "divide-y",
      // divide color
      "divide-gray-200 dark:divide-gray-800",
      className,
    )}
    {...props}
  />
))

TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, forwardedRef) => (
  <tr
    ref={forwardedRef}
    className={cx(
      "[&_td:last-child]:pr-4 [&_th:last-child]:pr-4",
      "[&_td:first-child]:pl-4 [&_th:first-child]:pl-4",
      className,
    )}
    {...props}
  />
))

TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <td
    ref={forwardedRef}
    className={cx(
      // base
      "p-4 text-sm",
      // text color
      "text-gray-600 dark:text-gray-400",
      className,
    )}
    {...props}
  />
))

TableCell.displayName = "TableCell"

const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => {
  return (
    <tfoot
      ref={forwardedRef}
      className={cx(
        // base
        "border-t text-left font-medium",
        // text color
        "text-gray-900 dark:text-gray-50",
        // border color
        "border-gray-200 dark:border-gray-800",
        className,
      )}
      {...props}
    />
  )
})

TableFoot.displayName = "TableFoot"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    className={cx(
      // base
      "mt-3 px-3 text-center text-sm",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
}

// Tremor Table [v0.0.3]

import React from "react"

import { cx } from "@/lib/utils"

const TableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    // Activate if table is used in a float environment
    // className="flow-root"
  >
    <div
      // make table scrollable on mobile
      className={cx("w-full overflow-auto whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </div>
  </div>
))

TableRoot.displayName = "TableRoot"

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, forwardedRef) => (
  <table
    ref={forwardedRef}
    tremor-id="tremor-raw"
    className={cx(
      // base
      "w-full caption-bottom border-b",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

Table.displayName = "Table"

const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <thead ref={forwardedRef} className={cx(className)} {...props} />
))

TableHead.displayName = "TableHead"

const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <th
    ref={forwardedRef}
    className={cx(
      // base
      "border-b px-4 py-3.5 text-left text-sm font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

TableHeaderCell.displayName = "TableHeaderCell"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <tbody
    ref={forwardedRef}
    className={cx(
      // base
      "divide-y",
      // divide color
      "divide-gray-200 dark:divide-gray-800",
      className,
    )}
    {...props}
  />
))

TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, forwardedRef) => (
  <tr
    ref={forwardedRef}
    className={cx(
      "[&_td:last-child]:pr-2 [&_th:last-child]:pr-2",
      "[&_td:first-child]:pl-2 [&_th:first-child]:pl-2",
      className,
    )}
    {...props}
  />
))

TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <td
    ref={forwardedRef}
    className={cx(
      // base
      "p-4 text-sm",
      // text color
      "text-gray-600 dark:text-gray-400",
      className,
    )}
    {...props}
  />
))

TableCell.displayName = "TableCell"

const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => {
  return (
    <tfoot
      ref={forwardedRef}
      className={cx(
        // base
        "border-t text-left font-medium",
        // text color
        "text-gray-900 dark:text-gray-50",
        // border color
        "border-gray-200 dark:border-gray-800",
        className,
      )}
      {...props}
    />
  )
})

TableFoot.displayName = "TableFoot"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    className={cx(
      // base
      "mt-3 px-3 text-center text-sm",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
}
// Tremor Table [v0.0.3]

import React from "react"

import { cx } from "@/lib/utils"

const TableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => (
  <div
    ref={forwardedRef}
    // Activate if table is used in a float environment
    // className="flow-root"
    className="overflow-x-auto"
  >
    <div
      // make table scrollable on mobile
      className={cx("w-full overflow-auto whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </div>
  </div>
))

TableRoot.displayName = "TableRoot"

const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, forwardedRef) => (
  <table
    ref={forwardedRef}
    tremor-id="tremor-raw"
    className={cx(
      // base
      "w-full caption-bottom border-b",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

Table.displayName = "Table"

const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <thead ref={forwardedRef} className={cx(className)} {...props} />
))

TableHead.displayName = "TableHead"

const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <th
    ref={forwardedRef}
    className={cx(
      // base
      "whitespace-nowrap border-b px-4 py-3.5 text-left text-sm font-semibold",
      // text color
      "text-gray-900 dark:text-gray-50",
      // border color
      "border-gray-200 dark:border-gray-800",
      className,
    )}
    {...props}
  />
))

TableHeaderCell.displayName = "TableHeaderCell"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => (
  <tbody
    ref={forwardedRef}
    className={cx(
      // base
      "divide-y",
      // divide color
      "divide-gray-200 dark:divide-gray-800",
      className,
    )}
    {...props}
  />
))

TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, forwardedRef) => (
  <tr
    ref={forwardedRef}
    className={cx(
      "sm:[&_td:last-child]:pr-6 sm:[&_th:last-child]:pr-6",
      "sm:[&_td:first-child]:pl-6 sm:[&_th:first-child]:pl-6",
      className,
    )}
    {...props}
  />
))

TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, forwardedRef) => (
  <td
    ref={forwardedRef}
    className={cx(
      // base
      "whitespace-nowrap p-4 text-sm",
      // text color
      "text-gray-600 dark:text-gray-400",
      className,
    )}
    {...props}
  />
))

TableCell.displayName = "TableCell"

const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, forwardedRef) => {
  return (
    <tfoot
      ref={forwardedRef}
      className={cx(
        // base
        "border-t text-left font-medium",
        // text color
        "text-gray-900 dark:text-gray-50",
        // border color
        "border-gray-200 dark:border-gray-800",
        className,
      )}
      {...props}
    />
  )
})

TableFoot.displayName = "TableFoot"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, forwardedRef) => (
  <caption
    ref={forwardedRef}
    className={cx(
      // base
      "mt-3 px-3 text-center text-sm",
      // text color
      "text-gray-500 dark:text-gray-500",
      className,
    )}
    {...props}
  />
))

TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
}
