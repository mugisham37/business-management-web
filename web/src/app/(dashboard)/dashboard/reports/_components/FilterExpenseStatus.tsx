import { Label } from "@/components/ui/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { expense_statuses } from "@/data/schema"
import { cx } from "@/lib/utils"
import { useQueryState } from "nuqs"

type ExpenseStatus = (typeof expense_statuses)[number]

const statusColorMap: {
  [key in ExpenseStatus["value"]]?: string
} = {
  pending: "reports-status-dot-pending",
  approved: "reports-status-dot-approved",
  actionRequired: "reports-status-dot-action-required",
  inAudit: "reports-status-dot-in-audit",
}

function FilterExpenseStatus() {
  const DEFAULT_STATUS = "all"
  const [status, setStatus] = useQueryState<string>("expense_status", {
    defaultValue: DEFAULT_STATUS,
    parse: (value) =>
      [DEFAULT_STATUS, ...expense_statuses.map((s) => s.value)].includes(value)
        ? value
        : DEFAULT_STATUS,
  })

  const handleValueChange = (value: string) => {
    setStatus(value)
  }

  return (
    <div>
      <Label htmlFor="expense-filter" className="reports-filter-label">
        Expense Status
      </Label>
      <Select value={status} onValueChange={handleValueChange}>
        <SelectTrigger id="expense-filter" className="mt-[var(--spacing-reports-filter-label-margin)] w-full md:w-44">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem key="all" value="all">
            All
          </SelectItem>
          {expense_statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-x-[var(--spacing-reports-filter-gap)]">
                <span
                  className={cx(
                    "reports-status-dot",
                    statusColorMap[status.value] || "reports-status-dot-pending",
                  )}
                  aria-hidden="true"
                />
                {status.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { FilterExpenseStatus }
