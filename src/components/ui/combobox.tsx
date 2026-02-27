"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"

// Context for Combobox state management
interface ComboboxContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string | string[]
  onValueChange?: (value: string | string[]) => void
  inputValue: string
  setInputValue: (value: string) => void
  multiple?: boolean
  disabled?: boolean
}

const ComboboxContext = React.createContext<ComboboxContextValue | undefined>(
  undefined
)

function useComboboxContext() {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error("Combobox components must be used within Combobox")
  }
  return context
}

interface ComboboxProps {
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  multiple?: boolean
  disabled?: boolean
  children: React.ReactNode
}

function Combobox({
  value: controlledValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  multiple = false,
  disabled = false,
  children,
}: ComboboxProps) {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    multiple ? [] : ""
  )
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const value = controlledValue !== undefined ? controlledValue : internalValue
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (disabled) return
      if (onOpenChange) {
        onOpenChange(newOpen)
      } else {
        setInternalOpen(newOpen)
      }
    },
    [disabled, onOpenChange]
  )

  const handleValueChange = React.useCallback(
    (newValue: string | string[]) => {
      if (onValueChange) {
        onValueChange(newValue)
      } else {
        setInternalValue(newValue)
      }
    },
    [onValueChange]
  )

  return (
    <ComboboxContext.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange: handleValueChange,
        inputValue,
        setInputValue,
        multiple,
        disabled,
      }}
    >
      <div data-slot="combobox">{children}</div>
    </ComboboxContext.Provider>
  )
}

function ComboboxValue({ placeholder, ...props }: { placeholder?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const { value } = useComboboxContext()
  const displayValue = Array.isArray(value) ? value.join(", ") : value
  
  return (
    <span data-slot="combobox-value" {...props}>
      {displayValue || placeholder}
    </span>
  )
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen, open, disabled } = useComboboxContext()

  return (
    <button
      type="button"
      data-slot="combobox-trigger"
      className={cn("cn-combobox-trigger", className)}
      onClick={() => setOpen(!open)}
      disabled={disabled}
      {...props}
    >
      {children}
      <IconPlaceholder
        lucide="ChevronDownIcon"
        tabler="IconChevronDown"
        hugeicons="ArrowDown01Icon"
        phosphor="CaretDownIcon"
        remixicon="RiArrowDownSLine"
        className="cn-combobox-trigger-icon pointer-events-none"
      />
    </button>
  )
}

function ComboboxClear({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setInputValue, onValueChange, multiple, disabled } = useComboboxContext()

  const handleClear = () => {
    setInputValue("")
    if (onValueChange) {
      onValueChange(multiple ? [] : "")
    }
  }

  return (
    <InputGroupButton
      variant="ghost"
      size="icon-xs"
      data-slot="combobox-clear"
      className={cn("cn-combobox-clear", className)}
      onClick={handleClear}
      disabled={disabled}
      type="button"
      {...props}
    >
      <IconPlaceholder
        lucide="XIcon"
        tabler="IconX"
        hugeicons="Cancel01Icon"
        phosphor="XIcon"
        remixicon="RiCloseLine"
        className="cn-combobox-clear-icon pointer-events-none"
      />
    </InputGroupButton>
  )
}

function ComboboxInput({
  className,
  children,
  disabled: disabledProp,
  showTrigger = true,
  showClear = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  const { inputValue, setInputValue, setOpen, disabled: contextDisabled } = useComboboxContext()
  const disabled = disabledProp ?? contextDisabled

  return (
    <InputGroup className={cn("cn-combobox-input w-auto", className)}>
      <InputGroupInput
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setOpen(true)
        }}
        disabled={disabled}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  align?: "start" | "center" | "end"
  alignOffset?: number
  anchor?: React.RefObject<HTMLElement>
}) {
  const { open } = useComboboxContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <div
      ref={contentRef}
      data-slot="combobox-content"
      data-chips={!!anchor}
      className={cn(
        "cn-combobox-content cn-combobox-content-logical cn-menu-target group/combobox-content",
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ComboboxList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="combobox-list"
      role="listbox"
      className={cn(
        "cn-combobox-list overflow-y-auto overscroll-contain",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  value: itemValue,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
}) {
  const { value, onValueChange, multiple, setOpen, setInputValue } = useComboboxContext()
  const isSelected = Array.isArray(value)
    ? value.includes(itemValue)
    : value === itemValue

  const handleSelect = () => {
    if (disabled) return

    if (multiple && Array.isArray(value)) {
      const newValue = isSelected
        ? value.filter((v) => v !== itemValue)
        : [...value, itemValue]
      onValueChange?.(newValue)
    } else {
      onValueChange?.(itemValue)
      setInputValue(itemValue)
      setOpen(false)
    }
  }

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-slot="combobox-item"
      data-disabled={disabled}
      className={cn(
        "cn-combobox-item relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      onClick={handleSelect}
      {...props}
    >
      {children}
      {isSelected && (
        <span className="cn-combobox-item-indicator ml-auto">
          <IconPlaceholder
            lucide="CheckIcon"
            tabler="IconCheck"
            hugeicons="Tick02Icon"
            phosphor="CheckIcon"
            remixicon="RiCheckLine"
            className="cn-combobox-item-indicator-icon pointer-events-none h-4 w-4"
          />
        </span>
      )}
    </div>
  )
}

function ComboboxGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      data-slot="combobox-group"
      className={cn("cn-combobox-group", className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="combobox-label"
      className={cn("cn-combobox-label px-2 py-1.5 text-sm font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxCollection({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="combobox-collection">{children}</div>
  )
}

function ComboboxEmpty({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="combobox-empty"
      className={cn("cn-combobox-empty px-2 py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="combobox-separator"
      className={cn("cn-combobox-separator -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="combobox-chips"
      className={cn("cn-combobox-chips flex flex-wrap gap-1", className)}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  value: chipValue,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showRemove?: boolean
  value: string
}) {
  const { value, onValueChange, multiple } = useComboboxContext()

  const handleRemove = () => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((v) => v !== chipValue)
      onValueChange?.(newValue)
    }
  }

  return (
    <div
      data-slot="combobox-chip"
      className={cn(
        "cn-combobox-chip inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground",
        "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="cn-combobox-chip-remove h-4 w-4 p-0 hover:bg-transparent"
          data-slot="combobox-chip-remove"
          onClick={handleRemove}
          type="button"
        >
          <IconPlaceholder
            lucide="XIcon"
            tabler="IconX"
            hugeicons="Cancel01Icon"
            phosphor="XIcon"
            remixicon="RiCloseLine"
            className="cn-combobox-chip-indicator-icon pointer-events-none h-3 w-3"
          />
        </Button>
      )}
    </div>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { inputValue, setInputValue, setOpen } = useComboboxContext()

  return (
    <input
      data-slot="combobox-chip-input"
      className={cn(
        "cn-combobox-chip-input min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
        className
      )}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value)
        setOpen(true)
      }}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
