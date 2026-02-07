import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { CategoryBar } from "@/components/ui/CategoryBar"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Alert } from "@/components/ui/Alert"
import { Tooltip, TooltipProvider } from "@/components/ui/Tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { cx } from "@/lib/utils"
import { ChevronRight, Trash2, Plus, AlertTriangle, Info } from "lucide-react"
import { useState, useCallback } from "react"

const blacklist = [
  {
    category: "Blocked transactions",
    value: "$4,653 volume",
    description: "1,234",
    color: "bg-[var(--policy-blocked-color)]",
  },
  {
    category: "Suspicious transactions",
    value: "$1,201 volume",
    description: "319",
    color: "bg-[var(--policy-suspicious-color)]",
  },
  {
    category: "Successful transactions",
    value: "$213,642 volume",
    description: "10,546",
    color: "bg-[var(--muted)]",
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
    color: "bg-[var(--policy-blocked-color)]",
    description: "Blocks transactions, preventing payment.",
  },
  {
    value: "Suspicious",
    color: "bg-[var(--policy-suspicious-color)]",
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
  const [keywordInput, setKeywordInput] = useState("")
  const [keywordList, setKeywordList] = useState(keywords)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAddKeyword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!keywordInput.trim()) {
      setError("Please enter a keyword")
      return
    }

    if (keywordList.some(k => k.label.toLowerCase() === keywordInput.toLowerCase())) {
      setError("This keyword already exists")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newKeyword = {
        label: keywordInput.trim(),
        value: keywordInput.toLowerCase().replace(/\s+/g, '-'),
        flagged: 0,
        category: value.toLowerCase(),
      }

      setKeywordList(prev => [...prev, newKeyword])
      setKeywordInput("")
      setIsKeyword(false)
      setSuccess(`Keyword "${keywordInput}" added successfully`)
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to add keyword. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [keywordInput, value, keywordList])

  const handleRemoveKeyword = useCallback(async (keywordValue: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setKeywordList(prev => prev.filter(k => k.value !== keywordValue))
      setSuccess("Keyword removed successfully")
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to remove keyword. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsKeyword(false)
    setKeywordInput("")
    setError(null)
  }, [])

  return (
    <TooltipProvider>
      <section aria-labelledby="transaction-policy-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="transaction-policy-heading"
              className="scroll-mt-10 text-[length:var(--text-settings-section-heading)] font-[var(--font-settings-section-heading)] text-[var(--foreground)]"
            >
              Transaction policy
            </h2>
            <p className="mt-2 text-[length:var(--text-settings-section-description)] leading-[var(--leading-settings-section-description)] text-[var(--muted-foreground)]">
              Block transactions by keywords or merchant category.
            </p>
            
            <Tooltip content="Keywords are case-insensitive and match partial merchant names">
              <Button variant="ghost" size="sm" className="mt-2 p-1">
                <Info className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
          
          <div className="md:col-span-2">
            {success && (
              <Alert className="mb-4" variant="default">
                <Info className="h-4 w-4" />
                <div>
                  <p className="text-sm">{success}</p>
                </div>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <h4 className="font-medium">Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </Alert>
            )}

            <Card variant="tremor">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Overview of blocked transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBar
                  values={[8, 3, 89]}
                  colors={["rose", "orange", "gray"]}
                  showLabels={false}
                  className="mt-2"
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
                        <p className="text-sm leading-none text-gray-600 dark:text-gray-400">
                          {item.category}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.value}
                        </p>
                        <a
                          href="#"
                          className="mt-2.5 flex items-center gap-0.5 text-sm font-normal text-blue-600 hover:underline hover:underline-offset-4 dark:text-blue-500"
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
              </CardContent>
            </Card>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p
                  id="keyword-heading"
                  className="text-sm font-medium text-gray-900 dark:text-gray-50"
                >
                  Keyword / Merchant category
                </p>
                <p
                  id="transaction-count-heading"
                  className="text-sm font-medium text-gray-900 dark:text-gray-50"
                >
                  # of transactions
                </p>
              </div>
              
              <ul
                role="list"
                className="mt-1 divide-y divide-gray-200 dark:divide-gray-800"
                aria-labelledby="keyword-heading transaction-count-heading"
              >
                {keywordList.map((item) => (
                  <li
                    key={item.value}
                    className="flex items-center justify-between py-2.5"
                  >
                    <Badge
                      variant={item.category === "block" ? "error" : "warning"}
                      className="gap-2"
                    >
                      <span
                        className={cx(
                          item.category === "block"
                            ? "bg-rose-500 dark:bg-rose-500"
                            : "bg-orange-500 dark:bg-orange-500",
                          "size-2 rounded-sm",
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="pr-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.flagged}
                      </span>
                      <span
                        className="h-5 w-px bg-gray-200 dark:bg-gray-800"
                        aria-hidden="true"
                      />
                      <Tooltip content="Remove keyword">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2.5 text-gray-600 hover:border hover:border-gray-300 hover:bg-gray-50 hover:text-rose-500 dark:text-gray-400 hover:dark:border-gray-800 hover:dark:bg-gray-900 hover:dark:text-rose-500"
                          onClick={() => handleRemoveKeyword(item.value)}
                          disabled={isLoading}
                          aria-label={`Remove ${item.label}`}
                        >
                          <Trash2 className="size-4 shrink-0" aria-hidden="true" />
                        </Button>
                      </Tooltip>
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
                  <form onSubmit={handleAddKeyword}>
                    <Card variant="tremor" className="mt-4">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                          <div className="flex flex-col sm:flex-row w-full items-center gap-4">
                            <div className="w-full sm:w-48">
                              <Label htmlFor="category-select" className="sr-only">
                                Select category
                              </Label>
                              <Select value={value} onValueChange={setValue}>
                                <SelectTrigger 
                                  id="category-select"
                                  variant="tremor"
                                  className="w-full"
                                >
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
                                <SelectContent variant="tremor">
                                  {keywordCategories.map((item) => (
                                    <SelectItem 
                                      key={item.value} 
                                      value={item.value}
                                      variant="tremor"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={cx(
                                            "size-3 shrink-0 rounded",
                                            item.color,
                                          )}
                                          aria-hidden="true"
                                        />
                                        <div>
                                          <p>{item.value}</p>
                                          <span className="text-xs text-gray-500 dark:text-gray-500">
                                            {item.description}
                                          </span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="w-full">
                              <Label htmlFor="keyword-input" className="sr-only">
                                Insert keyword
                              </Label>
                              <Input
                                id="keyword-input"
                                placeholder="Insert keyword"
                                value={keywordInput}
                                onChange={(e) => {
                                  setKeywordInput(e.target.value)
                                  if (error) setError(null)
                                }}
                                variant="tremor"
                                hasError={!!error}
                                aria-label="Insert keyword"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="flex w-full flex-col items-center gap-2 sm:w-fit sm:flex-row">
                            <Button
                              type="button"
                              variant="secondary"
                              className="w-full sm:w-fit"
                              onClick={handleCancel}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="w-full sm:w-fit"
                              isLoading={isLoading}
                              loadingText="Adding..."
                              variant="primary"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                </div>
              </div>
              
              <Button
                variant="secondary"
                className={cx("mt-4 w-full sm:w-fit", isKeyword && "hidden")}
                onClick={() => setIsKeyword(true)}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add keyword
              </Button>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}
