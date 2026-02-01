"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/lib/use-scroll"
import { cx } from "@/lib/utils/cn"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import Link from "next/link"
import React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import { Button } from "@/components/landing/Button"

export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Check if we're on the auth page and determine the current mode
  const isAuthPage = pathname === '/auth'
  const currentMode = searchParams?.get('mode') || 'login' // default to login if no mode specified
  
  // Determine button text and links based on current auth mode
  const getAuthButtons = () => {
    if (!isAuthPage) {
      // Default buttons for non-auth pages
      return {
        signIn: { text: "Sign In", href: "/auth" },
        getStarted: { text: "Get Started", href: "/auth" }
      }
    }
    
    // On auth page, show opposite mode
    if (currentMode === 'register') {
      return {
        signIn: { text: "Sign In", href: "/auth?mode=login" },
        getStarted: { text: "Sign In", href: "/auth?mode=login" }
      }
    } else {
      // Default to login mode, show register option
      return {
        signIn: { text: "Sign Up", href: "/auth?mode=register" },
        getStarted: { text: "Get Started", href: "/auth?mode=register" }
      }
    }
  }

  const authButtons = getAuthButtons()

  React.useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia("(min-width: 768px)")
    const handleMediaQueryChange = () => {
      setOpen(false)
    }

    mediaQuery.addEventListener("change", handleMediaQueryChange)
    handleMediaQueryChange()

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange)
    }
  }, [])

  return (
    <header
      className={cx(
        "fixed inset-x-3 top-4 z-50 mx-auto flex max-w-6xl transform-gpu animate-slide-down-fade justify-center overflow-hidden rounded-xl border border-transparent px-3 py-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
        open === true ? "h-52" : "h-16",
        scrolled || open === true
          ? "backdrop-blur-nav max-w-3xl border-gray-100 bg-white/80 shadow-xl shadow-black/5 dark:border-white/15 dark:bg-black/70"
          : "bg-white/0 dark:bg-gray-950/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <span className="sr-only">Company logo</span>
            <DatabaseLogo className="w-28 md:w-32" />
          </Link>
          <nav className="hidden md:absolute md:left-1/2 md:top-1/2 md:block md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-10 font-medium">
              <Link
                className="px-2 py-1 text-gray-900 dark:text-gray-50"
                href={siteConfig.baseLinks.about}
              >
                About
              </Link>
              <Link
                className="px-2 py-1 text-gray-900 dark:text-gray-50"
                href={siteConfig.baseLinks.pricing}
              >
                Pricing
              </Link>
            </div>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="secondary" asChild className="h-10 font-semibold">
              <Link href={authButtons.signIn.href}>{authButtons.signIn.text}</Link>
            </Button>
            <Button asChild className="h-10 font-semibold">
              <Link href={authButtons.getStarted.href}>{authButtons.getStarted.text}</Link>
            </Button>
          </div>
          <div className="flex gap-x-2 md:hidden">
            <Button asChild><Link href={authButtons.signIn.href}>{authButtons.signIn.text}</Link></Button>
            <Button
              onClick={() => setOpen(!open)}
              variant="light"
              className="aspect-square p-2"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="size-5" />
              ) : (
                <RiMenuLine aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
        </div>
        <nav
          className={cx(
            "my-6 flex text-lg ease-in-out will-change-transform md:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-medium">
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.about}>About</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.pricing}>Pricing</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.changelog}>Changelog</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
