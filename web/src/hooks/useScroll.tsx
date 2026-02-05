// Enhanced useScroll Hook [v2.0.0]
// Comprehensive scroll handling with advanced features and maximum flexibility

import * as React from "react"

// Type definitions for maximum flexibility and type safety
export interface ScrollPosition {
  x: number
  y: number
}

export interface ScrollDelta {
  deltaX: number
  deltaY: number
}

export interface ScrollEventData extends ScrollPosition, ScrollDelta {
  previousX: number
  previousY: number
  isScrollingUp: boolean
  isScrollingDown: boolean
  isScrollingLeft: boolean
  isScrollingRight: boolean
  scrollPercentageX: number
  scrollPercentageY: number
  maxScrollX: number
  maxScrollY: number
}

export interface ScrollThresholds {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

export interface UseScrollOptions {
  debounceMs?: number
  throttleMs?: number
  immediate?: boolean
  passive?: boolean
  capture?: boolean
  element?: React.RefObject<HTMLElement> | HTMLElement | null
  includeScrollData?: boolean
  thresholds?: ScrollThresholds
  ssrFallback?: boolean
}

export type ScrollDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export type ScrollHandler = () => void
export type ScrollHandlerWithData = (data: ScrollEventData) => void
export type ScrollHandlerFlexible = ScrollHandler | ScrollHandlerWithData

// Utility functions for performance optimization
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Get current scroll position safely
function getScrollPosition(element?: HTMLElement | null): ScrollPosition {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 }
  }
  
  if (element) {
    return {
      x: element.scrollLeft,
      y: element.scrollTop
    }
  }
  
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset
  }
}

// Get maximum scroll values
function getMaxScroll(element?: HTMLElement | null): ScrollPosition {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 }
  }
  
  if (element) {
    return {
      x: element.scrollWidth - element.clientWidth,
      y: element.scrollHeight - element.clientHeight
    }
  }
  
  return {
    x: Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    ) - window.innerWidth,
    y: Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    ) - window.innerHeight
  }
}

// Calculate scroll percentage
function getScrollPercentage(current: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(Math.max((current / max) * 100, 0), 100)
}

// Main scroll hook with comprehensive functionality
export function useScroll(handler: ScrollHandler): void
export function useScroll(
  handler: ScrollHandlerFlexible,
  options: UseScrollOptions
): void
export function useScroll(
  handler: ScrollHandlerFlexible,
  options: UseScrollOptions = {}
): void {
  const {
    debounceMs = 0,
    throttleMs = 0,
    immediate = true,
    passive = true,
    capture = false,
    element,
    includeScrollData = false
  } = options

  // Store previous scroll position for comparison and delta calculation
  const previousPositionRef = React.useRef<ScrollPosition>({ x: 0, y: 0 })
  const handlerRef = React.useRef<ScrollHandlerFlexible>(handler)
  const elementRef = React.useRef<HTMLElement | null>(null)

  // Update handler ref when handler changes
  React.useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  // Update element ref
  React.useEffect(() => {
    if (element) {
      elementRef.current = 'current' in element ? element.current : element
    } else {
      elementRef.current = null
    }
  }, [element])

  React.useEffect(() => {
    // Early return for SSR
    if (typeof window === 'undefined') return

    const targetElement = elementRef.current
    const scrollTarget = targetElement || window

    const executeHandler = () => {
      try {
        const currentPosition = getScrollPosition(targetElement)
        const previousPosition = previousPositionRef.current
        const maxScroll = getMaxScroll(targetElement)

        // Calculate deltas and directions
        const deltaX = currentPosition.x - previousPosition.x
        const deltaY = currentPosition.y - previousPosition.y

        if (includeScrollData) {
          const scrollData: ScrollEventData = {
            ...currentPosition,
            previousX: previousPosition.x,
            previousY: previousPosition.y,
            deltaX,
            deltaY,
            isScrollingUp: deltaY < 0,
            isScrollingDown: deltaY > 0,
            isScrollingLeft: deltaX < 0,
            isScrollingRight: deltaX > 0,
            scrollPercentageX: getScrollPercentage(currentPosition.x, maxScroll.x),
            scrollPercentageY: getScrollPercentage(currentPosition.y, maxScroll.y),
            maxScrollX: maxScroll.x,
            maxScrollY: maxScroll.y
          }
          
          // Type-safe call - check if handler expects data
          if (handlerRef.current.length > 0) {
            (handlerRef.current as ScrollHandlerWithData)(scrollData)
          } else {
            (handlerRef.current as ScrollHandler)()
          }
        } else {
          (handlerRef.current as ScrollHandler)()
        }

        // Update previous position
        previousPositionRef.current = currentPosition
      } catch (error) {
        console.error('Error in scroll handler:', error)
      }
    }

    // Apply debouncing or throttling if specified
    let processedHandler = executeHandler
    
    if (debounceMs > 0) {
      processedHandler = debounce(executeHandler, debounceMs)
    } else if (throttleMs > 0) {
      processedHandler = throttle(executeHandler, throttleMs)
    }

    // Initialize previous position
    previousPositionRef.current = getScrollPosition(targetElement)

    // Execute immediately if requested
    if (immediate) {
      executeHandler()
    }

    // Set up event listener with specified options
    const eventOptions = {
      passive,
      capture
    }

    scrollTarget.addEventListener('scroll', processedHandler, eventOptions)

    // Cleanup function
    return () => {
      scrollTarget.removeEventListener('scroll', processedHandler, eventOptions)
    }
  }, [debounceMs, throttleMs, immediate, passive, capture, includeScrollData])
}

