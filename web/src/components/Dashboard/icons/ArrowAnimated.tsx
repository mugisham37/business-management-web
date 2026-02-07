import { cx } from "@/lib/utils"

export function ArrowAnimated({
  className,
  ...props
}: React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      className={cx("arrow-animated-base -mr-1 ml-1.5", className)}
      fill="none"
      stroke="currentColor"
      width="11"
      height="11"
      viewBox="0 0 10 10"
      aria-hidden="true"
      {...props}
    >
      <path
        className="arrow-path-hidden"
        d="M0 5h7"
      />
      <path
        className="arrow-path-translate"
        d="M1 1l4 4-4 4"
      />
    </svg>
  )
}
