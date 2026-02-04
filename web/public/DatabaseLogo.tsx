export function DatabaseLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="16"
        cy="8"
        rx="12"
        ry="4"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <ellipse
        cx="16"
        cy="8"
        rx="12"
        ry="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 8V16C4 18.2091 9.37258 20 16 20C22.6274 20 28 18.2091 28 16V8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 16V24C4 26.2091 9.37258 28 16 28C22.6274 28 28 26.2091 28 24V16"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}