// Hook for simple threshold-based scroll detection (maintains backward compatibility)
export function useScrollThreshold(
  threshold: number,
  options: Omit<UseScrollOptions, 'includeScrollData'> = {}
) {
  const { ssrFallback = false } = options
  const [scrolled, setScrolled] = React.useState<boolean>(ssrFallback)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useScroll(
    React.useCallback(() => {
      const position = getScrollPosition(
        options.element ? ('current' in options.element ? options.element.current : options.element) : null
      )
      setScrolled(position.y > threshold)
    }, [threshold, options.element]),
    options
  )

  return { scrolled, isClient }
}

// Hook for multiple thresholds
export function useScrollThresholds(
  thresholds: ScrollThresholds,
  options: Omit<UseScrollOptions, 'includeScrollData'> = {}
) {
  const [thresholdStates, setThresholdStates] = React.useState({
    top: false,
    bottom: false,
    left: false,
    right: false
  })
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useScroll(
    React.useCallback(() => {
      const targetElement = options.element ? ('current' in options.element ? options.element.current : options.element) : null
      const position = getScrollPosition(targetElement)
      const maxScroll = getMaxScroll(targetElement)

      setThresholdStates({
        top: thresholds.top !== undefined ? position.y > thresholds.top : false,
        bottom: thresholds.bottom !== undefined ? position.y > (maxScroll.y - thresholds.bottom) : false,
        left: thresholds.left !== undefined ? position.x > thresholds.left : false,
        right: thresholds.right !== undefined ? position.x > (maxScroll.x - thresholds.right) : false
      })
    }, [thresholds, options.element]),
    options
  )

  return { ...thresholdStates, isClient }
}

// Hook that returns current scroll position
export function useScrollPosition(options: UseScrollOptions = {}) {
  const [position, setPosition] = React.useState<ScrollPosition>({ x: 0, y: 0 })
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useScroll(
    React.useCallback(() => {
      const targetElement = options.element ? ('current' in options.element ? options.element.current : options.element) : null
      setPosition(getScrollPosition(targetElement))
    }, [options.element]),
    options
  )

  return { ...position, isClient }
}

// Hook for scroll direction detection
export function useScrollDirection(options: UseScrollOptions = {}) {
  const [direction, setDirection] = React.useState<ScrollDirection>('none')
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useScroll(
    React.useCallback((data: ScrollEventData) => {
      if (Math.abs(data.deltaY) > Math.abs(data.deltaX)) {
        setDirection(data.deltaY > 0 ? 'down' : data.deltaY < 0 ? 'up' : 'none')
      } else if (Math.abs(data.deltaX) > 0) {
        setDirection(data.deltaX > 0 ? 'right' : 'left')
      } else {
        setDirection('none')
      }
    }, []),
    { ...options, includeScrollData: true }
  )

  return { direction, isClient }
}

// Hook for scroll percentage
export function useScrollPercentage(options: UseScrollOptions = {}) {
  const [percentage, setPercentage] = React.useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useScroll(
    React.useCallback((data: ScrollEventData) => {
      setPercentage({
        x: data.scrollPercentageX,
        y: data.scrollPercentageY
      })
    }, []),
    { ...options, includeScrollData: true }
  )

  return { ...percentage, isClient }
}

// Hook with full scroll event data for advanced use cases
export function useScrollWithData(
  handler: ScrollHandlerWithData,
  options: Omit<UseScrollOptions, 'includeScrollData'> = {}
) {
  useScroll(handler, { ...options, includeScrollData: true })
}

// Legacy compatibility - maintains exact same API as original
export function useScrollLegacy(threshold: number) {
  const { scrolled } = useScrollThreshold(threshold)
  return scrolled
}

// Utility hook for detecting if element is in viewport during scroll
export function useScrollIntoView(
  elementRef: React.RefObject<HTMLElement>,
  options: UseScrollOptions & { rootMargin?: string; threshold?: number } = {}
) {
  const [isInView, setIsInView] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  React.useEffect(() => {
    if (!isClient || !elementRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        rootMargin: options.rootMargin || '0px',
        threshold: options.threshold || 0
      }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isClient, elementRef, options.rootMargin, options.threshold])

  return { isInView, isClient }
}

// Export utility functions for external use
export { debounce, throttle, getScrollPosition, getMaxScroll, getScrollPercentage }

// Default export maintains backward compatibility
export default function useScrollDefault(threshold: number) {
  return useScrollLegacy(threshold)
}
