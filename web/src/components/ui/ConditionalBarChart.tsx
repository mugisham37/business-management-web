"use client"

import React from "react"
import {
  Bar,
  CartesianGrid,
  Label,
  BarChart as RechartsBarChart,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AxisDomain } from "recharts/types/util/types"

import {
  AvailableChartColors,
  AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
  getConditionalColorClassName,
  getGradientColorClassName,
  getYAxisDomain,
} from "@/lib/chartUtils"
import { useOnWindowResize } from "@/hooks/useOnWindowResize"
import { cx } from "@/lib/utils"

type BaseEventProps = {
  eventType: "category" | "bar"
  categoryClicked: string
  [key: string]: number | string
}

export type BarChartEventProps = BaseEventProps | null | undefined

type PayloadItem = {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: any
}

export type TooltipProps = {
  active: boolean | undefined
  payload: PayloadItem[]
  label: string
}

interface ChartTooltipProps extends TooltipProps {
  valueFormatter: (value: number) => string
}

interface LegendItemProps {
  name: string
  color: AvailableChartColorsKeys
  onClick?: (name: string, color: AvailableChartColorsKeys) => void
}

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
}

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  startEndOnly?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  yAxisWidth?: number
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart"
  showTooltip?: boolean
  showLegend?: boolean
  autoMinValue?: boolean
  minValue?: number
  maxValue?: number
  allowDecimals?: boolean
  onValueChange?: (value: BarChartEventProps) => void
  enableLegendSlider?: boolean
  tickGap?: number
  barCategoryGap?: string | number
  xAxisLabel?: string
  yAxisLabel?: string
  layout?: "vertical" | "horizontal"
  type?: "default" | "stacked" | "percent"
  legendPosition?: "left" | "center" | "right"
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void
  customTooltip?: React.ComponentType<TooltipProps>
}

function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) return true

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1) as Array<keyof T>
  const keys2 = Object.keys(obj2) as Array<keyof T>

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

const renderShape = (
  props: any,
  activeBar: any | undefined,
  activeLegend: string | undefined,
  layout: string,
  color: AvailableChartColorsKeys,
) => {
  const { fillOpacity, name, payload, value } = props
  let { x, width, y, height } = props

  if (layout === "horizontal" && height < 0) {
    y += height
    height = Math.abs(height)
  } else if (layout === "vertical" && width < 0) {
    x += width
    width = Math.abs(width)
  }

  const isActive = activeBar && deepEqual(activeBar, { ...payload, value })
  const isInactive = activeLegend && activeLegend !== name
  const opacity = activeBar || isInactive ? (isActive ? fillOpacity : 0.3) : fillOpacity

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      className={getConditionalColorClassName(value, color)}
      opacity={opacity}
    />
  )
}

const LegendItem = ({ name, color, onClick }: LegendItemProps) => {
  const hasOnClick = !!onClick
  
  return (
    <div
      className={cx(
        "group inline-flex flex-nowrap items-center gap-2 whitespace-nowrap rounded px-2 py-1 transition",
        hasOnClick
          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default",
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(name, color)
      }}
    >
      <span className="text-xs text-gray-700 dark:text-gray-300">Low</span>
      <span
        className={cx(
          getGradientColorClassName(color),
          "h-1.5 w-14 rounded-full bg-gradient-to-r",
        )}
      />
      <span className="text-xs text-gray-700 dark:text-gray-300">High</span>
    </div>
  )
}

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    categories,
    colors = AvailableChartColors,
    className,
    onClickLegendItem,
    activeLegend,
    ...other
  } = props
  
  return (
    <ol
      ref={ref}
      className={cx("relative overflow-hidden", className)}
      {...other}
    >
      <div tabIndex={0} className="flex h-full flex-wrap">
        {categories.map((category, index) => (
          <LegendItem
            key={`item-${index}`}
            name={category}
            color={colors[index] as AvailableChartColorsKeys}
            onClick={onClickLegendItem}
          />
        ))}
      </div>
    </ol>
  )
})

Legend.displayName = "Legend"

