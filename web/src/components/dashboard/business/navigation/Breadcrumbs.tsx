import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function Breadcrumbs() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="ml-2">
        <ol role="list" className="flex items-center space-x-3 text-sm">
          <li className="flex">
            <Link
              href="#"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Home
            </Link>
          </li>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <li className="flex">
            <div className="flex items-center">
              <Link
                href="#"
                // aria-current={page.current ? 'page' : undefined}
                className="text-foreground"
              >
                Quotes
              </Link>
            </div>
          </li>
        </ol>
      </nav>
    </>
  )
}
