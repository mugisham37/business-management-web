"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import React from "react"
import {
  CartesianGrid,
  Dot,
  Label,
  Line,
  Legend as RechartsLegend,
  LineChart as RechartsLineChart,
  Rectangle,
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

//#region Legend

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
          "truncate whitespace-nowrap text-xs text-gray-700 dark:text-gray-300",
          hasOnValueChange && "group-hover:text-gray-900 dark:group-hover:text-gray-50",
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

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPressed(true)
  }, [])

  const handleMouseUp = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPressed(false)
  }, [])

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }, [onClick])

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
        intervalRef.current = null
      }
    }
  }, [isPressed, disabled, onClick])

  React.useEffect(() => {
    if (disabled) {
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

  const scrollableRef = React.useRef<HTMLInputElement>(null)
  const scrollButtonsRef = React.useRef<HTMLDivElement>(null)
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
      const scrollButtons = scrollButtonsRef?.current
      const scrollButtonWidth = scrollButtons?.clientWidth ?? 0
      const width = element?.clientWidth ?? 0

      if (element && enableLegendSlider) {
        element.scrollTo({
          left:
            direction === "left"
              ? element.scrollLeft - width + scrollButtonWidth
              : element.scrollLeft + width - scrollButtonWidth,
          behavior: "smooth",
        })
        setTimeout(checkScroll, 400)
      }
    },
    [enableLegendSlider, checkScroll],
  )

  const handleKeyDown = React.useCallback(
    (key: string) => {
      if (key === "ArrowLeft") {
        scrollToDirection("left")
      } else if (key === "ArrowRight") {
        scrollToDirection("right")
      }
    },
    [scrollToDirection],
  )

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
        intervalRef.current = null
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
    const scrollable = scrollableRef?.current
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
      {...other}
    >
      <div
        ref={scrollableRef}
        tabIndex={0}
        className={cx(
          "flex h-full",
          enableLegendSlider
            ? showScrollButtons
              ? "snap-mandatory items-center overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : ""
            : "flex-wrap",
        )}
      >
        {categories.map((category, index) => (
          <LegendItem
            key={`item-${index}`}
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
  { payload }: { payload: any[] },
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

  const legendPayload = payload.filter((item: any) => item.type !== "none")
  const paddingLeft = legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0

  return (
    <div
      ref={legendRef}
      style={{ paddingLeft }}
      className={cx(
        "flex items-center",
        {
          "justify-center": legendPosition === "center",
          "justify-start": legendPosition === "left",
          "justify-end": legendPosition === "right",
        },
      )}
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

interface TooltipProps {
  active: boolean | undefined
  payload: PayloadItem[]
  label: string
}

interface PayloadItem {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: any
}

interface ChartTooltipProps extends TooltipProps {
  valueFormatter: (value: number) => string
}

const ChartTooltip = React.memo<ChartTooltipProps>(({
  active,
  payload,
  valueFormatter,
}) => {
  if (!active || !payload?.length) return null

  const legendPayload = payload.filter((item: any) => item.type !== "none")

  return (
    <div
      className={cx(
        "overflow-hidden rounded-md text-sm shadow-md",
        "bg-gray-900 dark:bg-gray-800",
      )}
    >
      <div className="border-b border-gray-700 px-4 py-2 dark:border-gray-700">
        <p className="font-medium text-gray-50">
          Total Requests
        </p>
      </div>
      <div className="space-y-1 bg-gray-800 px-4 py-2 dark:bg-gray-800">
        {legendPayload.map(({ value, category, color }, index) => (
          <div
            key={`id-${index}`}
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
              <p className="whitespace-nowrap text-right text-gray-400 dark:text-gray-400">
                {category}
              </p>
            </div>
            <p className="whitespace-nowrap text-right tabular-nums text-gray-50 dark:text-gray-50">
              {valueFormatter(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})

ChartTooltip.displayName = "ChartTooltip"

interface ActiveDot {
  index?: number
  dataKey?: string
}

interface BaseEventProps {
  eventType: "dot" | "category"
  categoryClicked: string
  [key: string]: number | string
}

type LineChartEventProps = BaseEventProps | null | undefined

interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
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
  onValueChange?: (value: LineChartEventProps) => void
  enableLegendSlider?: boolean
  tickGap?: number
  connectNulls?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  legendPosition?: "left" | "center" | "right"
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void
  customTooltip?: React.ComponentType<TooltipProps>
}

interface CustomCursorProps {
  pointerEvents?: any
  height?: number
  points?: Array<{ x: number; y: number }>
  className?: string
  payload?: any[]
  width?: number
  index: string
}

const CustomCursor = React.memo<CustomCursorProps>(({ 
  pointerEvents, 
  height = 0, 
  points = [], 
  className, 
  payload = [], 
  width = 0,
  index 
}) => {
  const label = payload?.[0]?.payload?.[index]
  const { x, y } = points?.[0] || { x: 0, y: 0 }
  const textWidth = 60
  const textHeight = 15
  const padding = 3

  let translateX: number
  if (x < textWidth / 2 + padding) {
    translateX = padding - 3
  } else if (x > width - textWidth / 2 - padding) {
    translateX = width - textWidth - padding + 3
  } else {
    translateX = x - textWidth / 2
  }

  return (
    <>
      <Rectangle
        x={x}
        y={y}
        fillOpacity={0}
        stroke="#d1d5db"
        strokeWidth={1}
        pointerEvents={pointerEvents}
        width={1}
        height={height}
        className={className}
      />
      <g transform={`translate(${translateX}, ${y + height + 6})`}>
        <rect
          className="fill-gray-200 dark:fill-gray-800"
          width={textWidth + 2 * padding}
          height={textHeight + 2 * padding}
          rx={4}
          ry={4}
        />
        <text
          className="fill-gray-700 text-xs dark:fill-gray-300"
          x={textWidth / 2 + padding}
          y={textHeight / 2 + padding + 5}
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    </>
  )
})

CustomCursor.displayName = "CustomCursor"

export const LineChartSupport = React.forwardRef<HTMLDivElement, LineChartProps>((props, ref) => {
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
    legendPosition = "right",
    tooltipCallback,
    customTooltip,
    ...other
  } = props

  const CustomTooltip = customTooltip
  const paddingValue = (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20
  
  const [legendHeight, setLegendHeight] = React.useState(60)
  const [activeDot, setActiveDot] = React.useState<ActiveDot | undefined>(undefined)
  const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined)
  
  const categoryColors = React.useMemo(() => constructCategoryColors(categories, colors), [categories, colors])
  const yAxisDomain = React.useMemo(() => getYAxisDomain(autoMinValue, minValue, maxValue), [autoMinValue, minValue, maxValue])
  const hasOnValueChange = !!onValueChange
  
  const prevActiveRef = React.useRef<boolean | undefined>(undefined)
  const prevLabelRef = React.useRef<string | undefined>(undefined)

  const handleDotClick = React.useCallback((itemData: any, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!hasOnValueChange) return
    
    const isCurrentlyActive = itemData.index === activeDot?.index && itemData.dataKey === activeDot?.dataKey
    const isSingleValueActive = hasOnlyOneValueForKey(data, itemData.dataKey) && activeLegend === itemData.dataKey

    if (isCurrentlyActive || isSingleValueActive) {
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

  const handleCategoryClick = React.useCallback((dataKey: string) => {
    if (!hasOnValueChange) return
    
    const isCurrentlyActive = dataKey === activeLegend && !activeDot
    const isSingleValueActive = hasOnlyOneValueForKey(data, dataKey) && activeDot?.dataKey === dataKey

    if (isCurrentlyActive || isSingleValueActive) {
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

  const renderActiveDot = React.useCallback((props: any) => {
    const { cx: cxCoord, cy: cyCoord, stroke, strokeLinecap, strokeLinejoin, strokeWidth, dataKey } = props
    
    return (
      <Dot
        className={cx(
          "stroke-white dark:stroke-gray-950",
          onValueChange ? "cursor-pointer" : "",
          getColorClassName(categoryColors.get(dataKey) as AvailableChartColorsKeys, "fill"),
        )}
        cx={cxCoord}
        cy={cyCoord}
        r={5}
        fill=""
        stroke={stroke}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        strokeWidth={strokeWidth}
        onClick={(_, event) => handleDotClick(props, event)}
      />
    )
  }, [categoryColors, onValueChange, handleDotClick])

  const renderDot = React.useCallback((props: any) => {
    const { stroke, strokeLinecap, strokeLinejoin, strokeWidth, cx: cxCoord, cy: cyCoord, dataKey, index } = props

    const shouldShowDot = (hasOnlyOneValueForKey(data, props.dataKey) && !(activeDot || (activeLegend && activeLegend !== props.dataKey))) ||
                         (activeDot?.index === index && activeDot?.dataKey === props.dataKey)

    if (shouldShowDot) {
      return (
        <Dot
          key={index}
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
            getColorClassName(categoryColors.get(dataKey) as AvailableChartColorsKeys, "fill"),
          )}
        />
      )
    }
    return <React.Fragment key={index} />
  }, [data, activeDot, activeLegend, categoryColors, onValueChange])

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

    if (tooltipCallback && (active !== prevActiveRef.current || label !== prevLabelRef.current)) {
      tooltipCallback({ active, payload: cleanPayload, label })
      prevActiveRef.current = active
      prevLabelRef.current = label
    }

    return showTooltip && active ? (
      CustomTooltip ? (
        <CustomTooltip active={active} payload={cleanPayload} label={label} />
      ) : (
        <ChartTooltip active={active} payload={cleanPayload} label={label} valueFormatter={valueFormatter} />
      )
    ) : null
  }, [index, categoryColors, tooltipCallback, showTooltip, CustomTooltip, valueFormatter])

  return (
    <div ref={ref} className={cx("h-80 w-full", className)} {...other}>
      <ResponsiveContainer>
        <RechartsLineChart
          data={data}
          onClick={handleChartClick}
          margin={{
            bottom: xAxisLabel ? 30 : undefined,
            left: yAxisLabel ? 20 : 3,
            right: yAxisLabel ? 5 : 3,
            top: 5,
          }}
        >
          {showGridLines && (
            <CartesianGrid
              className="stroke-gray-200 stroke-1 dark:stroke-gray-800"
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
            ticks={startEndOnly ? [data[0]?.[index], data[data.length - 1]?.[index]] : undefined}
            fill=""
            stroke=""
            className="text-xs fill-gray-500 dark:fill-gray-500"
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
            className="text-xs fill-gray-500 dark:fill-gray-500"
            tickFormatter={valueFormatter}
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
            cursor={<CustomCursor index={index} />}
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
                  { payload: payload || [] },
                  categoryColors,
                  setLegendHeight,
                  activeLegend,
                  hasOnValueChange ? handleCategoryClick : undefined,
                  enableLegendSlider,
                  legendPosition,
                  yAxisWidth,
                )
              }
            />
          )}
          
          {categories.map((category) => (
            <Line
              key={category}
              className={getColorClassName(categoryColors.get(category) as AvailableChartColorsKeys, "stroke")}
              strokeOpacity={activeDot || (activeLegend && activeLegend !== category) ? 0.3 : 1}
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
            />
          ))}
          
          {onValueChange &&
            categories.map((category) => (
              <Line
                key={`${category}-clickable`}
                className="cursor-pointer"
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
                  handleCategoryClick(name)
                }}
              />
            ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
})

LineChartSupport.displayName = "LineChartSupport"
