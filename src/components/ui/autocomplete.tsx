"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"

const inputVariants = cva(
  "outline-none flex w-full text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [[readonly]]:bg-muted/80 [[readonly]]:cursor-not-allowed border border-input focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 style-vega:rounded-md style-maia:rounded-4xl style-nova:rounded-lg style-lyra:rounded-none style-mira:rounded-md style-vega:bg-transparent style-vega:dark:bg-input/30 style-maia:bg-input/30 style-nova:bg-transparent style-nova:dark:bg-input/30 style-lyra:bg-transparent style-lyra:dark:bg-input/30 style-mira:bg-input/20 style-mira:dark:bg-input/30 style-vega:text-sm style-maia:text-sm style-nova:text-sm style-lyra:text-xs style-mira:text-xs/relaxed style-vega:shadow-xs style-vega:transition-[color,box-shadow] style-maia:transition-colors style-nova:transition-colors style-lyra:transition-colors style-mira:transition-colors style-vega:focus-visible:ring-ring/50 style-maia:focus-visible:ring-ring/50 style-nova:focus-visible:ring-ring/50 style-lyra:focus-visible:ring-ring/50 style-mira:focus-visible:ring-ring/30 style-vega:focus-visible:ring-3 style-maia:focus-visible:ring-[3px] style-nova:focus-visible:ring-3 style-lyra:focus-visible:ring-1 style-mira:focus-visible:ring-2 style-vega:aria-invalid:ring-3 style-maia:aria-invalid:ring-[3px] style-nova:aria-invalid:ring-3 style-lyra:aria-invalid:ring-1 style-mira:aria-invalid:ring-2",
  {
    variants: {
      size: {
        sm: "style-vega:h-8 style-vega:px-2.5 style-maia:h-8 style-maia:px-3 style-nova:h-7 style-nova:px-2 style-lyra:h-7 style-lyra:px-2 style-mira:h-6 style-mira:px-2 style-vega:[&~[data-slot=autocomplete-clear]]:end-1.75 style-vega:[&~[data-slot=autocomplete-trigger]]:end-1.75 style-maia:[&~[data-slot=autocomplete-clear]]:end-2.5 style-maia:[&~[data-slot=autocomplete-trigger]]:end-2.5 style-nova:[&~[data-slot=autocomplete-clear]]:end-1.5 style-nova:[&~[data-slot=autocomplete-trigger]]:end-1.5 style-lyra:[&~[data-slot=autocomplete-clear]]:end-1.5 style-lyra:[&~[data-slot=autocomplete-trigger]]:end-1.5 style-mira:[&~[data-slot=autocomplete-clear]]:end-1.25 style-mira:[&~[data-slot=autocomplete-trigger]]:end-1.25",
        default:
          "style-vega:h-9 style-vega:px-3 style-maia:h-9 style-maia:px-3 style-nova:h-8 style-nova:px-2.5 style-lyra:h-8 style-lyra:px-2.5 style-mira:h-7 style-mira:px-2 style-vega:[&~[data-slot=autocomplete-clear]]:end-2 style-vega:[&~[data-slot=autocomplete-trigger]]:end-2 style-maia:[&~[data-slot=autocomplete-clear]]:end-2.5 style-maia:[&~[data-slot=autocomplete-trigger]]:end-2.5 style-nova:[&~[data-slot=autocomplete-clear]]:end-1.75 style-nova:[&~[data-slot=autocomplete-trigger]]:end-1.75 style-lyra:[&~[data-slot=autocomplete-clear]]:end-1.75 style-lyra:[&~[data-slot=autocomplete-trigger]]:end-1.75 style-mira:[&~[data-slot=autocomplete-clear]]:end-1.5 style-mira:[&~[data-slot=autocomplete-trigger]]:end-1.5",
        lg: "style-vega:h-10 style-vega:px-3.5 style-maia:h-10 style-maia:px-4 style-nova:h-9 style-nova:px-2.5 style-lyra:h-9 style-lyra:px-2.5 style-mira:h-8 style-mira:px-2.5 style-vega:[&~[data-slot=autocomplete-clear]]:end-2.5 style-vega:[&~[data-slot=autocomplete-trigger]]:end-2.5 style-maia:[&~[data-slot=autocomplete-clear]]:end-3 style-maia:[&~[data-slot=autocomplete-trigger]]:end-3 style-nova:[&~[data-slot=autocomplete-clear]]:end-2 style-nova:[&~[data-slot=autocomplete-trigger]]:end-2 style-lyra:[&~[data-slot=autocomplete-clear]]:end-2 style-lyra:[&~[data-slot=autocomplete-trigger]]:end-2 style-mira:[&~[data-slot=autocomplete-clear]]:end-1.75 style-mira:[&~[data-slot=autocomplete-trigger]]:end-1.75",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

// Context for managing autocomplete state
interface AutocompleteContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
  inputValue: string
  setInputValue: (value: string) => void
  highlightedIndex: number
  setHighlightedIndex: (index: number) => void
}

const AutocompleteContext = React.createContext<
  AutocompleteContextValue | undefined
>(undefined)

function useAutocompleteContext() {
  const context = React.useContext(AutocompleteContext)
  if (!context) {
    throw new Error(
      "Autocomplete components must be used within an Autocomplete"
    )
  }
  return context
}

interface AutocompleteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  children: React.ReactNode
}

function Autocomplete({
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  onValueChange,
  defaultValue = "",
  children,
}: AutocompleteProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [inputValue, setInputValue] = React.useState(defaultValue)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)

  const open = controlledOpen ?? internalOpen
  const value = controlledValue ?? internalValue

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [controlledOpen, onOpenChange]
  )

  const setValue = React.useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [controlledValue, onValueChange]
  )

  return (
    <AutocompleteContext.Provider
      value={{
        open,
        setOpen,
        value,
        setValue,
        inputValue,
        setInputValue,
        highlightedIndex,
        setHighlightedIndex,
      }}
    >
      {children}
    </AutocompleteContext.Provider>
  )
}

