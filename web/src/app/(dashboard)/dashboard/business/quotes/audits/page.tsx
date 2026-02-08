"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { sections } from "@/data/data"
import { RiCheckboxCircleFill, RiErrorWarningFill } from "@remixicon/react"
import { Link, SlidersHorizontal } from "lucide-react"

const getStatusIcon = (status: string) => {
  if (status === "complete") {
    return (
      <RiCheckboxCircleFill 
        className="shrink-0"
        style={{
          width: 'var(--nav-item-icon-size)',
          height: 'var(--nav-item-icon-size)',
          color: 'var(--status-good)'
        }}
      />
    )
  }
  return (
    <RiErrorWarningFill 
      className="shrink-0"
      style={{
        width: 'var(--nav-item-icon-size)',
        height: 'var(--nav-item-icon-size)',
        color: 'var(--status-critical)'
      }}
    />
  )
}

export default function Audits() {
  return (
    <section aria-label="Audits overview">
      <div 
        className="flex flex-col items-center justify-between sm:flex-row"
        style={{
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-business-card-padding)'
        }}
      >
        <Input
          type="search"
          placeholder="Search audits..."
          className="sm:w-64 [&>input]:py-1.5"
        />
        <Button
          variant="secondary"
          className="w-full text-base sm:w-fit sm:text-sm"
          style={{
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-xs) var(--spacing-md)'
          }}
        >
          <SlidersHorizontal
            className="-ml-0.5 shrink-0 text-muted-foreground"
            style={{
              width: 'var(--icon-size-settings-sm)',
              height: 'var(--icon-size-settings-sm)'
            }}
            aria-hidden="true"
          />
          Filters
        </Button>
      </div>
      <div 
        style={{
          borderTop: '1px solid var(--business-accordion-border)',
          padding: '0 var(--spacing-business-card-padding) var(--spacing-business-card-padding)'
        }}
      >
        <Accordion type="multiple" style={{ marginTop: 'var(--spacing-md)' }}>
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger style={{ padding: 'var(--spacing-md) 0' }}>
                <p className="flex w-full items-center justify-between" style={{ paddingRight: 'var(--spacing-md)' }}>
                  <span className="flex items-center" style={{ gap: 'var(--nav-item-gap)' }}>
                    <span style={{ fontSize: 'var(--text-business-table-header)', fontWeight: 'var(--font-medium)' }}>{section.title}</span>
                    <span 
                      className="inline-flex items-center"
                      style={{
                        borderRadius: 'var(--radius-business-badge)',
                        backgroundColor: 'var(--muted)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        fontSize: 'var(--text-business-badge)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {section.certified}
                    </span>
                  </span>
                  <span className="flex items-center tabular-nums" style={{ gap: 'var(--spacing-sm)', fontSize: 'var(--text-business-table-cell)' }}>
                    {getStatusIcon(section.status)}
                    {section.progress.current}/{section.progress.total}
                  </span>
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <div 
                  className="grid grid-cols-1 md:grid-cols-2"
                  style={{
                    marginTop: 'var(--spacing-sm)',
                    gap: 'var(--spacing-business-section-gap)'
                  }}
                >
                  <div>
                    <p 
                      className="flex items-center justify-between"
                      style={{
                        fontSize: 'var(--text-business-table-header)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <span>Audit round</span>
                      <span>Auditor</span>
                    </p>
                    <ul 
                      className="divide-y divide-border"
                      style={{
                        marginTop: 'var(--spacing-xs)',
                        fontSize: 'var(--text-business-table-cell)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {section.auditDates.map((audit, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                          style={{ padding: 'var(--spacing-business-table-cell-y) 0' }}
                        >
                          <span>{audit.date}</span>
                          <span>{audit.auditor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p 
                      className="flex items-center justify-between"
                      style={{
                        fontSize: 'var(--text-business-table-header)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <span>Related documents</span>
                      <span>Status</span>
                    </p>
                    <ul 
                      className="divide-y divide-border"
                      style={{
                        marginTop: 'var(--spacing-xs)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {section.documents.map((doc, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                          style={{
                            padding: 'var(--spacing-business-table-cell-y) 0',
                            fontSize: 'var(--text-business-table-cell)'
                          }}
                        >
                          <a
                            href="#"
                            className="flex items-center hover:underline hover:underline-offset-4"
                            style={{
                              gap: 'var(--spacing-sm)',
                              color: 'var(--primary)'
                            }}
                          >
                            <Link
                              className="shrink-0"
                              style={{
                                width: 'var(--icon-size-settings-sm)',
                                height: 'var(--icon-size-settings-sm)'
                              }}
                              aria-hidden="true"
                            />
                            {doc.name}
                          </a>
                          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
                            <button
                              type="button"
                              className="hover:text-foreground hover:underline hover:underline-offset-4 transition-colors-standard"
                            >
                              Edit
                            </button>
                            <span
                              className="bg-border"
                              style={{
                                height: 'var(--spacing-md)',
                                width: '1px'
                              }}
                              aria-hidden="true"
                            />
                            <button
                              type="button"
                              className="hover:text-foreground hover:underline hover:underline-offset-4 transition-colors-standard"
                            >
                              Re-Upload
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
