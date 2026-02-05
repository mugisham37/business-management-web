"use client"
import { cx, focusRing } from "@/lib/utils"
import * as RadioGroupPrimitives from "@radix-ui/react-radio-group"
import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"
import React, { useCallback, useEffect, useMemo, useState } from "react"

interface ThemeOption {
  value: string
  icon: React.ElementType
  label: string
  ariaLabel: string
}

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Root> {
  className?: string
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Item> {
  icon: React.ElementType
  className?: string
}

interface ThemeSwitchProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "compact"
  orientation?: "horizontal" | "vertical"
  showLabels?: boolean
  customThemes?: ThemeOption[]
  onThemeChange?: (theme: string) => void
  fallback?: React.ReactNode
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Root>,
  RadioGroupProps
>(({ className, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitives.Root
      ref={forwardedRef}
      className={cx("grid gap-2", className)}
      {...props}
    />
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Item>,
  RadioGroupItemProps
>(({ className, icon, ...props }, forwardedRef) => {
  const Icon = icon
  return (
    <RadioGroupPrimitives.Item
      ref={forwardedRef}
      className={cx(
        "group relative flex size-8 appearance-none items-center justify-center outline-none",
        "transition-all duration-200 ease-in-out",
        "hover:scale-105 active:scale-95",
        className,
      )}
      {...props}
    >
      <div
        className={cx(
          "flex size-full shrink-0 items-center justify-center rounded-lg text-gray-700 dark:text-gray-400",
          "bg-transparent",
          "group-data-[state=checked]:bg-indigo-50 group-data-[state=checked]:text-indigo-600 dark:group-data-[state=checked]:bg-indigo-500/20 dark:group-data-[state=checked]:text-indigo-300",
          "group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50",
          "group-data-[state=checked]:group-hover:bg-indigo-100 dark:group-data-[state=checked]:group-hover:bg-indigo-500/30",
          focusRing,
        )}
      >
        <Icon className="size-4 text-inherit" />
      </div>
    </RadioGroupPrimitives.Item>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

const ThemeSwitch = React.forwardRef<
  HTMLDivElement,
  ThemeSwitchProps
>(({
  className,
  size = "md",
  variant = "default",
  orientation = "horizontal",
  showLabels = false,
  customThemes,
  onThemeChange,
  fallback = null,
  ...props
}, forwardedRef) => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, themes } = useTheme()

  const defaultThemes: ThemeOption[] = useMemo(() => [
    {
      value: "system",
      icon: RiComputerLine,
      label: "System",
      ariaLabel: "Switch to System Mode"
    },
    {
      value: "light",
      icon: RiSunLine,
      label: "Light",
      ariaLabel: "Switch to Light Mode"
    },
    {
      value: "dark",
      icon: RiMoonLine,
      label: "Dark",
      ariaLabel: "Switch to Dark Mode"
    }
  ], [])

  const themeOptions = useMemo(() => {
    if (customThemes) return customThemes
    return defaultThemes.filter(option => themes?.includes(option.value) ?? true)
  }, [customThemes, defaultThemes, themes])

  const sizeClasses = useMemo(() => ({
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5"
  }), [])

  const orientationClasses = useMemo(() => ({
    horizontal: "flex",
    vertical: "flex flex-col"
  }), [])

  const handleThemeChange = useCallback((value: string) => {
    setTheme(value)
    onThemeChange?.(value)
  }, [setTheme, onThemeChange])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback
  }

  if (!theme || themeOptions.length === 0) {
    return fallback
  }

  return (
    <div ref={forwardedRef} {...props}>
      <RadioGroup
        value={theme}
        onValueChange={handleThemeChange}
        className={cx(
          orientationClasses[orientation],
          sizeClasses[size],
          variant === "compact" && "gap-0",
          className
        )}
        role="radiogroup"
        aria-label="Theme selection"
      >
        {themeOptions.map((option) => (
          <div key={option.value} className="flex flex-col items-center gap-1">
            <RadioGroupItem
              aria-label={option.ariaLabel}
              icon={option.icon}
              value={option.value}
              id={`theme-${option.value}`}
            />
            {showLabels && (
              <label
                htmlFor={`theme-${option.value}`}
                className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none"
              >
                {option.label}
              </label>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  )
})
ThemeSwitch.displayName = "ThemeSwitch"

export { RadioGroup, RadioGroupItem, ThemeSwitch }
export type { ThemeOption, RadioGroupProps, RadioGroupItemProps, ThemeSwitchProps }
export default ThemeSwitch
