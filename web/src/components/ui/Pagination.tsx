import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cx } from "@/lib/utils"
import { type ButtonProps, buttonVariants } from "@/components/ui/Button"

interface PaginationProps extends React.ComponentProps<"nav"> {
  className?: string
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cx("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
)
Pagination.displayName = "Pagination"

interface PaginationContentProps extends React.ComponentProps<"ul"> {
  className?: string
}

const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cx("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
)
PaginationContent.displayName = "PaginationContent"

interface PaginationItemProps extends React.ComponentProps<"li"> {
  className?: string
}

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cx("", className)} {...props} />
  )
)
PaginationItem.displayName = "PaginationItem"

interface PaginationLinkProps
  extends React.ComponentProps<"a">,
    Pick<ButtonProps, "size"> {
  isActive?: boolean
  disabled?: boolean
  className?: string
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, disabled, size = "icon", ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={cx(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  )
)
PaginationLink.displayName = "PaginationLink"

interface PaginationButtonProps
  extends Omit<PaginationLinkProps, "isActive">,
    Pick<ButtonProps, "size"> {
  disabled?: boolean
  className?: string
}

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, PaginationButtonProps>(
  ({ className, disabled, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to previous page"
      size="default"
      disabled={disabled}
      className={cx("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  )
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<HTMLAnchorElement, PaginationButtonProps>(
  ({ className, disabled, ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      size="default"
      disabled={disabled}
      className={cx("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
)
PaginationNext.displayName = "PaginationNext"

interface PaginationEllipsisProps extends React.ComponentProps<"span"> {
  className?: string
}

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

export type {
  PaginationProps,
  PaginationContentProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationButtonProps,
  PaginationEllipsisProps,
}
