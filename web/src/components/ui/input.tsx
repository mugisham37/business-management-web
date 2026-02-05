import * as React from "react"
import { RiEyeFill, RiEyeOffFill, RiSearchLine } from "@remixicon/react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, focusRing, hasErrorInput } from "@/lib/utils"

const inputVariants = tv({
  base: [
    "flex w-full appearance-none rounded-md border shadow-sm outline-none transition",
    "text-base md:text-sm sm:text-sm",
    "px-3 py-2 h-9",
    "border-input bg-background text-foreground",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "file:-my-2 file:-ml-2.5 file:cursor-pointer file:rounded-l-[5px] file:rounded-r-none",
    "file:px-3 file:py-2 file:outline-none focus:outline-none",
    "file:disabled:pointer-events-none file:disabled:cursor-not-allowed",
    "file:border-solid file:border-input file:bg-muted file:text-muted-foreground",
    "file:hover:bg-muted/80 file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem]",
    "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
  ],
  variants: {
    hasError: {
      true: "border-destructive focus-visible:ring-destructive",
    },
    enableStepper: {
      false: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
    variant: {
      default: "",
      tremor: [
        "border-gray-300 dark:border-gray-800",
        "text-gray-900 dark:text-gray-50",
        "placeholder-gray-400 dark:placeholder-gray-500",
        "bg-white dark:bg-gray-950",
        "disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
        "disabled:dark:border-gray-700 disabled:dark:bg-gray-800 disabled:dark:text-gray-500",
        "file:border-gray-300 file:bg-gray-50 file:text-gray-500 file:hover:bg-gray-100",
        "file:dark:border-gray-800 file:dark:bg-gray-950 file:hover:dark:bg-gray-900/20",
        "file:disabled:dark:border-gray-700 file:disabled:bg-gray-100 file:disabled:text-gray-500",
        "file:disabled:dark:bg-gray-800",
        ...focusInput,
      ],
    },
  },
  compoundVariants: [
    {
      variant: "tremor",
      hasError: true,
      class: [...hasErrorInput],
    },
  ],
  defaultVariants: {
    variant: "default",
    enableStepper: true,
  },
})

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  inputClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    inputClassName, 
    hasError, 
    enableStepper = true, 
    variant = "default",
    type, 
    ...props 
  }, ref) => {
    const [typeState, setTypeState] = React.useState(type)
    const [showPassword, setShowPassword] = React.useState(false)

    const isPassword = type === "password"
    const isSearch = type === "search"
    const isTremor = variant === "tremor"

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
      setTypeState(showPassword ? "password" : "text")
    }

    const utilityFn = cx

    return (
      <div 
        className={utilityFn("relative w-full", className)} 
        {...(isTremor && { "tremor-id": "tremor-raw" })}
      >
        <input
          ref={ref}
          type={isPassword ? typeState : type}
          className={utilityFn(
            inputVariants({ hasError, enableStepper, variant }),
            {
              "pl-8": isSearch && isTremor,
              "pl-10": isSearch && !isTremor,
              "pr-10": isPassword,
            },
            inputClassName
          )}
          {...props}
        />
        
        {isSearch && (
          <div className={utilityFn(
            "absolute flex items-center pointer-events-none",
            isTremor 
              ? "bottom-0 left-2 h-full justify-center text-gray-400 dark:text-gray-600"
              : "inset-y-0 left-0 pl-3 text-muted-foreground"
          )}>
            <RiSearchLine 
              className={isTremor ? "size-[1.125rem] shrink-0" : "h-4 w-4"} 
              aria-hidden="true"
            />
          </div>
        )}
        
        {isPassword && (
          <div className={utilityFn(
            "absolute flex items-center",
            isTremor 
              ? "bottom-0 right-0 h-full justify-center px-3"
              : "inset-y-0 right-0 pr-3"
          )}>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label="Toggle password visibility"
              className={utilityFn(
                "outline-none transition-all",
                isTremor 
                  ? [
                      "h-fit w-fit rounded-sm",
                      "text-gray-400 dark:text-gray-600",
                      "hover:text-gray-500 hover:dark:text-gray-500",
                      ...focusRing,
                    ]
                  : "text-muted-foreground hover:text-foreground focus:outline-none"
              )}
              tabIndex={-1}
            >
              <span className="sr-only">
                {typeState === "password" ? "Show password" : "Hide password"}
              </span>
              {showPassword ? (
                <RiEyeOffFill 
                  className={isTremor ? "size-5 shrink-0" : "h-4 w-4"} 
                  aria-hidden="true"
                />
              ) : (
                <RiEyeFill 
                  className={isTremor ? "size-5 shrink-0" : "h-4 w-4"} 
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }