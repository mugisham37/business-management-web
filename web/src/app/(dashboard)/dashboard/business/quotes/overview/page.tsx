"use client"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/Table"
import { quotes } from "@/data/data"
import { Download } from "lucide-react"
import { Fragment } from "react"

// Use theme chart colors for avatars - fully theme-aware
const getAvatarColor = (initials: string) => {
  const seed = initials
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    'var(--chart-1)', // cyan
    'var(--chart-2)', // yellow
    'var(--chart-3)', // orange
    'var(--chart-4)', // red
    'var(--chart-5)', // cream
  ]
  return colors[seed % colors.length]
}

export default function Overview() {
  return (
    <section aria-label="Overview Table">
      <div 
        className="flex flex-col justify-between sm:flex-row sm:items-center"
        style={{
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-business-card-padding)'
        }}
      >
        <Input
          type="search"
          placeholder="Search quotes..."
          className="sm:w-64 [&>input]:py-1.5"
        />
        <div className="flex flex-col items-center sm:flex-row" style={{ gap: 'var(--spacing-sm)' }}>
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
            className="w-full text-base sm:w-fit sm:text-sm"
            style={{
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-xs) var(--spacing-md)'
            }}
          >
            <Download
              className="-ml-0.5 shrink-0 text-muted-foreground"
              style={{
                width: 'var(--icon-size-settings-sm)',
                height: 'var(--icon-size-settings-sm)'
              }}
              aria-hidden="true"
            />
            Export
          </Button>
        </div>
      </div>
      <TableRoot style={{ borderTop: '1px solid var(--business-table-border)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Deal Size</TableHeaderCell>
              <TableHeaderCell>Win Probability</TableHeaderCell>
              <TableHeaderCell>Project Duration</TableHeaderCell>
              <TableHeaderCell>Assigned</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotes.map((quote) => (
              <Fragment key={quote.region}>
                <TableRow>
                  <TableHeaderCell
                    scope="colgroup"
                    colSpan={6}
                    className="business-table-header-cell"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-business-card-padding)'
                    }}
                  >
                    {quote.region}
                    <span 
                      style={{ 
                        marginLeft: 'var(--spacing-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {quote.project.length}
                    </span>
                  </TableHeaderCell>
                </TableRow>
                {quote.project.map((item, index) => (
                  <TableRow key={index} className="business-table-row-hover">
                    <TableCell style={{ fontSize: 'var(--text-business-table-cell)' }}>{item.company}</TableCell>
                    <TableCell style={{ fontSize: 'var(--text-business-table-cell)' }}>{item.size}</TableCell>
                    <TableCell style={{ fontSize: 'var(--text-business-table-cell)' }}>{item.probability}</TableCell>
                    <TableCell style={{ fontSize: 'var(--text-business-table-cell)' }}>{item.duration}</TableCell>
                    <TableCell>
                      <div className="business-avatar-group">
                        {item.assigned.map((name, nameIndex) => (
                          <span
                            key={nameIndex}
                            className="business-avatar-group-item"
                            style={{
                              backgroundColor: getAvatarColor(name.initials)
                            }}
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
                              ? "neutral"
                              : item.status === "Sent"
                                ? "default"
                                : "default"
                        }
                        style={{ borderRadius: 'var(--radius-business-badge)' }}
                      >
                        <span
                          className="shrink-0"
                          style={{
                            width: 'var(--spacing-xs)',
                            height: 'var(--spacing-xs)',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 
                              item.status === "Closed" 
                                ? 'var(--business-badge-closed)' 
                                : item.status === "Drafted"
                                  ? 'var(--business-badge-drafted)'
                                  : item.status === "Sent"
                                    ? 'var(--business-badge-sent)'
                                    : 'var(--muted-foreground)'
                          }}
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
      </TableRoot>
    </section>
  )
}
