"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Collapsible Context
interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(
  undefined
)

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("Collapsible components must be used within a Collapsible")
  }
  return context
}

// Collapsible Root Component
interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

function Collapsible({
  className,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [controlledOpen, onOpenChange]
  )

  return (
    <CollapsibleContext.Provider
      value={{
        open,
        onOpenChange: handleOpenChange,
        disabled,
      }}
    >
      <div
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        className={cn("cn-collapsible", className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

Collapsible.displayName = "Collapsible"

// Collapsible Trigger Component
interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function CollapsibleTrigger({
  className,
  onClick,
  disabled: triggerDisabled,
  asChild = false,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const { open, onOpenChange, disabled: collapsibleDisabled } = useCollapsible()

  const disabled = collapsibleDisabled || triggerDisabled

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onOpenChange(!open)
    }
    onClick?.(event)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      "data-slot": "collapsible-trigger",
      "data-state": open ? "open" : "closed",
      "aria-expanded": open,
      disabled,
      onClick: handleClick,
      className: cn(
        "cn-collapsible-trigger",
        (children as React.ReactElement<any>).props.className
      ),
    })
  }

  return (
    <button
      type="button"
      data-slot="collapsible-trigger"
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "cn-collapsible-trigger",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

CollapsibleTrigger.displayName = "CollapsibleTrigger"

// Collapsible Content Component
interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsibleContentProps) {
  const { open } = useCollapsible()

  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number | undefined>(
    open ? undefined : 0
  )

  React.useEffect(() => {
    if (!contentRef.current) return

    if (open) {
      const contentHeight = contentRef.current.scrollHeight
      setHeight(contentHeight)

      const timer = setTimeout(() => {
        setHeight(undefined)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setHeight(contentRef.current.scrollHeight)

      requestAnimationFrame(() => {
        setHeight(0)
      })
    }
  }, [open])

  return (
    <div
      data-slot="collapsible-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "cn-collapsible-content overflow-hidden transition-all duration-300 ease-in-out",
        className
      )}
      style={{
        height: height !== undefined ? `${height}px` : "auto",
      }}
    >
      <div ref={contentRef} {...props}>
        {children}
      </div>
    </div>
  )
}

CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
