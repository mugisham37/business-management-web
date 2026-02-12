import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CategoryBar } from "@/components/ui/category-bar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cx } from "@/lib/utils"
import { ChevronRight, Trash2 } from "lucide-react"
import { useState } from "react"

const blacklist = [
  {
    category: "Blocked transactions",
    value: "$4,653 volume",
    description: "1,234",
    color: "bg-chart-4",
  },
  {
    category: "Suspicious transactions",
    value: "$1,201 volume",
    description: "319",
    color: "bg-chart-3",
  },
  {
    category: "Successful transactions",
    value: "$213,642 volume",
    description: "10,546",
    color: "bg-muted",
  },
]

const keywords = [
  {
    label: "Coffee shop",
    value: "coffee-shop",
    flagged: 831,
    category: "block",
  },
  {
    label: "Club & bar",
    value: "club-bar",
    flagged: 213,
    category: "block",
  },
  {
    label: "Sports",
    value: "sports",
    flagged: 198,
    category: "suspicious",
  },
  {
    label: "Gambling",
    value: "gambling",
    flagged: 172,
    category: "block",
  },
  {
    label: "Liquor",
    value: "liquor",
    flagged: 121,
    category: "suspicious",
  },
]

const keywordCategories = [
  {
    value: "Block",
    color: "bg-chart-4",
    description: "Blocks transactions, preventing payment.",
  },
  {
    value: "Suspicious",
    color: "bg-chart-3",
    description: "Processes transactions but flags for audit.",
  },
]

const getStateColor = (state: string) => {
  const category = keywordCategories.find(
    (category) => category.value === state,
  )
  return category ? category.color : null
}

export default function TransactionPolicy() {
  const [isKeyword, setIsKeyword] = useState(false)
  const [value, setValue] = useState("Block")

  return (
    <section aria-labelledby="transaction-policy-heading">
      <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
        <div>
          <h2
            id="transaction-policy-heading"
            className="scroll-mt-10 font-semibold text-foreground"
          >
            Transaction policy
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Block transactions by keywords or merchant category.
          </p>
        </div>
        <div className="md:col-span-2">
          <h3
            id="overview-heading"
            className="text-sm font-medium text-foreground"
          >
            Overview of blocked transactions
          </h3>
          <CategoryBar
            values={[8, 3, 89]}
            colors={["pink", "amber", "gray"]}
            showLabels={false}
            className="mt-10"
            aria-labelledby="overview-heading"
          />
          <ul
            role="list"
            className="mt-6 flex flex-wrap gap-12"
            aria-label="Transaction categories"
          >
            {blacklist.map((item) => (
              <li key={item.category} className="flex items-start gap-2.5">
                <span
                  className={cx(item.color, "mt-[2px] size-2.5 rounded-sm")}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm leading-none text-muted-foreground">
                    {item.category}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {item.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.value}
                  </p>
                  <a
                    href="#"
                    className="mt-2.5 flex items-center gap-0.5 text-sm font-normal text-primary hover:underline hover:underline-offset-4"
                    aria-label={`Details for ${item.category}`}
                  >
                    Details
                    <ChevronRight
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center justify-between">
            <p
              id="keyword-heading"
              className="text-sm font-medium text-foreground"
            >
              Keyword / Merchant category
            </p>
            <p
              id="transaction-count-heading"
              className="text-sm font-medium text-foreground"
            >
              # of transactions
            </p>
          </div>
          <ul
            role="list"
            className="mt-1 divide-y divide-border"
            aria-labelledby="keyword-heading transaction-count-heading"
          >
            {keywords.map((item) => (
              <li
                key={item.value}
                className="flex items-center justify-between py-2.5"
              >
                <Badge
                  variant={item.category === "block" ? "destructive" : "warning"}
                  className="gap-2"
                >
                  <span
                    className={cx(
                      item.category === "block"
                        ? "bg-chart-4"
                        : "bg-chart-3",
                      "size-2 rounded-sm",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="pr-2 text-sm text-muted-foreground">
                    {item.flagged}
                  </span>
                  <span
                    className="h-5 w-px bg-border"
                    aria-hidden="true"
                  />
                  <Button
                    variant="ghost"
                    className="p-2.5 text-muted-foreground hover:border hover:border-border hover:bg-muted hover:text-destructive"
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 className="size-4 shrink-0" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div
            className={cx(
              "transform-gpu transition-all ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
            )}
            style={{
              transitionDuration: "300ms",
              animationFillMode: "backwards",
            }}
          >
            <div
              className={cx(
                "transition motion-safe:animate-slideDownAndFade",
                isKeyword ? "" : "hidden",
              )}
              style={{
                animationDelay: "100ms",
                animationDuration: "300ms",
                transitionDuration: "300ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="mt-4 flex flex-col items-center gap-2 rounded-md bg-muted/50 p-4 ring-1 ring-inset ring-border sm:flex-row">
                <div className="flex flex-col sm:flex-row w-full items-center gap-2">
                  <Select value={value} onValueChange={setValue}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue aria-label={value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cx(
                              "size-3 shrink-0 rounded",
                              getStateColor(value),
                            )}
                            aria-hidden="true"
                          />
                          <p className="truncate">{value}</p>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {keywordCategories.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cx(
                                "size-3 shrink-0 rounded",
                                item.color,
                              )}
                              aria-hidden="true"
                            />
                            <p>{item.value}</p>
                          </div>
                          <span className="ml-5 text-sm font-normal text-muted-foreground">
                            {item.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Insert keyword"
                    aria-label="Insert keyword"
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-2 sm:w-fit sm:flex-row">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-fit"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()
                      setIsKeyword(!isKeyword)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-fit">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            className={cx("mt-4 w-full sm:w-fit", isKeyword && "hidden")}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              setIsKeyword(!isKeyword)
            }}
          >
            Add keyword
          </Button>
        </div>
      </div>
    </section>
  )
}
