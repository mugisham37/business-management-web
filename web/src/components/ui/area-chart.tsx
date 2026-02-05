// Tremor Raw AreaChart [v0.3.0]

"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import React from "react"
import {
  Area,
  CartesianGrid,
  Dot,
  Label,
  Line,
  AreaChart as RechartsAreaChart,
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

//#region Types and Interfaces

interface ActiveDot {
  index?: number
  dataKey?: string
}

type BaseEventProps = {
  eventType: "dot" | "category"
  categoryClicked: string
  [key: string]: number | string
}

type AreaChartEventProps = BaseEventProps | null | undefined

type PayloadItem = {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: Record<string, unknown>
}

type TooltipProps = {
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
  activeLegend?: string
}

interface ScrollButtonProps {
  icon: React.ElementType
  onClick?: () => void
  disabled?: boolean
}

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
  enableLegendSlider?: boolean
}

interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, unknown>[]
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
  onValueChange?: (value: AreaChartEventProps) => void
  enableLegendSlider?: boolean
  tickGap?: number
  connectNulls?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  type?: "default" | "stacked" | "percent"
  legendPosition?: "left" | "center" | "right"
  fill?: "gradient" | "solid" | "none"
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void
  customTooltip?: React.ComponentType<TooltipProps>
}

type HasScrollProps = {
  left: boolean
  right: boolean
}

//#endregion

