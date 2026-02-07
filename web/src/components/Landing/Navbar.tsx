"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/hooks/useScroll"
import { cx } from "@/lib/utils"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import Link from "next/link"
import React from "react"
import { DatabaseLogo } from "../DatabaseLogo"
import { Button } from "../ui/Button"

export function Navigation() {
  const scrolled = useScroll(15)
  const [open, setOpen] = React.useState(false)

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
        "navbar-header",
        open === true ? "navbar-open" : "navbar-closed",
        scrolled || open === true
          ? "navbar-scrolled"
          : "navbar-not-scrolled",
      )}
    >
      <div className="navbar-inner-wrapper">
        <div className="navbar-top-bar">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <span className="sr-only">Company logo</span>
            <DatabaseLogo className="navbar-logo" />
          </Link>
          <nav className="navbar-desktop-nav">
            <div className="navbar-desktop-links">
              <Link
                className="navbar-desktop-link"
                href={siteConfig.baseLinks.about}
              >
                About
              </Link>
              <Link
                className="navbar-desktop-link"
                href={siteConfig.baseLinks.pricing}
              >
                Pricing
              </Link>
              <Link
                className="navbar-desktop-link"
                href={siteConfig.baseLinks.changelog}
              >
                Changelog
              </Link>
            </div>
          </nav>
          <Button className="navbar-desktop-button">
            Book a demo
          </Button>
          <div className="navbar-mobile-buttons">
            <Button>Book demo</Button>
            <Button
              onClick={() => setOpen(!open)}
              variant="light"
              className="navbar-mobile-toggle"
            >
              {open ? (
                <RiCloseLine aria-hidden="true" className="navbar-toggle-icon" />
              ) : (
                <RiMenuLine aria-hidden="true" className="navbar-toggle-icon" />
              )}
            </Button>
          </div>
        </div>
        <nav
          className={cx(
            "navbar-mobile-nav",
            open ? "" : "navbar-mobile-nav-hidden",
          )}
        >
          <ul className="navbar-mobile-list">
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
