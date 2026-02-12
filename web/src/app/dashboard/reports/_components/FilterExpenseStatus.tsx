import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { expense_statuses } from "@/data/schema"
import { cx } from "@/lib/utils"
import { useQueryState } from "nuqs"

type ExpenseStatus = (typeof expense_statuses)[number]

const variantColorMap: {
  [key: string]: string
} = {
  success: "bg-chart-5",
  neutral: "bg-muted-foreground",
  error: "bg-destructive",
  warning: "bg-accent",
}

const getStatusColor = (status: ExpenseStatus): string => {
  return variantColorMap[status.variant] || "bg-muted-foreground"
}

function FilterExpenseStatus() {
  const DEFAULT_STATUS = "all"
  const [status, setStatus] = useQueryState<string>("expense_status", {
    defaultValue: DEFAULT_STATUS,
    parse: (value: string) =>
      [DEFAULT_STATUS, ...expense_statuses.map((s) => s.value)].includes(value)
        ? value
        : DEFAULT_STATUS,
  })

  const handleValueChange = (value: string) => {
    setStatus(value)
  }

  return (
    <div>
      <Label htmlFor="expense-filter" className="font-medium">
        Expense Status
      </Label>
      <Select value={status} onValueChange={handleValueChange}>
        <SelectTrigger id="expense-filter" className="mt-2 w-full md:w-44">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem key="all" value="all">
            All
          </SelectItem>
          {expense_statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-x-2.5">
                <span
                  className={cx(
                    getStatusColor(status),
                    "inline-block size-2 shrink-0 rounded-full",
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
