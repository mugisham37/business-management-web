"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
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
  getYAxisDomain,
} from "@/lib/chartUtils"
import { useOnWindowResize } from "@/hooks/useOnWindowResize"
import { cx } from "@/lib/utils"

type ChartDataItem = Record<string, any>

interface ShapeProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  payload: ChartDataItem
  value: number
}

interface ActiveBarState {
  payload: ChartDataItem
  value: number
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
  props: ShapeProps,
  activeBar: ActiveBarState | undefined,
  activeLegend: string | undefined,
  strokeClass: string,
  layout: "horizontal" | "vertical",
) => {
  const { name, payload, value } = props
  let { x, width, y, height } = props
  let lineX1: number, lineY1: number, lineX2: number, lineY2: number

  if (layout === "horizontal" && height < 0) {
    y += height
    height = Math.abs(height)
  } else if (layout === "vertical" && width < 0) {
    x += width
    width = Math.abs(width)
  }

  if (layout === "horizontal") {
    lineX1 = x
    lineY1 = y
    lineX2 = x + width
    lineY2 = y
  } else {
    lineX1 = x + width
    lineY1 = y
    lineX2 = x + width
    lineY2 = y + height
  }

  const isActive = activeBar && deepEqual(activeBar, { payload, value })
  const isInactive = (activeBar || (activeLegend && activeLegend !== name)) && !isActive

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        opacity={isInactive ? 0.1 : 0.2}
      />
      <line
        x1={lineX1}
        y1={lineY1}
        x2={lineX2}
        y2={lineY2}
        stroke=""
        className={strokeClass}
        strokeWidth="2"
        opacity={isInactive ? 0.5 : 1}
      />
    </g>
  )
}

interface LegendItemProps {
  name: string
  color: AvailableChartColorsKeys
  onClick?: (name: string, color: AvailableChartColorsKeys) => void
  activeLegend?: string
}

const LegendItem = React.memo<LegendItemProps>(({
  name,
  color,
  onClick,
  activeLegend,
}) => {
  const hasOnValueChange = !!onClick
  const isActive = activeLegend === name
  const isInactive = activeLegend && !isActive

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(name, color)
  }, [onClick, name, color])

  return (
    <li
      className={cx(
        "group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition",
        hasOnValueChange
          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default",
      )}
      onClick={handleClick}
      role={hasOnValueChange ? "button" : undefined}
      tabIndex={hasOnValueChange ? 0 : undefined}
      onKeyDown={hasOnValueChange ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick(e as any)
        }
      } : undefined}
      aria-label={hasOnValueChange ? `Toggle ${name} series` : undefined}
    >
      <span
        className={cx(
          "size-2 shrink-0 rounded-sm",
          getColorClassName(color, "bg"),
          isInactive ? "opacity-40" : "opacity-100",
        )}
        aria-hidden={true}
      />
      <p
        className={cx(
          "truncate whitespace-nowrap text-xs",
          "text-gray-700 dark:text-gray-300",
          hasOnValueChange &&
          "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          isInactive ? "opacity-40" : "opacity-100",
        )}
      >
        {name}
      </p>
    </li>
  )
})

LegendItem.displayName = "LegendItem"

interface ScrollButtonProps {
  icon: React.ElementType
  onClick?: () => void
  disabled?: boolean
}

const ScrollButton = React.memo<ScrollButtonProps>(({ icon, onClick, disabled }) => {
  const Icon = icon
  const [isPressed, setIsPressed] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }, [onClick])

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPressed(true)
  }, [])

  const handleMouseUp = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPressed(false)
  }, [])

  React.useEffect(() => {
    if (isPressed && !disabled) {
      intervalRef.current = setInterval(() => {
        onClick?.()
      }, 300)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPressed, onClick, disabled])

  React.useEffect(() => {
    if (disabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
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
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      aria-label={`Scroll ${icon === RiArrowLeftSLine ? 'left' : 'right'}`}
    >
      <Icon className="size-full" aria-hidden="true" />
    </button>
  )
})

ScrollButton.displayName = "ScrollButton"

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
  enableLegendSlider?: boolean
}

