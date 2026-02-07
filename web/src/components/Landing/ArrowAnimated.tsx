import { cx } from "@/lib/utils"

export function ArrowAnimated({
  className,
  ...props
}: React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      className={cx("arrow-animated", className)}
      fill="none"
      stroke="currentColor"
      width="11"
      height="11"
      viewBox="0 0 10 10"
      aria-hidden="true"
      {...props}
    >
      <path
        className="arrow-animated-path-1"
        d="M0 5h7"
      />
      <path
        className="arrow-animated-path-2"
        d="M1 1l4 4-4 4"
      />
    </svg>
  )
}
