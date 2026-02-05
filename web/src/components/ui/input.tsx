import * as React from "react"
import { RiEyeFill, RiEyeOffFill, RiSearchLine } from "@remixicon/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      hasError: {
        true: "border-destructive focus-visible:ring-destructive",
      },
      enableStepper: {
        false: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      },
    },
    defaultVariants: {
      enableStepper: true,
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  inputClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputClassName, hasError, enableStepper = true, type, ...props }, ref) => {
    const [typeState, setTypeState] = React.useState(type)
    const [showPassword, setShowPassword] = React.useState(false)

    const isPassword = type === "password"
    const isSearch = type === "search"

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
      setTypeState(showPassword ? "password" : "text")
    }

    return (
      <div className={cn("relative w-full", className)}>
        <input
          ref={ref}
          type={isPassword ? typeState : type}
          className={cn(
            inputVariants({ hasError, enableStepper }),
            {
              "pr-10": isPassword || isSearch,
              "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden": isSearch,
            },
            inputClassName
          )}
          {...props}
        />
        
        {isSearch && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <RiSearchLine className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <RiEyeOffFill className="h-4 w-4" />
            ) : (
              <RiEyeFill className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
