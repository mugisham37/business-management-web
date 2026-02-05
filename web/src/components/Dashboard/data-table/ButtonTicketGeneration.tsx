import React from "react"
import { type VariantProps } from "tailwind-variants"

import { Button, buttonVariants } from "@/components/ui/Button"
import { RiCheckboxCircleFill, RiCloseCircleFill } from "@remixicon/react"

interface ButtonTicketGenerationProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  initialState: boolean
  onStateChange?: (state: boolean) => void
}

const ButtonTicketGeneration = React.forwardRef<HTMLButtonElement, ButtonTicketGenerationProps>(
  ({ 
    initialState, 
    onStateChange,
    variant = "secondary",
    size = "sm",
    isLoading = false,
    loadingText,
    disabled,
    onClick,
    children,
    ...props 
  }: ButtonTicketGenerationProps, forwardedRef) => {
    const [internalState, setInternalState] = React.useState(initialState)
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) return
      
      const newState = !internalState
      setInternalState(newState)
      onStateChange?.(newState)
      onClick?.(event)
    }

    return (
      <Button
        ref={forwardedRef}
        variant={variant}
        size={size}
        isLoading={isLoading}
        loadingText={loadingText}
        disabled={disabled}
        onClick={handleClick}
        aria-pressed={internalState}
        aria-label={`Ticket generation ${internalState ? 'enabled' : 'disabled'}`}
        {...props}
      >
        {!isLoading && (
          <>
            {internalState ? (
              <RiCheckboxCircleFill
                className="text-emerald-600 dark:text-emerald-500"
                aria-hidden="true"
              />
            ) : (
              <RiCloseCircleFill
                className="text-gray-400 dark:text-gray-600"
                aria-hidden="true"
              />
            )}
            {children || (internalState ? "Enabled" : "Disabled")}
          </>
        )}
      </Button>
    )
  },
)

ButtonTicketGeneration.displayName = "ButtonTicketGeneration"

export { ButtonTicketGeneration, type ButtonTicketGenerationProps }