const ChartLegend = (
  { payload }: any,
  categoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  onClick?: (category: string, color: string) => void,
  legendPosition: "left" | "center" | "right" = "right",
  yAxisWidth = 56,
) => {
  const legendRef = React.useRef<HTMLDivElement>(null)

  useOnWindowResize(() => {
    const height = legendRef.current?.clientHeight
    setLegendHeight(height ? height + 15 : 60)
  })

  const filteredPayload = payload.filter((item: any) => item.type !== "none")
  const paddingLeft = legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0

  const justifyClass = {
    center: "justify-center",
    left: "justify-start",
    right: "justify-end",
  }[legendPosition]

  return (
    <div
      style={{ paddingLeft }}
      ref={legendRef}
      className={cx("flex items-center", justifyClass)}
    >
      <Legend
        categories={filteredPayload.map((entry: any) => entry.value)}
        colors={filteredPayload.map((entry: any) =>
          categoryColors.get(entry.value),
        )}
        onClickLegendItem={onClick}
        activeLegend={activeLegend}
      />
    </div>
  )
}

const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  return (
    <div
      className={cx(
        "rounded-md border text-sm shadow-md",
        "border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-950",
      )}
    >
      <div className="border-b border-inherit px-4 py-2">
        <p className="font-medium text-gray-900 dark:text-gray-50">
          {label}
        </p>
      </div>
      <div className="space-y-1 px-4 py-2">
        {payload.map(({ value, category, color }, index) => (
          <div
            key={`tooltip-${index}`}
            className="flex items-center justify-between space-x-8"
          >
            <div className="flex items-center space-x-2">
              <span
                aria-hidden="true"
                className={cx(
                  "size-2 shrink-0 rounded-sm",
                  getColorClassName(color, "bg"),
                )}
              />
              <p className="whitespace-nowrap text-gray-700 dark:text-gray-300">
                {category}
              </p>
            </div>
            <p className="whitespace-nowrap text-right font-medium tabular-nums text-gray-900 dark:text-gray-50">
              {valueFormatter(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const ConditionalBarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      categories = [],
      index,
      colors = AvailableChartColors,
      valueFormatter = (value: number) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      showGridLines = true,
      yAxisWidth = 56,
      intervalType = "equidistantPreserveStart",
      showTooltip = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      allowDecimals = true,
      className,
      onValueChange,
      barCategoryGap,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      layout = "horizontal",
      type = "default",
      legendPosition = "right",
      tooltipCallback,
      customTooltip,
      ...other
    } = props

    const [legendHeight, setLegendHeight] = React.useState(60)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined)
    const [activeBar, setActiveBar] = React.useState<any | undefined>(undefined)
    
    const prevActiveRef = React.useRef<boolean | undefined>(undefined)
    const prevLabelRef = React.useRef<string | undefined>(undefined)

    const categoryColors = constructCategoryColors(categories, colors)
    const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue)
    const hasOnValueChange = !!onValueChange
    const stacked = type === "stacked" || type === "percent"
    const paddingValue = (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20

    const valueToPercent = (value: number) => `${(value * 100).toFixed(0)}%`

    const handleBarClick = (data: any, _: any, event: React.MouseEvent) => {
      event.stopPropagation()
      if (!onValueChange) return

      const barData = { ...data.payload, value: data.value }
      const isCurrentlyActive = deepEqual(activeBar, barData)

      if (isCurrentlyActive) {
        setActiveLegend(undefined)
        setActiveBar(undefined)
        onValueChange(null)
      } else {
        const categoryClicked = data.tooltipPayload?.[0]?.dataKey
        setActiveLegend(categoryClicked)
        setActiveBar(barData)
        onValueChange({
          eventType: "bar",
          categoryClicked,
          ...data.payload,
        })
      }
    }

    const handleCategoryClick = (dataKey: string) => {
      if (!hasOnValueChange) return

      if (dataKey === activeLegend && !activeBar) {
        setActiveLegend(undefined)
        onValueChange(null)
      } else {
        setActiveLegend(dataKey)
        onValueChange({
          eventType: "category",
          categoryClicked: dataKey,
        })
      }
      setActiveBar(undefined)
    }

    const handleChartClick = () => {
      if (hasOnValueChange && (activeLegend || activeBar)) {
        setActiveBar(undefined)
        setActiveLegend(undefined)
        onValueChange(null)
      }
    }

    const getXAxisConfig = () => {
      if (layout !== "vertical") {
        return {
          padding: { left: paddingValue, right: paddingValue },
          dataKey: index,
          interval: startEndOnly ? "preserveStartEnd" : intervalType,
          ticks: startEndOnly ? [data[0]?.[index], data[data.length - 1]?.[index]] : undefined,
        }
      }
      return {
        type: "number" as const,
        domain: yAxisDomain as AxisDomain,
        tickFormatter: type === "percent" ? valueToPercent : valueFormatter,
        allowDecimals,
      }
    }

    const getYAxisConfig = () => {
      if (layout !== "vertical") {
        return {
          type: "number" as const,
          domain: yAxisDomain as AxisDomain,
          tickFormatter: type === "percent" ? valueToPercent : valueFormatter,
          allowDecimals,
        }
      }
      return {
        dataKey: index,
        ticks: startEndOnly ? [data[0]?.[index], data[data.length - 1]?.[index]] : undefined,
        type: "category" as const,
        interval: "equidistantPreserveStart" as const,
      }
    }

    const renderTooltipContent = ({ active, payload, label }: any) => {
      const cleanPayload: PayloadItem[] = payload
        ? payload.map((item: any) => ({
            category: item.dataKey,
            value: item.value,
            index: item.payload[index],
            color: categoryColors.get(item.dataKey) as AvailableChartColorsKeys,
            type: item.type,
            payload: item.payload,
          }))
        : []

      if (tooltipCallback && (active !== prevActiveRef.current || label !== prevLabelRef.current)) {
        tooltipCallback({ active, payload: cleanPayload, label })
        prevActiveRef.current = active
        prevLabelRef.current = label
      }

      if (!showTooltip || !active) return null

      const CustomTooltip = customTooltip
      return CustomTooltip ? (
        <CustomTooltip active={active} payload={cleanPayload} label={label} />
      ) : (
        <ChartTooltip
          active={active}
          payload={cleanPayload}
          label={label}
          valueFormatter={valueFormatter}
        />
      )
    }

    return (
      <div
        ref={forwardedRef}
        className={cx("h-80 w-full", className)}
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            onClick={handleChartClick}
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: yAxisLabel ? 20 : undefined,
              right: yAxisLabel ? 5 : undefined,
              top: 5,
            }}
            stackOffset={type === "percent" ? "expand" : undefined}
            layout={layout}
            barCategoryGap={barCategoryGap}
          >
            {showGridLines && (
              <CartesianGrid
                className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
                horizontal={layout !== "vertical"}
                vertical={layout === "vertical"}
              />
            )}
            
            <XAxis
              hide={!showXAxis}
              tick={{ transform: layout !== "vertical" ? "translate(0, 6)" : undefined }}
              fill=""
              stroke=""
              className={cx(
                "text-xs fill-gray-500 dark:fill-gray-500",
                { "mt-4": layout !== "vertical" }
              )}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              {...getXAxisConfig()}
            >
              {xAxisLabel && (
                <Label
                  position="insideBottom"
                  offset={-20}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {xAxisLabel}
                </Label>
              )}
            </XAxis>
            
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              fill=""
              stroke=""
              className="text-xs fill-gray-500 dark:fill-gray-500"
              tick={{
                transform: layout !== "vertical" ? "translate(-3, 0)" : "translate(0, 0)",
              }}
              {...getYAxisConfig()}
            >
              {yAxisLabel && (
                <Label
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                  angle={-90}
                  offset={-10}
                  className="fill-gray-500 text-xs font-normal dark:fill-gray-500"
                >
                  {yAxisLabel}
                </Label>
              )}
            </YAxis>
            
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive
              animationDuration={100}
              cursor={{ fill: "#d1d5db", opacity: "0.15" }}
              offset={20}
              position={{
                y: layout === "horizontal" ? 0 : undefined,
                x: layout === "horizontal" ? undefined : yAxisWidth + 20,
              }}
              content={renderTooltipContent}
            />
            
            {showLegend && (
              <RechartsLegend
                verticalAlign="top"
                height={legendHeight}
                content={({ payload }) =>
                  ChartLegend(
                    { payload },
                    categoryColors,
                    setLegendHeight,
                    activeLegend,
                    hasOnValueChange ? handleCategoryClick : undefined,
                    legendPosition,
                    yAxisWidth,
                  )
                }
              />
            )}
            
            {categories.map((category) => (
              <Bar
                className={cx(onValueChange && "cursor-pointer")}
                key={category}
                name={category}
                type="linear"
                dataKey={category}
                stackId={stacked ? "stack" : undefined}
                isAnimationActive={false}
                fill=""
                shape={(props: any) =>
                  renderShape(
                    props,
                    activeBar,
                    activeLegend,
                    layout,
                    categoryColors.get(category) as AvailableChartColorsKeys,
                  )
                }
                onClick={handleBarClick}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  },
)

ConditionalBarChart.displayName = "ConditionalBarChart"

export { ConditionalBarChart }