interface HasScrollProps {
  left: boolean
  right: boolean
}

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
  const {
    categories,
    colors = AvailableChartColors,
    className,
    onClickLegendItem,
    activeLegend,
    enableLegendSlider = false,
    ...other
  } = props
  
  const scrollableRef = React.useRef<HTMLDivElement>(null)
  const scrollButtonsRef = React.useRef<HTMLDivElement>(null)
  const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(null)
  const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const checkScroll = React.useCallback(() => {
    const scrollable = scrollableRef.current
    if (!scrollable) return

    const hasLeftScroll = scrollable.scrollLeft > 0
    const hasRightScroll =
      scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft

    setHasScroll({ left: hasLeftScroll, right: hasRightScroll })
  }, [])

  const scrollTo = React.useCallback(
    (direction: "left" | "right") => {
      const element = scrollableRef.current
      const scrollButtons = scrollButtonsRef.current
      const scrollButtonsWidth = scrollButtons?.clientWidth ?? 0
      const width = element?.clientWidth ?? 0

      if (element && enableLegendSlider) {
        element.scrollTo({
          left:
            direction === "left"
              ? element.scrollLeft - width + scrollButtonsWidth
              : element.scrollLeft + width - scrollButtonsWidth,
          behavior: "smooth",
        })
        setTimeout(checkScroll, 400)
      }
    },
    [enableLegendSlider, checkScroll],
  )

  const handleKeyDown = React.useCallback((key: string) => {
    if (key === "ArrowLeft") {
      scrollTo("left")
    } else if (key === "ArrowRight") {
      scrollTo("right")
    }
  }, [scrollTo])

  React.useEffect(() => {
    if (isKeyDowned) {
      handleKeyDown(isKeyDowned)
      intervalRef.current = setInterval(() => {
        handleKeyDown(isKeyDowned)
      }, 300)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isKeyDowned, handleKeyDown])

  const keyDown = React.useCallback((e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      setIsKeyDowned(e.key)
    }
  }, [])

  const keyUp = React.useCallback((e: KeyboardEvent) => {
    e.stopPropagation()
    setIsKeyDowned(null)
  }, [])

  React.useEffect(() => {
    const scrollable = scrollableRef.current
    if (enableLegendSlider && scrollable) {
      checkScroll()
      scrollable.addEventListener("keydown", keyDown)
      scrollable.addEventListener("keyup", keyUp)

      return () => {
        scrollable.removeEventListener("keydown", keyDown)
        scrollable.removeEventListener("keyup", keyUp)
      }
    }
  }, [checkScroll, enableLegendSlider, keyDown, keyUp])

  const memoizedLegendItems = React.useMemo(() => 
    categories.map((category, index) => (
      <LegendItem
        key={`item-${category}-${index}`}
        name={category}
        color={colors[index] as AvailableChartColorsKeys}
        onClick={onClickLegendItem}
        activeLegend={activeLegend}
      />
    )), [categories, colors, onClickLegendItem, activeLegend])

  return (
    <ol
      ref={ref}
      className={cx("relative overflow-hidden", className)}
      {...other}
    >
      <div
        ref={scrollableRef}
        tabIndex={enableLegendSlider ? 0 : undefined}
        className={cx(
          "flex h-full",
          enableLegendSlider
            ? hasScroll?.right || hasScroll?.left
              ? "snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
            : "flex-wrap",
        )}
        role={enableLegendSlider ? "region" : undefined}
        aria-label={enableLegendSlider ? "Chart legend with scroll controls" : undefined}
      >
        {memoizedLegendItems}
      </div>
      {enableLegendSlider && (hasScroll?.right || hasScroll?.left) && (
        <div
          ref={scrollButtonsRef}
          className={cx(
            "absolute bottom-0 right-0 top-0 flex h-full items-center justify-center pr-1",
            "bg-white dark:bg-gray-950",
          )}
        >
          <ScrollButton
            icon={RiArrowLeftSLine}
            onClick={() => {
              setIsKeyDowned(null)
              scrollTo("left")
            }}
            disabled={!hasScroll?.left}
          />
          <ScrollButton
            icon={RiArrowRightSLine}
            onClick={() => {
              setIsKeyDowned(null)
              scrollTo("right")
            }}
            disabled={!hasScroll?.right}
          />
        </div>
      )}
    </ol>
  )
})

Legend.displayName = "Legend"

