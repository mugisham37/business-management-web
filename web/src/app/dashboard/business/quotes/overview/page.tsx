"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cx } from "@/lib/utils"
import { Download } from "lucide-react"
import { Fragment } from "react"

// Mock data - replace with actual data source
const quotes = [
  {
    region: "North America",
    project: [
      {
        company: "Acme Corp",
        size: "$250,000",
        probability: "75%",
        duration: "6 months",
        assigned: [{ initials: "JD" }, { initials: "SM" }],
        status: "Sent",
      },
    ],
  },
]

const colorClasses = [
  "bg-blue-500 dark:bg-blue-500",
  "bg-purple-500 dark:bg-purple-500",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-cyan-500 dark:bg-cyan-500",
  "bg-rose-500 dark:bg-rose-500",
  "bg-indigo-500 dark:bg-indigo-500",
]

const getRandomColor = (initials: string) => {
  const seed = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colorClasses[seed % colorClasses.length]
}
export default function Overview() {
  return (
    <section aria-label="Overview Table">
      <div className="flex flex-col justify-between gap-2 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
        <Input
          type="search"
          placeholder="Search quotes..."
          className="sm:w-64 [&>input]:py-1.5"
        />
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Select>
            <SelectTrigger className="w-full py-1.5 sm:w-44">
              <SelectValue placeholder="Assigned to..." />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="1">Harry Granger</SelectItem>
              <SelectItem value="2">Hermoine Weasley</SelectItem>
              <SelectItem value="3">Emma Stone</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
          >
            <Download
              className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
              aria-hidden="true"
            />
            Export
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Deal Size</TableHead>
              <TableHead>Win Probability</TableHead>
              <TableHead>Project Duration</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote: typeof quotes[0]) => (
              <Fragment key={quote.region}>
                <TableRow>
                  <TableHead
                    scope="colgroup"
                    colSpan={6}
                    className="bg-gray-50 py-3 pl-4 sm:pl-6 dark:bg-gray-900"
                  >
                    {quote.region}
                    <span className="ml-2 font-medium text-gray-600 dark:text-gray-400">
                      {quote.project.length}
                    </span>
                  </TableHead>
                </TableRow>
                {quote.project.map((item: typeof quote.project[0], index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.company}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.probability}</TableCell>
                    <TableCell>{item.duration}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-1 overflow-hidden">
                        {item.assigned.map((name: typeof item.assigned[0], nameIndex: number) => (
                          <span
                            key={nameIndex}
                            className={cx(
                              getRandomColor(name.initials),
                              "inline-flex size-5 items-center justify-center rounded-full text-xs font-medium text-white ring-2 ring-white dark:text-white dark:ring-[#090E1A]",
                            )}
                          >
                            {name.initials}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Closed"
                            ? "success"
                            : item.status === "Drafted"
                              ? "secondary"
                              : item.status === "Sent"
                                ? "info"
                                : "secondary"
                        }
                        className="rounded-full"
                      >
                        <span
                          className={cx(
                            "size-1.5 shrink-0 rounded-full",
                            "bg-gray-500 dark:bg-gray-500",
                            {
                              "bg-emerald-600 dark:bg-emerald-400":
                                item.status === "Closed",
                            },
                            {
                              "bg-gray-500 dark:bg-gray-500":
                                item.status === "Drafted",
                            },
                            {
                              "bg-blue-500 dark:bg-blue-500":
                                item.status === "Sent",
                            },
                          )}
                          aria-hidden="true"
                        />
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
