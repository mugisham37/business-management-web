"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IconPlaceholder } from "@/components/ui/icon-placeholder"

type CarouselProps = {
  orientation?: "horizontal" | "vertical"
  autoplay?: boolean
  autoplayInterval?: number
  loop?: boolean
}

type CarouselContextProps = {
  currentIndex: number
  itemsCount: number
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollToIndex: (index: number) => void
  orientation: "horizontal" | "vertical"
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  autoplay = false,
  autoplayInterval = 3000,
  loop = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [itemsCount, setItemsCount] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const autoplayTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const canScrollPrev = loop ? true : currentIndex > 0
  const canScrollNext = loop ? true : currentIndex < itemsCount - 1

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (itemsCount === 0) return

      let newIndex = index
      if (loop) {
        newIndex = ((index % itemsCount) + itemsCount) % itemsCount
      } else {
        newIndex = Math.max(0, Math.min(index, itemsCount - 1))
      }

      setCurrentIndex(newIndex)

      const container = containerRef.current
      if (!container) return

      const items = container.querySelectorAll('[data-slot="carousel-item"]')
      const targetItem = items[newIndex] as HTMLElement
      if (targetItem) {
        targetItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: orientation === "horizontal" ? "start" : "nearest",
        })
      }
    },
    [itemsCount, loop, orientation]
  )

  const scrollPrev = React.useCallback(() => {
    scrollToIndex(currentIndex - 1)
  }, [currentIndex, scrollToIndex])

  const scrollNext = React.useCallback(() => {
    scrollToIndex(currentIndex + 1)
  }, [currentIndex, scrollToIndex])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  // Count items on mount and when children change
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll('[data-slot="carousel-item"]')
    setItemsCount(items.length)
  }, [children])

  // Autoplay functionality
  React.useEffect(() => {
    if (!autoplay || itemsCount === 0) return

    autoplayTimerRef.current = setInterval(() => {
      scrollNext()
    }, autoplayInterval)

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
      }
    }
  }, [autoplay, autoplayInterval, itemsCount, scrollNext])

  return (
    <CarouselContext.Provider
      value={{
        currentIndex,
        itemsCount,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        scrollToIndex,
        orientation,
      }}
    >
      <div
        ref={containerRef}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        aria-live={autoplay ? "off" : "polite"}
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div className="overflow-hidden" data-slot="carousel-content">
      <div
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "-ml-4 snap-x snap-mandatory scroll-smooth"
            : "-mt-4 flex-col snap-y snap-mandatory scroll-smooth",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4 snap-start" : "pt-4 snap-start",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "cn-carousel-previous absolute touch-manipulation",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <IconPlaceholder
        lucide="ChevronLeftIcon"
        tabler="IconChevronLeft"
        hugeicons="ArrowLeft01Icon"
        phosphor="CaretLeftIcon"
        remixicon="RiArrowLeftSLine"
        className="cn-rtl-flip"
      />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "cn-carousel-next absolute touch-manipulation",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <IconPlaceholder
        lucide="ChevronRightIcon"
        tabler="IconChevronRight"
        hugeicons="ArrowRight01Icon"
        phosphor="CaretRightIcon"
        remixicon="RiArrowRightSLine"
        className="cn-rtl-flip"
      />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