interface ChartLegendProps {
  payload: Array<{ value: string; type: string }>
  categoryColors: Map<string, AvailableChartColorsKeys>
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>
  activeLegend: string | undefined
  onClick?: (category: string, color: string) => void
  enableLegendSlider?: boolean
  legendPosition?: "left" | "center" | "right"
  yAxisWidth?: number
}

const ChartLegend = React.memo<ChartLegendProps>(({
  payload,
  categoryColors,
  setLegendHeight,
  activeLegend,
  onClick,
  enableLegendSlider = false,
  legendPosition = "right",
  yAxisWidth = 56,
}) => {
  const legendRef = React.useRef<HTMLDivElement>(null)

  useOnWindowResize(() => {
    const calculateHeight = (height: number | undefined) =>
      height ? Number(height) + 15 : 60
    setLegendHeight(calculateHeight(legendRef.current?.clientHeight))
  })

  const filteredPayload = React.useMemo(() => 
    payload.filter((item) => item.type !== "none"), 
    [payload]
  )

  const paddingLeft = React.useMemo(() => 
    legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0,
    [legendPosition, yAxisWidth]
  )

  const justifyClass = React.useMemo(() => {
    switch (legendPosition) {
      case "center": return "justify-center"
      case "left": return "justify-start"
      case "right": return "justify-end"
      default: return "justify-end"
    }
  }, [legendPosition])

  return (
    <div
      style={{ paddingLeft }}
      ref={legendRef}
      className={cx("flex items-center", justifyClass)}
    >
      <Legend
        categories={filteredPayload.map((entry) => entry.value)}
        colors={filteredPayload.map((entry) =>
          categoryColors.get(entry.value)
        ).filter((color): color is AvailableChartColorsKeys => color !== undefined)}
        onClickLegendItem={onClick}
        activeLegend={activeLegend}
        enableLegendSlider={enableLegendSlider}
      />
    </div>
  )
})

ChartLegend.displayName = "ChartLegend"

type TooltipProps = Pick<ChartTooltipProps, "active" | "payload" | "label">

interface PayloadItem {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: ChartDataItem
}

interface ChartTooltipProps {
  active: boolean | undefined
  payload: PayloadItem[]
  label: string
  valueFormatter: (value: number) => string
  xValueFormatter?: (value: string) => string
}

