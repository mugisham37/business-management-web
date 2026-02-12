"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiCheckboxCircleFill, RiErrorWarningFill } from "@remixicon/react"
import { Link, SlidersHorizontal } from "lucide-react"

// Mock data - replace with actual data source
const sections = [
  {
    id: "section-1",
    title: "Compliance Audit",
    certified: "ISO 9001",
    status: "complete",
    progress: { current: 5, total: 5 },
    auditDates: [
      { date: "2024-01-15", auditor: "John Smith" },
      { date: "2024-02-20", auditor: "Jane Doe" },
    ],
    documents: [
      { name: "Compliance Report.pdf" },
      { name: "Audit Checklist.xlsx" },
    ],
  },
]

const getStatusIcon = (status: string) => {
  if (status === "complete") {
    return (
      <RiCheckboxCircleFill className="size-[18px] shrink-0 text-chart-5" />
    )
  }
  return (
    <RiErrorWarningFill className="size-[18px] shrink-0 text-destructive" />
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
            className="-ml-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          Filters
        </Button>
      </div>
      <div className="border-t border-border px-6 pb-6">
        <Accordion type="multiple" className="mt-3">
          {sections.map((section: typeof sections[0]) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="py-5">
                <p className="flex w-full items-center justify-between pr-4">
                  <span className="flex items-center gap-2.5">
                    <span>{section.title}</span>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
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
                    <p className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span>Audit round</span>
                      <span>Auditor</span>
                    </p>
                    <ul className="mt-1 divide-y divide-border text-sm text-muted-foreground">
                      {section.auditDates.map((audit: typeof section.auditDates[0], index: number) => (
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
                    <p className="flex items-center justify-between text-sm font-medium text-foreground">
                      <span>Related documents</span>
                      <span>Status</span>
                    </p>
                    <ul className="mt-1 divide-y divide-border text-muted-foreground">
                      {section.documents.map((doc: typeof section.documents[0], index: number) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-2.5 text-sm"
                        >
                          <a
                            href="#"
                            className="flex items-center gap-2 text-chart-1 hover:underline hover:underline-offset-4"
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
                              className="hover:text-foreground hover:underline hover:underline-offset-4"
                            >
                              Edit
                            </button>
                            <span
                              className="h-4 w-px bg-border"
                              aria-hidden="true"
                            />
                            <button
                              type="button"
                              className="hover:text-foreground hover:underline hover:underline-offset-4"
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