//#region Legend Components

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
          handleClick(e as unknown as React.MouseEvent)
        }
      } : undefined}
      aria-label={hasOnValueChange ? `Toggle ${name} series` : undefined}
    >
      <span
        className={cx(
          "h-[3px] w-3.5 shrink-0 rounded-full",
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

interface ScrollButtonProps {
  icon: React.ElementType
  onClick?: () => void
  disabled?: boolean
}

const ScrollButton = React.memo<ScrollButtonProps>(({ icon, onClick, disabled }) => {
  const Icon = icon
  const [isPressed, setIsPressed] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      setIsPressed(true)
    }
  }, [disabled])

  const handleMouseUp = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPressed(false)
  }, [])

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onClick?.()
    }
  }, [onClick, disabled])

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
      aria-label={`Scroll legend ${icon === RiArrowLeftSLine ? 'left' : 'right'}`}
    >
      <Icon className="size-full" aria-hidden="true" />
    </button>
  )
})

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
  enableLegendSlider?: boolean
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

  const scrollToDirection = React.useCallback(
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
      scrollToDirection("left")
    } else if (key === "ArrowRight") {
      scrollToDirection("right")
    }
  }, [scrollToDirection])

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

  const handleKeyDownEvent = React.useCallback((e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      setIsKeyDowned(e.key)
    }
  }, [])

  const handleKeyUpEvent = React.useCallback((e: KeyboardEvent) => {
    e.stopPropagation()
    setIsKeyDowned(null)
  }, [])

  React.useEffect(() => {
    const scrollable = scrollableRef.current
    if (enableLegendSlider && scrollable) {
      checkScroll()
      scrollable.addEventListener("keydown", handleKeyDownEvent)
      scrollable.addEventListener("keyup", handleKeyUpEvent)

      return () => {
        scrollable.removeEventListener("keydown", handleKeyDownEvent)
        scrollable.removeEventListener("keyup", handleKeyUpEvent)
      }
    }
  }, [checkScroll, enableLegendSlider, handleKeyDownEvent, handleKeyUpEvent])

  const showScrollButtons = enableLegendSlider && (hasScroll?.right || hasScroll?.left)

  return (
    <ol
      ref={ref}
      className={cx("relative overflow-hidden", className)}
      role="list"
      aria-label="Chart legend"
      {...other}
    >
      <div
        ref={scrollableRef}
        tabIndex={enableLegendSlider ? 0 : undefined}
        className={cx(
          "flex h-full",
          enableLegendSlider
            ? showScrollButtons
              ? "snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "items-center"
            : "flex-wrap",
        )}
        role="group"
        aria-label="Legend items"
      >
        {categories.map((category, index) => (
          <LegendItem
            key={`legend-item-${category}-${index}`}
            name={category}
            color={colors[index] as AvailableChartColorsKeys}
            onClick={onClickLegendItem}
            activeLegend={activeLegend}
          />
        ))}
      </div>
      {showScrollButtons && (
        <div
          ref={scrollButtonsRef}
          className={cx(
            "absolute bottom-0 right-0 top-0 flex h-full items-center justify-center pr-1",
            "bg-white dark:bg-gray-950",
          )}
          role="group"
          aria-label="Legend scroll controls"
        >
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
  { payload }: { payload: unknown[] },
  categoryColors: Map<string, AvailableChartColorsKeys>,
  setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
  activeLegend: string | undefined,
  onClick?: (category: string, color: string) => void,
  enableLegendSlider?: boolean,
  legendPosition?: "left" | "center" | "right",
  yAxisWidth?: number,
) => {
  const legendRef = React.useRef<HTMLDivElement>(null)

  useOnWindowResize(() => {
    const calculateHeight = (height: number | undefined) =>
      height ? Number(height) + 15 : 60
    setLegendHeight(calculateHeight(legendRef.current?.clientHeight))
  })

  const legendPayload = React.useMemo(() => 
    payload.filter((item: any) => item.type !== "none"),
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
      ref={legendRef}
      style={{ paddingLeft }}
      className={cx("flex items-center", justifyClass)}
    >
      <Legend
        categories={legendPayload.map((entry: any) => entry.value)}
        colors={legendPayload.map((entry: any) =>
          categoryColors.get(entry.value),
        ).filter((color): color is AvailableChartColorsKeys => color !== undefined)}
        onClickLegendItem={onClick}
        activeLegend={activeLegend}
        enableLegendSlider={enableLegendSlider}
      />
    </div>
  )
}

//#endregion

//#region Tooltip Components

const ChartTooltip = React.memo<ChartTooltipProps>(({
  active,
  payload,
  label,
  valueFormatter,
}) => {
  if (!active || !payload?.length) return null

  return (
    <div
      className={cx(
        "rounded-md border text-sm shadow-md",
        "border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-950",
      )}
      role="tooltip"
      aria-label={`Chart data for ${label}`}
    >
      <div className={cx("border-b border-inherit px-4 py-2")}>
        <p
          className={cx(
            "font-medium",
            "text-gray-900 dark:text-gray-50",
          )}
        >
          {label}
        </p>
      </div>
      <div className={cx("space-y-1 px-4 py-2")}>
        {payload.map(({ value, category, color }, index) => (
          <div
            key={`tooltip-item-${category}-${index}`}
            className="flex items-center justify-between space-x-8"
          >
            <div className="flex items-center space-x-2">
              <span
                aria-hidden="true"
                className={cx(
                  "h-[3px] w-3.5 shrink-0 rounded-full",
                  getColorClassName(color, "bg"),
                )}
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

//#endregion

//#region AreaChart Component

const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
  (props, ref) => {
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
      connectNulls = false,
      className,
      onValueChange,
      enableLegendSlider = false,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      type = "default",
      legendPosition = "right",
      fill = "gradient",
      tooltipCallback,
      customTooltip,
      ...other
    } = props

    const CustomTooltip = customTooltip
    const [legendHeight, setLegendHeight] = React.useState(60)
    const [activeDot, setActiveDot] = React.useState<ActiveDot | undefined>(undefined)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined)
    
    const prevActiveRef = React.useRef<boolean | undefined>(undefined)
    const prevLabelRef = React.useRef<string | undefined>(undefined)
    const areaId = React.useId()

    const categoryColors = React.useMemo(() => 
      constructCategoryColors(categories, colors), 
      [categories, colors]
    )

    const yAxisDomain = React.useMemo(() => 
      getYAxisDomain(autoMinValue, minValue, maxValue),
      [autoMinValue, minValue, maxValue]
    )

    const paddingValue = React.useMemo(() =>
      (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20,
      [showXAxis, showYAxis, startEndOnly]
    )

    const hasOnValueChange = !!onValueChange
    const stacked = type === "stacked" || type === "percent"

    const getFillContent = React.useCallback(({
      fillType,
      activeDot,
      activeLegend,
      category,
    }: {
      fillType: AreaChartProps["fill"]
      activeDot: ActiveDot | undefined
      activeLegend: string | undefined
      category: string
    }) => {
      const stopOpacity =
        activeDot || (activeLegend && activeLegend !== category) ? 0.1 : 0.3

      switch (fillType) {
        case "none":
          return <stop stopColor="currentColor" stopOpacity={0} />
        case "gradient":
          return (
            <>
              <stop
                offset="5%"
                stopColor="currentColor"
                stopOpacity={stopOpacity}
              />
              <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
            </>
          )
        case "solid":
        default:
          return <stop stopColor="currentColor" stopOpacity={stopOpacity} />
      }
    }, [])

    const valueToPercent = React.useCallback((value: number) => {
      return `${(value * 100).toFixed(0)}%`
    }, [])

    const onDotClick = React.useCallback((itemData: any, event: React.MouseEvent) => {
      event.stopPropagation()

      if (!hasOnValueChange) return
      
      const shouldDeactivate = 
        (itemData.index === activeDot?.index && itemData.dataKey === activeDot?.dataKey) ||
        (hasOnlyOneValueForKey(data, itemData.dataKey) && activeLegend && activeLegend === itemData.dataKey)

      if (shouldDeactivate) {
        setActiveLegend(undefined)
        setActiveDot(undefined)
        onValueChange?.(null)
      } else {
        setActiveLegend(itemData.dataKey)
        setActiveDot({
          index: itemData.index,
          dataKey: itemData.dataKey,
        })
        onValueChange?.({
          eventType: "dot",
          categoryClicked: itemData.dataKey,
          ...itemData.payload,
        })
      }
    }, [hasOnValueChange, activeDot, activeLegend, data, onValueChange])

    const onCategoryClick = React.useCallback((dataKey: string) => {
      if (!hasOnValueChange) return
      
      const shouldDeactivate =
        (dataKey === activeLegend && !activeDot) ||
        (hasOnlyOneValueForKey(data, dataKey) && activeDot && activeDot.dataKey === dataKey)

      if (shouldDeactivate) {
        setActiveLegend(undefined)
        onValueChange?.(null)
      } else {
        setActiveLegend(dataKey)
        onValueChange?.({
          eventType: "category",
          categoryClicked: dataKey,
        })
      }
      setActiveDot(undefined)
    }, [hasOnValueChange, activeLegend, activeDot, data, onValueChange])

    const handleChartClick = React.useCallback(() => {
      if (hasOnValueChange && (activeLegend || activeDot)) {
        setActiveDot(undefined)
        setActiveLegend(undefined)
        onValueChange?.(null)
      }
    }, [hasOnValueChange, activeLegend, activeDot, onValueChange])

    const renderTooltipContent = React.useCallback(({ active, payload, label }: any) => {
      const cleanPayload: TooltipProps["payload"] = payload
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
          />
        )
      ) : null
    }, [showTooltip, CustomTooltip, valueFormatter, tooltipCallback, categoryColors, index])

    const renderActiveDot = React.useCallback((props: any) => {
      const {
        cx: cxCoord,
        cy: cyCoord,
        stroke,
        strokeLinecap,
        strokeLinejoin,
        strokeWidth,
        dataKey,
      } = props
      
      return (
        <Dot
          className={cx(
            "stroke-white dark:stroke-gray-950",
            onValueChange ? "cursor-pointer" : "",
            getColorClassName(
              categoryColors.get(dataKey) as AvailableChartColorsKeys,
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
    }, [onValueChange, categoryColors, onDotClick])

    const renderDot = React.useCallback((props: any) => {
      const {
        stroke,
        strokeLinecap,
        strokeLinejoin,
        strokeWidth,
        cx: cxCoord,
        cy: cyCoord,
        dataKey,
        index: dotIndex,
      } = props

      const shouldShowDot =
        (hasOnlyOneValueForKey(data, dataKey) &&
          !(activeDot || (activeLegend && activeLegend !== dataKey))) ||
        (activeDot?.index === dotIndex && activeDot?.dataKey === dataKey)

      if (shouldShowDot) {
        return (
          <Dot
            key={`dot-${dataKey}-${dotIndex}`}
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
              onValueChange ? "cursor-pointer" : "",
              getColorClassName(
                categoryColors.get(dataKey) as AvailableChartColorsKeys,
                "fill",
              ),
            )}
          />
        )
      }
      return <React.Fragment key={`dot-fragment-${dataKey}-${dotIndex}`} />
    }, [data, activeDot, activeLegend, onValueChange, categoryColors])

    const renderLegendContent = React.useCallback((props: any) =>
      ChartLegend(
        { payload: props.payload || [] },
        categoryColors,
        setLegendHeight,
        activeLegend,
        hasOnValueChange ? onCategoryClick : undefined,
        enableLegendSlider,
        legendPosition,
        yAxisWidth,
      ),
      [categoryColors, activeLegend, hasOnValueChange, onCategoryClick, enableLegendSlider, legendPosition, yAxisWidth]
    )

    return (
      <div
        ref={ref}
        className={cx("h-80 w-full", className)}
        tremor-id="tremor-raw"
        {...other}
      >
        <ResponsiveContainer>
          <RechartsAreaChart
            data={data}
            onClick={handleChartClick}
            margin={{
              bottom: xAxisLabel ? 30 : undefined,
              left: yAxisLabel ? 20 : undefined,
              right: yAxisLabel ? 5 : undefined,
              top: 5,
            }}
            stackOffset={type === "percent" ? "expand" : undefined}
          >
            {showGridLines && (
              <CartesianGrid
                className={cx("stroke-gray-200 stroke-1 dark:stroke-gray-800")}
                horizontal={true}
                vertical={false}
              />
            )}
            
            <XAxis
              padding={{ left: paddingValue, right: paddingValue }}
              hide={!showXAxis}
              dataKey={index}
              interval={startEndOnly ? "preserveStartEnd" : intervalType}
              tick={{ transform: "translate(0, 6)" }}
              ticks={
                startEndOnly && data.length > 0
                  ? [data[0]?.[index], data[data.length - 1]?.[index]].filter(Boolean) as (string | number)[]
                  : undefined
              }
              fill=""
              stroke=""
              className={cx(
                "text-xs",
                "fill-gray-500 dark:fill-gray-500",
              )}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
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
              type="number"
              domain={yAxisDomain as AxisDomain}
              tick={{ transform: "translate(-3, 0)" }}
              fill=""
              stroke=""
              className={cx(
                "text-xs",
                "fill-gray-500 dark:fill-gray-500",
              )}
              tickFormatter={type === "percent" ? valueToPercent : valueFormatter}
              allowDecimals={allowDecimals}
            >
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
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              offset={20}
              position={{ y: 0 }}
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
              const categoryId = `${areaId}-${category.replace(/[^a-zA-Z0-9]/g, "")}`
              const categoryColor = categoryColors.get(category) as AvailableChartColorsKeys
              
              return (
                <React.Fragment key={`area-fragment-${category}`}>
                  <defs>
                    <linearGradient
                      className={cx(getColorClassName(categoryColor, "text"))}
                      id={categoryId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {getFillContent({
                        fillType: fill,
                        activeDot,
                        activeLegend,
                        category,
                      })}
                    </linearGradient>
                  </defs>
                  <Area
                    className={cx(getColorClassName(categoryColor, "stroke"))}
                    strokeOpacity={
                      activeDot || (activeLegend && activeLegend !== category) ? 0.3 : 1
                    }
                    activeDot={renderActiveDot}
                    dot={renderDot}
                    name={category}
                    type="linear"
                    dataKey={category}
                    stroke=""
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    isAnimationActive={false}
                    connectNulls={connectNulls}
                    stackId={stacked ? "stack" : undefined}
                    fill={`url(#${categoryId})`}
                  />
                </React.Fragment>
              )
            })}
            
            {onValueChange &&
              categories.map((category) => (
                <Line
                  key={`hidden-line-${category}`}
                  className={cx("cursor-pointer")}
                  strokeOpacity={0}
                  name={category}
                  type="linear"
                  dataKey={category}
                  stroke="transparent"
                  fill="transparent"
                  legendType="none"
                  tooltipType="none"
                  strokeWidth={12}
                  connectNulls={connectNulls}
                  onClick={(props: any, event) => {
                    event.stopPropagation()
                    const { name } = props
                    onCategoryClick(name)
                  }}
                />
              ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    )
  },
)

AreaChart.displayName = "AreaChart"

LegendItem.displayName = "LegendItem"
ScrollButton.displayName = "ScrollButton"
Legend.displayName = "Legend"
ChartLegend.displayName = "ChartLegend"
ChartTooltip.displayName = "ChartTooltip"

//#endregion

export { AreaChart, type AreaChartEventProps, type TooltipProps }