const ChartTooltip = React.memo<ChartTooltipProps>(({
  active,
  payload,
  label,
  valueFormatter,
  xValueFormatter,
}) => {
  if (!active || !payload?.length) return null

  return (
    <div
      className={cx(
        "w-44 rounded-md border text-sm shadow-md",
        "border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-950",
      )}
    >
      <div className={cx("border-b border-inherit p-2")}>
        <p
          className={cx(
            "font-medium",
            "text-gray-900 dark:text-gray-50",
          )}
        >
          {xValueFormatter ? xValueFormatter(label) : label}
        </p>
      </div>

      <div className={cx("space-y-1 p-2")}>
        {payload.map(({ value, category, color }, index) => (
          <div
            key={`tooltip-item-${category}-${index}`}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-2">
              <span
                className={cx(
                  "size-2.5 shrink-0 rounded-sm",
                  getColorClassName(color, "bg"),
                )}
                aria-hidden="true"
              />
              <p
                className={cx(
                  "whitespace-nowrap text-right",
                  "text-gray-700 dark:text-gray-300",
                )}
              >
                {category}
              </p>
            </div>
            <p
              className={cx(
                "whitespace-nowrap text-right font-medium tabular-nums",
                "text-gray-900 dark:text-gray-50",
              )}
            >
              {valueFormatter(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})

ChartTooltip.displayName = "ChartTooltip"

interface BaseEventProps {
  eventType: "category" | "bar"
  categoryClicked: string
  [key: string]: number | string
}

type BarChartEventProps = BaseEventProps | null | undefined

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDataItem[]
  index: string
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  xValueFormatter?: (value: string) => string
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
  type?: "default" | "stacked" | "percent"
  legendPosition?: "left" | "center" | "right"
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void
  customTooltip?: React.ComponentType<TooltipProps>
  syncId?: string
  layout?: "vertical" | "horizontal"
}

const BarChartVariant = React.forwardRef<HTMLDivElement, BarChartProps>(
  (props, forwardedRef) => {
    const {
      data = [],
      categories = [],
      index,
      colors = AvailableChartColors,
      valueFormatter = (value: number) => value.toString(),
      xValueFormatter = (value: string) => value.toString(),
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
      enableLegendSlider = false,
      barCategoryGap = "2%",
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      type = "default",
      legendPosition = "right",
      tooltipCallback,
      customTooltip,
      syncId,
      layout = "horizontal",
      ...other
    } = props

    const CustomTooltip = customTooltip
    const paddingValue = (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20
    const [legendHeight, setLegendHeight] = React.useState(60)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined)
    const [activeBar, setActiveBar] = React.useState<ActiveBarState | undefined>(undefined)
    
    const categoryColors = React.useMemo(() => 
      constructCategoryColors(categories, colors), 
      [categories, colors]
    )
    
    const yAxisDomain = React.useMemo(() => 
      getYAxisDomain(autoMinValue, minValue, maxValue),
      [autoMinValue, minValue, maxValue]
    )
    
    const hasOnValueChange = !!onValueChange
    const stacked = type === "stacked" || type === "percent"

    const prevActiveRef = React.useRef<boolean | undefined>(undefined)
    const prevLabelRef = React.useRef<string | undefined>(undefined)

    const valueToPercent = React.useCallback((value: number) => {
      return `${(value * 100).toFixed(0)}%`
    }, [])

    const onBarClick = React.useCallback((data: any, _: any, event: React.MouseEvent) => {
      event.stopPropagation()
      if (!onValueChange) return
      
      const newActiveBar = { payload: data.payload, value: data.value }
      
      if (activeBar && deepEqual(activeBar, newActiveBar)) {
        setActiveLegend(undefined)
        setActiveBar(undefined)
        onValueChange(null)
      } else {
        setActiveLegend(data.tooltipPayload?.[0]?.dataKey)
        setActiveBar(newActiveBar)
        onValueChange({
          eventType: "bar",
          categoryClicked: data.tooltipPayload?.[0]?.dataKey,
          ...data.payload,
        })
      }
    }, [onValueChange, activeBar])

    const onCategoryClick = React.useCallback((dataKey: string) => {
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
    }, [hasOnValueChange, activeLegend, activeBar, onValueChange])

    const handleChartClick = React.useCallback(() => {
      if (hasOnValueChange && (activeLegend || activeBar)) {
        setActiveBar(undefined)
        setActiveLegend(undefined)
        onValueChange(null)
      }
    }, [hasOnValueChange, activeLegend, activeBar, onValueChange])

    const renderTooltipContent = React.useCallback(({ active, payload, label }: any) => {
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

      if (
        tooltipCallback &&
        (active !== prevActiveRef.current || label !== prevLabelRef.current)
      ) {
        tooltipCallback({ active, payload: cleanPayload, label })
        prevActiveRef.current = active
        prevLabelRef.current = label
      }

      return showTooltip && active ? (
        CustomTooltip ? (
          <CustomTooltip
            active={active}
            payload={cleanPayload}
            label={label}
          />
        ) : (
          <ChartTooltip
            active={active}
            payload={cleanPayload}
            label={label}
            valueFormatter={valueFormatter}
            xValueFormatter={xValueFormatter}
          />
        )
      ) : null
    }, [
      index,
      categoryColors,
      tooltipCallback,
      showTooltip,
      CustomTooltip,
      valueFormatter,
      xValueFormatter,
    ])

    const renderLegendContent = React.useCallback(({ payload }: any) => (
      <ChartLegend
        payload={payload}
        categoryColors={categoryColors}
        setLegendHeight={setLegendHeight}
        activeLegend={activeLegend}
        onClick={hasOnValueChange ? onCategoryClick : undefined}
        enableLegendSlider={enableLegendSlider}
        legendPosition={legendPosition}
        yAxisWidth={yAxisWidth}
      />
    ), [
      categoryColors,
      activeLegend,
      hasOnValueChange,
      onCategoryClick,
      enableLegendSlider,
      legendPosition,
      yAxisWidth,
    ])

    const xAxisProps = React.useMemo(() => {
      const baseProps = {
        hide: !showXAxis,
        tick: {
          transform: layout !== "vertical" ? "translate(0, 6)" : undefined,
        },
        fill: "",
        stroke: "",
        className: cx(
          "text-xs",
          "mt-4 fill-gray-500 dark:fill-gray-500",
        ),
        tickLine: false,
        axisLine: false,
        minTickGap: tickGap,
        tickFormatter: xValueFormatter,
      }

      if (layout !== "vertical") {
        return {
          ...baseProps,
          padding: {
            left: paddingValue,
            right: paddingValue,
          },
          dataKey: index,
          interval: startEndOnly ? "preserveStartEnd" : intervalType,
          ticks: startEndOnly && data.length > 0
            ? [data[0][index], data[data.length - 1][index]]
            : undefined,
        }
      } else {
        return {
          ...baseProps,
          type: "number" as const,
          domain: yAxisDomain as AxisDomain,
          tickFormatter: type === "percent" ? valueToPercent : valueFormatter,
          allowDecimals,
        }
      }
    }, [
      showXAxis,
      layout,
      tickGap,
      xValueFormatter,
      paddingValue,
      index,
      startEndOnly,
      intervalType,
      data,
      yAxisDomain,
      type,
      valueToPercent,
      valueFormatter,
      allowDecimals,
    ])

    const yAxisProps = React.useMemo(() => {
      const baseProps = {
        width: yAxisWidth,
        hide: !showYAxis,
        axisLine: false,
        tickLine: layout === "horizontal",
        tickSize: 6,
        fill: "",
        stroke: "",
        className: cx(
          "text-xs",
          "fill-gray-500 stroke-gray-800 dark:fill-gray-500 dark:stroke-gray-300",
        ),
        tick: {
          transform: layout !== "vertical" ? "translate(-3, 0)" : "translate(0, 0)",
        },
      }

      if (layout !== "vertical") {
        return {
          ...baseProps,
          type: "number" as const,
          domain: yAxisDomain as AxisDomain,
          tickFormatter: type === "percent" ? valueToPercent : valueFormatter,
          allowDecimals,
        }
      } else {
        return {
          ...baseProps,
          dataKey: index,
          ticks: startEndOnly && data.length > 0
            ? [data[0][index], data[data.length - 1][index]]
            : undefined,
          type: "category" as const,
          interval: "equidistantPreserveStart" as const,
        }
      }
    }, [
      yAxisWidth,
      showYAxis,
      layout,
      yAxisDomain,
      type,
      valueToPercent,
      valueFormatter,
      allowDecimals,
      index,
      startEndOnly,
      data,
    ])

    if (!data.length || !categories.length) {
      return (
        <div
          ref={forwardedRef}
          className={cx("h-80 w-full flex items-center justify-center", className)}
          {...other}
        >
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
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
              top: 10,
            }}
            stackOffset={type === "percent" ? "expand" : undefined}
            layout={layout}
            barCategoryGap={barCategoryGap}
            syncId={syncId}
          >
            {showGridLines && (
              <CartesianGrid
                className={cx("stroke-gray-100 stroke-1 dark:stroke-gray-900")}
                horizontal={layout !== "vertical"}
                vertical={layout === "vertical"}
              />
            )}
            
            <XAxis {...xAxisProps}>
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
            
            <YAxis {...yAxisProps}>
              {yAxisLabel && (
                <Label
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                  angle={-90}
                  offset={-15}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {yAxisLabel}
                </Label>
              )}
            </YAxis>
            
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={true}
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
                content={renderLegendContent}
              />
            )}
            
            {categories.map((category) => {
              const color = categoryColors.get(category) as AvailableChartColorsKeys
              return (
                <Bar
                  key={category}
                  className={cx(
                    getColorClassName(color, "fill"),
                    onValueChange ? "cursor-pointer" : "",
                  )}
                  name={category}
                  type="linear"
                  dataKey={category}
                  stackId={stacked ? "stack" : undefined}
                  isAnimationActive={false}
                  fill=""
                  shape={(props: any) => {
                    const strokeClass = getColorClassName(color, "stroke")
                    return renderShape(props, activeBar, activeLegend, strokeClass, layout)
                  }}
                  onClick={onBarClick}
                />
              )
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  },
)

BarChartVariant.displayName = "BarChartVariant"

export { BarChartVariant, type BarChartProps, type BarChartEventProps }
