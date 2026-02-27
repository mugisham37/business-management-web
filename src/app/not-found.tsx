import Link from "next/link"
import { siteConfig } from "./siteConfig"
import { Button } from "@/components/ui/button"
import { DatabaseLogo } from "../../public/DatabaseLogo"
import { ArrowAnimated } from "@/components/landing/ArrowAnimated"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Link href={siteConfig.baseLinks.home}>
        <DatabaseLogo className="mt-6 h-10" />
      </Link>
      <p className="mt-6 text-4xl font-semibold text-primary sm:text-5xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Button asChild className="group" variant="ghost">
        <Link href={siteConfig.baseLinks.home}>
          Go to the home page
          <ArrowAnimated
            className="stroke-foreground"
            aria-hidden="true"
          />
        </Link>
      </Button>
    </div>
  )
}
