// Tremor ComboChart [v0.0.0]
"use client"

import React, { useMemo, useCallback } from "react"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import {
  Bar,
  CartesianGrid,
  Dot,
  Label,
  Line,
  ComposedChart as RechartsComposedChart,
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
  getYAxisDomain,
  hasOnlyOneValueForKey,
} from "@/lib/chartUtils"
import { useOnWindowResize } from "@/hooks/useOnWindowResize"
import { cx } from "@/lib/utils"

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
) => {
  const { fillOpacity, name, payload, value, width, x } = props
  let { y, height } = props

  if (height < 0) {
    y += height
    height = Math.abs(height)
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={
        activeBar || (activeLegend && activeLegend !== name)
          ? deepEqual(activeBar, { ...payload, value })
            ? fillOpacity
            : 0.3
          : fillOpacity
      }
    />
  )
}

interface LegendItemProps {
  name: string
  color: AvailableChartColorsKeys
  onClick?: (name: string, color: AvailableChartColorsKeys) => void
  activeLegend?: string
  chartType: "bar" | "line"
}

const LegendItem = ({
  name,
  color,
  onClick,
  activeLegend,
  chartType,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick
  const colorClass = getColorClassName(color, "bg")
  const isActive = activeLegend && activeLegend !== name

  return (
    <li
      className={cx(
        "group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition",
        hasOnValueChange
          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default",
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(name, color)
      }}
    >
      <span
        className={cx(
          chartType === "bar" ? "size-2 rounded-sm" : "h-[3px] w-3.5 shrink-0 rounded-full",
          "shrink-0",
          colorClass,
          isActive ? "opacity-40" : "opacity-100",
        )}
        aria-hidden="true"
      />
      <p
        className={cx(
          "truncate whitespace-nowrap text-xs text-gray-700 dark:text-gray-300",
          hasOnValueChange && "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          isActive ? "opacity-40" : "opacity-100",
        )}
      >
        {name}
      </p>
    </li>
  )
}

interface ScrollButtonProps {
  icon: React.ElementType
  onClick?: () => void
  disabled?: boolean
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
  const Icon = icon
  const [isPressed, setIsPressed] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (isPressed && !disabled) {
      intervalRef.current = setInterval(() => {
        onClick?.()
      }, 300)
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout)
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout)
  }, [isPressed, onClick, disabled])

  React.useEffect(() => {
    if (disabled) {
      clearInterval(intervalRef.current as NodeJS.Timeout)
      setIsPressed(false)
    }
  }, [disabled])

  return (
    <button
      type="button"
      className={cx(
        "group inline-flex size-5 items-center truncate rounded transition",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      )}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        setIsPressed(true)
      }}
      onMouseUp={(e) => {
        e.stopPropagation()
        setIsPressed(false)
      }}
    >
      <Icon className="size-full" aria-hidden="true" />
    </button>
  )
}

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: { name: string; chartType: "bar" | "line" }[]
  barCategoryColors: Map<string, AvailableChartColorsKeys>
  lineCategoryColors: Map<string, AvailableChartColorsKeys>
  onClickLegendItem?: (category: string, color: AvailableChartColorsKeys) => void
  activeLegend?: string
  enableLegendSlider?: boolean
}

