import type { SVGProps } from "react"
import { forwardRef } from "react"
import { cx } from "@/lib/utils"

export interface ArrowProps extends SVGProps<SVGSVGElement> {
  direction?: "up" | "down" | "left" | "right"
  variant?: "solid" | "outline" | "animated"
  size?: "sm" | "md" | "lg" | "xl"
}

const Arrow = forwardRef<SVGSVGElement, ArrowProps>(
  ({ 
    direction = "down", 
    variant = "solid", 
    size = "md", 
    className, 
    width, 
    height, 
    ...props 
  }, ref) => {
    const sizeMap = {
      sm: { width: 16, height: 8, viewBox: "0 0 16 8" },
      md: { width: 30, height: 10, viewBox: "0 0 30 10" },
      lg: { width: 40, height: 16, viewBox: "0 0 40 16" },
      xl: { width: 60, height: 20, viewBox: "0 0 60 20" }
    }

    const directionMap = {
      down: { points: "0,0 30,0 15,10", transform: "" },
      up: { points: "0,10 30,10 15,0", transform: "" },
      left: { points: "10,0 10,30 0,15", transform: "" },
      right: { points: "0,0 0,30 10,15", transform: "" }
    }

    const { width: defaultWidth, height: defaultHeight, viewBox } = sizeMap[size]
    const { points, transform } = directionMap[direction]

    const baseClasses = "transition-all duration-200"
    const variantClasses = {
      solid: "",
      outline: "fill-none stroke-current stroke-2",
      animated: "group-hover:scale-110 group-hover:translate-x-0.5"
    }

    return (
      <svg
        ref={ref}
        width={width || defaultWidth}
        height={height || defaultHeight}
        viewBox={viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cx(baseClasses, variantClasses[variant], className)}
        transform={transform}
        {...props}
      >
        {variant === "animated" ? (
          <g>
            <polygon 
              points={points} 
              className="transition-transform duration-200 group-hover:scale-110"
            />
            {variant === "animated" && direction === "right" && (
              <path
                d="M0 15h7"
                className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 stroke-current stroke-1"
                fill="none"
              />
            )}
          </g>
        ) : (
          <polygon points={points} />
        )}
      </svg>
    )
  }
)

Arrow.displayName = "Arrow"

export default Arrow
export { Arrow }
