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
      <RiCheckboxCircleFill className="size-[18px] shrink-0 text-[var(--status-good)]" />
    )
  }
  return (
    <RiErrorWarningFill className="size-[18px] shrink-0 text-[var(--status-critical)]" />
  )
}

export default function Audits() {
  return (
    <section aria-label="Audits overview">
      <div className="flex flex-col items-center justify-between gap-2 p-6 sm:flex-row">
        <Input
          type="search"
          placeholder="Search audits..."
          className="sm:w-64 [&>input]:py-1.5"
        />
        <Button
          variant="secondary"
          className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
        >
          <SlidersHorizontal
            className="-ml-0.5 size-4 shrink-0 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
          Filters
        </Button>
      </div>
      <div className="border-t border-[var(--business-accordion-border)] px-6 pb-6">
        <Accordion type="multiple" className="mt-3">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="py-5">
                <p className="flex w-full items-center justify-between pr-4">
                  <span className="flex items-center gap-2.5">
                    <span>{section.title}</span>
                    <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                      {section.certified}
                    </span>
                  </span>
                  <span className="flex items-center gap-x-2 tabular-nums">
                    {getStatusIcon(section.status)}
                    {section.progress.current}/{section.progress.total}
                  </span>
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <p className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
                      <span>Audit round</span>
                      <span>Auditor</span>
                    </p>
                    <ul className="mt-1 divide-y divide-[var(--border)] text-sm text-[var(--muted-foreground)]">
                      {section.auditDates.map((audit, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-2.5"
                        >
                          <span>{audit.date}</span>
                          <span>{audit.auditor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
                      <span>Related documents</span>
                      <span>Status</span>
                    </p>
                    <ul className="mt-1 divide-y divide-[var(--border)] text-[var(--muted-foreground)]">
                      {section.documents.map((doc, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-2.5 text-sm"
                        >
                          <a
                            href="#"
                            className="flex items-center gap-2 text-[var(--primary)] hover:underline hover:underline-offset-4"
                          >
                            <Link
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                            {doc.name}
                          </a>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="hover:text-[var(--foreground)] hover:underline hover:underline-offset-4 transition-colors-standard"
                            >
                              Edit
                            </button>
                            <span
                              className="h-4 w-px bg-[var(--border)]"
                              aria-hidden="true"
                            />
                            <button
                              type="button"
                              className="hover:text-[var(--foreground)] hover:underline hover:underline-offset-4 transition-colors-standard"
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