type HasScrollProps = {
  left: boolean
  right: boolean
}

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    categories,
    barCategoryColors,
    lineCategoryColors,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    className,
    ...other
  } = props
  
  const scrollableRef = React.useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(null)
  const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const checkScroll = React.useCallback(() => {
    const scrollable = scrollableRef?.current
    if (!scrollable) return

    const hasLeftScroll = scrollable.scrollLeft > 0
    const hasRightScroll =
      scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft

    setHasScroll({ left: hasLeftScroll, right: hasRightScroll })
  }, [])

  const scrollToDirection = React.useCallback(
    (direction: "left" | "right") => {
      const element = scrollableRef?.current
      const width = element?.clientWidth ?? 0

      if (element && enableLegendSlider) {
        element.scrollTo({
          left:
            direction === "left"
              ? element.scrollLeft - width
              : element.scrollLeft + width,
          behavior: "smooth",
        })
        setTimeout(checkScroll, 400)
      }
    },
    [enableLegendSlider, checkScroll],
  )

  React.useEffect(() => {
    const keyDownHandler = (key: string) => {
      if (key === "ArrowLeft") {
        scrollToDirection("left")
      } else if (key === "ArrowRight") {
        scrollToDirection("right")
      }
    }
    
    if (isKeyDowned) {
      keyDownHandler(isKeyDowned)
      intervalRef.current = setInterval(() => {
        keyDownHandler(isKeyDowned)
      }, 300)
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout)
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout)
  }, [isKeyDowned, scrollToDirection])

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      setIsKeyDowned(e.key)
    }
  }, [])

  const handleKeyUp = React.useCallback((e: KeyboardEvent) => {
    e.stopPropagation()
    setIsKeyDowned(null)
  }, [])

  React.useEffect(() => {
    const scrollable = scrollableRef?.current
    if (enableLegendSlider) {
      checkScroll()
      scrollable?.addEventListener("keydown", handleKeyDown)
      scrollable?.addEventListener("keyup", handleKeyUp)
    }

    return () => {
      scrollable?.removeEventListener("keydown", handleKeyDown)
      scrollable?.removeEventListener("keyup", handleKeyUp)
    }
  }, [checkScroll, enableLegendSlider, handleKeyDown, handleKeyUp])

  const shouldShowScrollButtons = enableLegendSlider && (hasScroll?.right || hasScroll?.left)

  return (
    <ol
      ref={ref}
      className={cx("relative overflow-hidden", className)}
      {...other}
    >
      <div
        ref={scrollableRef}
        className={cx(
          "flex h-full",
          enableLegendSlider
            ? shouldShowScrollButtons
              ? "snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
            : "flex-wrap",
        )}
      >
        {categories.map((category, index) => {
          const color = category.chartType === "bar" 
            ? barCategoryColors.get(category.name)! 
            : lineCategoryColors.get(category.name)!
          
          return (
            <LegendItem
              key={`item-${index}`}
              name={category.name}
              chartType={category.chartType}
              onClick={onClickLegendItem}
              activeLegend={activeLegend}
              color={color}
            />
          )
        })}
      </div>
      {shouldShowScrollButtons && (
        <div className="absolute bottom-0 right-0 top-0 flex h-full items-center justify-center pr-1 bg-white dark:bg-gray-950">
          <ScrollButton
            icon={RiArrowLeftSLine}
            onClick={() => {
              setIsKeyDowned(null)
              scrollToDirection("left")
            }}
            disabled={!hasScroll?.left}
          />
          <ScrollButton
            icon={RiArrowRightSLine}
            onClick={() => {
              setIsKeyDowned(null)
              scrollToDirection("right")
            }}
            disabled={!hasScroll?.right}
          />
        </div>
      )}
    </ol>
  )
})

Legend.displayName = "Legend"

const ChartLegend = (
  { payload }: any,
  barCategoryColors: Map<string, AvailableChartColorsKeys>,
  lineCategoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  onClick?: (category: string, color: AvailableChartColorsKeys) => void,
  enableLegendSlider?: boolean,
  legendPosition?: "left" | "center" | "right",
  barYAxisWidth?: number,
  lineYAxisWidth?: number,
) => {
  const legendRef = React.useRef<HTMLDivElement>(null)

  useOnWindowResize(() => {
    const height = legendRef.current?.clientHeight
    setLegendHeight(height ? height + 15 : 60)
  })

  const filteredPayload = payload.filter((item: any) => item.type !== "none")

  const paddingLeft = legendPosition === "left" && barYAxisWidth ? barYAxisWidth - 8 : 0
  const paddingRight = (legendPosition === "right" || legendPosition === undefined) && lineYAxisWidth ? lineYAxisWidth - 8 : 52

  const justifyClass = 
    legendPosition === "center" ? "justify-center" :
    legendPosition === "left" ? "justify-start" :
    "justify-end"

  return (
    <div
      style={{ paddingLeft, paddingRight }}
      ref={legendRef}
      className={cx("flex items-center", justifyClass)}
    >
      <Legend
        categories={filteredPayload.map((entry: any) => ({
          name: entry.value,
          chartType: entry.type === "rect" ? "bar" : entry.type,
        }))}
        barCategoryColors={barCategoryColors}
        lineCategoryColors={lineCategoryColors}
        onClickLegendItem={onClick}
        activeLegend={activeLegend}
        enableLegendSlider={enableLegendSlider}
      />
    </div>
  )
}

type TooltipProps = Pick<ChartTooltipProps, "active" | "payload" | "label">

