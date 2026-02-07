import { RiArrowRightUpLine } from "@remixicon/react"
import Link from "next/link"
import { DatabaseLogo } from "../DatabaseLogo"
import ThemeSwitch from "../ui/ThemeSwitch"

const navigation = {
  resources: [
    { name: "Instagram", href: "#", external: true },
    { name: "Tiktok", href: "#", external: true },
    { name: "YouTube", href: "#", external: true },
  ],
  company: [
    { name: "About", href: "/about", external: false },
    { name: "Pricing", href: "#", external: true },
    { name: "Contact", href: "#", external: false },
  ],
  legal: [
    { name: "Privacy", href: "#", external: false },
    { name: "Terms", href: "#", external: false },
  ],
}

export default function Footer() {
  return (
    <footer id="footer">
      <div className="footer-container">
        <div className="footer-top-grid">
          <div className="footer-left-column">
            <Link href="/" aria-label="Home">
              <DatabaseLogo className="footer-logo" />
            </Link>
            <p className="footer-description">
              Redefining the way databases are built and managed. Built in
              Switzerland, made for the world.
            </p>
            <div className="footer-theme-switch-wrapper">
              <ThemeSwitch />
            </div>
          </div>
          <div className="footer-nav-grid">
            <div className="footer-nav-inner-grid">
              <div>
                <h3 className="footer-section-heading">
                  Resources
                </h3>
                <ul
                  role="list"
                  className="footer-nav-list"
                  aria-label="Quick links Resources"
                >
                  {navigation.resources.map((item) => (
                    <li key={item.name} className="footer-nav-item">
                      <Link
                        className="footer-nav-link"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="footer-external-icon-wrapper-resources">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="footer-external-icon"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="footer-nav-inner-grid">
              <div>
                <h3 className="footer-section-heading">
                  Company
                </h3>
                <ul
                  role="list"
                  className="footer-nav-list"
                  aria-label="Quick links Company"
                >
                  {navigation.company.map((item) => (
                    <li key={item.name} className="footer-nav-item">
                      <Link
                        className="footer-nav-link"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="footer-external-icon-wrapper">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="footer-external-icon"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="footer-section-heading">
                  Legal
                </h3>
                <ul
                  role="list"
                  className="footer-nav-list"
                  aria-label="Quick links Legal"
                >
                  {navigation.legal.map((item) => (
                    <li key={item.name} className="footer-nav-item">
                      <Link
                        className="footer-nav-link"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="footer-external-icon-wrapper">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="footer-external-icon"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Database, Inc. All rights
            reserved.
          </p>
          <div className="footer-status-badge">
            <div className="footer-status-inner">
              <div className="footer-status-indicator">
                <div className="footer-status-bg" />
                <div className="footer-status-dot" />
              </div>
              <span className="footer-status-text">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
