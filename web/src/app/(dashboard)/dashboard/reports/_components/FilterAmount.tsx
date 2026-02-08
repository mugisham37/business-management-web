import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { Slider } from "@/components/ui/Slider"
import { transactions } from "@/data/transactions"
import { cx, focusRing, formatters } from "@/lib/utils"
import { useQueryState } from "nuqs"
import React from "react"

const presetOptions = [
  { label: "Below $1,000", min: 0, max: 1000 },
  { label: "Between $1,001 and $4,000", min: 1001, max: 4000 },
  { label: "Between $4,001 and $7,000", min: 4001, max: 7000 },
]

function FilterAmount() {
  const [minAmount, maxAmount] = React.useMemo(() => {
    const amounts = transactions.map((t) => t.amount)
    return [Math.floor(Math.min(...amounts)), Math.ceil(Math.max(...amounts))]
  }, [])

  const [range, setRange] = useQueryState("amount_range", {
    defaultValue: `${minAmount}-${maxAmount}`,
    parse: (value: string) => {
      try {
        const [min, max] = value.split("-").map(Number)
        if (isNaN(min) || isNaN(max)) {
          throw new Error("Invalid range values")
        }
        return `${Math.max(min, minAmount)}-${Math.min(max, maxAmount)}`
      } catch (error) {
        console.error("Error parsing amount range:", error)
        return `${minAmount}-${maxAmount}`
      }
    },
    serialize: (value: string) => value,
  })

  const [min, max] = React.useMemo(() => {
    try {
      return range.split("-").map(Number)
    } catch (error) {
      console.error("Error parsing range:", error)
      return [minAmount, maxAmount]
    }
  }, [range, minAmount, maxAmount])

  const [localMin, setLocalMin] = React.useState(min)
  const [localMax, setLocalMax] = React.useState(max)

  React.useEffect(() => {
    setLocalMin(min)
    setLocalMax(max)
  }, [min, max])

  const handleValueChange = (value: number[]) => {
    setLocalMin(value[0])
    setLocalMax(value[1])
  }

  const handleValueCommit = (value: number[]) => {
    setRange(`${value[0]}-${value[1]}`)
  }

  const handlePresetClick = (min: number, max: number) => {
    const adjustedMin = Math.max(min, minAmount)
    const adjustedMax = Math.min(max, maxAmount)
    setLocalMin(adjustedMin)
    setLocalMax(adjustedMax)
    setRange(`${adjustedMin}-${adjustedMax}`)
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(Number(e.target.value), minAmount)
    if (newMin >= localMax) {
      setLocalMax(newMin + 50)
    }
    setLocalMin(newMin)
    setRange(`${newMin}-${localMax}`)
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.min(Number(e.target.value), maxAmount)
    if (newMax <= localMin) {
      setLocalMin(minAmount)
    }
    setLocalMax(newMax)
    setRange(`${localMin}-${newMax}`)
  }

  const distributionData = React.useMemo(() => {
    const numBins = 30
    const binSize = (maxAmount - minAmount) / numBins
    const bins = Array(numBins).fill(0)
    transactions.forEach((t) => {
      const binIndex = Math.min(
        Math.floor((t.amount - minAmount) / binSize),
        numBins - 1,
      )
      bins[binIndex]++
    })
    const maxCount = Math.max(...bins)
    return bins.map((count, index) => ({
      height: (count / maxCount) * 100,
      isInRange:
        minAmount + index * binSize >= localMin &&
        minAmount + (index + 1) * binSize <= localMax,
    }))
  }, [minAmount, maxAmount, localMin, localMax])

  return (
    <div>
      <Label htmlFor="amount-filter" className="reports-filter-label">
        Transaction Amount
      </Label>
      <Popover>
        <PopoverTrigger asChild id="amount-filter">
          <Button
            variant="secondary"
            className={cx(
              "reports-filter-button mt-[var(--spacing-reports-filter-label-margin)] block w-full text-left font-normal tabular-nums md:w-36",
              focusRing,
            )}
          >
            {formatters.currency({ number: localMin, maxFractionDigits: 0 })} -{" "}
            {formatters.currency({ number: localMax, maxFractionDigits: 0 })}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[var(--z-reports-popover)] min-w-[calc(var(--radix-popover-trigger-width))] max-w-[calc(var(--radix-popover-trigger-width))] p-[var(--reports-popover-padding)] sm:min-w-72 sm:max-w-72"
          align="end"
        >
          <div className="flex h-[var(--reports-filter-distribution-height)] items-end space-x-[var(--reports-histogram-bar-spacing)]">
            {distributionData.map((bin, index) => (
              <div
                key={index}
                className={cx(
                  "reports-histogram-bar",
                  bin.isInRange ? "reports-histogram-bar-active" : "reports-histogram-bar-inactive"
                )}
                style={{ height: `${bin.height}%` }}
              />
            ))}
          </div>
          <div className="mt-[var(--spacing-sm)] space-y-[var(--spacing-sm)]">
            <Slider
              minStepsBetweenThumbs={10}
              min={minAmount}
              max={maxAmount}
              step={50}
              value={[localMin, localMax]}
              onValueChange={handleValueChange}
              onValueCommit={handleValueCommit}
            />
          </div>
          <div className="mt-[var(--spacing-sm)] space-y-[var(--spacing-reports-preset-section-gap)]">
            <p className="text-base sm:text-sm font-medium text-[var(--foreground)]">
              Popular ranges:
            </p>
            {presetOptions.map((option) => (
              <Button
                key={option.label}
                variant="secondary"
                className="reports-preset-button w-full justify-start font-normal"
                onClick={() => handlePresetClick(option.min, option.max)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="mt-[var(--spacing-sm)] space-y-[var(--spacing-reports-filter-section-gap)]">
            <p className="text-base sm:text-sm font-medium text-[var(--foreground)]">
              Custom range:
            </p>
            <div className="flex w-full items-center gap-[var(--spacing-xs)]">
              <Input
                name="Minimum Amount"
                type="number"
                step={50}
                placeholder={`${minAmount}`}
                value={localMin}
                onChange={handleMinInputChange}
                enableStepper={false} // has to be false because of URL change rate limits
              />
              <>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">–</span>
                <Input
                  name="Maximum Amount"
                  type="number"
                  step={50}
                  placeholder={`${maxAmount}`}
                  value={localMax}
                  onChange={handleMaxInputChange}
                  enableStepper={false} // has to be false because of URL change rate limits
                />
              </>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { FilterAmount }