type PayloadItem = {
  category: string
  value: number
  index: string
  barColor: AvailableChartColorsKeys
  lineColor: AvailableChartColorsKeys
  chartType: "bar" | "line"
  type: string
  payload: any
}

interface ChartTooltipProps {
  active: boolean | undefined
  payload: PayloadItem[]
  label: string
  barValueFormatter?: (value: number) => string
  lineValueFormatter?: (value: number) => string
}

const ChartTooltip = ({
  active,
  payload,
  label,
  barValueFormatter = (value: number) => value.toString(),
  lineValueFormatter = (value: number) => value.toString(),
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null

  const filteredPayload = payload.filter((item: any) => item.type !== "none")

  return (
    <div className="rounded-md border text-sm shadow-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="border-b border-inherit px-4 py-2">
        <p className="font-medium text-gray-900 dark:text-gray-50">
          {label}
        </p>
      </div>
      <div className="space-y-1 px-4 py-2">
        {filteredPayload.map(
          ({ value, category, barColor, lineColor, chartType }, index) => (
            <div
              key={`id-${index}`}
              className="flex items-center justify-between space-x-8"
            >
              <div className="flex items-center space-x-2">
                <div className="flex w-5 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={cx(
                      chartType === "bar" ? "size-2 rounded-sm" : "h-[3px] w-3.5 shrink-0 rounded-full",
                      "shrink-0",
                      getColorClassName(
                        chartType === "bar" ? barColor : lineColor,
                        "bg",
                      ),
                    )}
                  />
                </div>
                <p className="whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                  {category}
                </p>
              </div>
              <p className="whitespace-nowrap text-right font-medium tabular-nums text-gray-900 dark:text-gray-50">
                {chartType === "bar"
                  ? barValueFormatter(value)
                  : lineValueFormatter(value)}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

interface ActiveDot {
  index?: number
  dataKey?: string
}

type BaseEventProps = {
  eventType: "category" | "bar" | "dot"
  categoryClicked: string
  [key: string]: number | string
}

type ComboChartEventProps = BaseEventProps | null | undefined

type ChartSeries = {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  showYAxis?: boolean
  yAxisWidth?: number
  allowDecimals?: boolean
  yAxisLabel?: string
  autoMinValue?: boolean
  minValue?: number
  maxValue?: number
}

interface ComboChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[]
  index: string
  startEndOnly?: boolean
  showXAxis?: boolean
  xAxisLabel?: string
  showGridLines?: boolean
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart"
  showLegend?: boolean
  showTooltip?: boolean
  onValueChange?: (value: ComboChartEventProps) => void
  enableLegendSlider?: boolean
  legendPosition?: "left" | "center" | "right"
  tickGap?: number
  enableBiaxial?: boolean
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void
  customTooltip?: React.ComponentType<TooltipProps>
  barSeries: ChartSeries & {
    type?: "default" | "stacked"
  }
  lineSeries?: ChartSeries & {
    connectNulls?: boolean
  }
}

const DEFAULT_SERIES: ChartSeries = {
  categories: [],
  colors: AvailableChartColors,
  valueFormatter: (value: number) => value.toString(),
  showYAxis: true,
  yAxisWidth: 56,
  yAxisLabel: undefined,
  allowDecimals: true,
  autoMinValue: false,
  minValue: undefined,
  maxValue: undefined,
}

const ComboChart = React.forwardRef<HTMLDivElement, ComboChartProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      index,
      startEndOnly = false,
      showXAxis = true,
      showGridLines = true,
      intervalType = "equidistantPreserveStart",
      showTooltip = true,
      showLegend = true,
      legendPosition = "right",
      enableLegendSlider = false,
      onValueChange,
      tickGap = 5,
      xAxisLabel,
      enableBiaxial = false,
      barSeries,
      lineSeries,
      tooltipCallback,
      customTooltip,
      className,
      ...other
    } = props

    const mergedBarSeries = { ...DEFAULT_SERIES, type: "default", ...barSeries }
    const mergedLineSeries = { ...DEFAULT_SERIES, connectNulls: false, ...lineSeries }

    const CustomTooltip = customTooltip
    const hasOnValueChange = !!onValueChange
    const stacked = barSeries.type === "stacked"

    const paddingValue = useMemo(() => {
      const noAxes = !showXAxis && !mergedBarSeries.showYAxis && enableBiaxial && !mergedLineSeries.showYAxis
      const startEndNoAxes = startEndOnly && !mergedBarSeries.showYAxis && enableBiaxial && !mergedLineSeries.showYAxis
      return noAxes || startEndNoAxes ? 0 : 20
    }, [showXAxis, mergedBarSeries.showYAxis, enableBiaxial, mergedLineSeries.showYAxis, startEndOnly])

    const [legendHeight, setLegendHeight] = React.useState(60)
    const [activeDot, setActiveDot] = React.useState<ActiveDot | undefined>(undefined)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined)
    const [activeBar, setActiveBar] = React.useState<any | undefined>(undefined)

    const prevActiveRef = React.useRef<boolean | undefined>(undefined)
    const prevLabelRef = React.useRef<string | undefined>(undefined)

    const barCategoryColors = useMemo(() => 
      constructCategoryColors(mergedBarSeries.categories, mergedBarSeries.colors ?? AvailableChartColors),
      [mergedBarSeries.categories, mergedBarSeries.colors]
    )
    
    const lineCategoryColors = useMemo(() => 
      constructCategoryColors(mergedLineSeries.categories, mergedLineSeries.colors ?? AvailableChartColors),
      [mergedLineSeries.categories, mergedLineSeries.colors]
    )

    const barYAxisDomain = useMemo(() => 
      getYAxisDomain(mergedBarSeries.autoMinValue ?? false, mergedBarSeries.minValue, mergedBarSeries.maxValue),
      [mergedBarSeries.autoMinValue, mergedBarSeries.minValue, mergedBarSeries.maxValue]
    )
    
    const lineYAxisDomain = useMemo(() => 
      getYAxisDomain(mergedLineSeries.autoMinValue ?? false, mergedLineSeries.minValue, mergedLineSeries.maxValue),
      [mergedLineSeries.autoMinValue, mergedLineSeries.minValue, mergedLineSeries.maxValue]
    )

    const resetActiveStates = useCallback(() => {
      setActiveBar(undefined)
      setActiveDot(undefined)
      setActiveLegend(undefined)
      onValueChange?.(null)
    }, [onValueChange])

    const onBarClick = useCallback((data: any, _: any, event: React.MouseEvent) => {
      event.stopPropagation()
      if (!onValueChange) return
      
      const barData = { ...data.payload, value: data.value }
      if (deepEqual(activeBar, barData)) {
        resetActiveStates()
      } else {
        setActiveLegend(data.tooltipPayload?.[0]?.dataKey)
        setActiveBar(barData)
        onValueChange({
          eventType: "bar",
          categoryClicked: data.tooltipPayload?.[0]?.dataKey,
          ...data.payload,
        })
      }
    }, [activeBar, onValueChange, resetActiveStates])

    const onDotClick = useCallback((itemData: any, event: React.MouseEvent) => {
      event.stopPropagation()
      if (!hasOnValueChange) return

      const shouldReset = 
        (itemData.index === activeDot?.index && itemData.dataKey === activeDot?.dataKey) ||
        (hasOnlyOneValueForKey(data, itemData.dataKey) && activeLegend === itemData.dataKey)

      if (shouldReset) {
        resetActiveStates()
      } else {
        setActiveBar(undefined)
        setActiveLegend(itemData.dataKey)
        setActiveDot({ index: itemData.index, dataKey: itemData.dataKey })
        onValueChange({
          eventType: "dot",
          categoryClicked: itemData.dataKey,
          ...itemData.payload,
        })
      }
    }, [activeDot, activeLegend, data, hasOnValueChange, onValueChange, resetActiveStates])

    const onCategoryClick = useCallback((dataKey: string) => {
      if (!hasOnValueChange) return

      if (dataKey === activeLegend && !activeBar && !activeDot) {
        resetActiveStates()
      } else if (activeBar && activeBar.tooltipPayload?.[0]?.dataKey === dataKey) {
        setActiveLegend(dataKey)
        onValueChange({ eventType: "category", categoryClicked: dataKey })
      } else {
        setActiveLegend(dataKey)
        setActiveBar(undefined)
        setActiveDot(undefined)
        onValueChange({ eventType: "category", categoryClicked: dataKey })
      }
    }, [activeLegend, activeBar, activeDot, hasOnValueChange, onValueChange, resetActiveStates])

    const renderTooltipContent = useCallback(({ active, payload, label }: any) => {
      const cleanPayload: TooltipProps["payload"] = payload
        ? payload.map((item: any) => ({
            category: item.dataKey,
            value: item.value,
            index: item.payload[index],
            barColor: barCategoryColors.get(item.dataKey) as AvailableChartColorsKeys,
            lineColor: lineCategoryColors.get(item.dataKey) as AvailableChartColorsKeys,
            chartType: barCategoryColors.get(item.dataKey) ? "bar" : "line" as PayloadItem["chartType"],
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

      return CustomTooltip ? (
        <CustomTooltip active={active} payload={cleanPayload} label={label} />
      ) : (
        <ChartTooltip
          active={active}
          payload={cleanPayload}
          label={label}
          barValueFormatter={mergedBarSeries.valueFormatter}
          lineValueFormatter={mergedLineSeries.valueFormatter}
        />
      )
    }, [index, barCategoryColors, lineCategoryColors, tooltipCallback, showTooltip, CustomTooltip, mergedBarSeries.valueFormatter, mergedLineSeries.valueFormatter])

    return (
      <div
        ref={forwardedRef}
        className={cx("h-80 w-full", className)}
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsComposedChart
            data={data}
            onClick={hasOnValueChange && (activeLegend || activeBar || activeDot) ? resetActiveStates : undefined}
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: mergedBarSeries.yAxisLabel ? 20 : undefined,
              right: mergedLineSeries.yAxisLabel ? 20 : undefined,
              top: 5,
            }}
            barCategoryGap="30%"
          >
            {showGridLines && (
              <CartesianGrid
                className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
                horizontal={true}
                vertical={false}
              />
            )}
            <XAxis
              hide={!showXAxis}
              tick={{ transform: "translate(0, 6)" }}
              fill=""
              stroke=""
              className="mt-4 text-xs fill-gray-500 dark:fill-gray-500"
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              padding={{ left: paddingValue, right: paddingValue }}
              dataKey={index}
              interval={startEndOnly ? "preserveStartEnd" : intervalType}
              ticks={startEndOnly ? [data[0][index], data[data.length - 1][index]] : undefined}
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
              yAxisId={enableBiaxial ? "left" : undefined}
              width={mergedBarSeries.yAxisWidth}
              hide={!mergedBarSeries.showYAxis}
              axisLine={false}
              tickLine={false}
              fill=""
              stroke=""
              className="text-xs fill-gray-500 dark:fill-gray-500"
              tick={{ transform: "translate(-3, 0)" }}
              type="number"
              domain={barYAxisDomain as AxisDomain}
              tickFormatter={mergedBarSeries.valueFormatter}
              allowDecimals={mergedBarSeries.allowDecimals}
            >
              {mergedBarSeries.yAxisLabel && (
                <Label
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                  angle={-90}
                  offset={-10}
                  className="fill-gray-500 text-xs font-normal dark:fill-gray-500"
                >
                  {mergedBarSeries.yAxisLabel}
                </Label>
              )}
            </YAxis>

            {enableBiaxial && (
              <YAxis
                yAxisId="right"
                orientation="right"
                width={mergedLineSeries.yAxisWidth}
                hide={!mergedLineSeries.showYAxis}
                axisLine={false}
                tickLine={false}
                fill=""
                stroke=""
                className="text-xs fill-gray-500 dark:fill-gray-500"
                tick={{ transform: "translate(3, 0)" }}
                type="number"
                domain={lineYAxisDomain as AxisDomain}
                tickFormatter={mergedLineSeries.valueFormatter}
                allowDecimals={mergedLineSeries.allowDecimals}
              >
                {mergedLineSeries.yAxisLabel && (
                  <Label
                    position="insideRight"
                    style={{ textAnchor: "middle" }}
                    angle={-90}
                    offset={-15}
                    className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                  >
                    {mergedLineSeries.yAxisLabel}
                  </Label>
                )}
              </YAxis>
            )}

            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={true}
              animationDuration={100}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              offset={20}
              position={{ y: 0 }}
              content={renderTooltipContent}
            />
            
            {showLegend && (
              <RechartsLegend
                verticalAlign="top"
                height={legendHeight}
                content={({ payload }) =>
                  ChartLegend(
                    { payload },
                    barCategoryColors,
                    lineCategoryColors,
                    setLegendHeight,
                    activeLegend,
                    hasOnValueChange ? onCategoryClick : undefined,
                    enableLegendSlider,
                    legendPosition,
                    mergedBarSeries.yAxisWidth,
                    mergedLineSeries.yAxisWidth,
                  )
                }
              />
            )}
            
            {mergedBarSeries.categories.map((category) => (
              <Bar
                yAxisId={enableBiaxial ? "left" : undefined}
                className={cx(
                  getColorClassName(
                    barCategoryColors.get(category) as AvailableChartColorsKeys,
                    "fill",
                  ),
                  onValueChange && "cursor-pointer",
                )}
                key={category}
                name={category}
                type="linear"
                dataKey={category}
                stackId={stacked ? "stack" : undefined}
                isAnimationActive={false}
                fill=""
                shape={(props: any) => renderShape(props, activeBar, activeLegend)}
                onClick={onBarClick}
              />
            ))}
            
            {onValueChange && mergedLineSeries.categories.map((category) => (
              <Line
                yAxisId={enableBiaxial ? "right" : undefined}
                className="cursor-pointer"
                strokeOpacity={0}
                key={`${category}-hidden`}
                name={category}
                type="linear"
                dataKey={category}
                stroke="transparent"
                fill="transparent"
                legendType="none"
                tooltipType="none"
                strokeWidth={12}
                connectNulls={mergedLineSeries.connectNulls}
                onClick={(props: any, event) => {
                  event.stopPropagation()
                  onCategoryClick(props.name)
                }}
              />
            ))}
            
            {mergedLineSeries.categories.map((category) => (
              <Line
                yAxisId={enableBiaxial ? "right" : undefined}
                className={cx(
                  getColorClassName(
                    lineCategoryColors.get(category) as AvailableChartColorsKeys,
                    "stroke",
                  ),
                  hasOnValueChange && "cursor-pointer",
                )}
                strokeOpacity={
                  activeDot || (activeLegend && activeLegend !== category) ? 0.3 : 1
                }
                activeDot={(props: any) => {
                  const { cx: cxCoord, cy: cyCoord, stroke, strokeLinecap, strokeLinejoin, strokeWidth, dataKey } = props
                  return (
                    <Dot
                      className={cx(
                        "stroke-white dark:stroke-gray-950",
                        onValueChange && "cursor-pointer",
                        getColorClassName(
                          lineCategoryColors.get(dataKey) as AvailableChartColorsKeys,
                          "fill",
                        ),
                      )}
                      cx={cxCoord}
                      cy={cyCoord}
                      r={5}
                      fill=""
                      stroke={stroke}
                      strokeLinecap={strokeLinecap}
                      strokeLinejoin={strokeLinejoin}
                      strokeWidth={strokeWidth}
                      onClick={(_, event) => onDotClick(props, event)}
                    />
                  )
                }}
                dot={(props: any) => {
                  const { stroke, strokeLinecap, strokeLinejoin, strokeWidth, cx: cxCoord, cy: cyCoord, dataKey, index: dotIndex } = props

                  const shouldShowDot = 
                    (hasOnlyOneValueForKey(data, category) && !(activeDot || (activeLegend && activeLegend !== category))) ||
                    (activeDot?.index === dotIndex && activeDot?.dataKey === category)

                  if (shouldShowDot) {
                    return (
                      <Dot
                        key={dotIndex}
                        cx={cxCoord}
                        cy={cyCoord}
                        r={5}
                        stroke={stroke}
                        fill=""
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                        strokeWidth={strokeWidth}
                        className={cx(
                          "stroke-white dark:stroke-gray-950",
                          onValueChange && "cursor-pointer",
                          getColorClassName(
                            lineCategoryColors.get(dataKey) as AvailableChartColorsKeys,
                            "fill",
                          ),
                        )}
                      />
                    )
                  }
                  return <React.Fragment key={dotIndex} />
                }}
                key={`${category}-line`}
                name={category}
                type="linear"
                dataKey={category}
                stroke=""
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                isAnimationActive={false}
                connectNulls={mergedLineSeries.connectNulls}
                onClick={(props: any, event) => {
                  event.stopPropagation()
                  onCategoryClick(props.name)
                }}
              />
            ))}
          </RechartsComposedChart>
        </ResponsiveContainer>
      </div>
    )
  },
)

ComboChart.displayName = "ComboChart"

export { ComboChart, type ComboChartEventProps, type TooltipProps }