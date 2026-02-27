import * as React from "react"
import { cn, cx, focusInput, focusRing, hasErrorInput } from "@/lib/utils"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  enableStepper?: boolean
  inputClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      hasError = false,
      enableStepper = true,
      type,
      ...props
    },
    forwardedRef
  ) => {
    const [typeState, setTypeState] = React.useState(type)

    const isPassword = type === "password"
    const isSearch = type === "search"

    const inputClasses = cn(
      // base
      "relative block w-full appearance-none rounded-md border px-2.5 py-2 shadow-sm outline-none transition sm:text-sm",
      // border color - using CSS variables
      "border-border",
      // text color - using CSS variables
      "text-foreground",
      // placeholder color - using CSS variables
      "placeholder:text-muted-foreground",
      // background color - using CSS variables
      "bg-background",
      // disabled
      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      // file input styling
      "file:-my-2 file:-ml-2.5 file:cursor-pointer file:rounded-l-[5px] file:rounded-r-none file:border-0 file:px-3 file:py-2 file:outline-none",
      "file:border-solid file:border-border file:bg-muted file:text-muted-foreground file:hover:bg-muted/80",
      "file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem]",
      "file:disabled:pointer-events-none file:disabled:opacity-50",
      // remove search cancel button
      "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
      // focus styles
      focusInput,
      // error state
      hasError && hasErrorInput,
      // number input stepper
      !enableStepper &&
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      // padding adjustments for icons
      isSearch && "pl-8",
      isPassword && "pr-10",
      inputClassName
    )

    return (
      <div className={cx("relative w-full", className)}>
        <input
          ref={forwardedRef}
          type={isPassword ? typeState : type}
          className={inputClasses}
          data-slot="input"
          {...props}
        />
        {isSearch && (
          <div className="pointer-events-none absolute bottom-0 left-2 flex h-full items-center justify-center text-muted-foreground">
            <IconPlaceholder
              lucide="SearchIcon"
              tabler="IconSearch"
              hugeicons="Search01Icon"
              phosphor="MagnifyingGlassIcon"
              remixicon="RiSearchLine"
              className="size-[1.125rem] shrink-0"
              aria-hidden="true"
            />
          </div>
        )}
        {isPassword && (
          <div className="absolute bottom-0 right-0 flex h-full items-center justify-center px-3">
            <button
              aria-label="Change password visibility"
              className={cn(
                "h-fit w-fit rounded-sm outline-none transition-all text-muted-foreground hover:text-foreground",
                focusRing
              )}
              type="button"
              onClick={() => {
                setTypeState(typeState === "password" ? "text" : "password")
              }}
            >
              <span className="sr-only">
                {typeState === "password" ? "Show password" : "Hide password"}
              </span>
              {typeState === "password" ? (
                <IconPlaceholder
                  lucide="EyeIcon"
                  tabler="IconEye"
                  hugeicons="ViewIcon"
                  phosphor="EyeIcon"
                  remixicon="RiEyeFill"
                  className="size-5 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <IconPlaceholder
                  lucide="EyeOffIcon"
                  tabler="IconEyeOff"
                  hugeicons="ViewOffSlashIcon"
                  phosphor="EyeClosedIcon"
                  remixicon="RiEyeOffFill"
                  className="size-5 shrink-0"
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

export { Input, type InputProps }
