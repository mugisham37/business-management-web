"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Accordion Context
interface AccordionContextValue {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  disabled?: boolean
}

const AccordionContext = React.createContext<AccordionContextValue>({})

// Accordion Item Context
interface AccordionItemContextValue {
  value: string
  disabled?: boolean
}

const AccordionItemContext = React.createContext<AccordionItemContextValue>({
  value: "",
})

// Accordion Root Component
interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  disabled?: boolean
}

function Accordion({
  className,
  type = "single",
  value: controlledValue,
  defaultValue,
  onValueChange,
  collapsible = false,
  disabled = false,
  children,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | string[]
  >(defaultValue || (type === "multiple" ? [] : ""))

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (newValue: string | string[]) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [controlledValue, onValueChange]
  )

  return (
    <AccordionContext.Provider
      value={{
        type,
        value,
        onValueChange: handleValueChange,
        collapsible,
        disabled,
      }}
    >
      <div
        data-slot="accordion"
        className={cn("cn-accordion flex w-full flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

Accordion.displayName = "Accordion"

// Accordion Item Component
interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

function AccordionItem({
  className,
  value,
  disabled,
  ...props
}: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div
        data-slot="accordion-item"
        className={cn(
          "cn-accordion-item overflow-hidden border-b border-border first:mt-0",
          className
        )}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
}

AccordionItem.displayName = "AccordionItem"

// Accordion Trigger Component
interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const { type, value: accordionValue, onValueChange, collapsible, disabled: accordionDisabled } =
    React.useContext(AccordionContext)
  const { value: itemValue, disabled: itemDisabled } = React.useContext(AccordionItemContext)

  const disabled = accordionDisabled || itemDisabled || props.disabled

  const isOpen = React.useMemo(() => {
    if (type === "multiple" && Array.isArray(accordionValue)) {
      return accordionValue.includes(itemValue)
    }
    return accordionValue === itemValue
  }, [type, accordionValue, itemValue])

  const handleClick = () => {
    if (disabled) return

    if (type === "multiple" && Array.isArray(accordionValue)) {
      const newValue = isOpen
        ? accordionValue.filter((v) => v !== itemValue)
        : [...accordionValue, itemValue]
      onValueChange?.(newValue)
    } else {
      const newValue = isOpen && collapsible ? "" : itemValue
      onValueChange?.(newValue)
    }
  }

  return (
    <div className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-center justify-between py-3 text-left text-sm font-medium leading-none transition-all outline-none",
          "text-foreground",
          "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          "disabled:cursor-default disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
        <ChevronIcon
          className={cn(
            "cn-accordion-trigger-icon size-5 shrink-0 transition-transform duration-200",
            "text-muted-foreground",
            isOpen && "rotate-180"
          )}
        />
      </button>
    </div>
  )
}

AccordionTrigger.displayName = "AccordionTrigger"

// Accordion Content Component
interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const { type, value: accordionValue } = React.useContext(AccordionContext)
  const { value: itemValue } = React.useContext(AccordionItemContext)

  const isOpen = React.useMemo(() => {
    if (type === "multiple" && Array.isArray(accordionValue)) {
      return accordionValue.includes(itemValue)
    }
    return accordionValue === itemValue
  }, [type, accordionValue, itemValue])

  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number | undefined>(isOpen ? undefined : 0)

  React.useEffect(() => {
    if (!contentRef.current) return

    if (isOpen) {
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
  }, [isOpen])

  return (
    <div
      data-slot="accordion-content"
      className="cn-accordion-content overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        height: height !== undefined ? `${height}px` : "auto",
      }}
    >
      <div
        ref={contentRef}
        className={cn(
          "cn-accordion-content-inner pb-4 text-sm text-muted-foreground",
          "[&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-foreground",
          "[&_p:not(:last-child)]:mb-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

AccordionContent.displayName = "AccordionContent"

// Simple Chevron Icon Component
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
