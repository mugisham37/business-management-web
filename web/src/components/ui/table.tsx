import * as React from "react"
import { cx } from "@/lib/utils"

const cn = cx

const TableRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    flowRoot?: boolean
  }
>(({ className, children, flowRoot = false, ...props }, ref) => (
  <div
    ref={ref}
    className={flowRoot ? "flow-root" : "overflow-x-auto"}
  >
    <div
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
  React.HTMLAttributes<HTMLTableElement> & {
    variant?: "default" | "tremor"
    tremorId?: string
  }
>(({ className, variant = "default", tremorId, ...props }, ref) => {
  const baseClasses = "w-full caption-bottom"
  
  if (variant === "tremor") {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          tremor-id={tremorId || "tremor-raw"}
          className={cx(
            baseClasses,
            "border-b",
            "border-gray-200 dark:border-gray-800",
            className
          )}
          {...props}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(baseClasses, "text-sm", className)}
        {...props}
      />
    </div>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return <thead ref={ref} className={cx(className)} {...props} />
  }

  return (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
})
TableHeader.displayName = "TableHeader"

const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return <thead ref={ref} className={cx(className)} {...props} />
  }

  return (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
})
TableHead.displayName = "TableHead"

const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    variant?: "default" | "tremor"
    whitespaceNowrap?: boolean
  }
>(({ className, variant = "default", whitespaceNowrap = false, ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <th
        ref={ref}
        className={cx(
          "border-b px-4 py-3.5 text-left text-sm font-semibold",
          "text-gray-900 dark:text-gray-50",
          "border-gray-200 dark:border-gray-800",
          whitespaceNowrap && "whitespace-nowrap",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <th
      ref={ref}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
})
TableHeaderCell.displayName = "TableHeaderCell"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <tbody
        ref={ref}
        className={cx(
          "divide-y",
          "divide-gray-200 dark:divide-gray-800",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
})
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    variant?: "default" | "tremor"
    responsive?: boolean
  }
>(({ className, variant = "default", responsive = false, ...props }, ref) => {
  if (variant === "tremor") {
    const responsiveClasses = responsive
      ? "sm:[&_td:last-child]:pr-6 sm:[&_th:last-child]:pr-6 sm:[&_td:first-child]:pl-6 sm:[&_th:first-child]:pl-6"
      : "[&_td:last-child]:pr-4 [&_th:last-child]:pr-4 [&_td:first-child]:pl-4 [&_th:first-child]:pl-4"

    return (
      <tr
        ref={ref}
        className={cx(responsiveClasses, className)}
        {...props}
      />
    )
  }

  return (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
})
TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    variant?: "default" | "tremor"
    whitespaceNowrap?: boolean
  }
>(({ className, variant = "default", whitespaceNowrap = false, ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <td
        ref={ref}
        className={cx(
          "p-4 text-sm",
          "text-gray-600 dark:text-gray-400",
          whitespaceNowrap && "whitespace-nowrap",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <td
      ref={ref}
      className={cn(
        "p-2 align-middle",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
})
TableCell.displayName = "TableCell"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <tfoot
        ref={ref}
        className={cx(
          "border-t text-left font-medium",
          "text-gray-900 dark:text-gray-50",
          "border-gray-200 dark:border-gray-800",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
})
TableFooter.displayName = "TableFooter"

const TableFoot = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <tfoot
        ref={ref}
        className={cx(
          "border-t text-left font-medium",
          "text-gray-900 dark:text-gray-50",
          "border-gray-200 dark:border-gray-800",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
})
TableFoot.displayName = "TableFoot"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement> & {
    variant?: "default" | "tremor"
  }
>(({ className, variant = "default", ...props }, ref) => {
  if (variant === "tremor") {
    return (
      <caption
        ref={ref}
        className={cx(
          "mt-3 px-3 text-center text-sm",
          "text-gray-500 dark:text-gray-500",
          className
        )}
        {...props}
      />
    )
  }

  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableRoot,
  TableHeader,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TableFoot,
  TableCaption,
}