function AutocompleteValue({ children }: { children?: React.ReactNode }) {
  const { value } = useAutocompleteContext()
  return (
    <span data-slot="autocomplete-value">
      {children || value}
    </span>
  )
}

interface AutocompleteInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: VariantProps<typeof inputVariants>["size"]
  showClear?: boolean
  showTrigger?: boolean
}

function AutocompleteInput({
  className,
  size = "default",
  showClear = false,
  showTrigger = false,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  ...props
}: AutocompleteInputProps) {
  const {
    open,
    setOpen,
    inputValue,
    setInputValue,
    setValue,
    highlightedIndex,
    setHighlightedIndex,
  } = useAutocompleteContext()

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setOpen(true)
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay to allow click events on items
    setTimeout(() => setOpen(false), 200)
    onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setOpen(true)
    onChange?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false)
    }
    onKeyDown?.(e)
  }

  return (
    <div className="relative w-full">
      <input
        data-slot="autocomplete-input"
        data-size={size}
        className={cn(inputVariants({ size }), className)}
        value={inputValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {showTrigger && <AutocompleteTrigger />}
      {showClear && inputValue && <AutocompleteClear />}
    </div>
  )
}

function AutocompleteStatus({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="autocomplete-status"
      className={cn(
        "text-muted-foreground style-vega:px-2 style-vega:py-1.5 style-vega:text-sm style-maia:px-3 style-maia:py-2 style-maia:text-sm style-nova:px-2 style-nova:py-1.5 style-nova:text-sm style-lyra:px-2 style-lyra:py-1.5 style-lyra:text-xs style-mira:px-2 style-mira:py-1 style-mira:text-xs/relaxed empty:m-0 empty:p-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface AutocompleteContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
  alignOffset?: number
  side?: "top" | "right" | "bottom" | "left"
  showBackdrop?: boolean
}

function AutocompleteContent({
  className,
  children,
  showBackdrop = false,
  align = "start",
  sideOffset = 4,
  side = "bottom",
  ...props
}: AutocompleteContentProps) {
  const { open } = useAutocompleteContext()

  if (!open) return null

  return (
    <>
      {showBackdrop && (
        <div
          data-slot="autocomplete-backdrop"
          className="fixed inset-0 z-40"
        />
      )}
      <div
        data-slot="autocomplete-positioner"
        className="absolute z-50 mt-1 w-full"
      >
        <div
          data-slot="autocomplete-popup"
          className={cn(
            "bg-popover text-popover-foreground style-vega:rounded-md style-maia:rounded-2xl style-nova:rounded-lg style-lyra:rounded-none style-mira:rounded-lg style-vega:shadow-md style-vega:shadow-black/5 style-maia:shadow-2xl style-nova:shadow-md style-lyra:shadow-md style-mira:shadow-md style-vega:ring-foreground/10 style-maia:ring-foreground/5 style-nova:ring-foreground/10 style-lyra:ring-foreground/10 style-mira:ring-foreground/10 flex max-h-96 w-full flex-col py-0.5 ring-1",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </>
  )
}

interface AutocompleteListProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollAreaClassName?: string
}

function AutocompleteList({
  className,
  scrollAreaClassName,
  children,
  ...props
}: AutocompleteListProps) {
  return (
    <ScrollArea
      className={cn(
        "size-full min-h-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain",
        scrollAreaClassName
      )}
    >
      <div
        data-slot="autocomplete-list"
        className={cn(
          "style-vega:not-empty:px-1 style-vega:not-empty:py-1 style-maia:not-empty:px-1 style-maia:not-empty:py-1 style-nova:not-empty:px-1 style-nova:not-empty:py-1 style-mira:not-empty:px-1 style-mira:not-empty:py-1 not-empty:scroll-py-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ScrollArea>
  )
}

function AutocompleteCollection({ children }: { children: React.ReactNode }) {
  return <div data-slot="autocomplete-collection">{children}</div>
}

function AutocompleteRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="autocomplete-row"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

interface AutocompleteItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

function AutocompleteItem({
  className,
  value: itemValue,
  disabled = false,
  onClick,
  children,
  ...props
}: AutocompleteItemProps) {
  const { setValue, setInputValue, setOpen, highlightedIndex } =
    useAutocompleteContext()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setValue(itemValue)
      setInputValue(itemValue)
      setOpen(false)
      onClick?.(e)
    }
  }

  return (
    <div
      data-slot="autocomplete-item"
      data-disabled={disabled || undefined}
      className={cn(
        "text-foreground data-highlighted:text-foreground data-highlighted:before:bg-accent style-vega:gap-2 style-maia:gap-2.5 style-nova:gap-1.5 style-lyra:gap-2 style-mira:gap-2 style-vega:rounded-sm style-maia:rounded-xl style-nova:rounded-md style-lyra:rounded-none style-mira:rounded-md style-vega:px-2 style-vega:py-1.5 style-maia:px-3 style-maia:py-2 style-nova:px-1.5 style-nova:py-1 style-lyra:px-2 style-lyra:py-2 style-mira:px-2 style-mira:py-1 style-vega:text-sm style-maia:text-sm style-nova:text-sm style-lyra:text-xs style-mira:text-xs/relaxed style-vega:data-highlighted:before:rounded-sm style-maia:data-highlighted:before:rounded-lg style-nova:data-highlighted:before:rounded-sm style-lyra:data-highlighted:before:rounded-none style-mira:data-highlighted:before:rounded-sm style-vega:[&_svg:not([class*='size-'])]:size-4 style-maia:[&_svg:not([class*='size-'])]:size-4 style-nova:[&_svg:not([class*='size-'])]:size-4 style-lyra:[&_svg:not([class*='size-'])]:size-4 style-mira:[&_svg:not([class*='size-'])]:size-3.5 relative flex cursor-default items-center outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 hover:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([role=img]):not([class*=text-])]:opacity-60",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

function AutocompleteGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="autocomplete-group"
      className={className}
      {...props}
    />
  )
}

function AutocompleteGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="autocomplete-group-label"
      className={cn(
        "text-muted-foreground style-vega:px-2 style-vega:py-1.5 style-maia:px-3 style-maia:py-2.5 style-nova:px-1.5 style-nova:py-1 style-lyra:px-2 style-lyra:py-2 style-mira:px-2 style-mira:py-1.5 text-xs font-medium",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteEmpty({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="autocomplete-empty"
      className={cn(
        "text-muted-foreground style-vega:px-2 style-vega:py-1.5 style-vega:text-sm style-maia:px-3 style-maia:py-2 style-maia:text-sm style-nova:px-2 style-nova:py-1.5 style-nova:text-sm style-lyra:px-2 style-lyra:py-1.5 style-lyra:text-xs style-mira:px-2 style-mira:py-1 style-mira:text-xs/relaxed text-center empty:m-0 empty:p-0",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteClear({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setInputValue, setValue } = useAutocompleteContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setInputValue("")
    setValue("")
    props.onClick?.(e)
  }

  return (
    <button
      type="button"
      data-slot="autocomplete-clear"
      className={cn(
        "ring-offset-background focus:ring-ring absolute top-1/2 -translate-y-1/2 cursor-pointer opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <IconPlaceholder
        lucide="XIcon"
        tabler="IconX"
        hugeicons="Cancel01Icon"
        phosphor="XIcon"
        remixicon="RiCloseLine"
        className="style-vega:size-4 style-maia:size-4 style-nova:size-4 style-lyra:size-4 style-mira:size-3.5"
      />
    </button>
  )
}

function AutocompleteTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useAutocompleteContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setOpen(!open)
    props.onClick?.(e)
  }

  return (
    <button
      type="button"
      data-slot="autocomplete-trigger"
      className={cn(
        "focus:ring-ring ring-offset-background absolute top-1/2 -translate-y-1/2 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none has-[+[data-slot=autocomplete-clear]]:hidden",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <IconPlaceholder
        lucide="ChevronsUpDownIcon"
        tabler="IconSelector"
        hugeicons="UnfoldMoreIcon"
        phosphor="CaretUpDownIcon"
        remixicon="RiExpandUpDownLine"
        className="style-vega:size-4 style-maia:size-4 style-nova:size-4 style-lyra:size-4 style-mira:size-3.5 opacity-70"
      />
    </button>
  )
}

function AutocompleteSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="autocomplete-separator"
      className={cn(
        "style-vega:bg-border style-vega:my-1.5 style-maia:bg-border/50 style-maia:my-1.5 style-nova:bg-border style-nova:my-1.5 style-lyra:bg-border style-lyra:my-1 style-mira:bg-border/50 style-mira:my-1 h-px",
        className
      )}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteValue,
  AutocompleteTrigger,
  AutocompleteInput,
  AutocompleteStatus,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteCollection,
  AutocompleteRow,
  AutocompleteItem,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteEmpty,
  AutocompleteClear,
  AutocompleteSeparator,
}
